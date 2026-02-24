import type { LucideIcon } from "lucide-react";

export type Device = {
  id: string;
  name: string;
  icon: LucideIcon;
  powerConsumption: number;
  usageHoursToday: number;
  status: 'on' | 'off';
  expectedUsage?: string;
};

export type Tariff = {
  high: number;
  low: number;
  current?: number; // live dynamic rate
};

// Threshold above which the AI agent auto-alerts (₹/kWh)
export const TARIFF_ALERT_THRESHOLD = 9.5;
