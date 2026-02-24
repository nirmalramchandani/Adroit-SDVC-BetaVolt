"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap, Sun, Moon, TrendingUp } from "lucide-react";
import type { Tariff } from "@/app/lib/types";
import { TARIFF_ALERT_THRESHOLD } from "@/app/lib/types";

interface SummaryCardsProps {
  totalUsage: number;
  tariffs: Tariff;
}

export function SummaryCards({ totalUsage, tariffs }: SummaryCardsProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const estimatedCost = totalUsage * ((tariffs.high + tariffs.low) / 2);

  const hour = currentDate ? currentDate.getHours() : -1;
  const isHighTariff = hour >= 9 && hour < 21;
  const TariffIcon = isHighTariff ? Sun : Moon;

  // Use live dynamic rate if provided, otherwise fall back to static
  const displayRate = tariffs.current ?? (isHighTariff ? tariffs.high : tariffs.low);
  const isAlertLevel = displayRate >= TARIFF_ALERT_THRESHOLD;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usage Today</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsage.toFixed(2)} kWh</div>
          <p className="text-xs text-muted-foreground">
            Estimated Cost: ₹{estimatedCost.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className={isAlertLevel ? "border-destructive" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Current Tariff Rate
            {/* Live pulse indicator */}
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAlertLevel ? "bg-destructive" : "bg-accent"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAlertLevel ? "bg-destructive" : "bg-accent"}`} />
            </span>
          </CardTitle>
          {currentDate
            ? (isAlertLevel
                ? <TrendingUp className="h-4 w-4 text-destructive" />
                : <TariffIcon className="h-4 w-4 text-muted-foreground" />)
            : <div className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          {!currentDate ? (
            <>
              <div className="text-2xl font-bold animate-pulse">--</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </>
          ) : (
            <>
              <div className={`text-2xl font-bold transition-colors duration-500 ${isAlertLevel ? "text-destructive" : ""}`}>
                ₹{displayRate.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground ml-1">/kWh</span>
              </div>
              <p className={`text-xs font-medium ${isAlertLevel ? "text-destructive" : isHighTariff ? "text-orange-500" : "text-accent"}`}>
                {isHighTariff ? "High Period" : "Low Period"}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
