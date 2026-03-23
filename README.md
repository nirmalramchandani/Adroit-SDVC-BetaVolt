# ⚡ BetaVolt — Unified Agentic Smart Metering Super App

> **"We didn't build another energy app. We built a brain for your home."**

BetaVolt is an AI-powered smart metering super app that autonomously monitors, controls, and optimizes home energy consumption in real time. Built for the INSTINCT 4.0 Hackathon by **Team ADROIT SDVC**.

---

## 🧠 What is BetaVolt?

BetaVolt is not a monitoring dashboard — it's an intelligent agent that **thinks, decides, and acts** on your behalf. It builds a live digital twin of your home, watches tariffs every second, and autonomously controls your appliances before your bill spikes. When a high-impact decision needs human approval, it **calls you**, explains the situation, and waits for your go-ahead — like JARVIS.

---

## 🚀 Key Features

### 👤 Consumer App
- 📊 Live smart meter data — real-time kWh, voltage, current
- 💰 Dynamic ToD tariff display with spike alerts
- 🔌 Device ON/OFF controls — AC, EV Charger, Washing Machine
- 🕐 Appliance scheduling for lowest-cost time windows
- 🤖 **Agent Mode** — full autonomous AI control
- ⚡ **Power Saving Mode** — user-defined threshold rules
- 🧾 Bill estimator + monthly savings projection
- 📈 Usage graphs (hourly / daily / monthly)
- 👻 Ghost Load Detection — identifies standby power drains
- 🗣️ Conversational AI — voice + text commands
- 📞 Proactive AI call to user for high-impact decisions

### 👥 Multi-Profile Consumer Support
| Profile | What BetaVolt Does |
|---|---|
| **Prepaid** | Live balance tracking, auto load-shifting to stretch credit |
| **Postpaid** | Real-time bill simulation with projected savings |
| **Solar / Prosumer** | Generation vs consumption tracking, schedule appliances during peak solar hours |
| **EV Owner** | Tariff-aware smart charging, auto pause/resume on live rates |
| **Commercial** | Multi-meter support, demand spike prevention, ToD optimization |

### 🎧 Agentic Customer Support
- Consumers raise tickets directly from the app
- AI agent auto-categorizes, prioritizes, and resolves common issues instantly
- Escalations routed to admin panel with full resolution tracking
- Admin can assign, manage, and close tickets end-to-end

### 🛠️ Admin & DISCOM Control Panel
- Real-time tariff creation and broadcast across all accounts
- Area-wise energy consumption heatmap
- Consumer profile management — suspend, restrict, force power-off
- Agent activity audit log — full transparency of every AI decision
- Billing oversight — view any consumer's bill history
- Demand response events — push commands to consumer devices at scale

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BetaVolt System                      │
├───────────────┬─────────────────┬───────────────────────────┤
│  LAYER 1      │   LAYER 2       │   LAYER 3 (GCP Cloud)     │
│  IoT Devices  │   Edge + AI     │   Backend + Storage       │
│               │   Agent Layer   │                           │
│  Smart Meter  │  BetaVolt Agent │   Cloud Run (Backend)     │
│  AC Unit      │  Decision Engine│   Vertex AI / Gemini      │
│  EV Charger   │  Tariff Optimizer   InfluxDB / TimescaleDB  │
│  Wash Machine │  C++ Controller │   GCP Pub/Sub             │
│  Sensors      │  Python Engine  │   Cloud Storage           │
└───────────────┴─────────────────┴───────────────────────────┘
         ↕ MQTT / WebSockets ↕           ↕ REST / gRPC ↕
┌─────────────────────────────────────────────────────────────┐
│                     LAYER 4 — User Interfaces               │
│   Mobile App (React Native)  │  Web Dashboard (Next.js)    │
│   Voice Interaction (Gemini) │  Admin Panel                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| AI Agent & Brain | Google Gemini + Google ADK |
| Backend | Python + FastAPI |
| Frontend (Web) | Next.js + React |
| Mobile App | React Native + Expo |
| Real-time Control | C++ Modules |
| IoT Communication | MQTT + WebSockets |
| Cloud Infrastructure | Google Cloud Platform (GCP) |
| Time-Series Database | InfluxDB / TimescaleDB |
| Machine Learning | NumPy, Pandas, Scikit-learn, PyTorch |
| Message Queue | GCP Pub/Sub |
| Voice Interaction | Gemini Voice |
| Cloud Functions | GCP Cloud Functions |

---

## 📊 Performance Benchmarks

| Metric | Target | Result |
|---|---|---|
| Appliances controllable | ≥ 3 | ✅ AC, EV Charger, Washing Machine |
| User onboarding time | < 5 mins | ✅ Under 3 minutes |
| Cost savings demonstrated | 10–15% | ✅ 15–30% via ToD shifting |
| Tariff spike response time | — | ✅ < 3 seconds |
| Agent decision latency | — | ✅ < 500ms |
| Admin tariff propagation | — | ✅ Real-time broadcast |
| System uptime architecture | ≥ 99% | ✅ GCP Cloud Run (auto-scaling) |

---

## 🗺️ Roadmap

### Phase 2 — (3–6 months)
- [ ] Solar rooftop integration with net metering credits
- [ ] Carbon footprint tracker with CO₂ savings certificates
- [ ] WhatsApp / SMS agent for non-smartphone users
- [ ] Direct IntelliSmart MDMS API integration

### Phase 3 — (6–12 months)
- [ ] Peer-to-peer energy trading between prosumers
- [ ] Predictive appliance maintenance alerts
- [ ] Multi-language voice agent (Hindi, Marathi, Tamil, etc.)
- [ ] EV grid-aware charging with V2G support

### Phase 4 — (12–24 months)
- [ ] National rollout SaaS for DISCOMs
- [ ] Demand response automation for grid balancing
- [ ] Third-party appliance OEM SDK for native integration
- [ ] AI-powered energy audit reports for consumers

---

## 💸 Estimated Implementation Cost

| Phase | Scope | Estimated Cost |
|---|---|---|
| PoC / Prototype | 3 appliances, demo-ready | ₹2–5 Lakhs |
| Pilot Deployment | 1,000 homes, 1 DISCOM zone | ₹20–40 Lakhs |
| City-scale Rollout | 1M users, full DISCOM integration | ₹2–5 Crores |
| National Scale | 25M+ meters, multi-DISCOM | ₹50+ Crores (SaaS model) |

---

## 👥 Team

**Team Name:** ADROIT SDVC
**Team Leader:** Nawaz Sayyad
**Hackathon:** INSTINCT 4.0 — IntelliSmart (A JV of NIIF and EESL)
**Problem Statement:** Smart Metering Super App: Unified Platform for Consumers
**Track:** Expert in Agentic Systems

---

## 📄 License

This project was developed for the INSTINCT 4.0 Hackathon. All rights reserved by Team ADROIT SDVC.

---

---

> *"Every other solution stops at showing you the problem. BetaVolt solves it — automatically."*
