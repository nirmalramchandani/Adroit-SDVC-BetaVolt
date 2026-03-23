"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const quickAmounts = [100, 200, 500, 1000, 2000];

// An Indian-style electricity bill payload
const billData = {
  billNo: "BV-2026-01-00342",
  billDate: "01 Feb 2026",
  dueDate: "15 Feb 2026",
  billMonth: "January 2026",
  consumer: {
    name: "Akshay Bhatia",
    id: "#M-992104",
    address: "Flat 4B, Sunrise Heights, MIDC, Nagpur – 440018",
    phone: "+91 98765 43210",
    tariffCategory: "LT-I Residential",
    meterNo: "MVV-00-2293847",
    sanctionedLoad: "3 kW",
  },
  readings: {
    previous: 1842,
    current: 2084,
    units: 242,
  },
  charges: [
    { label: "Energy Charges (242 Units × ₹6.50)", amount: 1573.00 },
    { label: "Fixed Charges (3 kW × ₹40)", amount: 120.00 },
    { label: "Fuel Adjustment Charge (FAC)", amount: 48.40 },
    { label: "Electricity Duty @ 5%", amount: 78.57 },
  ],
  subtotal: 1819.97,
  lateFee: 0,
  total: 1819.97,
  previousBalance: 0,
  netPayable: 1819.97,
};

