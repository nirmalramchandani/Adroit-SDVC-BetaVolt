"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Device } from "@/app/lib/types";
import type { AnalyzeConsumptionPatternsOutput } from "@/ai/flows/analyze-consumption-patterns";
import { AlertTriangle } from "lucide-react";

interface DeviceCardProps {
  device: Device;
  onToggle: (deviceId: string, status: boolean) => void;
  analysisResult?: AnalyzeConsumptionPatternsOutput['analysisResults'][0];
}

export function DeviceCard({ device, onToggle, analysisResult }: DeviceCardProps) {
  const Icon = device.icon;
  const isUnusual = analysisResult?.isUnusual;

  const getPowerConfig = () => {
    if (device.status === 'off') {
      return {
        card: 'bg-muted/50 text-card-foreground',
        iconWrapper: 'bg-secondary',
        icon: 'text-secondary-foreground',
        status: 'text-muted-foreground',
        muted: 'text-muted-foreground',
        border: 'border-border',
        glowColor: '220 13% 95%' // background
      };
    }
    // Efficient -> "green"
    if (device.powerConsumption <= 100) {
        return {
            card: 'bg-accent text-accent-foreground',
            iconWrapper: 'bg-accent-foreground/10',
            icon: 'text-accent-foreground',
            status: 'text-accent-foreground/90',
            muted: 'text-accent-foreground/70',
            border: 'border-accent-foreground/20',
            glowColor: 'var(--accent)'
        };
    }
    // Medium consumption -> using primary color
    if (device.powerConsumption <= 1000) {
        return {
            card: 'bg-primary/90 text-primary-foreground',
            iconWrapper: 'bg-primary-foreground/10',
            icon: 'text-primary-foreground',
            status: 'text-primary-foreground/90',
            muted: 'text-primary-foreground/70',
            border: 'border-primary-foreground/20',
            glowColor: 'var(--primary)'
        };
    }
    // High consumption -> "deep red"
    return {
      card: 'bg-destructive text-destructive-foreground',
      iconWrapper: 'bg-destructive-foreground/10',
      icon: 'text-destructive-foreground',
      status: 'text-destructive-foreground/90',
      muted: 'text-destructive-foreground/70',
      border: 'border-destructive-foreground/20',
      glowColor: 'var(--destructive)'
    };
  };

  const powerConfig = getPowerConfig();
  const isHighConsumption = device.status === 'on' && device.powerConsumption > 1000;
  const isMediumConsumption = device.status === 'on' && device.powerConsumption > 100 && device.powerConsumption <= 1000;

  return (
    <Card 
        className={cn(
            "transition-all duration-300",
            powerConfig.card,
            device.status === 'on' && 'animate-card-glow',
            isUnusual && device.status === 'on' && !isHighConsumption && !isMediumConsumption && "ring-2 ring-offset-2 ring-offset-background ring-destructive"
        )}
        style={{ '--glow-color': powerConfig.glowColor } as React.CSSProperties}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{device.name}</CardTitle>
          <p className={cn("text-xs font-semibold", powerConfig.status)}>
            {device.status === 'on' ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className={cn("p-2 rounded-md transition-colors", powerConfig.iconWrapper)}>
            <Icon className={cn("h-6 w-6 transition-colors", powerConfig.icon)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className={cn("text-xs", powerConfig.muted)}>Power Draw</p>
            <p className="text-2xl font-bold">{device.powerConsumption}<span className="text-sm font-medium"> W</span></p>
          </div>
          <div>
            <p className={cn("text-xs", powerConfig.muted)}>Usage Today</p>
            <p className="text-2xl font-bold">{device.usageHoursToday.toFixed(1)}<span className="text-sm font-medium"> hrs</span></p>
          </div>
        </div>

        {isUnusual && (
          <div className={cn(
            "flex items-start gap-2 p-3 rounded-md text-xs",
            isHighConsumption ? 'bg-destructive-foreground/10 text-destructive-foreground'
            : isMediumConsumption ? 'bg-primary-foreground/10 text-primary-foreground'
            : 'bg-destructive/10 text-destructive'
          )}>
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0"/>
            <p><strong>AI Warning:</strong> {analysisResult.reason}</p>
          </div>
        )}

        <div className={cn("flex items-center justify-between pt-4 border-t", powerConfig.border)}>
          <Label htmlFor={`switch-${device.id}`} className="text-sm font-medium">
            Device Status
          </Label>
          <Switch
            id={`switch-${device.id}`}
            checked={device.status === 'on'}
            onCheckedChange={(checked) => onToggle(device.id, checked)}
            aria-label={`Toggle ${device.name}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
