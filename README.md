# BetaVolt: Smart Energy Management System

Welcome to the BetaVolt frontend repository. BetaVolt is an advanced Smart Energy Management Application designed to create a seamless connection between grid operators and energy consumers. Our platform provides real-time telemetry, energy insights, and a comprehensive management interface tailored for both administrative oversight and consumer utilization.

---

## Quick Links
- **[Development Dashboard](DEVELOPMENT.md)** — Detailed project status and strategic roadmap.
- **[Architecture Guide](docs/ARCHITECTURE.md)** — A comprehensive technical overview of the application stack.

---

## Key Features

### Consumer Experience
- **Real-Time Home Hub**: A unified dashboard to monitor solar production, battery storage capacity, and overall home energy consumption.
- **Advanced Analytics**: Interactive, Recharts-powered data visualizations that offer deep insights into energy usage patterns.
- **Dynamic Billing**: A robust module for accessing invoices, tracking payment histories, and managing prepaid or postpaid accounts.

### Administrative Command Center
- **Grid Telemetry**: High-level overviews of total grid load, active consumer metrics, and critical system alerts.
- **Intelligent Ticketing**: A streamlined support ticketing system designed to help operators assign issues and ensure rapid, effective resolution.
- **Project Hub**: Tools for managing fleet-scale installations and coordinating large-scale energy infrastructure projects.

---

## Technology Stack

| Component | Technology |
|---|---|
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Styling & Components**| [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide](https://lucide.dev/) |
| **Backend & Data** | [Firebase](https://firebase.google.com/), [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Data Validation** | [Zod](https://zod.dev/) |

---

## Getting Started

To set up the development environment locally, please follow these steps:

1. **Install Dependencies**:
   Please ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory and ensure you provide your Firebase configuration credentials.

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application dashboard will be accessible at `http://localhost:9002`.

---

## Project Status

- [x] **Core UI/UX Structure**: Implementation of the primary navigation and dark mode interface.
- [/] **Consumer Modules**: Development of the Analytics and Support features is currently progressing.
- [/] **Administrative Command Center**: Core telemetry views have been established, continuously integrating live data feeds.
- [ ] **Live Telemetry Connection**: Development of the WebSocket implementation for real-time grid updates is underway.

---

Thank you for your interest in the BetaVolt Smart Energy Management System. This project is proudly maintained and developed by the BetaVolt Team. We appreciate your support and contributions to building a smarter energy grid.
