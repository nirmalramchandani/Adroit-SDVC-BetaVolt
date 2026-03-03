"use client";

import React, { useState } from "react";
import {
  Activity, Search, User, ShieldAlert, Receipt, Settings, Bot,
  Zap, CreditCard, AlertCircle, Printer, Ban, TrendingUp,
  ServerOff, AlertOctagon, Clock, CheckCircle2, AlertTriangle,
  MoreVertical, MessageSquare, ZapOff, Filter, BarChart3,
  Terminal, Cpu, HardDrive, Wifi, DollarSign, ArrowUpRight, ArrowDownRight,
  Users, MapPin
} from "lucide-react";

// --- MOCK DATA ---
const MOCK_INCIDENTS = [
  { id: "INC-9092", consumerId: "UID-88392", consumerName: "TechPark Plaza", category: "Infrastructure", subCategory: "Phase Drop", priority: "Urgent", criticalityScore: 9.8, status: "Investigating", slaStatus: "Breached", timeRemaining: "-12m", assignedTo: "L2 Grid Ops", timestamp: "2026-03-03 10:15:00" },
  { id: "INC-9093", consumerId: "UID-10294", consumerName: "Rajesh K.", category: "Billing", subCategory: "Meter Discrepancy", priority: "High", criticalityScore: 7.2, status: "Open", slaStatus: "At Risk", timeRemaining: "45m", assignedTo: "Billing Res", timestamp: "2026-03-03 09:30:00" },
  { id: "INC-9094", consumerId: "UID-44021", consumerName: "Sector 4 Block", category: "Agent Server", subCategory: "Node Offline", priority: "Urgent", criticalityScore: 8.5, status: "Escalated", slaStatus: "On Track", timeRemaining: "1h 15m", assignedTo: "SysAdmin", timestamp: "2026-03-03 10:40:00" },
];

const MOCK_TRANSACTIONS = [
  { id: "TRX-88291A", date: "2026-03-03 10:12", user: "Rajesh K.", amount: "₹4,250", method: "UPI", status: "Settled", gateway: "Razorpay" },
  { id: "TRX-88292B", date: "2026-03-03 09:45", user: "Vikram P.", amount: "₹1,200", method: "Credit Card", status: "Processing", gateway: "Stripe" },
  { id: "TRX-88293C", date: "2026-03-02 22:10", user: "Sanjay M.", amount: "₹8,900", method: "Net Banking", status: "Failed", gateway: "BillDesk" },
  { id: "TRX-88294D", date: "2026-03-02 18:30", user: "TechPark", amount: "₹1,45,000", method: "RTGS", status: "Settled", gateway: "Direct Bank" },
];

const MOCK_PUNE_SECTORS = [
  { id: "PUN-01", name: "Hinjewadi (IT Park)", load: 94, status: "critical", x: 15, y: 35, peakTime: "14:00 - 18:00" },
  { id: "PUN-08", name: "Baner & Balewadi", load: 68, status: "warning", x: 25, y: 25, peakTime: "18:00 - 22:00" },
  { id: "PUN-02", name: "Kothrud", load: 42, status: "normal", x: 30, y: 60, peakTime: "19:00 - 23:00" },
  { id: "PUN-03", name: "Shivajinagar", load: 75, status: "warning", x: 45, y: 45, peakTime: "10:00 - 17:00" },
  { id: "PUN-07", name: "Katraj", load: 45, status: "normal", x: 45, y: 75, peakTime: "19:00 - 23:00" },
  { id: "PUN-04", name: "Viman Nagar", load: 88, status: "critical", x: 70, y: 30, peakTime: "11:00 - 16:00" },
  { id: "PUN-05", name: "Kharadi (EON)", load: 91, status: "critical", x: 85, y: 35, peakTime: "13:00 - 18:00" },
  { id: "PUN-06", name: "Magarpatta", load: 82, status: "critical", x: 75, y: 65, peakTime: "10:00 - 18:00" },
];

