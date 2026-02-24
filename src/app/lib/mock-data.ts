import { AirVent, Lightbulb, WashingMachine, Wind, BatteryCharging, Refrigerator, Microwave } from "lucide-react";
import type { Device, Tariff } from "./types";

export const initialDevices: Device[] = [
  {
    id: 'ac-1',
    name: 'Living Room AC',
    icon: AirVent,
    powerConsumption: 1500,
    usageHoursToday: 2.5,
    status: 'on',
    expectedUsage: '2-3 hours in the evening'
  },
  {
    id: 'refrigerator-1',
    name: 'Refrigerator',
    icon: Refrigerator,
    powerConsumption: 200,
    usageHoursToday: 24,
    status: 'on',
  },
  {
    id: 'washing-machine-1',
    name: 'Washing Machine',
    icon: WashingMachine,
    powerConsumption: 0,
    usageHoursToday: 1.2,
    status: 'off',
  },
  {
    id: 'microwave-1',
    name: 'Microwave',
    icon: Microwave,
    powerConsumption: 0,
    usageHoursToday: 0.2,
    status: 'off',
  },
  {
    id: 'lights-1',
    name: 'Kitchen Lights',
    icon: Lightbulb,
    powerConsumption: 40,
    usageHoursToday: 5.1,
    status: 'on',
  },
  {
    id: 'fan-1',
    name: 'Bedroom Fan',
    icon: Wind,
    powerConsumption: 75,
    usageHoursToday: 8.0,
    status: 'on',
  },
  {
    id: 'ev-charger-1',
    name: 'EV Charger',
    icon: BatteryCharging,
    powerConsumption: 0,
    usageHoursToday: 0.5,
    status: 'off',
    expectedUsage: 'Overnight charging 3 times a week'
  },
  {
    id: 'lights-2',
    name: 'Outdoor Lights',
    icon: Lightbulb,
    powerConsumption: 100,
    usageHoursToday: 0,
    status: 'off',
  }
];

export const puneTariffs: Tariff = {
  high: 11.82, // Sample peak rate in ₹/kWh
  low: 5.86,   // Sample off-peak rate in ₹/kWh
};