function BillDetail() {
  const handlePrint = () => window.print();

  return (
    <div id="bill-content" className="p-2 text-sm font-mono">
      {/* Header */}
      <div className="text-center border-b-2 border-primary pb-3 mb-4">
        <h2 className="text-xl font-bold text-primary tracking-wider">BetaVolt Energy Solutions Pvt. Ltd.</h2>
        <p className="text-xs text-muted-foreground">DISCOM Registered | CIN: U40100MH2024PTC000001</p>
        <p className="text-xs text-muted-foreground">Helpline: 1912 | betavolt.in | energy@betavolt.in</p>
        <p className="mt-1 text-base font-bold border border-primary inline-block px-4 py-0.5 rounded">
          ELECTRICITY BILL / TAX INVOICE
        </p>
      </div>

      {/* Bill metadata + consumer */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div className="space-y-1">
          <p><span className="font-semibold">Bill No:</span> {billData.billNo}</p>
          <p><span className="font-semibold">Bill Date:</span> {billData.billDate}</p>
          <p><span className="font-semibold">Bill Month:</span> {billData.billMonth}</p>
          <p><span className="font-semibold">Due Date:</span> {billData.dueDate}</p>
        </div>
        <div className="space-y-1">
          <p><span className="font-semibold">Consumer Name:</span> {billData.consumer.name}</p>
          <p><span className="font-semibold">Consumer No:</span> {billData.consumer.id}</p>
          <p><span className="font-semibold">Meter No:</span> {billData.consumer.meterNo}</p>
          <p><span className="font-semibold">Tariff Category:</span> {billData.consumer.tariffCategory}</p>
        </div>
        <div className="col-span-2">
          <p><span className="font-semibold">Address:</span> {billData.consumer.address}</p>
        </div>
      </div>

      {/* Reading */}
      <div className="border rounded mb-4 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted font-semibold">
            <tr>
              <th className="p-2 text-left">Previous Reading</th>
              <th className="p-2 text-left">Current Reading</th>
              <th className="p-2 text-left">Units Consumed</th>
              <th className="p-2 text-left">Sanctioned Load</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">{billData.readings.previous} kWh</td>
              <td className="p-2">{billData.readings.current} kWh</td>
              <td className="p-2 font-bold">{billData.readings.units} kWh</td>
              <td className="p-2">{billData.consumer.sanctionedLoad}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Charges */}
      <div className="border rounded mb-4 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted font-semibold">
            <tr>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {billData.charges.map((c, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{c.label}</td>
                <td className="p-2 text-right">{c.amount.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="border-t bg-muted/50 font-semibold">
              <td className="p-2">Sub Total</td>
              <td className="p-2 text-right">{billData.subtotal.toFixed(2)}</td>
            </tr>
            {billData.lateFee > 0 && (
              <tr className="border-t text-destructive">
                <td className="p-2">Late Payment Surcharge</td>
                <td className="p-2 text-right">{billData.lateFee.toFixed(2)}</td>
              </tr>
            )}
            <tr className="border-t bg-primary text-primary-foreground font-bold">
              <td className="p-2 text-base">NET PAYABLE</td>
              <td className="p-2 text-right text-base">₹ {billData.netPayable.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-[10px] text-muted-foreground border-t pt-2 space-y-1">
        <p>• Pay before due date to avoid late payment surcharge of 1.5% per month.</p>
        <p>• This is a computer-generated bill. No signature required.</p>
        <p>• For grievances: grievance@betavolt.in | Toll-Free: 1800-102-9999</p>
        <p>• GST No: 27AABCB1234C1Z8 | PAN: AABCB1234C</p>
      </div>

      <div className="flex gap-2 justify-end mt-4 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>
    </div>
  );
}

export function ConsumerBilling() {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txns, setTxns] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [consumerId, setConsumerId] = useState<string | null>(null);

  const fetchWallet = useCallback(async (cid: string) => {
    try {
      const res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${cid}/wallet`);
      if (res.ok) {
        const j = await res.json();
        setBalance(j.wallet_balance ?? 0);
        setTxns(j.transactions?.map((t: any) => ({
          id: t._id,
          date: new Date(t.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          amount: t.amount,
          type: t.type === "credit" ? "Credit" : "Debit",
          status: "Success",
          desc: t.by === "ui" ? "Wallet Top-up" : "Consumption Deduction",
        })) || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchBills = useCallback(async (cid: string) => {
    try {
      const res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${cid}/bills`);
      if (res.ok) {
        const j = await res.json();
        setBills(j || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("instinct_customer_id");
    if (id) {
      setConsumerId(id);
      fetchWallet(id);
      fetchBills(id);
    }
  }, [fetchWallet, fetchBills]);

  const handleRecharge = async () => {
    const amt = Number(rechargeAmount);
    if (!rechargeAmount || isNaN(amt) || amt <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid recharge amount.", variant: "destructive" });
      return;
    }
    if (!consumerId) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${consumerId}/wallet/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      if (res.ok) {
        toast({ title: "Top-up Successful! 🎉", description: `₹${amt.toFixed(2)} added to your wallet.` });
        setRechargeAmount("");
        fetchWallet(consumerId);
      } else {
        toast({ title: "Top-up Failed", description: "Backend error.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not connect to backend.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const daysRemaining = Math.max(0, Math.round(balance / (billData.netPayable / 31)));

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your prepaid meter balance and download bills.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <Card className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary-foreground/80 text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">₹{balance.toFixed(2)}</div>
            <p className="text-sm text-primary-foreground/70 mt-1">≈ {daysRemaining} days remaining</p>
            <div className="mt-3 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary-foreground/80 rounded-full" style={{ width: `${Math.min(100, (balance / 2000) * 100)}%` }} />
            </div>
            {balance < 500 && (
              <p className="text-xs mt-2 bg-destructive/80 rounded px-2 py-1 inline-block">⚠ Low balance — recharge soon</p>
            )}
          </CardContent>
        </Card>

        {/* Top-up Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top-up Wallet</CardTitle>
            <CardDescription>Add funds to your prepaid meter instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map(amount => (
                <Button key={amount} variant="outline" size="sm"
                  className={rechargeAmount === String(amount) ? "border-primary text-primary" : ""}
                  onClick={() => setRechargeAmount(amount.toString())}
                >₹{amount}</Button>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <Input type="number" placeholder="Custom amount" value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)} className="pl-7" />
              </div>
              <Button onClick={handleRecharge} disabled={isProcessing} className="w-36">
                {isProcessing ? "Processing..." : "Add to Wallet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent recharges and monthly deductions</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txns.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-sm">{txn.date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{txn.desc}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        {txn.type === "Credit"
                          ? <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                        <span className={txn.type === "Credit" ? "text-emerald-600" : "text-destructive"}>{txn.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {txn.type === "Credit" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />{txn.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bill Download Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Download Bills
            </CardTitle>
            <CardDescription>View and download detailed monthly bills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No bills found.</p>
            ) : (
              bills.map((bill) => (
                <div key={bill._id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">{bill.month}</p>
                    <p className="text-xs text-muted-foreground">{bill.usage_kwh} kWh · {bill.amount}</p>
                    <p className={`text-[10px] font-bold mt-1 ${bill.status === "Paid" ? "text-emerald-600" : "text-red-500"}`}>{bill.status}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Electricity Bill — {bill.month}</DialogTitle>
                      </DialogHeader>
                      <BillDetail />
                    </DialogContent>
                  </Dialog>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
