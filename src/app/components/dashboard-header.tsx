"use client";

import { useState, useEffect } from "react";
import { Zap, MapPin, User, Clock } from "lucide-react";
import { format } from "date-fns";

export function DashboardHeader() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial date after mount to avoid hydration mismatch
    setCurrentDate(new Date());
    
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // Update time every second

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
           <Zap className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Pune Home Monitor</h1>
      </div>
      <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center sm:gap-x-6 gap-y-2 text-sm text-muted-foreground">
         <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4"/>
            <span>Pune</span>
         </div>
         <div className="flex items-center gap-2">
            <User className="h-4 w-4"/>
            <span>CUST-007</span>
         </div>
         <div className="flex items-center gap-2 col-span-2">
            <Clock className="h-4 w-4"/>
            {currentDate ? (
                <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-foreground">{format(currentDate, 'HH:mm:ss')}</span>
                    <span className="text-xs">{format(currentDate, 'eeee, d MMM yyyy')}</span>
                </div>
            ) : (
                <div className="w-48 h-6 rounded-md bg-muted animate-pulse" />
            )}
         </div>
      </div>
    </header>
  );
}
