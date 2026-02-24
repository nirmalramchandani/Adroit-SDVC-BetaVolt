import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws";

const WS_URL = "ws://10.10.11.89:8080/lovelocalai/";

interface ActiveDevice {
  id: string;
  name: string;
  powerConsumption: number;
}

export async function POST(req: NextRequest) {
  try {
    const { tariffRate, activeDevices } = (await req.json()) as {
      tariffRate: number;
      activeDevices: ActiveDevice[];
    };

    console.log(`[tariff-alert] Received request — rate: ₹${tariffRate}, devices: ${activeDevices.length}`);

    const alertPayload = {
      event: "tariff_alert",
      tariff_rate: tariffRate,
      unit: "INR/kWh",
      message: `Tariff is high at ₹${tariffRate.toFixed(2)}/kWh. Please advise the user on energy saving.`,
      active_devices: activeDevices.map((d) => ({
        id: d.id,
        name: d.name,
        power_consumption_watts: d.powerConsumption,
      })),
    };

    await new Promise<void>((resolve) => {
      console.log(`[tariff-alert] Connecting to WS: ${WS_URL}`);
      const ws = new WebSocket(WS_URL);

      // Resolve after 10s no matter what
      const timeout = setTimeout(() => {
        console.warn("[tariff-alert] 10s timeout — closing WS");
        ws.terminate();
        resolve();
      }, 10000);

      ws.on("open", () => {
        console.log("[tariff-alert] WS connected — sending payload");
        ws.send(JSON.stringify({ type: "text", data: JSON.stringify(alertPayload) }));
        console.log("[tariff-alert] Payload sent — waiting for AI response...");
      });

      ws.on("message", (raw) => {
        const str = raw.toString();
        console.log("[tariff-alert] RAW response from AI backend:", str);
        try {
          const parsed = JSON.parse(str);
          console.log("[tariff-alert] Parsed type:", parsed.type);
          console.log("[tariff-alert] Parsed data:", parsed.data ?? parsed);
        } catch {
          console.log("[tariff-alert] Response is not valid JSON");
        }
      });

      ws.on("close", (code, reason) => {
        clearTimeout(timeout);
        console.log(`[tariff-alert] WS closed — code: ${code}, reason: "${reason.toString()}"`);
        resolve();
      });

      ws.on("error", (err) => {
        clearTimeout(timeout);
        console.error("[tariff-alert] WS error:", err.message);
        resolve(); // still resolve so API returns 200
      });
    });

    return NextResponse.json({ status: "sent", tariffRate, deviceCount: activeDevices.length });
  } catch (err) {
    console.error("[tariff-alert] Failed:", err);
    return NextResponse.json({ status: "error", message: String(err) });
  }
}
