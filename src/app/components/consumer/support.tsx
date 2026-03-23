"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Clock, CheckCircle2, UploadCloud, X, Zap, Send, Bot, User, Sparkles, ChevronRight, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────── */
type ChatMessage = {
  id: string;
  role: "agent" | "user";
  text: string;
  timestamp: Date;
  options?: string[];
};

/* ──────────────────────────────────────────────────────────────
   Predefined agent conversation flow
──────────────────────────────────────────────────────────────── */
const agentResponses: Record<string, { text: string; options?: string[] }> = {
  default: {
    text: "I'm here to help! Could you tell me more about what you're facing?",
    options: ["Billing issue", "Meter problem", "Power outage", "General query"],
  },
  "billing issue": {
    text: "I can see your last bill was ₹1,819.97 for January 2026. Your current wallet balance is ₹1,450.50. Would you like me to raise a billing dispute ticket or explain the charges?",
    options: ["Raise dispute ticket", "Explain charges", "Something else"],
  },
  "meter problem": {
    text: "Meter issues need an on-site check. I have logged a priority ticket (#TKT-8902) for you and an engineer will visit within 48 hours. Is there anything else?",
    options: ["Track my tickets", "Something else"],
  },
  "power outage": {
    text: "I'm checking the grid status for your area... There's a planned maintenance in your zone (MIDC, Nagpur) from 10 AM – 1 PM today. Power should be restored by 1 PM. Want me to set a reminder?",
    options: ["Set reminder", "Something else"],
  },
  "general query": {
    text: "Sure! Here are some things I can help you with. What would you like to know?",
    options: ["Tariff rates", "How to recharge", "Update contact info", "Something else"],
  },
  "raise dispute ticket": {
    text: "Done! I've raised Billing Dispute Ticket #TKT-8910. Our billing team will review and respond within 24–48 hours. You'll get a notification once it's updated.",
    options: ["Track my tickets", "Go back home"],
  },
  "explain charges": {
    text: "Your January bill includes:\n• 242 kWh × ₹6.50 = ₹1,573\n• Fixed charges = ₹120\n• FAC = ₹48.40\n• Electricity Duty = ₹78.57\n\nTotal = ₹1,819.97. All looks accurate. Any specific charge you'd like to dispute?",
    options: ["Raise dispute ticket", "Looks fine, thanks"],
  },
  "track my tickets": {
    text: "Here are your recent tickets:\n\n• #TKT-8821 — Meter Fault — 🔵 In Progress\n• #TKT-8104 — Billing Issue — ✅ Resolved\n• #TKT-7542 — Power Outage — ✅ Resolved\n\nIs there anything else I can help with?",
    options: ["Something else"],
  },
  "set reminder": {
    text: "Perfect! I've set a reminder for 1 PM today to check if your power is restored. You'll receive a push notification. Anything else?",
    options: ["Something else"],
  },
  "tariff rates": {
    text: "Current tariff rates for LT-I Residential in Nagpur:\n\n• Peak Hours (6 PM–10 PM): ₹11.82/kWh\n• Off-Peak Hours: ₹5.86/kWh\n\nTip: Run heavy appliances like washing machines during off-peak hours to save money! 💡",
    options: ["Something else"],
  },
  "how to recharge": {
    text: "It's easy! Go to the **Billing** tab → **Top-up Wallet** section. You can choose quick amounts (₹100–₹2000) or enter a custom amount. Payments are processed instantly. Need help with anything else?",
    options: ["Something else"],
  },
  "update contact info": {
    text: "To update your contact information, please go to the **Profile** tab and click **Edit Details**. Alternatively, I can raise a request to our team to update it for you. Which do you prefer?",
    options: ["Raise update request", "Something else"],
  },
  "raise update request": {
    text: "Done! I've raised a contact update request (#TKT-8911). Our team will reach out to verify and update your details within 24 hours.",
    options: ["Something else"],
  },
  "something else": {
    text: "Of course! What else can I help you with today?",
    options: ["Billing issue", "Meter problem", "Power outage", "General query"],
  },
  "looks fine, thanks": {
    text: "Great! Glad I could help, Akshay. Is there anything else you need?",
    options: ["Something else"],
  },
  "go back home": {
    text: "Sure thing! You can navigate using the sidebar. Feel free to come back anytime you need help. Have a great day! 🌟",
    options: [],
  },
};

function getAgentResponse(input: string) {
  const key = input.toLowerCase().trim();
  return agentResponses[key] ?? agentResponses["default"];
}

