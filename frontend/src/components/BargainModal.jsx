import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { useAnim } from "../context/AnimationContext";

export default function BargainModal({ isOpen, onClose, cartSubtotal }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! Main hoon Gupta Ji, ShopEase ka store manager. 🤝 Aaj aapke cart ki deals main hi final karunga. Chalo batao, kya discount chahiye?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [deal, setDeal] = useState(null); // { discountPercent, couponCode }
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);
  const anim = useAnim();

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading || deal) return;

    const userMsg = input.trim();
    setInput("");
    setError("");

    // Add user message to state
    const updatedHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      // API call to bargain
      const { data } = await api.post("/ai/negotiate", {
        history: updatedHistory.slice(0, -1), // send history without the latest message
        userMessage: userMsg,
      });

      setRound(data.round);

      // Add AI reply to state
      setMessages((prev) => [...prev, { role: "assistant", content: data.responseText }]);

      if (data.dealSealed) {
        setDeal({
          discountPercent: data.discountPercent,
          couponCode: data.couponCode,
        });

        // Store coupon in sessionStorage for checkout auto-fill
        sessionStorage.setItem("bargain_coupon", data.couponCode);

        // Explode fireworks + money rain!
        anim.moneyRain(30);
        setTimeout(() => anim.fireworks(4), 200);
        setTimeout(() => anim.confetti(60), 600);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to talk to Gupta Ji. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Calculate mood based on round
  const moods = [
    { emoji: "😐", text: "Firm" },
    { emoji: "🤨", text: "Skeptical" },
    { emoji: "🤔", text: "Thinking" },
    { emoji: "😏", text: "Almost there" },
    { emoji: "😊", text: "Deal Sealed!" },
  ];
  const currentMood = deal ? moods[4] : moods[Math.min(round, 3)];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "100%",
          background: "var(--color-bg)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--color-surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🧔</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-ink)" }}>Gupta Ji</h3>
              <p style={{ margin: 0, fontSize: 11, color: "var(--color-muted)" }}>
                Store Manager · Mood: <span style={{ color: "var(--color-accent-light)", fontWeight: 600 }}>{currentMood.emoji} {currentMood.text}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-muted)",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Info panel */}
        <div
          style={{
            background: "rgba(6,182,212,0.06)",
            padding: "8px 16px",
            borderBottom: "1px solid var(--color-border-2)",
            fontSize: 12,
            display: "flex",
            justifyContent: "space-between",
            color: "var(--color-muted)",
          }}
        >
          <span>🛒 Cart Value: ₹{cartSubtotal}</span>
          <span>🔄 Rounds: {deal ? "Done" : `${round}/5`}</span>
        </div>

        {/* Chat Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: msg.role === "user" ? "var(--color-primary)" : "var(--color-surface)",
                border: msg.role === "user" ? "none" : "1px solid var(--color-border-2)",
                color: msg.role === "user" ? "#fff" : "var(--color-ink)",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                fontSize: 14,
                lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div
              style={{
                alignSelf: "flex-start",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-2)",
                padding: "10px 20px",
                borderRadius: "16px 16px 16px 2px",
                color: "var(--color-muted)",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
              }}
            >
              Gupta Ji is typing…
            </div>
          )}

          {error && (
            <div
              style={{
                alignSelf: "center",
                background: "rgba(244,63,94,0.1)",
                color: "var(--color-hot)",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                textAlign: "center",
                width: "100%",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Deal Struck Announcement */}
        {deal && (
          <div
            className="stamp-in"
            style={{
              margin: "0 20px 16px",
              padding: 16,
              background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))",
              border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: 16,
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>🤝 Locked!</div>
            <h4 style={{ margin: "0 0 6px", color: "var(--color-success)" }}>
              {deal.discountPercent}% Discount Granted!
            </h4>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 15,
                fontWeight: 700,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px dashed rgba(16,185,129,0.5)",
                borderRadius: 8,
                color: "var(--color-ink)",
                display: "inline-block",
                marginBottom: 10,
              }}
            >
              {deal.couponCode}
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-muted)" }}>
              Gupta Ji has auto-applied this code for your checkout! Valid for 15 minutes.
            </p>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          style={{
            padding: 16,
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            display: "flex",
            gap: 10,
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder={deal ? "Deal locked. Proceed to checkout!" : "Type a counter-offer..."}
            disabled={loading || deal}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || deal || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
