"use client";
import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Jsi FlightHacker AI – špičkový agent na hledání nejlevnějších letenek. Mluvíš česky, jsi stručný, konkrétní a maximálně užitečný.

Tvoje schopnosti:
- Analyzuješ zadanou trasu a navrhneš nejlepší strategie pro nejnižší ceny
- Doporučíš nejlepší dny/časy nákupu a odletu
- Upozorníš na triky: hidden city ticketing, error fares, positioning legs, open-jaw
- Doporučíš konkrétní weby: Google Flights, Skyscanner, Kiwi.com, Scott's Cheap Flights, Secretflying
- Najdeš alternativní letiště, stopovery a kombinace aerolinek
- Upozorníš na věrnostní programy a kreditní karty s miles

Formát odpovědí:
- Používej emoji pro přehlednost ✈️ 💰 🔥 ⚡
- Strukturuj do krátkých sekcí
- Vždy uveď konkrétní akční kroky
- Na konci přidej "Hack skóre" (1-10) – jak velký potenciál má trasa na levnou letenku`;

export default function FlightHacker() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [flexibility, setFlexibility] = useState("flexible");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callAgent = async (userMessage) => {
    setLoading(true);
    conversationRef.current = [...conversationRef.current, { role: "user", content: userMessage }];
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: conversationRef.current,
        }),
      });
      const data = await response.json();
      const text = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "Chyba odpovědi.";
      conversationRef.current = [...conversationRef.current, { role: "assistant", content: text }];
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Chyba připojení. Zkus to znovu." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!origin || !destination) return;
    const msg = `Hledám letenku: ${origin} → ${destination}. Datum/období: ${dates || "flexibilní"}. Flexibilita: ${flexibility === "flexible" ? "jsem flexibilní ±3-7 dní" : flexibility === "very_flexible" ? "jsem velmi flexibilní, klidně měsíc" : "pevné datum"}. Najdi mi nejlepší strategie jak ušetřit co nejvíce.`;
    setMessages([{ role: "user", content: `✈️ ${origin} → ${destination} | ${dates || "Flexibilní termín"}` }]);
    conversationRef.current = [];
    callAgent(msg);
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    callAgent(msg);
  };

  const quickActions = ["Kdy je nejlevnější koupit?", "Alternativní letiště?", "Error fares a slevy?", "Věrnostní programy?"];

  const formatMessage = (text) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <div key={i} style={{ fontWeight: 700, fontSize: 14, color: "#7fffbf", marginTop: 8 }}>{line.slice(3)}</div>;
      if (line.startsWith("# ")) return <div key={i} style={{ fontWeight: 800, fontSize: 15, color: "#00ff88", marginTop: 10 }}>{line.slice(2)}</div>;
      if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} style={{ paddingLeft: 12, color: "#c8f0dd" }}>· {line.slice(2)}</div>;
      if (line.includes("**")) return <div key={i} style={{ color: "#e0ffe8" }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00ff88">$1</strong>') }} />;
      return line ? <div key={i} style={{ color: "#d4f5e4" }}>{line}</div> : <div key={i} style={{ height: 6 }} />;
    });

  return (
    <div style={{ minHeight: "100vh", background: "#050f08", fontFamily: "'Courier New', monospace", color: "#00ff88", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.015) 2px, rgba(0,255,136,0.015) 4px)" }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} input,select{background:transparent;outline:none;} input::placeholder{color:#00ff8840;} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#00ff8844;border-radius:2px;}`}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #00ff8833", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(90deg,#050f08,#001a0c)", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 24 }}>✈️</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase" }}>FLIGHT<span style={{ color: "#ff4444" }}>HACKER</span></div>
          <div style={{ fontSize: 10, color: "#00ff8866", letterSpacing: 2 }}>AI AGENT // NEJLEPŠÍ CENY // VŽDY</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", animation: "pulse 2s infinite", boxShadow: "0 0 8px #00ff88" }} />
          <span style={{ fontSize: 10, color: "#00ff8888", letterSpacing: 1 }}>ONLINE</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #00ff8822", background: "#060f09", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 10, color: "#00ff8855", letterSpacing: 2, marginBottom: 10 }}>// ZADEJ TRASU</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 8 }}>
          {[{ label: "ODKUD", val: origin, set: setOrigin, ph: "PRG, VIE..." }, { label: "KAM", val: destination, set: setDestination, ph: "BKK, NYC..." }, { label: "TERMÍN", val: dates, set: setDates, ph: "06/2025 nebo flex" }].map(({ label, val, set, ph }) => (
            <div key={label} style={{ border: "1px solid #00ff8833", padding: "8px 12px", borderRadius: 2 }}>
              <div style={{ fontSize: 9, color: "#00ff8866", letterSpacing: 2, marginBottom: 4 }}>{label}</div>
              <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} style={{ width: "100%", border: "none", color: "#00ff88", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ border: "1px solid #00ff8833", padding: "8px 12px", borderRadius: 2 }}>
            <div style={{ fontSize: 9, color: "#00ff8866", letterSpacing: 2, marginBottom: 4 }}>FLEXIBILITA</div>
            <select value={flexibility} onChange={(e) => setFlexibility(e.target.value)} style={{ border: "none", color: "#00ff88", fontSize: 12, fontFamily: "inherit", width: "100%", cursor: "pointer" }}>
              <option value="fixed">Pevné datum</option>
              <option value="flexible">±3-7 dní</option>
              <option value="very_flexible">Velmi flex.</option>
            </select>
          </div>
          <button onClick={handleSearch} disabled={!origin || !destination || loading} style={{ background: origin && destination ? "#00ff88" : "#00ff8822", color: origin && destination ? "#050f08" : "#00ff8844", border: "none", padding: "0 20px", borderRadius: 2, fontFamily: "inherit", fontWeight: 900, fontSize: 12, cursor: origin && destination ? "pointer" : "default", letterSpacing: 2, textTransform: "uppercase" }}>
            HACK ▶
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", position: "relative", zIndex: 1 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60, color: "#00ff8833" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <div style={{ fontSize: 14, letterSpacing: 3 }}>ZADEJ TRASU A SPUSŤ HACKOVÁNÍ</div>
            <div style={{ fontSize: 11, marginTop: 8, color: "#00ff8822", letterSpacing: 1 }}>AI agent najde nejlepší strategie pro nejnižší ceny</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 16, animation: "fadeIn 0.3s ease", display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start", gap: 10 }}>
            <div style={{ fontSize: 11, padding: "2px 6px", background: m.role === "user" ? "#00ff8822" : "transparent", border: `1px solid ${m.role === "user" ? "#00ff8844" : "#00ff8822"}`, borderRadius: 2, color: m.role === "user" ? "#00ff88" : "#00ff8866", whiteSpace: "nowrap", letterSpacing: 1 }}>
              {m.role === "user" ? "YOU" : "AI"}
            </div>
            <div style={{ maxWidth: "85%", background: m.role === "user" ? "#00ff8810" : "#001a0c", border: `1px solid ${m.role === "user" ? "#00ff8830" : "#00ff8820"}`, borderRadius: 2, padding: "12px 14px", fontSize: 13, lineHeight: 1.7 }}>
              {m.role === "assistant" ? formatMessage(m.content) : <span style={{ color: "#7fffbf" }}>{m.content}</span>}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 11, padding: "2px 6px", border: "1px solid #00ff8822", borderRadius: 2, color: "#00ff8866", letterSpacing: 1 }}>AI</div>
            <div style={{ background: "#001a0c", border: "1px solid #00ff8820", borderRadius: 2, padding: "12px 14px", color: "#00ff8866", fontSize: 13 }}>
              <span style={{ animation: "blink 1s infinite" }}>█</span> Hackuji databáze letenek...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length > 0 && (
        <div style={{ padding: "8px 20px", borderTop: "1px solid #00ff8815", display: "flex", gap: 6, flexWrap: "wrap", background: "#050f08", position: "relative", zIndex: 1 }}>
          {quickActions.map((a) => (
            <button key={a} onClick={() => { setMessages((p) => [...p, { role: "user", content: a }]); callAgent(a); }} disabled={loading}
              style={{ background: "transparent", border: "1px solid #00ff8833", color: "#00ff8888", fontSize: 10, padding: "4px 10px", borderRadius: 2, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1 }}>
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ borderTop: "1px solid #00ff8822", padding: "12px 20px", display: "flex", gap: 8, background: "#060f09", position: "relative", zIndex: 1 }}>
        <div style={{ flex: 1, border: "1px solid #00ff8833", display: "flex", alignItems: "center", padding: "0 12px", borderRadius: 2 }}>
          <span style={{ color: "#00ff8844", fontSize: 12, marginRight: 8 }}>▶</span>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Zeptej se na cokoliv o letenách..." style={{ flex: 1, border: "none", color: "#00ff88", fontSize: 13, fontFamily: "inherit", padding: "10px 0" }} />
        </div>
        <button onClick={handleSend} disabled={!input.trim() || loading} style={{ background: input.trim() ? "#00ff8815" : "transparent", border: `1px solid ${input.trim() ? "#00ff88" : "#00ff8822"}`, color: input.trim() ? "#00ff88" : "#00ff8833", padding: "10px 16px", borderRadius: 2, fontFamily: "inherit", fontSize: 12, cursor: input.trim() ? "pointer" : "default", letterSpacing: 2 }}>
          SEND
        </button>
      </div>
    </div>
  );
}
