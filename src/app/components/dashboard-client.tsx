"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { puneTariffs } from "@/app/lib/mock-data";
import type { Device } from "@/app/lib/types";
import { TARIFF_ALERT_THRESHOLD } from "@/app/lib/types";
import { AnalysisCard } from "./analysis-card";
import { analyzeConsumptionPatterns, type AnalyzeConsumptionPatternsOutput } from "@/ai/flows/analyze-consumption-patterns";
import { useToast } from "@/hooks/use-toast";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { AgentMode } from "@/components/agent-mode";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AirVent, Lightbulb, WashingMachine, Wind, BatteryCharging, Refrigerator, Microwave,
  Tv, Plus, Trash2, AlertTriangle, TrendingUp, Zap, BrainCircuit, Leaf,
  Sun, Moon, Clock, DollarSign, ArrowUpRight, ArrowDownRight, Receipt, Bot, Sparkles,
  Activity, LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_DEVICE_ICONS: Record<string, React.ElementType> = {
  AirVent, Lightbulb, WashingMachine, Wind, BatteryCharging, Refrigerator, Microwave, Tv, Zap
};



// ── Device Card ──
function DeviceCard({
  device, onToggle, onRemove, isTopConsumer, analysisResult
}: {
  device: Device;
  onToggle: (id: string, on: boolean) => void;
  onRemove: (id: string) => void;
  isTopConsumer: boolean;
  analysisResult?: AnalyzeConsumptionPatternsOutput['analysisResults'][0];
}) {
  const Icon = device.icon;
  const isOn = device.status === "on";
  const watts = device.powerConsumption;
  const tier = !isOn ? "off" : watts > 1000 ? "high" : watts > 200 ? "medium" : "low";

  const tierConfig: Record<string, { borderColor: string; iconBg: string; textMain: string; textMuted: string; cardBg: string; label: string; badgeVariant: "destructive" | "secondary" | "default" | "outline" }> = {
    off: { 
      borderColor: "border-slate-200 dark:border-slate-800", 
      iconBg: "bg-slate-100 dark:bg-slate-900", 
      cardBg: "bg-slate-50 dark:bg-slate-900/50",
      textMain: "text-slate-400 dark:text-slate-600",
      textMuted: "text-slate-400 dark:text-slate-700",
      label: "Off", 
      badgeVariant: "secondary" 
    },
    low: { 
      borderColor: "border-emerald-600", 
      iconBg: "bg-emerald-500/20", 
      cardBg: "bg-emerald-600 dark:bg-emerald-700",
      textMain: "text-white",
      textMuted: "text-emerald-50",
      label: "Low", 
      badgeVariant: "default" 
    },
    medium: { 
      borderColor: "border-violet-600", 
      iconBg: "bg-violet-500/20", 
      cardBg: "bg-violet-600 dark:bg-violet-700",
      textMain: "text-white",
      textMuted: "text-violet-50",
      label: "Medium", 
      badgeVariant: "outline" 
    },
    high: { 
      borderColor: "border-red-600", 
      iconBg: "bg-red-500/20", 
      cardBg: "bg-red-600 dark:bg-red-700",
      textMain: "text-white",
      textMuted: "text-red-50",
      label: "High", 
      badgeVariant: "destructive" 
    },
  };
  const s = tierConfig[tier];

  return (
    <Card className={cn(
      "relative transition-all duration-300 ease-in-out border-2 overflow-hidden",
      "shadow-md group",
      s.borderColor,
      s.cardBg
    )}>
      <CardHeader className="pb-1 pt-2.5 px-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg transition-colors duration-200", s.iconBg)}>
              <Icon className={cn("h-3.5 w-3.5", !isOn ? "text-slate-400 dark:text-slate-600" : "text-white")} />
            </div>
            <div>
              <CardTitle className={cn("text-xs font-bold leading-tight", s.textMain)}>{device.name}</CardTitle>
              <Badge variant={s.badgeVariant} className={cn("mt-0.5 text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider", !isOn && "opacity-50")}>
                {s.label}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 hover:text-red-500"
            onClick={() => onRemove(device.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5 space-y-1.5">
        <div className="flex items-end justify-between">
          <div>
            <p className={cn("text-[9px] font-bold uppercase tracking-wider", s.textMuted)}>Power</p>
            <p className={cn("text-lg font-black font-mono tabular-nums leading-none", s.textMain)}>{watts}<span className={cn("text-[10px] font-medium ml-0.5", s.textMuted)}>W</span></p>
          </div>
          <div className="text-right">
            <p className={cn("text-[9px] font-bold uppercase tracking-wider", s.textMuted)}>Today</p>
            <p className={cn("text-sm font-bold font-mono tabular-nums leading-none", s.textMain)}>{device.usageHoursToday.toFixed(1)}<span className={cn("text-[10px] font-medium ml-0.5", s.textMuted)}>h</span></p>
          </div>
        </div>

        {analysisResult?.isUnusual && isOn && (
          <div className="flex items-start gap-1 bg-violet-200/60 dark:bg-violet-900/20 border border-violet-400 dark:border-violet-700 rounded p-1.5 text-[10px] text-violet-900 dark:text-violet-200 animate-in slide-in-from-top-1 duration-300">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <p className="leading-snug"><strong>AI:</strong> {analysisResult.reason}</p>
          </div>
        )}

        <Separator className={cn(isOn ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700")} />

        <div className="flex items-center justify-between">
          <Label htmlFor={`sw-${device.id}`} className={cn("text-[10px] font-bold cursor-pointer", s.textMain)}>{isOn ? "Turn Off" : "Turn On"}</Label>
          <Switch id={`sw-${device.id}`} checked={isOn} onCheckedChange={(c) => onToggle(device.id, c)} />
        </div>
      </CardContent>
    </Card>
  );
}


// ── Main Dashboard ──
export function DashboardClient({ onAgentModeChange }: { onAgentModeChange?: (active: boolean) => void } = {}) {
  const [agentModeOpen, setAgentModeOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isDevicesLoading, setIsDevicesLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalyzeConsumptionPatternsOutput | null>(null);
  const customerIdRef = useRef<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [powerSavingMode, setPowerSavingMode] = useState(false);
  const [liveTariff, setLiveTariff] = useState(8.50);
  const [tariffLastUpdated, setTariffLastUpdated] = useState<string | null>(null);

  const [customerType, setCustomerType] = useState<string>("postpaid");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [solarRecords, setSolarRecords] = useState<any[]>([]);

  const { toast } = useToast();

  const handleAgentModeOpen = useCallback(() => {
    setAgentModeOpen(true);
    onAgentModeChange?.(true);
  }, [onAgentModeChange]);

  const handleAgentModeClose = useCallback(() => {
    setAgentModeOpen(false);
    onAgentModeChange?.(false);
  }, [onAgentModeChange]);

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWatts, setNewWatts] = useState("");
  const [newIconKey, setNewIconKey] = useState("Zap");

  // No sticky order ref — device positions are fixed by insertion order only

  const alertSentRef = useRef(false);
  const wsSendRef = useRef<((msg: string) => boolean) | null>(null);

  // --- API DATA FETCHING ---
  const fetchDevices = useCallback(async (customerId: string) => {
    try {
      const res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${customerId}/devices`);
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          // Auto-seed if empty
          await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${customerId}/devices/seed`, { method: "POST" });
          const retryRes = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${customerId}/devices`);
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            setDevices(retryData.map((d: any) => ({ ...d, id: d.device_id, icon: ALL_DEVICE_ICONS[d.icon_key] || Zap, powerConsumption: d.power_consumption_watts, usageHoursToday: d.usage_hours_today, expectedUsage: d.expected_usage })));
          }
        } else {
          setDevices(data.map((d: any) => ({ ...d, id: d.device_id, icon: ALL_DEVICE_ICONS[d.icon_key] || Zap, powerConsumption: d.power_consumption_watts, usageHoursToday: d.usage_hours_today, expectedUsage: d.expected_usage })));
        }
      }
    } catch (e) {
      console.error("Failed to fetch devices:", e);
      toast({ variant: "destructive", title: "Error", description: "Could not load your devices." });
    } finally {
      setIsDevicesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const initializeDashboard = async () => {
      // Resolve stored id (auth UID or DB customer_id)
      const stored = localStorage.getItem("instinct_customer_id");
      let resolved: string = stored || "1004";
      if (!stored) {
        localStorage.setItem("instinct_customer_id", resolved);
      }
      try {
        const exists = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${encodeURIComponent(resolved)}`);
        if (exists.status === 404) {
          const s = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/search?q=${encodeURIComponent(resolved)}`);
          if (s.ok) {
            const found = await s.json();
            if (found && found.customer_id) resolved = found.customer_id;
          }
        }
      } catch (e) {
        console.error("Failed to resolve customer id:", e);
      }

      customerIdRef.current = resolved;
      localStorage.setItem("instinct_customer_id", resolved);
      fetchDevices(resolved);

      // Fetch customer details (type, wallet)
      try {
        const cRes = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${resolved}`);
        if (cRes.ok) {
          const cData = await cRes.json();
          setCustomerType(cData.customer_type || "postpaid");
          setWalletBalance(cData.wallet_balance ?? null);
        }
        
        // If solar, fetch solar records too
        const sRes = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${resolved}/solar`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setSolarRecords(sData.records || []);
        }
      } catch (e) {
        console.error("Failed to fetch customer details:", e);
      }
    };

    initializeDashboard();

    // Fetch live tariff
    const fetchTariff = async () => {
      try {
        const res = await fetch("https://betavolt-978156456889.asia-south1.run.app/tariff");
        if (res.ok) {
          const data = await res.json();
          if (data && data.current_rate_INR) {
            setLiveTariff(data.current_rate_INR);
            if (data.timestamp) {
              const d = new Date(data.timestamp);
              setTariffLastUpdated(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (" + d.toLocaleDateString([], { day: '2-digit', month: 'short' }) + ")");
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch tariff:", e);
      }
    };

    fetchTariff();
    const tariffInterval = setInterval(fetchTariff, 30000);
    return () => clearInterval(tariffInterval);
  }, [fetchDevices]);

  // Handle fluctuation (only updates specific fields visually, server holds reality)
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => {
        if (d.status !== "on") return d;
        const fluc = (Math.random() - 0.5) * (d.powerConsumption * 0.05);
        return { ...d, powerConsumption: Math.max(0, Math.round(d.powerConsumption + fluc)), usageHoursToday: d.usageHoursToday + (1 / 3600) * 5 };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeviceToggle = useCallback(async (deviceId: string, status: boolean) => {
    alertSentRef.current = false;
    
    // Optistic update
    setDevices(prev => prev.map(d => {
      if (d.id !== deviceId) return d;
      const originalWatts = d.powerConsumption > 0 ? d.powerConsumption : 100; // rough fallback if no server original is handy
      return { ...d, status: status ? "on" : "off", powerConsumption: status ? originalWatts : 0 };
    }));

    // Server update
    try {
       const cid = customerIdRef.current;
       if (!cid) throw new Error("No customer id available");
       await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${cid}/devices/${deviceId}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ status: status ? "on" : "off" })
       });
    } catch(e) { console.error("Update failed", e); }
  }, []);

  const handleRemoveDevice = async (id: string) => {
    // Optimistic
    setDevices(prev => prev.filter(d => d.id !== id));
    toast({ title: "Device removed", description: "Device has been removed from your home." });
    
    // Server
    try {
      const cid = customerIdRef.current;
      if (!cid) throw new Error("No customer id available");
      await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${cid}/devices/${id}`, { method: "DELETE" });
    } catch(e) { console.error("Delete failed", e); }
  };

  const handleAddDevice = async () => {
    if (!newName.trim()) return;
    const w = parseInt(newWatts) || 100;
    
    const cid = customerIdRef.current;
    if (!cid) {
      toast({ variant: "destructive", title: "Error", description: "No customer id available." });
      return;
    }
    try {
      const res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${cid}/devices`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, icon_key: newIconKey, power_consumption_watts: w, status: "off" })
      });
      if (res.ok) {
        const data = await res.json();
        const IconComp = (ALL_DEVICE_ICONS[newIconKey] || Zap) as LucideIcon;
        setDevices(prev => [...prev, {
          id: data.device_id, name: newName, icon: IconComp,
          powerConsumption: 0, usageHoursToday: 0, status: "off",
        }] as Device[]);
        setNewName(""); setNewWatts("100"); setAddOpen(false);
        toast({ title: "Device added!", description: `${newName} has been added to your home.` });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add device to Database." });
    }
  };

  const handlePowerSavingToggle = (enabled: boolean) => {
    setPowerSavingMode(enabled);
    if (enabled) {
      setDevices(prev => prev.map(d =>
        d.status === "on" && d.powerConsumption > 500
          ? { ...d, status: "off", powerConsumption: 0 }
          : d
      ));
      toast({ title: "⚡ Power Saving Mode ON", description: "High-consumption devices have been turned off." });
    } else {
      toast({ title: "Power Saving Mode OFF" });
    }
  };

  const totalUsageKWh = useMemo(() =>
    devices.reduce((t, d) => t + (d.powerConsumption * d.usageHoursToday) / 1000, 0), [devices]);

  const activeDevices = useMemo(() => devices.filter(d => d.status === "on"), [devices]);

  const topConsumerId = useMemo(() => {
    if (activeDevices.length === 0) return null;
    return activeDevices.reduce((top, d) => d.powerConsumption > top.powerConsumption ? d : top).id;
  }, [activeDevices]);

  const predictedKWh = useMemo(() => {
    const hourOfDay = new Date().getHours();
    const remainingHours = 24 - hourOfDay;
    return totalUsageKWh + activeDevices.reduce((t, d) => t + (d.powerConsumption * remainingHours) / 1000, 0);
  }, [totalUsageKWh, activeDevices]);

  const predictedCost = predictedKWh * ((puneTariffs.high + puneTariffs.low) / 2);
  const estimatedCost = totalUsageKWh * ((puneTariffs.high + puneTariffs.low) / 2);
  const isAlertLevel = liveTariff >= TARIFF_ALERT_THRESHOLD;
  const hour = new Date().getHours();
  const isHighTariff = hour >= 9 && hour < 21;

  // Devices keep insertion order — no reordering on status change, all shown at once



  // useEffect(() => {
  //   if (liveTariff >= TARIFF_ALERT_THRESHOLD && !alertSentRef.current) {
  //     alertSentRef.current = true;
  //     const alertMsg = JSON.stringify({
  //       event: "tariff_alert", tariff_rate: liveTariff, unit: "INR/kWh",
  //       message: `Tariff is high at ₹${liveTariff.toFixed(2)}/kWh.`,
  //       active_devices: activeDevices.map(d => ({ id: d.id, name: d.name, power_consumption_watts: d.powerConsumption })),
  //     });
  //     wsSendRef.current?.(alertMsg);
  //   }
  // }, [liveTariff, activeDevices]);

  const runAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const result = await analyzeConsumptionPatterns({
        deviceData: devices.map(d => ({ deviceId: d.id, deviceName: d.name, powerConsumption: d.powerConsumption, usageHoursToday: d.usageHoursToday, expectedUsage: d.expectedUsage })),
        tariffRates: puneTariffs, location: "BetaVolt Network",
      });
      setAnalysis(result);
    } catch {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Could not get insights from AI." });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const recentBills = [
    { month: "Feb 2026", amount: "₹2,840", status: "Paid", trend: "-8%", positive: true },
    { month: "Jan 2026", amount: "₹3,180", status: "Paid", trend: "+12%", positive: false },
    { month: "Dec 2025", amount: "₹2,650", status: "Paid", trend: "-3%", positive: true },
  ];

  // Tariff classification for color coding
  const tariffColor = isAlertLevel ? "text-red-600" : liveTariff > 8 ? "text-orange-600" : "text-emerald-600";
  const tariffBg = isAlertLevel ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" : liveTariff > 8 ? "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700";

  // Solar Metrics Display
  const todayGeneration = useMemo(() => {
    if (solarRecords.length === 0) return 15.6; // Believable dummy data for demo
    const today = new Date().toISOString().split('T')[0];
    const recordsToday = solarRecords.filter(r => r.timestamp.startsWith(today));
    if (recordsToday.length > 0) return recordsToday.reduce((acc, r) => acc + r.output_kwh, 0);
    return solarRecords[0].output_kwh; // Fallback to last known or a random offset
  }, [solarRecords]);

  return (
    <TooltipProvider>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Home Monitor</h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
              customerType === "prepaid" ? "bg-emerald-500 text-white" :
              customerType === "solar" ? "bg-amber-500 text-white" :
              "bg-blue-500 text-white"
            }`}>
              {customerType} Active
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live System Status
          </div>
        </div>

        {/* ── ROW 1: Stat Cards ── */}
        <div className={cn("grid gap-3", customerType === "solar" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}>
          
          {/* Usage / Import */}
          <Card className="shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300 border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{customerType === "solar" ? "Current Usage (Import)" : "Usage Today"}</p>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono tabular-nums">{totalUsageKWh.toFixed(2)} <span className="text-xs font-normal text-slate-500">kWh</span></p>
              <p className="text-[10px] mt-0.5 text-slate-500">
                {customerType === "solar" ? "Total grid power consumed" : `≈ ₹${estimatedCost.toFixed(0)}`}
              </p>
            </CardContent>
          </Card>

          {/* Tariff (Hidden for Solar, Middle for others) */}
          {customerType !== "solar" && (
            <Card className={cn("shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 border-2", tariffBg)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  Live Tariff
                  <span className="relative flex h-2 w-2">
                    <span className={cn("animate-ping absolute h-full w-full rounded-full opacity-75", isAlertLevel ? "bg-red-400" : "bg-emerald-400")} />
                    <span className={cn("relative rounded-full h-2 w-2", isAlertLevel ? "bg-red-500" : "bg-emerald-500")} />
                  </span>
                </p>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", isAlertLevel ? "bg-red-100 dark:bg-red-900" : "bg-orange-100 dark:bg-orange-900")}>
                  {isHighTariff ? <Sun className={cn("h-3.5 w-3.5", isAlertLevel ? "text-red-600" : "text-orange-600")} /> : <Moon className="h-3.5 w-3.5 text-slate-500" />}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <p className={cn("text-xl font-black font-mono tabular-nums transition-colors duration-500", tariffColor)}>
                  ₹{liveTariff.toFixed(2)}<span className="text-xs font-normal text-slate-500">/kWh</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {isAlertLevel && <Badge variant="destructive" className="text-[9px] h-4 animate-pulse">HIGH ALERT</Badge>}
                  <p className={cn("text-[10px] font-bold text-slate-500")}>
                    {tariffLastUpdated ? `Updated: ${tariffLastUpdated}` : isHighTariff ? "Peak 9AM–9PM" : "Off-Peak"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Balance / Export / Predicted */}
          <Card className={cn(
            "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300 border-slate-200 dark:border-slate-700",
            customerType === "solar" ? "dark:bg-slate-800 border-l-4 border-l-amber-500" : "bg-slate-900 border-slate-800 text-white"
          )}>
            {customerType === "solar" ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Generation (Export)</p>
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Sun className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-xl font-black font-mono text-amber-500 tabular-nums">
                    {todayGeneration.toFixed(1)} <span className="text-xs font-normal text-slate-400">kWh</span>
                  </p>
                  <p className="text-[10px] mt-0.5 text-slate-500">Total solar energy produced</p>
                </CardContent>
              </>
            ) : customerType === "prepaid" ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wallet Balance</p>
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-xl font-black font-mono text-emerald-400 tabular-nums">
                    ₹{walletBalance?.toLocaleString() ?? "0"}
                  </p>
                  <p className="text-[10px] mt-0.5 text-slate-500">Available Funds</p>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Predicted Today</p>
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                    <BrainCircuit className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-xl font-black font-mono text-emerald-400 tabular-nums">{predictedKWh.toFixed(1)} <span className="text-xs font-normal text-slate-400">kWh</span></p>
                  <p className="text-[10px] mt-0.5 text-slate-500">≈ ₹{predictedCost.toFixed(0)}</p>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* ── ROW 2: Devices ── */}
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
          {/* Header — title only */}
          <CardHeader className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">My Devices</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {devices.length} devices • {activeDevices.length} active
            </p>
          </CardHeader>

          {/* Grid */}
          <CardContent className="p-3 sm:p-4">
            {isDevicesLoading ? (
              <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
                {devices.map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onToggle={handleDeviceToggle}
                    onRemove={handleRemoveDevice}
                    isTopConsumer={device.id === topConsumerId}
                    analysisResult={analysis?.analysisResults.find(r => r.deviceId === device.id)}
                  />
                ))}
              </div>
            )}

            {/* ── Controls Footer ── */}
            <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              {/* Legend */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" />Low</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600" />Med</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" />High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" />Off</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Power Saving */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={powerSavingMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePowerSavingToggle(!powerSavingMode)}
                      className={cn("text-xs gap-1.5 h-9", powerSavingMode && "bg-emerald-600 hover:bg-emerald-700")}
                    >
                      <Leaf className="h-3.5 w-3.5" />
                      {powerSavingMode ? "Saving On" : "Power Save"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Turn off all devices drawing &gt;500W</TooltipContent>
                </Tooltip>

                {/* Agent Mode Trigger */}
                <Button
                  size="sm"
                  className="text-xs gap-1.5 h-9 bg-violet-600 hover:bg-violet-700 text-white shadow-[0_5px_15px_-3px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-0.5"
                  onClick={handleAgentModeOpen}
                >
                  <Sparkles className="h-3.5 w-3.5" />Agent Mode
                </Button>

                {/* Add Device */}
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="text-xs gap-1.5 h-9 bg-slate-900 hover:bg-slate-800">
                      <Plus className="h-3.5 w-3.5" />Add Device
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add a Device</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                      <div>
                        <Label>Device Name</Label>
                        <Input className="mt-1.5" placeholder="e.g. Bedroom AC" value={newName} onChange={e => setNewName(e.target.value)} />
                      </div>
                      <div>
                        <Label>Power Consumption (Watts)</Label>
                        <Input type="number" className="mt-1.5" placeholder="100" value={newWatts} onChange={e => setNewWatts(e.target.value)} />
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Select value={newIconKey} onValueChange={setNewIconKey}>
                          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(ALL_DEVICE_ICONS).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={handleAddDevice}>Add Device</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* ── ROW 4: AI Analysis ── */}
        <AnalysisCard analysis={analysis} isLoading={isLoadingAnalysis} onRunAnalysis={runAnalysis} />

        <ChatbotWidget
          isAgentModeOpen={agentModeOpen}
          onCloseAgentMode={handleAgentModeClose}
          onRegisterWSSend={(fn) => { wsSendRef.current = fn; }}
          onDeviceSignal={(deviceId, action) => {
            handleDeviceToggle(deviceId, action === "turn_on");
          }}
        />
      </div>
    </TooltipProvider>
  );
}
