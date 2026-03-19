"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, Zap, Sparkles } from "lucide-react";

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
        let res = await fetch(`http://localhost:8080/customers/${custId}`);
        if (res.status === 404) {
          // try search by the stored identifier (auth UID / email etc.)
          const s = await fetch(`http://localhost:8080/customers/search?q=${encodeURIComponent(custId)}`);
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
        const res2 = await fetch(`http://localhost:8080/customers/${custId}`);
        if (res2.ok) {
          const j = await res2.json();
          setCustomerType(j.customer_type || "postpaid");
          setWalletBalance(j.wallet_balance ?? null);
        }

        const w = await fetch(`http://localhost:8080/customers/${custId}/wallet`);
        if (w.ok) {
          const jw = await w.json();
          setWalletBalance(jw.wallet_balance ?? null);
        }

        const s2 = await fetch(`http://localhost:8080/customers/${custId}/solar`);
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
      const res = await fetch(`http://localhost:8080/customers/${consumerId}/type`, {
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
      const res = await fetch(`http://localhost:8080/customers/${consumerId}/wallet/topup`, {
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
      const res = await fetch(`http://localhost:8080/customers/${consumerId}/solar/record`, {
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Customer Type</CardTitle>
              </div>
              <CardDescription>Set customer type: prepaid, postpaid or solar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button size="sm" variant={customerType === "prepaid" ? "default" : "outline"} onClick={() => setType("prepaid")}>Prepaid</Button>
                <Button size="sm" variant={customerType === "postpaid" ? "default" : "outline"} onClick={() => setType("postpaid")}>Postpaid</Button>
                <Button size="sm" variant={customerType === "solar" ? "default" : "outline"} onClick={() => setType("solar")}>Solar</Button>
              </div>

              {customerType === "prepaid" && (
                <div className="space-y-2">
                  <p className="text-sm">Wallet Balance: <strong>{walletBalance ?? "—"} INR</strong></p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => topUp(100)}>Top-up ₹100</Button>
                    <Button size="sm" onClick={() => topUp(500)}>Top-up ₹500</Button>
                  </div>
                </div>
              )}

              {customerType === "solar" && (
                <div className="space-y-2">
                  <p className="text-sm">Solar Input / Output Records</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Input kWh" id="in-kwh" className="input" />
                    <input placeholder="Output kWh" id="out-kwh" className="input" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      const inEl = document.getElementById("in-kwh") as HTMLInputElement | null;
                      const outEl = document.getElementById("out-kwh") as HTMLInputElement | null;
                      const inV = Number(inEl?.value || 0);
                      const outV = Number(outEl?.value || 0);
                      addSolarRecord(inV, outV);
                      if (inEl) inEl.value = "";
                      if (outEl) outEl.value = "";
                    }}>Add Record</Button>
                  </div>
                  <div className="space-y-1 text-xs">
                    {solarRecords.length === 0 ? <p className="text-muted-foreground">No records yet.</p> : (
                      solarRecords.map((r, i) => (
                        <div key={i} className="border rounded p-2">
                          <div>Input: {r.input_kwh} kWh — Output: {r.output_kwh} kWh</div>
                          <div className="text-muted-foreground text-xs">{new Date(r.timestamp).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {customerType === "postpaid" && (
                <div className="text-sm">Postpaid customers use the regular bill view in Billing page.</div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
