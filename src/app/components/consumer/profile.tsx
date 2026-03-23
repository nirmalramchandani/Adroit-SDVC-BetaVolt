"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bell, Shield, Zap, Sparkles, ArrowRightCircle, ShieldCheck } from "lucide-react";

export function ConsumerProfile() {
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [customerType, setCustomerType] = useState<string>("postpaid");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [solarRecords, setSolarRecords] = useState<Array<any>>([]);
  const [consumerId, setConsumerId] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    // read customer id from localStorage (set by LoginScreen)
    const id = localStorage.getItem("instinct_customer_id");
    if (!id) {
      // no customer id available — leave null; UI can show a hint
      return;
    }
    // try to load customer by stored id; if the backend returns 404, try search endpoint
    (async () => {
      try {
        let custId = id;
        let res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${custId}`);
        if (res.status === 404) {
          // try search by the stored identifier (auth UID / email etc.)
          const s = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/search?q=${encodeURIComponent(custId)}`);
          if (s.ok) {
            const found = await s.json();
            if (found && found.customer_id) {
              custId = found.customer_id;
            }
          }
        }

        // if we resolved a customer id, persist it locally so subsequent loads use the DB id
        setConsumerId(custId);
        localStorage.setItem("instinct_customer_id", custId);

        // Load customer, wallet, solar using the resolved id
        const res2 = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${custId}`);
        if (res2.ok) {
          const j = await res2.json();
          setCustomerType(j.customer_type || "postpaid");
          setWalletBalance(j.wallet_balance ?? null);
        }

        const w = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${custId}/wallet`);
        if (w.ok) {
          const jw = await w.json();
          setWalletBalance(jw.wallet_balance ?? null);
        }

        const s2 = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${custId}/solar`);
        if (s2.ok) {
          const js = await s2.json();
          setSolarRecords(js.records || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const setType = async (t: string) => {
    try {
      const res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${consumerId}/type`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_type: t }),
      });
      if (res.ok) {
        setCustomerType(t);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const topUp = async (amount: number) => {
    try {
      const res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${consumerId}/wallet/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const j = await res.json();
        setWalletBalance(j.wallet_balance ?? null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addSolarRecord = async (input_kwh: number, output_kwh: number) => {
    try {
      const res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${consumerId}/solar/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_kwh, output_kwh }),
      });
      if (res.ok) {
        // simple re-fetch of records could be added; we append a placeholder
        setSolarRecords((s) => [...s, { input_kwh, output_kwh, timestamp: new Date().toISOString() }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle dark mode by adding/removing 'dark' class on html element
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile & Preferences</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and AI agent preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Personal Details</CardTitle>
            </div>
            <CardDescription>Your registered consumer information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Full Name</Label>
                <p className="font-medium">Akshay Bhatia</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Consumer ID</Label>
                <p className="font-medium text-muted-foreground">#M-992104</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                <p className="font-medium">akshay.b@example.com</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Phone</Label>
                <p className="font-medium">+91 98765 43210</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-2">Edit Details</Button>
          </CardContent>
        </Card>
          {/* Customer Type Switcher + Conditional UI */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Service Management</CardTitle>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  customerType === "prepaid" ? "bg-emerald-500 text-white" :
                  customerType === "solar" ? "bg-amber-500 text-white" :
                  "bg-blue-500 text-white"
                }`}>
                  {customerType} Active
                </span>
              </div>
              <CardDescription>Manage your current subscription and request service changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h4 className="text-sm font-bold mb-1">Current Plan: <span className="capitalize text-primary">{customerType}</span></h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {customerType === "prepaid" && "You are currently using the pay-as-you-go service. Balance is deducted in real-time based on your usage."}
                  {customerType === "postpaid" && "Standard monthly billing is active. You will receive an invoice at the end of each billing cycle."}
                  {customerType === "solar" && "Solar optimization is active. Your system is feeding-in excess power to the BetaVolt grid."}
                </p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Instant Plan Switch (Demo)</p>
                  <div className="flex gap-2 mb-6">
                    <Button size="sm" variant={customerType === "prepaid" ? "default" : "outline"} className="flex-1 text-xs h-8" onClick={() => setType("prepaid")}>Prepaid</Button>
                    <Button size="sm" variant={customerType === "postpaid" ? "default" : "outline"} className="flex-1 text-xs h-8" onClick={() => setType("postpaid")}>Postpaid</Button>
                    <Button size="sm" variant={customerType === "solar" ? "default" : "outline"} className="flex-1 text-xs h-8" onClick={() => setType("solar")}>Solar</Button>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Service Requests</p>
                  {customerType === "prepaid" && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium">Switching to Postpaid?</p>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs h-9 border-dashed" onClick={() => alert("Postpaid activation request sent to BetaVolt Admin.")}>
                        <ArrowRightCircle className="h-3.5 w-3.5 mr-2" /> Request Postpaid Activation
                      </Button>
                      <p className="text-[10px] text-muted-foregrounditalic">* Requires credit verification and a security deposit of ₹2,000.</p>
                    </div>
                  )}
                  {customerType === "postpaid" && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium">Switching to Prepaid?</p>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs h-9 border-dashed" onClick={() => alert("Prepaid migration request sent. Our agent will contact you for meter re-configuration.")}>
                        <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Request Prepaid Migration
                      </Button>
                      <p className="text-[10px] text-muted-foreground italic">* Instant balance deduction will start after meter firmware update.</p>
                    </div>
                  )}
                  {customerType === "solar" && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 font-bold">
                      <Sparkles className="h-4 w-4" /> Solar Optimization Fully Active
                    </div>
                  )}
                </div>
              </div>

              {customerType === "prepaid" && (
                <div className="space-y-3 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-900/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Wallet Management</Label>
                    <p className="text-sm font-mono font-black text-emerald-600">₹{walletBalance?.toFixed(2) ?? "—"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs" onClick={() => topUp(100)}>+₹100</Button>
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs" onClick={() => topUp(500)}>+₹500</Button>
                  </div>
                </div>
              )}

              {customerType === "solar" && (
                <div className="space-y-4 p-4 rounded-xl border border-amber-100 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-900/10">
                  <Label className="text-sm font-bold text-amber-700 dark:text-amber-400">Solar Record Management</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Input kWh" id="in-kwh" className="h-8 text-xs bg-white/50 dark:bg-slate-900/50" />
                    <Input placeholder="Output kWh" id="out-kwh" className="h-8 text-xs bg-white/50 dark:bg-slate-900/50" />
                  </div>
                  <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 h-8 text-xs" onClick={() => {
                    const inEl = document.getElementById("in-kwh") as HTMLInputElement | null;
                    const outEl = document.getElementById("out-kwh") as HTMLInputElement | null;
                    const inV = Number(inEl?.value || 0);
                    const outV = Number(outEl?.value || 0);
                    addSolarRecord(inV, outV);
                    if (inEl) inEl.value = "";
                    if (outEl) outEl.value = "";
                  }}>Log Daily Production</Button>
                  
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                    {solarRecords.length === 0 ? <p className="text-[10px] text-muted-foreground">No production logs available.</p> : (
                      solarRecords.map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] p-2 bg-white/40 dark:bg-slate-900/30 rounded border border-amber-100/50 dark:border-amber-900/30">
                          <span className="font-medium">{new Date(r.timestamp).toLocaleDateString()}</span>
                          <span className="text-amber-700 dark:text-amber-400 font-bold">{r.output_kwh} Out / {r.input_kwh} In</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