export default function IntellismartMasterDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [consumerData, setConsumerData] = useState<any>(null);

  // --- TAB RENDERING LOGIC ---

  const renderOverview = () => (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Network Load" value="482.5 MW" trend="+2.4%" positive={false} icon={<Zap />} />
        <StatCard title="Active Consumers" value="1,248,092" trend="+124 today" positive={true} icon={<Users />} />
        <StatCard title="Agent Interventions" value="45,210" trend="past 24h" positive={true} icon={<Bot />} />
        <StatCard title="Daily Revenue Col." value="₹1.42 Cr" trend="+5.2%" positive={true} icon={<DollarSign />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2" /> Grid Load Curve (24h Forecast)</h3>
          <div className="h-64 bg-slate-50 border border-slate-100 rounded flex items-end px-4 pb-4 space-x-2">
            {[40, 30, 20, 15, 20, 35, 60, 85, 95, 80, 70, 65, 75, 85, 90, 100, 95, 85, 70, 50, 45, 35, 30, 45].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500 rounded-t opacity-80 hover:opacity-100 transition-opacity relative group" style={{ height: `${h}%` }}>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {h}MW
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 text-white flex flex-col">
          <h3 className="font-bold text-slate-100 mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-blue-400" /> System Health</h3>
          <div className="space-y-4 flex-1">
            <HealthMeter label="API Gateway" value={99.8} />
            <HealthMeter label="Meter Telemetry Database" value={100} />
            <HealthMeter label="AI Agent Cluster (Pune)" value={84.2} warning />
            <HealthMeter label="Billing Settlement Engine" value={98.5} />
          </div>
          <button className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-sm py-2 rounded border border-slate-600 transition">
            View Technical Logs
          </button>
        </div>
      </div>

      {/* --- NEW MAP OVERLAY APPENDED HERE --- */}
      <div className="mt-6">
        <SystemMapOverlay />
      </div>
    </div>
  );

  const renderConsumerManagement = () => (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Search Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery) {
            // Richer Mock Data Structure
            setConsumerData({
              id: searchQuery.toUpperCase(), 
              meterId: "MTR-8992-AXV",
              name: "Rajesh Kumar", 
              phone: "+91 98765 43210", 
              address: "Sector 4, Block B, Tech Park Road, Pune", 
              type: "Smart Prepaid User", 
              status: "Active",
              connectionDate: "12 Aug 2024",
              
              // Usage & Telemetry
              liveUsage: "1.42 kW", 
              dailyAvg: "8.5 kWh", 
              dailyCost: "₹ 58.40",
              monthlyTotal: "145 kWh", 
              predictedMonthly: "280 kWh", 
              
              // Financials
              prepaidBalance: "₹ 1,450.00", 
              outstandingDues: "₹ 840.00",
              walletStatus: "Low Balance",
              
              // Tables Data
              pendingBills: [
                { month: "Feb 2026", amount: "₹ 840.00", dueDate: "05 Mar 2026", type: "Postpaid Diff" }
              ],
              complaints: [
                { id: "INC-9093", date: "03 Mar 2026", issue: "Meter Sync Delay", status: "Open", priority: "High" },
                { id: "INC-8821", date: "15 Feb 2026", issue: "Agent False Alert", status: "In Progress", priority: "Low" }
              ],
              
              // Agent & Infrastructure
              agentStatus: true,
              agentMode: "Semi-Automatic"
            });
          }
        }} className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Enter Consumer ID (e.g., UID-10294) or Meter Number..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm shadow-inner" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition flex items-center">
            <Search className="w-4 h-4 mr-2" /> Retrieve Profile
          </button>
        </form>
      </div>

      {consumerData ? (
        <div className="space-y-6">
          
          {/* Header Profile Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start space-x-5">
              <div className="h-16 w-16 bg-slate-900 text-emerald-400 rounded-xl shadow-inner flex items-center justify-center border border-slate-700">
                <User className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-2xl font-bold text-slate-900">{consumerData.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${consumerData.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    ● {consumerData.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 font-mono">
                  <span><strong className="text-slate-700">UID:</strong> {consumerData.id}</span>
                  <span><strong className="text-slate-700">METER:</strong> {consumerData.meterId}</span>
                  <span><strong className="text-slate-700">TYPE:</strong> {consumerData.type}</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">{consumerData.address} • {consumerData.phone}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition">
                <MessageSquare className="w-4 h-4 mr-2" /> Contact User
              </button>
              <button className="text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition">
                <Printer className="w-4 h-4 mr-2" /> Export PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: Telemetry & Complaints */}
            <div className="space-y-6">
              
              {/* Telemetry & Usage */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center"><Zap className="w-4 h-4 text-emerald-500 mr-2" /> Usage & Telemetry</h4>
                  <span className="flex items-center text-[10px] text-emerald-600 font-bold uppercase"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-1"></span> Live Sync</span>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Current Load</p>
                    <p className="text-4xl font-bold font-mono text-slate-900">{consumerData.liveUsage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Est. Daily Cost</p>
                    <p className="text-4xl font-bold font-mono text-orange-600">{consumerData.dailyCost}</p>
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Daily Avg</p>
                      <p className="font-semibold text-slate-700">{consumerData.dailyAvg}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">MTD Total</p>
                      <p className="font-semibold text-slate-700">{consumerData.monthlyTotal}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Predicted</p>
                      <p className="font-semibold text-slate-700">{consumerData.predictedMonthly}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaints & Resolution */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center"><ShieldAlert className="w-4 h-4 text-blue-500 mr-2" /> Complaint Resolution</h4>
                  <button className="text-xs font-bold text-blue-600 hover:underline">View Full History</button>
                </div>
                <div className="p-0">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold border-b">
                      <tr><th className="px-4 py-2">Ticket</th><th className="px-4 py-2">Issue</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {consumerData.complaints.map((c: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-blue-600 text-xs">{c.id}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{c.issue}<div className="text-[10px] text-slate-400">{c.date}</div></td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.status === 'Open' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{c.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded text-[10px] font-bold transition">Resolve</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Financials & Service Controls */}
            <div className="space-y-6">
              
              {/* Financials & Pending Bills */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center"><Receipt className="w-4 h-4 text-indigo-500 mr-2" /> Billing & Financials</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${consumerData.walletStatus === 'Low Balance' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{consumerData.walletStatus}</span>
                </div>
                
                <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-100">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Prepaid Wallet</p>
                    <p className="text-2xl font-bold font-mono text-emerald-700">{consumerData.prepaidBalance}</p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1">Pending Dues</p>
                    <p className="text-2xl font-bold font-mono text-red-700">{consumerData.outstandingDues}</p>
                  </div>
                </div>

                <div className="p-0">
                  <div className="px-6 py-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b">Pending Bills / Invoices</div>
                  <ul className="divide-y divide-slate-100">
                    {consumerData.pendingBills.map((bill: any, i: number) => (
                      <li key={i} className="px-6 py-3 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{bill.month} <span className="text-xs font-normal text-slate-500">({bill.type})</span></p>
                          <p className="text-xs text-red-500 font-medium flex items-center mt-0.5"><Clock className="w-3 h-3 mr-1" /> Due: {bill.dueDate}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <p className="font-mono font-bold text-slate-900">{bill.amount}</p>
                          <button className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded" title="Download Invoice"><Printer className="w-4 h-4" /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Impose Penalty Sub-module */}
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Impose Administrative Penalty</p>
                  <div className="flex space-x-2">
                    <select className="flex-1 border border-slate-300 rounded p-2 text-xs outline-none bg-white">
                      <option>Late Payment Fee</option>
                      <option>Meter Tampering</option>
                      <option>Agent Override Violation</option>
                      <option>Other</option>
                    </select>
                    <input type="number" placeholder="Amt (₹)" className="w-24 border border-slate-300 rounded p-2 text-xs outline-none font-mono bg-white" />
                    <button className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold transition">Apply</button>
                  </div>
                </div>
              </div>

              {/* Service & Infrastructure Controls */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-bold text-slate-800 flex items-center"><Settings className="w-4 h-4 text-slate-500 mr-2" /> Services & Infrastructure</h4>
                </div>
                
                <div className="p-6 space-y-5">
                  
                  {/* Agent Control */}
                  <div className="flex justify-between items-center p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                    <div>
                      <p className="font-bold text-sm text-slate-800 flex items-center"><Bot className="w-4 h-4 mr-2 text-blue-500" /> BetaVolt Home Agent</p>
                      <p className="text-xs text-slate-500 mt-1">Controls AI automation for user's devices.</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={consumerData.agentStatus} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <select className="text-[10px] font-bold border rounded p-1 outline-none text-slate-600 bg-slate-50">
                        <option>Fully-Automatic</option>
                        <option selected>Semi-Automatic</option>
                        <option>Manual Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Danger Zone: Grid Cutoff */}
                  <div className="border border-red-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex items-center">
                      <AlertOctagon className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Danger Zone Actions</span>
                    </div>
                    <div className="p-4 bg-white space-y-3">
                      <button className="w-full flex justify-between items-center bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-800 hover:text-red-700 p-3 rounded-lg transition group">
                        <div className="text-left">
                          <p className="font-bold text-sm">Disconnect Grid Supply (Cut Light)</p>
                          <p className="text-xs text-slate-500 group-hover:text-red-500 mt-0.5">Remotely trigger physical meter cutoff relay.</p>
                        </div>
                        <ZapOff className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition" />
                      </button>

                      <button className="w-full flex justify-between items-center bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 p-3 rounded-lg transition group">
                        <div className="text-left">
                          <p className="font-bold text-sm">Suspend App Access</p>
                          <p className="text-xs text-slate-500 mt-0.5">Revoke user login credentials immediately.</p>
                        </div>
                        <Ban className="w-5 h-5 text-slate-400 group-hover:text-slate-800 transition" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white p-16 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center min-h-[60vh] shadow-sm">
          <div className="bg-slate-50 p-6 rounded-full mb-6 border border-slate-100">
            <Search className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Consumer Operations Center</h3>
          <p className="text-slate-500 max-w-md text-sm leading-relaxed">
            Enter a Consumer ID, Meter Number, or registered Phone Number in the search bar above to pull up full telemetry, billing records, and administrative controls.
          </p>
        </div>
      )}
    </div>
  );

  const renderTickets = () => (
    <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in duration-300">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Query INC ID..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded text-sm font-mono outline-none" />
        </div>
        <div className="flex space-x-2">
          <select className="border rounded px-3 py-2 text-sm bg-slate-50"><option>Severity: Urgent</option><option>All</option></select>
          <button className="bg-slate-100 border px-4 py-2 rounded text-sm font-semibold flex items-center"><Filter className="w-4 h-4 mr-2" /> Filter</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-900 text-slate-300 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Incident ID</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">SLA Timer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_INCIDENTS.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3"><span className="font-mono font-bold text-blue-600">{inc.id}</span></td>
                  <td className="px-4 py-3"><div className="font-medium">{inc.consumerName}</div><div className="text-xs text-slate-500 font-mono">{inc.consumerId}</div></td>
                  <td className="px-4 py-3"><div className="font-medium">{inc.category}</div><div className="text-[10px] text-slate-500">{inc.subCategory}</div></td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${inc.criticalityScore >= 8 ? 'text-red-600' : 'text-orange-500'}`}>{inc.criticalityScore}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {inc.slaStatus === 'Breached' ? <span className="text-red-600 flex items-center animate-pulse"><Clock className="w-3 h-3 mr-1"/> {inc.timeRemaining}</span> : <span className="text-slate-600">{inc.timeRemaining}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold uppercase text-slate-600">{inc.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-slate-400 hover:text-blue-600 p-1"><MessageSquare className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinancials = () => (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-sm border border-emerald-800">
          <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">Total Collections (MTD)</p>
          <p className="text-4xl font-bold font-mono">₹42.8 Cr</p>
          <p className="text-xs text-emerald-300 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +14.2% vs last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Pending Settlements</p>
           <p className="text-3xl font-bold font-mono text-slate-800">₹1.2 Cr</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
           <p className="text-red-500 text-sm font-bold uppercase tracking-wider mb-2">Failed Transactions (24h)</p>
           <p className="text-3xl font-bold font-mono text-red-600">342</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <button className="text-sm font-bold text-blue-600 hover:underline">Export CSV</button>
        </div>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-semibold">
            <tr><th className="px-4 py-3">TRX ID</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Gateway</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_TRANSACTIONS.map((trx, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-medium text-slate-700">{trx.id}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{trx.date}</td>
                <td className="px-4 py-3 font-medium">{trx.user}</td>
                <td className="px-4 py-3 font-mono font-bold">{trx.amount}</td>
                <td className="px-4 py-3 text-xs">{trx.gateway} ({trx.method})</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${trx.status === 'Settled' ? 'bg-emerald-100 text-emerald-800' : trx.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{trx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTariffs = () => (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Global TOU (Time of Use) Pricing</h3>
            <p className="text-sm text-slate-500">Configure real-time grid pricing parameters for automated agents.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition">Deploy to Grid</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TariffCard tier="Off-Peak (Base)" time="23:00 - 06:00" rate="4.50" color="emerald" />
          <TariffCard tier="Standard Phase" time="06:00 - 18:00" rate="6.80" color="blue" />
          <TariffCard tier="Peak / Surge" time="18:00 - 23:00" rate="11.20" color="orange" />
        </div>

        <div className="mt-8 border-t pt-6">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center"><Settings className="w-5 h-5 mr-2" /> Algorithmic Surge Multipliers</h4>
          <div className="flex items-center space-x-4">
             <div className="flex-1">
               <label className="text-xs font-bold text-slate-600 uppercase">Grid Load &gt; 80% Cap</label>
               <input type="number" defaultValue="1.5" step="0.1" className="w-full mt-1 border rounded p-2 text-sm outline-none font-mono" />
             </div>
             <div className="flex-1">
               <label className="text-xs font-bold text-slate-600 uppercase">Critical Phase &gt; 95% Cap</label>
               <input type="number" defaultValue="2.0" step="0.1" className="w-full mt-1 border rounded p-2 text-sm outline-none font-mono" />
             </div>
             <div className="flex-1">
               <label className="text-xs font-bold text-slate-600 uppercase">AI Load Shedding Trigger</label>
               <select className="w-full mt-1 border rounded p-2 text-sm outline-none"><option>Enable at 98%</option><option>Manual Only</option></select>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgent = () => (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-xl shadow border border-slate-700">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center"><Terminal className="w-6 h-6 mr-2 text-emerald-400" /> BetaVolt AI Cluster Command</h3>
          <p className="text-slate-400 text-sm mt-1">Manage physical server nodes and LLM routing for the automation ecosystem.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold flex items-center transition">
          <ServerOff className="w-4 h-4 mr-2" /> Global Kill Switch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b bg-slate-50"><h4 className="font-bold text-slate-800">Node Telemetry</h4></div>
          <div className="p-4 space-y-4">
             <NodeCard name="Alpha Node (Pune Primary)" cpu="42%" ram="16GB/64GB" status="Online" />
             <NodeCard name="Beta Node (Mumbai Replica)" cpu="28%" ram="12GB/64GB" status="Online" />
             <NodeCard name="Gamma Node (Analytics)" cpu="88%" ram="60GB/64GB" status="High Load" warning />
          </div>
        </div>

        <div className="bg-black rounded-xl shadow-sm border border-slate-700 overflow-hidden flex flex-col h-[400px]">
          <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-400 ml-2 font-mono">live-agent-feed.log</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto font-mono text-[10px] sm:text-xs text-emerald-400 space-y-1">
            <p>[10:53:01] INFO : Agent L1 handling UID-88291... routine query.</p>
            <p>[10:53:04] <span className="text-blue-400">EXEC</span> : Automated load shedding triggered for Sector 4 (Ruleset A).</p>
            <p>[10:53:05] INFO : Relay sync successful on 4,291 devices.</p>
            <p>[10:53:09] <span className="text-red-400">WARN</span> : API Latency spike detected on payment gateway bridge.</p>
            <p>[10:53:11] INFO : BetaVolt routing 142 concurrent LLM sessions...</p>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Shell */}
      <aside className="w-64 md:w-72 bg-slate-950 text-slate-300 flex flex-col z-20 shadow-xl flex-shrink-0">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h1 className="text-2xl font-black text-emerald-400 tracking-tight flex items-center">
            <Zap className="w-6 h-6 mr-2" /> Intellismart
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Master Control Center</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavBtn icon={<Activity />} label="System Overview" id="overview" current={activeTab} set={setActiveTab} />
          <NavBtn icon={<User />} label="Consumer Management" id="consumer-management" current={activeTab} set={setActiveTab} />
          <NavBtn icon={<ShieldAlert />} label="Tickets & NOC" id="tickets" current={activeTab} set={setActiveTab} />
          <NavBtn icon={<Receipt />} label="Financials & Billing" id="transactions" current={activeTab} set={setActiveTab} />
          <NavBtn icon={<Settings />} label="Global Tariffs" id="tariffs" current={activeTab} set={setActiveTab} />
          <NavBtn icon={<ServerOff />} label="Agent Infrastructure" id="agent" current={activeTab} set={setActiveTab} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white px-8 py-4 border-b border-slate-200 shadow-sm flex justify-between items-center z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center">
            {activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-wider border">Live Prod</span>
            <div className="h-9 w-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow text-sm">SA</div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-100">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "consumer-management" && renderConsumerManagement()}
          {activeTab === "tickets" && renderTickets()}
          {activeTab === "transactions" && renderFinancials()}
          {activeTab === "tariffs" && renderTariffs()}
          {activeTab === "agent" && renderAgent()}
        </div>
      </main>
    </div>
  );
}

// --- MICRO COMPONENTS ---

function NavBtn({ icon, label, id, current, set }: any) {
  const active = current === id;
  return (
    <button onClick={() => set(id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${active ? "bg-emerald-600/10 text-emerald-400 font-bold border border-emerald-500/20" : "hover:bg-slate-900 hover:text-white font-medium text-sm"}`}>
      <span className={`w-5 h-5 ${active ? 'opacity-100' : 'opacity-70'}`}>{icon}</span><span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, trend, positive, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-800 font-mono">{value}</p>
      <p className={`text-xs mt-2 font-medium flex items-center ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
        {positive ? <ArrowUpRight className="w-3 h-3 mr-1"/> : <ArrowDownRight className="w-3 h-3 mr-1"/>} {trend}
      </p>
    </div>
  );
}

function HealthMeter({ label, value, warning = false }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-mono">
        <span className="text-slate-400">{label}</span>
        <span className={warning ? "text-orange-400 font-bold" : "text-emerald-400"}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${warning ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function TariffCard({ tier, time, rate, color }: any) {
  const colorMap: any = { emerald: "border-emerald-200 bg-emerald-50 text-emerald-800", blue: "border-blue-200 bg-blue-50 text-blue-800", orange: "border-orange-200 bg-orange-50 text-orange-800" };
  return (
    <div className={`p-5 rounded-xl border ${colorMap[color]} shadow-sm`}>
      <p className="font-bold text-sm uppercase tracking-wider mb-1">{tier}</p>
      <p className="text-xs opacity-80 mb-4 flex items-center"><Clock className="w-3 h-3 mr-1"/> {time}</p>
      <label className="text-[10px] font-bold uppercase opacity-70">Rate per Unit (₹)</label>
      <input type="number" defaultValue={rate} step="0.1" className="w-full mt-1 border-0 bg-white/50 rounded p-2 text-xl font-bold font-mono outline-none shadow-inner" />
    </div>
  );
}

function NodeCard({ name, cpu, ram, status, warning = false }: any) {
  return (
    <div className={`p-4 rounded-lg border ${warning ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-white'} flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${warning ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-600'}`}><HardDrive className="w-5 h-5" /></div>
        <div><p className="font-bold text-sm text-slate-800">{name}</p><p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">{status}</p></div>
      </div>
      <div className="flex space-x-6">
        <div className="text-right"><p className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-end"><Cpu className="w-3 h-3 mr-1"/> CPU</p><p className="font-mono font-bold text-sm">{cpu}</p></div>
        <div className="text-right"><p className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-end"><HardDrive className="w-3 h-3 mr-1"/> RAM</p><p className="font-mono font-bold text-sm">{ram}</p></div>
      </div>
    </div>
  );
}
export function SystemMapOverlay({ region = "Pune Metropolitan Region", sectors = MOCK_PUNE_SECTORS }) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const getStatusColors = (status: string) => {
    switch (status) {
      case "critical": return { glow: "rgba(239, 68, 68, 0.4)", dot: "bg-red-500", text: "text-red-500", border: "border-red-200" };
      case "warning": return { glow: "rgba(249, 115, 22, 0.3)", dot: "bg-orange-500", text: "text-orange-500", border: "border-orange-200" };
      case "normal": return { glow: "rgba(16, 185, 129, 0.2)", dot: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-200" };
      default: return { glow: "rgba(148, 163, 184, 0.2)", dot: "bg-slate-500", text: "text-slate-500", border: "border-slate-200" };
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" /> 
            Live Thermal Load Map: {region}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Real-time sector consumption and grid strain visualization.</p>
        </div>
        <div className="flex space-x-3 text-[10px] font-bold uppercase tracking-wider bg-slate-50 px-3 py-2 rounded border border-slate-100">
          <span className="flex items-center text-slate-600"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> Normal (&lt;60%)</span>
          <span className="flex items-center text-slate-600"><div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div> High (60-80%)</span>
          <span className="flex items-center text-slate-600"><div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div> Critical (&gt;80%)</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 min-h-[400px]">
        
        {/* Real Map Background (OpenStreetMap embedded & styled for dark mode) */}
        <div className="absolute inset-0 z-0 opacity-50">
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=73.65%2C18.40%2C74.05%2C18.65&layer=mapnik"
            style={{ 
              pointerEvents: 'none', 
              filter: 'grayscale(100%) invert(100%) contrast(150%) brightness(80%)',
              transform: 'scale(1.05)' // slightly scales to hide standard iframe borders
            }}
          ></iframe>
        </div>

        {/* Map Elements (The Dots) */}
        {sectors.map((sector) => {
          const colors = getStatusColors(sector.status);
          const isHovered = hoveredSector === sector.id;
          
          return (
            <div 
              key={sector.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer"
              style={{ left: `${sector.x}%`, top: `${sector.y}%`, zIndex: isHovered ? 50 : 10 }}
              onMouseEnter={() => setHoveredSector(sector.id)}
              onMouseLeave={() => setHoveredSector(null)}
            >
              {/* Thermal Glow / Heatmap Blob */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-500"
                style={{ 
                  width: `${sector.load * 1.5}px`, 
                  height: `${sector.load * 1.5}px`, 
                  background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                  opacity: isHovered ? 1 : 0.7
                }}
              ></div>

              {/* Map Marker */}
              <div className="relative flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border-2 border-slate-900 shadow-md ${colors.dot} ${sector.status === 'critical' ? 'animate-pulse' : ''}`}></div>
                
                {/* Always show small label for critical, show full tooltip on hover */}
                {sector.status === 'critical' && !isHovered && (
                  <span className="mt-1 text-[9px] font-bold text-red-400 bg-slate-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap">
                    {sector.load}%
                  </span>
                )}

                {/* Hover Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden text-left pointer-events-none transform origin-bottom animate-in zoom-in-95 duration-200">
                    <div className={`px-3 py-2 border-b flex justify-between items-center ${
                      sector.status === 'critical' ? 'bg-red-50 border-red-100' : 
                      sector.status === 'warning' ? 'bg-orange-50 border-orange-100' : 'bg-emerald-50 border-emerald-100'
                    }`}>
                      <span className="font-bold text-xs text-slate-800 truncate">{sector.name}</span>
                      {sector.status === 'critical' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="p-3 bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Grid Load</span>
                        <span className={`font-mono font-bold text-sm ${colors.text}`}>{sector.load}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${colors.dot}`} style={{ width: `${sector.load}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Peak Hrs</span>
                        <span className="text-xs font-medium text-slate-700">{sector.peakTime}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Legend / Info overlay on map */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-20">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg flex items-center space-x-4 pointer-events-auto shadow-lg">
             <div>
               <p className="text-[10px] text-slate-400 font-bold uppercase">Total City Load</p>
               <p className="text-lg font-mono font-bold text-emerald-400">482.5 MW</p>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div>
               <p className="text-[10px] text-slate-400 font-bold uppercase">Active Critical Nodes</p>
               <p className="text-lg font-mono font-bold text-red-400 flex items-center">
                 {sectors.filter(s => s.status === 'critical').length} <Activity className="w-4 h-4 ml-1 animate-pulse" />
               </p>
             </div>
          </div>
          
          <div className="text-[10px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded shadow-lg">
            Live Sync: ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
}