/* ──────────────────────────────────────────────────────────────
   Chatbot Modal
──────────────────────────────────────────────────────────────── */
function ChatbotModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "agent",
      text: "Hi Akshay! 👋 I'm **Volt**, your BetaVolt AI assistant. I'm here to help you with billing, outages, meter issues, and more. What can I help you with today?",
      timestamp: new Date(),
      options: ["Billing issue", "Meter problem", "Power outage", "General query"],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate agent typing delay
    setTimeout(() => {
      const response = getAgentResponse(text);
      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "agent",
        text: response.text,
        timestamp: new Date(),
        options: response.options,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  };

  const formatText = (text: string) =>
    text.split("\n").map((line, i) => (
      <span key={i}>
        {line.replace(/\*\*(.*?)\*\*/g, "$1").split(/\*\*(.*?)\*\*/).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal */}
      <div className="w-full max-w-[420px] h-[600px] flex flex-col rounded-2xl shadow-2xl overflow-hidden
                      bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                      animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 border-2 border-emerald-600 rounded-full" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm leading-none">Volt — BetaVolt Agent</p>
            <p className="text-[11px] text-emerald-100 mt-0.5">Online · Always here to help</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
              {/* Avatar */}
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                msg.role === "agent"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}>
                {msg.role === "agent"
                  ? <Zap className="w-3.5 h-3.5" />
                  : <User className="w-3.5 h-3.5" />
                }
              </div>

              <div className={cn("flex flex-col gap-1.5 max-w-[80%]", msg.role === "user" && "items-end")}>
                {/* Bubble */}
                <div className={cn(
                  "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === "agent"
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700"
                    : "bg-emerald-500 text-white rounded-tr-sm"
                )}>
                  {formatText(msg.text)}
                </div>

                {/* Quick-reply options */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => sendMessage(opt)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full
                                   bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400
                                   border border-emerald-200 dark:border-emerald-700
                                   hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      >
                        {opt}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-[10px] text-slate-400 px-1">
                  {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700
                         bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200
                         outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                         placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40
                         flex items-center justify-center transition-all duration-200 flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Powered by BetaVolt AI · Responses may not always be accurate
          </p>
        </div>
      </div>
    </div>
  );
}

function AgentGreetingCard({ onConnect, messages, setMessages, inputText, setInputText, isTyping, setIsTyping, sendMessage, bottomRef }: { 
  onConnect: () => void; 
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  inputText: string;
  setInputText: (text: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  sendMessage: (text: string) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  const WS_URL = "wss://betavolt-978156456889.asia-south1.run.app/BetaVoltSupport/";
  const USER_AUDIO_SAMPLE_RATE = 16000;
  const AI_SAMPLE_RATE = 24000;

  const [phase, setPhase] = useState<"banner" | "transitioning" | "closing" | "chat">("banner");
  const [activeMode, setActiveMode] = useState<"chat" | "call" | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active">("idle");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // WebSocket + audio refs (same as chatbot-widget)
  const webSocket = useRef<WebSocket | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const userAudioContext = useRef<AudioContext | null>(null);
  const userAudioProcessor = useRef<ScriptProcessorNode | null>(null);
  const aiAudioContext = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);
  const pendingSources = useRef<AudioBufferSourceNode[]>([]);
  const speakingTimer = useRef<NodeJS.Timeout | null>(null);

  const stopCall = useCallback(() => {
    if (webSocket.current?.readyState === WebSocket.OPEN) webSocket.current.close();
    if (mediaStream.current) mediaStream.current.getTracks().forEach((t) => t.stop());
    if (userAudioProcessor.current) userAudioProcessor.current.disconnect();
    if (userAudioContext.current?.state !== "closed") userAudioContext.current?.close();
    if (aiAudioContext.current?.state !== "closed") aiAudioContext.current?.close();
    webSocket.current = null;
    mediaStream.current = null;
    nextStartTime.current = 0;
    setCallStatus("idle");
    setIsAiSpeaking(false);
  }, []);

  const playAudioChunk = useCallback((base64Data: string) => {
    try {
      const ctx = aiAudioContext.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;

      const buffer = ctx.createBuffer(1, float32Data.length, AI_SAMPLE_RATE);
      buffer.copyToChannel(float32Data, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (nextStartTime.current < now + 0.1) nextStartTime.current = now + 0.1;
      
      source.start(nextStartTime.current);
      nextStartTime.current += buffer.duration;
      
      pendingSources.current.push(source);
      setIsAiSpeaking(true);
      source.onended = () => {
        pendingSources.current = pendingSources.current.filter((s) => s !== source);
        if (pendingSources.current.length === 0) {
          if (speakingTimer.current) clearTimeout(speakingTimer.current);
          speakingTimer.current = setTimeout(() => setIsAiSpeaking(false), 200);
        }
      };
      console.log(`[support-ws] Played AI audio chunk: ${float32Data.length} samples`);
    } catch (e) { console.error("playAudioChunk error:", e); }
  }, [setIsAiSpeaking]);

  const startCall = useCallback(async () => {
    try {
      setCallStatus("connecting");
      if (!aiAudioContext.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        aiAudioContext.current = new AudioCtx({ sampleRate: AI_SAMPLE_RATE });
      }
      if (aiAudioContext.current.state === "suspended") await aiAudioContext.current.resume();

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser does not support media devices or is not in a secure context");
      }

      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: USER_AUDIO_SAMPLE_RATE },
      });

      const customerId = localStorage.getItem("instinct_customer_id") || "cust-123";
      webSocket.current = new WebSocket(`${WS_URL}?customer_id=${encodeURIComponent(customerId)}`);
      console.log("[support-ws] Connecting to", WS_URL);

      webSocket.current.onopen = () => {
        setCallStatus("active");
        const AudioCtxLocal = window.AudioContext || (window as any).webkitAudioContext;
        if (mediaStream.current) {
          userAudioContext.current = new AudioCtxLocal({ sampleRate: USER_AUDIO_SAMPLE_RATE });
          const source = userAudioContext.current.createMediaStreamSource(mediaStream.current);
          userAudioProcessor.current = userAudioContext.current.createScriptProcessor(4096, 1, 1);
          source.connect(userAudioProcessor.current);
          userAudioProcessor.current.connect(userAudioContext.current.destination);
          userAudioProcessor.current.onaudioprocess = (e) => {
            if (webSocket.current?.readyState === WebSocket.OPEN) {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) {
                const s = Math.max(-1, Math.min(1, input[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }
              const bytes = new Uint8Array(int16.buffer);
              let binary = "";
              const chunkSize = 8192;
              for (let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
              webSocket.current?.send(JSON.stringify({ type: "audio", data: btoa(binary) }));
            }
          };
        }
      };

      webSocket.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("[support-ws] Received message type:", msg.type);
          if (msg.type === "audio") {
            // Explicitly resume to satisfy browser autoplay policy on first message
            if (aiAudioContext.current?.state === "suspended") {
              aiAudioContext.current.resume().catch(console.warn);
            }
            playAudioChunk(msg.data);
          } else if (msg.type === "text") {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              // If last was agent and from WS, append (for streaming feel if backend supports)
              if (last && last.role === "agent" && last.id.startsWith("ws-a-")) {
                const updated = [...prev];
                updated[updated.length - 1] = { ...last, text: last.text + msg.data };
                return updated;
              }
              return [...prev, { id: `ws-a-${Date.now()}`, role: "agent", text: msg.data, timestamp: new Date() }];
            });
            setIsTyping(false);
          } else if (msg.type === "usertext") {
            // This is the transcription of what the user just said
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "user" && last.id.startsWith("ws-u-")) {
                const updated = [...prev];
                updated[updated.length - 1] = { ...last, text: last.text + " " + msg.data };
                return updated;
              }
              return [...prev, { id: `ws-u-${Date.now()}`, role: "user", text: msg.data, timestamp: new Date() }];
            });
          }
        } catch (e) { console.warn("WS parse error:", e); }
      };

      webSocket.current.onclose = () => { setCallStatus("idle"); };
      webSocket.current.onerror = () => { stopCall(); };
    } catch (err) {
      console.error("startCall failed:", err);
      setCallStatus("idle");
      if (err instanceof Error && (err.message.includes("mediaDevices") || err.message.includes("secure context"))) {
        alert("Camera/Microphone access is not supported in this browser or context. Please ensure you are using HTTPS or localhost.");
      }
    }
  }, [playAudioChunk, stopCall]);

  const toggleCall = useCallback(() => {
    if (callStatus === "idle") {
      startCall();
    } else {
      stopCall();
    }
  }, [callStatus, startCall, stopCall]);

  const goBackToBanner = useCallback(() => {
    stopCall();
    setPhase("closing");
    setTimeout(() => {
      setPhase("banner");
    }, 2500);
  }, [stopCall]);

  const handleButtonClick = (mode: "chat" | "call") => {
    if (phase !== "banner") return;
    setActiveMode(mode);
    setPhase("transitioning");
    
    // Create & Resume context on user action as required by browsers
    if (!aiAudioContext.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      aiAudioContext.current = new AudioCtx({ sampleRate: AI_SAMPLE_RATE });
    }
    if (aiAudioContext.current?.state === "suspended") {
      aiAudioContext.current.resume().catch(console.warn);
    }

    setTimeout(() => {
      setPhase("chat");
      if (mode === "chat") onConnect();
      startCall();
    }, 2500);
  };

  const formatText = (text: string) =>
    text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));

  /* ── Collapsed Banner ────────────────────────────────── */
  if (phase === "banner") {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-200 dark:border-emerald-800/60 h-[130px]">
        {/* Green gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />

        {/* Animated Raining Text in the Middle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-80 z-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
          <style>{`
            @keyframes rainingText {
              0% { transform: translateY(-30px); opacity: 0; }
              10% { opacity: 0.8; }
              90% { opacity: 0.8; }
              100% { transform: translateY(160px); opacity: 0; }
            }
          `}</style>
          
          {[
            { text: "24/7 Support", delay: "0s", duration: "12s", left: "8%" },
            { text: "Fast Resolution", delay: "4s", duration: "14s", left: "20%" },
            { text: "Live Chat", delay: "6s", duration: "13s", left: "32%" },
            { text: "Quick Connect", delay: "2s", duration: "16s", left: "45%" },
            { text: "Smart Routing", delay: "1s", duration: "11s", left: "55%" },
            { text: "AI Assistant", delay: "3s", duration: "15s", left: "68%" },
            { text: "Voice Bot", delay: "7s", duration: "10s", left: "82%" },
            { text: "Instant Help", delay: "5s", duration: "12s", left: "92%" },
          ].map((item, i) => (
            <div 
              key={i}
              className="absolute text-white/70 font-medium text-xs whitespace-nowrap"
              style={{
                left: item.left,
                animation: `rainingText ${item.duration} linear ${item.delay} infinite`
              }}
            >
              {item.text}
            </div>
          ))}
        </div>

        {/* Banner content: logo left, buttons right */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-10 gap-[8%]">
          {/* Logo + BetaVolt text */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-bold text-sm tracking-wide">BetaVolt</p>
          </div>

          {/* Two side-by-side buttons on the right */}
          <div className="flex flex-col items-center gap-4">
            {/* Notice for Customer ID 1004 */}
            <div className="bg-emerald-600/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex flex-col items-center gap-1 shadow-xl animate-in fade-in zoom-in duration-700">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-white text-[10px] font-bold tracking-widest uppercase opacity-90">Developer Access</span>
               </div>
               <p className="text-white text-xs font-medium">Use Customer ID <span className="text-emerald-300 font-bold underline underline-offset-4 decoration-2">1004</span> for Agent Demo</p>
            </div>

            <div className="flex flex-row gap-3">
              <button
                onClick={() => handleButtonClick("chat")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 shadow-lg shadow-black/10 transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                Chat with agent
              </button>
              <button
                onClick={() => handleButtonClick("call")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 shadow-lg shadow-black/10 transition-all duration-200"
              >
                <Phone className="w-4 h-4" />
                Call agent
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Transitioning ───────────────────────────────────── */
  if (phase === "transitioning") {
    return (
      <div
        className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-200 dark:border-emerald-800/60"
        style={{
          animation: "bannerExpand 2.5s cubic-bezier(0.4,0,0.2,1) forwards",
        }}
      >
        <style>{`
          @keyframes bannerExpand {
            0%   { height: 130px; background: linear-gradient(135deg,#10b981,#059669,#0d9488); }
            40%  { height: 230px; background: linear-gradient(135deg,#10b981,#059669,#0d9488); }
            70%  { height: 380px; background: linear-gradient(135deg,#a7f3d0,#d1fae5,#f0fdf4); }
            100% { height: 520px; background: #ffffff; }
          }
        `}</style>

        {/* Fading green overlay that disappears */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700"
          style={{ animation: "fadeGreen 2.5s cubic-bezier(0.4,0,0.2,1) forwards" }}
        />
        <style>{`
          @keyframes fadeGreen {
            0%   { opacity:1; }
            60%  { opacity:0.3; }
            100% { opacity:0; }
          }
        `}</style>

        {/* Logo pulses in center during transition */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          <div
            className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center shadow-xl"
            style={{ animation: "logoGrow 2.5s cubic-bezier(0.4,0,0.2,1) forwards" }}
          >
            <style>{`
              @keyframes logoGrow {
                0%   { transform:scale(1); background:rgba(255,255,255,0.25); }
                50%  { transform:scale(1.15); background:rgba(255,255,255,0.5); }
                100% { transform:scale(1); background:rgba(16,185,129,0.15); }
              }
            `}</style>
            <Zap className="w-8 h-8 text-white" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))" }} />
          </div>
          <p
            className="font-bold text-white text-sm tracking-widest"
            style={{ animation: "fadeToGreen 2.5s cubic-bezier(0.4,0,0.2,1) forwards" }}
          >
            <style>{`
              @keyframes fadeToGreen {
                0%   { color:#fff; }
                80%  { color:#fff; }
                100% { color:#059669; }
              }
            `}</style>
            Connecting…
          </p>
        </div>
      </div>
    );
  }

  /* ── Closing (reverse) transition ────────────────────────────────── */
  if (phase === "closing") {
    return (
      <div
        className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-200 dark:border-emerald-800/60"
        style={{ animation: "bannerCollapse 2.5s cubic-bezier(0.4,0,0.2,1) forwards" }}
      >
        <style>{`
          @keyframes bannerCollapse {
            0%   { height: 520px; background: #ffffff; }
            30%  { height: 380px; background: linear-gradient(135deg,#a7f3d0,#d1fae5,#f0fdf4); }
            70%  { height: 230px; background: linear-gradient(135deg,#10b981,#059669,#0d9488); }
            100% { height: 130px; background: linear-gradient(135deg,#10b981,#059669,#0d9488); }
          }
        `}</style>

        {/* Green overlay fades in */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700"
          style={{ animation: "revealGreen 2.5s cubic-bezier(0.4,0,0.2,1) forwards" }}
        />
        <style>{`
          @keyframes revealGreen {
            0%   { opacity: 0; }
            40%  { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}</style>

        {/* Pulsing Zap in the center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center shadow-xl">
            <Zap className="w-8 h-8 text-white" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))" }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Expanded Chat UI / Voice Agent UI ────────────────────────────────── */
  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900"
      style={{ height: "520px", animation: "chatReveal 0.35s ease-out forwards" }}
    >
      <style>{`
        @keyframes chatReveal {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Header — Emerald Green */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-100" />
          </div>
          <p className="font-semibold text-sm">AI Voice Agent</p>
        </div>
        <button
          onClick={goBackToBanner}
          className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main Body (Avatar & Messages) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Compressed Header when messages exist */}
        <div className={cn(
          "flex flex-col items-center justify-center transition-all duration-500",
          messages.length > 0 ? "py-3 bg-slate-50 dark:bg-slate-800/40 border-b dark:border-slate-800" : "flex-1 p-6"
        )}>
           <div className={cn(
             "relative rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all duration-500",
             messages.length > 0 ? "w-14 h-14" : "w-32 h-32"
           )}>
             <div className="absolute inset-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center">
               <Bot className={cn("transition-all duration-500", 
                 messages.length > 0 ? "w-7 h-7" : "w-16 h-16",
                 callStatus === "active" ? "text-emerald-500" : "text-slate-400"
               )} />
             </div>
             {callStatus === "active" && (
               <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
             )}
           </div>
           
           <div className={cn("text-center mt-2", messages.length > 0 ? "hidden sm:block" : "block")}>
             <h2 className={cn("font-semibold text-emerald-700 dark:text-emerald-400 transition-all", 
               messages.length > 0 ? "text-sm" : "text-xl"
             )}>
               BetaVolt Assistant
             </h2>
             <p className="text-xs text-slate-500 dark:text-slate-400">
               {callStatus === "idle" ? "Disconnected" : callStatus === "connecting" ? "Connecting..." : "Live Support Session"}
             </p>
           </div>
        </div>

        {/* Message List */}
        <div className={cn(
          "flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth bg-slate-50/30 dark:bg-slate-950/20",
          messages.length <= 0 && "hidden"
        )}>
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm",
                msg.role === "agent" ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border dark:border-slate-600"
              )}>
                {msg.role === "agent" ? <Zap className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={cn("flex flex-col gap-1 max-w-[80%]", msg.role === "user" && "items-end")}>
                <div className={cn(
                  "px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm border",
                  msg.role === "agent" 
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border-slate-100 dark:border-slate-700" 
                    : "bg-emerald-500 text-white rounded-tr-sm border-emerald-400"
                )}>
                  {formatText(msg.text)}
                </div>
                <p className="text-[9px] text-slate-400 px-1 font-medium opacity-70">
                  {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Footer (Input & Hang up) */}
      <div className="p-4 flex flex-col items-center gap-6">
        {/* Input Pill */}
        <form
          onSubmit={(e) => { 
            e.preventDefault(); 
            const text = inputText.trim();
            if (!text) return;
            
            // Send via WS if open
            if (webSocket.current?.readyState === WebSocket.OPEN) {
              webSocket.current.send(JSON.stringify({ type: "text", data: text }));
            }
            
            sendMessage(text);
          }}
          className="w-full relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-5 pr-12 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700
                       bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200
                       outline-none focus:ring-2 focus:ring-emerald-500/30
                       placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || callStatus !== "active"}
            className="absolute right-1.5 w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50
                       flex items-center justify-center transition-colors shadow-sm"
          >
            <Send className="w-4 h-4 text-white -mt-0.5 ml-0.5 rotate-[-45deg]" />
          </button>
        </form>

        {/* Call/Hang up button */}
        {callStatus === "idle" ? (
          <button
            onClick={toggleCall}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform active:scale-95 animate-in zoom-in duration-200"
            title="Start Call"
          >
            <Phone className="w-6 h-6 text-white" />
          </button>
        ) : (
          <button
            onClick={toggleCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 flex items-center justify-center transition-transform active:scale-95 animate-in zoom-in duration-200"
            title="End Call"
          >
            <Phone className="w-6 h-6 text-white rotate-[135deg]" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main ConsumerSupport Component
──────────────────────────────────────────────────────────────── */
export function ConsumerSupport() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [myTickets, setMyTickets] = useState<any[]>([]);

  useEffect(() => {
    const custId = localStorage.getItem("instinct_customer_id");
    if (custId) {
      fetch(`https://betavolt-978156456889.asia-south1.run.app/customers/${custId}/support-tickets`)
        .then(res => res.json())
        .then(data => setMyTickets(data || []))
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    // Only scroll the specific chat container, not the whole page
    if (bottomRef.current && bottomRef.current.parentElement) {
      bottomRef.current.parentElement.scrollTo({
        top: bottomRef.current.parentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true); // Signal we're waiting for live response from WebSocket
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support &amp; Complaints</h1>
            <p className="text-muted-foreground mt-1">Raise a new ticket or track your existing requests.</p>
          </div>
        </div>

        {/* Agent Greeting Card */}
        <AgentGreetingCard
          onConnect={() => {}}
          messages={messages}
          setMessages={setMessages}
          inputText={inputText}
          setInputText={setInputText}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          sendMessage={sendMessage}
          bottomRef={bottomRef}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Support Form */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Raise New Ticket</CardTitle>
              <CardDescription>Describe your issue and our team will assist you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Issue Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option>Billing Issue</option>
                  <option>Meter Fault</option>
                  <option>Power Outage</option>
                  <option>New Connection</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" placeholder="Please provide detailed information about your issue..." className="min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label>Attach Photo of Meter (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <Button className="w-full mt-2">Submit Ticket</Button>

              <div className="pt-1 border-t">
                <p className="text-xs text-muted-foreground mb-2">Prefer instant help?</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Ask Volt AI instead
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Tickets List */}
          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle>My Tickets</CardTitle>
              <CardDescription>Status of your recently raised complaints</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status / Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTickets.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell className="font-medium align-top py-4">#INC-{t._id.slice(-6).toUpperCase()}</TableCell>
                      <TableCell className="align-top py-4">{t.issue_category}</TableCell>
                      <TableCell className="align-top py-4">{t.created_at ? t.created_at.split("T")[0] : "N/A"}</TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          {t.status === "RESOLVED" ? (
                             <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                               <CheckCircle2 className="mr-1 h-3 w-3" /> Resolved
                             </span>
                          ) : (
                             <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                               <Clock className="mr-1 h-3 w-3" /> {t.status}
                             </span>
                          )}
                          <p className="text-xs text-muted-foreground">Admin: {t.assigned_admin || "Unassigned"}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {myTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No tickets found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
