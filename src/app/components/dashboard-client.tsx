"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { initialDevices, puneTariffs } from "@/app/lib/mock-data";
import type { Device } from "@/app/lib/types";
import { TARIFF_ALERT_THRESHOLD } from "@/app/lib/types";
import { DashboardHeader } from "./dashboard-header";
import { DeviceCard } from "./device-card";
import { SummaryCards } from "./summary-cards";
import { AnalysisCard } from "./analysis-card";
import { analyzeConsumptionPatterns, type AnalyzeConsumptionPatternsOutput } from "@/ai/flows/analyze-consumption-patterns";
import { useToast } from "@/hooks/use-toast";
import { ChatbotWidget } from "@/components/chatbot-widget";

export function DashboardClient() {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [analysis, setAnalysis] = useState<AnalyzeConsumptionPatternsOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const { toast } = useToast();

  // Track whether we've already sent the high-tariff alert this session
  const alertSentRef = useRef(false);
  // Ref to the chatbot's WS send function (only works when user is on a call)
  const wsSendRef = useRef<((msg: string) => boolean) | null>(null);

  // Simulate live device power fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices =>
        prevDevices.map(device => {
          if (device.status === 'on') {
            const fluctuation = (Math.random() - 0.5) * (device.powerConsumption * 0.05);
            const newPower = Math.max(0, Math.round(device.powerConsumption + fluctuation));
            const newHours = device.usageHoursToday + (1 / 3600) * 5;
            return { ...device, powerConsumption: newPower, usageHoursToday: newHours };
          }
          return device;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeviceToggle = useCallback((deviceId: string, status: boolean) => {
    // Reset alert so it can re-trigger if devices change significantly
    alertSentRef.current = false;
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId
          ? {
              ...device,
              status: status ? 'on' : 'off',
              powerConsumption: status
                ? (initialDevices.find(d => d.id === deviceId)?.powerConsumption || 0)
                : 0,
            }
          : device
      )
    );
  }, []);

  const totalUsageKWh = useMemo(() => {
    return devices.reduce((total, device) => {
      return total + (device.powerConsumption * device.usageHoursToday) / 1000;
    }, 0);
  }, [devices]);

  // --- DYNAMIC TARIFF: scales with number of active devices ---
  const dynamicTariffRate = useMemo(() => {
    const activeCount = devices.filter(d => d.status === 'on').length;
    const surcharge = Math.max(0, activeCount - 2) * 0.4;
    const noise = (Math.random() - 0.5) * 0.2;
    return Math.min(parseFloat((puneTariffs.high + surcharge + noise).toFixed(2)), 18.0);
  }, [devices]);

  const activeDevices = useMemo(() => devices.filter(d => d.status === 'on'), [devices]);

  // --- TARIFF ALERT: inject into user's live WS when tariff crosses threshold ---
  useEffect(() => {
    if (dynamicTariffRate >= TARIFF_ALERT_THRESHOLD && !alertSentRef.current) {
      alertSentRef.current = true;

      const alertMsg = JSON.stringify({
        event: "tariff_alert",
        tariff_rate: dynamicTariffRate,
        unit: "INR/kWh",
        message: `Tariff is high at ₹${dynamicTariffRate.toFixed(2)}/kWh. Please advise the user on energy saving.`,
        active_devices: activeDevices.map(d => ({
          id: d.id,
          name: d.name,
          power_consumption_watts: d.powerConsumption,
        })),
      });

      // Try to inject into the user's existing open WS first
      // API route fallback is currently disabled
      wsSendRef.current?.(alertMsg);
    }
  }, [dynamicTariffRate, activeDevices]);

  const runAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const deviceDataForAI = devices.map(d => ({
        deviceId: d.id,
        deviceName: d.name,
        powerConsumption: d.powerConsumption,
        usageHoursToday: d.usageHoursToday,
        expectedUsage: d.expectedUsage,
      }));
      const result = await analyzeConsumptionPatterns({
        deviceData: deviceDataForAI,
        tariffRates: puneTariffs,
        location: 'Pune',
      });
      setAnalysis(result);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not get insights from AI. Please try again.",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-background min-h-screen font-body">
      <DashboardHeader />
      <div className="space-y-6">
        <SummaryCards
          totalUsage={totalUsageKWh}
          tariffs={{ ...puneTariffs, current: dynamicTariffRate }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {devices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={handleDeviceToggle}
              analysisResult={analysis?.analysisResults.find(
                (r: { deviceId: string }) => r.deviceId === device.id
              )}
            />
          ))}
        </div>

        <AnalysisCard analysis={analysis} isLoading={isLoadingAnalysis} onRunAnalysis={runAnalysis} />
      </div>

      {/* ChatbotWidget — exposes WS send fn for tariff alert injection */}
      <ChatbotWidget
        onRegisterWSSend={(fn) => { wsSendRef.current = fn; }}
        onDeviceSignal={(deviceId, action) => {
          console.log(`[dashboard] AI device signal received — ${action} device: ${deviceId}`);
          handleDeviceToggle(deviceId, action === "turn_on");
        }}
      />
    </div>
  );
}
