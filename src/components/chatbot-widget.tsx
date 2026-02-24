"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// --- CONFIGURATION ---
const WS_URL = "ws://10.10.11.89:8080/lovelocalai/";
const USER_AUDIO_SAMPLE_RATE = 16000;
const AI_SAMPLE_RATE = 24000;

interface Message {
  text: string;
  isUser: boolean;
}

type SupportView = "menu" | "chat" | "call";

interface ChatbotWidgetProps {
  onRegisterWSSend?: (sendFn: (msg: string) => boolean) => void;
  onDeviceSignal?: (deviceId: string, action: "turn_on" | "turn_off") => void;
}

export function ChatbotWidget({ onRegisterWSSend, onDeviceSignal }: ChatbotWidgetProps) {
  // --- UI STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [view, setView] = useState<SupportView>("menu");

  // Keep onDeviceSignal in a ref so the WS onmessage handler always has the latest version
  const onDeviceSignalRef = useRef(onDeviceSignal);
  useEffect(() => { onDeviceSignalRef.current = onDeviceSignal; }, [onDeviceSignal]);

  // --- CHAT STATE ---
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi 👋 How can I help you?", isUser: false },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callMessagesEndRef = useRef<HTMLDivElement>(null);

  // --- CALL STATE ---
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // --- REFS ---
  const webSocket = useRef<WebSocket | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamInterval = useRef<NodeJS.Timeout | null>(null);

  const userAudioContext = useRef<AudioContext | null>(null);
  const userAudioProcessor = useRef<ScriptProcessorNode | null>(null);
  const aiAudioContext = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);

  const ringingInterval = useRef<NodeJS.Timeout | null>(null);
  const ringingAudioCtx = useRef<AudioContext | null>(null);

  // ------------------------------------------------------------------
  // AUDIO: Ringing Tone
  // ------------------------------------------------------------------
  const playRingingTone = () => {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!ringingAudioCtx.current) ringingAudioCtx.current = new Ctx();
    const ctx = ringingAudioCtx.current;
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = 440;
    osc2.frequency.value = 480;
    osc1.type = "sine";
    osc2.type = "sine";

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gain.gain.setValueAtTime(0.9, now + 0.4);
    gain.gain.linearRampToValueAtTime(0, now + 0.9);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  };

  // ------------------------------------------------------------------
  // AUDIO: Connection Beep
  // ------------------------------------------------------------------
  const playConnectedSound = () => {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  // ------------------------------------------------------------------
  // LOGIC: Stop Call
  // ------------------------------------------------------------------
  const stopCall = useCallback(() => {
    if (ringingInterval.current) clearInterval(ringingInterval.current);
    if (ringingAudioCtx.current) {
      ringingAudioCtx.current.close();
      ringingAudioCtx.current = null;
    }
    if (streamInterval.current) clearInterval(streamInterval.current);
    if (webSocket.current?.readyState === WebSocket.OPEN) webSocket.current.close();
    if (mediaStream.current) mediaStream.current.getTracks().forEach((t) => t.stop());
    if (userAudioProcessor.current) userAudioProcessor.current.disconnect();
    if (userAudioContext.current?.state !== "closed") userAudioContext.current?.close();
    if (aiAudioContext.current?.state !== "closed") aiAudioContext.current?.close();

    webSocket.current = null;
    mediaStream.current = null;
    nextStartTime.current = 0;

    setConnectionStatus("Disconnected");
    setIsAiSpeaking(false);
  }, []);

  // ------------------------------------------------------------------
  // LOGIC: Send Video Frame
  // ------------------------------------------------------------------
  const sendVideoFrame = useCallback(() => {
    if (
      webSocket.current?.readyState === WebSocket.OPEN &&
      videoRef.current &&
      canvasRef.current
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState < 3) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
        webSocket.current.send(JSON.stringify({ type: "video", data: base64Data }));
      }
    }
  }, []);

  // ------------------------------------------------------------------
  // LOGIC: Play AI Audio Chunk  (robust scheduler — no gaps / crackling)
  // ------------------------------------------------------------------
  const pendingSources = useRef<AudioBufferSourceNode[]>([]);
  const speakingTimer = useRef<NodeJS.Timeout | null>(null);

  const playAudioChunk = useCallback((base64Data: string) => {
    try {
      if (!aiAudioContext.current) return;

      // Resume context if suspended (browser autoplay policy)
      if (aiAudioContext.current.state === "suspended") {
        aiAudioContext.current.resume();
      }

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;

      const buffer = aiAudioContext.current.createBuffer(1, float32Data.length, AI_SAMPLE_RATE);
      buffer.copyToChannel(float32Data, 0);

      const source = aiAudioContext.current.createBufferSource();
      source.buffer = buffer;
      source.connect(aiAudioContext.current.destination);

      const ctx = aiAudioContext.current;
      const now = ctx.currentTime;

      // Jitter buffer: keep at least 100ms ahead to absorb network jitter
      const JITTER_BUFFER = 0.1;
      if (nextStartTime.current < now + JITTER_BUFFER) {
        nextStartTime.current = now + JITTER_BUFFER;
      }

      source.start(nextStartTime.current);
      nextStartTime.current += buffer.duration;

      // Track pending sources so we know when speech truly ends
      pendingSources.current.push(source);
      setIsAiSpeaking(true);

      source.onended = () => {
        pendingSources.current = pendingSources.current.filter((s) => s !== source);
        // Only mark as not speaking when ALL queued chunks have finished
        if (pendingSources.current.length === 0) {
          if (speakingTimer.current) clearTimeout(speakingTimer.current);
          speakingTimer.current = setTimeout(() => setIsAiSpeaking(false), 200);
        }
      };
    } catch (e) {
      console.error("playAudioChunk error:", e);
    }
  }, []);


  // ------------------------------------------------------------------
  // LOGIC: Start Call
  // ------------------------------------------------------------------
  const startCall = useCallback(async () => {
    try {
      setConnectionStatus("Calling...");
      playRingingTone();
      ringingInterval.current = setInterval(playRingingTone, 2000);

      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: USER_AUDIO_SAMPLE_RATE },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream.current;
        videoRef.current.play();
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      aiAudioContext.current = new AudioCtx({ sampleRate: AI_SAMPLE_RATE });

      webSocket.current = new WebSocket(WS_URL);

      webSocket.current.onopen = () => {
        if (ringingInterval.current) clearInterval(ringingInterval.current);
        if (ringingAudioCtx.current) {
          ringingAudioCtx.current.close().catch(console.error);
          ringingAudioCtx.current = null;
        }
        playConnectedSound();
        setConnectionStatus("Connected");
        streamInterval.current = setInterval(sendVideoFrame, 150);

        if (mediaStream.current) {
          userAudioContext.current = new AudioCtx({ sampleRate: USER_AUDIO_SAMPLE_RATE });
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
              // Safe chunked btoa — avoids call stack overflow on large buffers
              const bytes = new Uint8Array(int16.buffer);
              let binary = "";
              const chunkSize = 8192;
              for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
              }
              const b64 = btoa(binary);
              console.log(`[chatbot-ws] USER audio chunk sent — ${bytes.length} bytes`);
              webSocket.current?.send(JSON.stringify({ type: "audio", data: b64 }));
            }
          };
        }
      };

      webSocket.current.onmessage = (event) => {
        // Log every raw message from the AI backend
        console.log("[chatbot-ws] RAW message received:", event.data);
        try {
          const msg = JSON.parse(event.data);
          console.log("[chatbot-ws] Parsed type:", msg.type);

          if (msg.type === "audio") {
            playAudioChunk(msg.data);
          } else if (msg.type === "text") {
            console.log("[chatbot-ws] Text from AI:", msg.data);
            setMessages((prev) => [...prev, { text: msg.data, isUser: false }]);
          } else if (msg.type === "device_signal") {
            const { device_id, device_name, action, reason } = msg.data;
            console.log(`[chatbot-ws] Device signal — ${action} "${device_name}" (${device_id}). Reason: ${reason}`);
            if (action === "turn_on" || action === "turn_off") {
              onDeviceSignalRef.current?.(device_id, action);
            }
          }
        } catch (e) {
          console.warn("[chatbot-ws] Failed to parse message:", e);
        }
      };

      webSocket.current.onclose = () => {
        setConnectionStatus("Ended");
        playConnectedSound();
        setTimeout(() => {
          setIsChatOpen(false);
          setView("menu");
        }, 2000);
      };

      webSocket.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        setConnectionStatus("Error");
        stopCall();
      };
    } catch (err) {
      console.error("startCall failed:", err);
      setConnectionStatus("Failed");
      if (ringingInterval.current) clearInterval(ringingInterval.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendVideoFrame, stopCall]);

  useEffect(() => {
    if (view === "call") startCall();
    return () => stopCall();
  }, [view, startCall, stopCall]);

  // --- REGISTER WS SEND with parent (for tariff alert injection) ---
  // Returns true if WS was open and message was sent, false otherwise
  const wsSendFn = useCallback((msg: string): boolean => {
    if (webSocket.current?.readyState === WebSocket.OPEN) {
      webSocket.current.send(JSON.stringify({ type: "text", data: msg }));
      console.log("[chatbot-ws] Injected message via existing WS:", msg);
      return true;
    }
    console.log("[chatbot-ws] WS not open — message not sent");
    return false;
  }, []);

  useEffect(() => {
    if (onRegisterWSSend) onRegisterWSSend(wsSendFn);
  }, [onRegisterWSSend, wsSendFn]);

  // --- SEND MESSAGE ---
  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { text: inputValue, isUser: true }]);
    const txtToSend = inputValue;
    setInputValue("");

    if (view === "call") {
      if (webSocket.current?.readyState === WebSocket.OPEN) {
        console.log("[chatbot-ws] USER text sent:", txtToSend);
        webSocket.current.send(JSON.stringify({ type: "text", data: txtToSend }));
      }
    } else {
      console.log("[chatbot-chat] USER message (live chat):", txtToSend);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "Our team will contact you shortly 😊", isUser: false },
        ]);
      }, 800);
    }
  };

  const openSupport = () => {
    setView("menu");
    setIsChatOpen(true);
  };
  const closeModal = () => {
    setIsChatOpen(false);
    stopCall();
  };

  useEffect(() => {
    if (view === "chat") messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  useEffect(() => {
    if (view === "call") callMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  return (
    <>
      {/* FLOATING BUTTON */}
      {!isChatOpen && (
        <button
          onClick={openSupport}
          aria-label="Open support chat"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 1000,
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(233,30,99,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 6px 28px rgba(233,30,99,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 20px rgba(233,30,99,0.45)";
          }}
        >
          💬
        </button>
      )}

      {/* MODAL */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              width: "340px",
              height: "550px",
              background: "#fff",
              borderRadius: "28px",
              boxShadow: "0 10px 30px rgba(0,0,0,.3)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                background: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)",
                color: "#fff",
                padding: "16px 20px",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "15px",
              }}
            >
              <span>
                {view === "menu" ? "🤖 AI Support" : view === "call" ? "🤖 AI Voice Call" : "💬 Live Chat"}
              </span>
              <button
                onClick={closeModal}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* VIEW 1: MENU */}
            {view === "menu" && (
              <div
                style={{
                  flex: 1,
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "16px",
                  background: "#f9f9f9",
                }}
              >
                <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "8px" }}>
                  How would you like to connect?
                </p>
                {/* Voice Call Button */}
                <button
                  onClick={() => setView("call")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px",
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: "16px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.2s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 16px rgba(233,30,99,0.15)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.06)")
                  }
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "#fce4ec",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    📞
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a1a" }}>
                      Voice Call
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                      Talk to AI assistant
                    </div>
                  </div>
                </button>

                {/* Live Chat Button */}
                <button
                  onClick={() => setView("chat")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px",
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: "16px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.2s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 16px rgba(3,155,229,0.15)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.06)")
                  }
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "#e1f5fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    💬
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a1a" }}>
                      Live Chat
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                      Message support team
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* VIEW 2: CALL */}
            {view === "call" && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: "linear-gradient(160deg, #f891f6 0%, #e74c80 100%)",
                  position: "relative",
                  color: "white",
                  overflow: "hidden",
                }}
              >
                <video ref={videoRef} playsInline muted style={{ display: "none" }} />
                <canvas ref={canvasRef} style={{ display: "none" }} />

                {/* AI Visualizer */}
                <div
                  style={{
                    flex: "0 0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      background: isAiSpeaking
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "36px",
                      boxShadow: isAiSpeaking
                        ? "0 0 0 12px rgba(255,255,255,0.15), 0 0 0 24px rgba(255,255,255,0.07)"
                        : "0 0 0 8px rgba(255,255,255,0.1)",
                      transition: "all 0.4s ease",
                    }}
                  >
                    🤖
                  </div>
                  <h3 style={{ marginTop: "12px", fontWeight: 600, fontSize: "17px" }}>
                    AI Assistant
                  </h3>
                  <p style={{ opacity: 0.8, fontSize: "12px", marginTop: "2px" }}>
                    {connectionStatus}
                  </p>
                </div>

                {/* In-call chat messages */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    background: "rgba(0,0,0,0.1)",
                    margin: "10px 0",
                  }}
                >
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        alignSelf: msg.isUser ? "flex-end" : "flex-start",
                        background: msg.isUser ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.5)",
                        color: msg.isUser ? "#e91e63" : "#fff",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        maxWidth: "85%",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={callMessagesEndRef} />
                </div>

                {/* Input + End Call */}
                <div
                  style={{ padding: "0 14px 20px 14px", display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "20px",
                      padding: "4px 4px 4px 14px",
                      backdropFilter: "blur(5px)",
                    }}
                  >
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type to AI..."
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#fff",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      onClick={handleSend}
                      style={{
                        background: "#fff",
                        color: "#e91e63",
                        border: "none",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      ↑
                    </button>
                  </div>

                  {/* End Call */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={() => {
                        stopCall();
                        setView("menu");
                      }}
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "#ff1744",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 16px rgba(255,23,68,0.5)",
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: CHAT */}
            {view === "chat" && (
              <>
                <div
                  style={{
                    flex: 1,
                    padding: "14px",
                    overflowY: "auto",
                    background: "#f7f7f7",
                    fontSize: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        background: msg.isUser ? "#e91e63" : "#fff",
                        color: msg.isUser ? "#fff" : "#000",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        width: "max-content",
                        maxWidth: "80%",
                        marginLeft: msg.isUser ? "auto" : "0",
                        boxShadow: !msg.isUser ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div
                  style={{
                    display: "flex",
                    borderTop: "1px solid #eee",
                    padding: "10px",
                    gap: "8px",
                  }}
                >
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      border: "1px solid #eee",
                      borderRadius: "20px",
                      padding: "10px 14px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                  <button
                    onClick={handleSend}
                    style={{
                      background: "#e91e63",
                      color: "#fff",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
