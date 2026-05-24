import { useState, useEffect, useRef } from "react";

// ── Anthropic API helper ──────────────────────────────────────────────────────
async function callAI(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Error generating content.";
}

// ── Mock DB ───────────────────────────────────────────────────────────────────
const MOCK_USERS = [{ email: "demo@neuroverse.ai", password: "demo123", name: "Alex Nova", plan: "Pro" }];

// ── Analytics Data ────────────────────────────────────────────────────────────
const ANALYTICS = {
  views: [120, 340, 280, 560, 890, 1200, 980, 1450, 1800, 2100, 1760, 2400],
  followers: [1200, 1280, 1350, 1420, 1600, 1750, 1900, 2100, 2300, 2600, 2900, 3200],
  engagement: [4.2, 5.1, 4.8, 6.2, 7.1, 6.8, 7.5, 8.2, 7.9, 8.8, 9.1, 9.6],
  months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
};

const TRENDS = [
  { tag: "#AIArt", score: 98, growth: "+234%", category: "Creative", color: "#ff006e" },
  { tag: "#NightRoutine", score: 95, growth: "+189%", category: "Lifestyle", color: "#8338ec" },
  { tag: "#ViralDance", score: 92, growth: "+167%", category: "Entertainment", color: "#3a86ff" },
  { tag: "#StudyWithMe", score: 89, growth: "+145%", category: "Education", color: "#06d6a0" },
  { tag: "#GlowUp", score: 87, growth: "+132%", category: "Beauty", color: "#ffbe0b" },
  { tag: "#LifeHacks", score: 84, growth: "+118%", category: "Tips", color: "#fb5607" },
  { tag: "#CodingTips", score: 81, growth: "+109%", category: "Tech", color: "#3a86ff" },
  { tag: "#FoodAesthetic", score: 79, growth: "+98%", category: "Food", color: "#ff006e" },
];

const NOTIFICATIONS = [
  { id: 1, type: "viral", msg: "Your video reached 100K views! 🔥", time: "2m ago", read: false },
  { id: 2, type: "trend", msg: "New trend alert: #AIArt is surging 234%", time: "15m ago", read: false },
  { id: 3, type: "follow", msg: "500 new followers this week!", time: "1h ago", read: true },
  { id: 4, type: "ai", msg: "AI Content Plan ready for this week", time: "3h ago", read: true },
  { id: 5, type: "system", msg: "Pro plan renewed successfully", time: "1d ago", read: true },
];

// ── Icons (SVG inline) ────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    analytics: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    trend: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    ai: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    caption: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    hashtag: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
    hook: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 2a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    profile: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    pricing: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    help: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    sun: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    fire: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  };
  return icons[name] || null;
};

// ── Mini Chart ────────────────────────────────────────────────────────────────
function MiniChart({ data, color, height = 60 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 280;
    const y = height - ((v - min) / (max - min || 1)) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" height={height} viewBox={`0 0 280 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} 280,${height}`} fill={`url(#grad-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data, labels, color, height = 120 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height, width: "100%" }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", borderRadius: "4px 4px 0 0",
            background: `linear-gradient(to top, ${color}88, ${color})`,
            height: `${(v / max) * (height - 24)}px`,
            transition: "height 0.8s cubic-bezier(.34,1.56,.64,1)",
            minHeight: 4,
          }}/>
          <span style={{ fontSize: 9, color: "#666", whiteSpace: "nowrap" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function NeuroVerseX() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const bg = dark ? "#0a0a0f" : "#f0f2f7";
  const card = dark ? "#12121c" : "#ffffff";
  const border = dark ? "#1e1e2e" : "#e0e4ef";
  const text = dark ? "#e8e8ff" : "#1a1a2e";
  const sub = dark ? "#7070a0" : "#5a5a8a";
  const accent = "#7c3aed";
  const neon = "#a855f7";
  const cyan = "#22d3ee";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigate = (p) => { setPage(p); setMobileMenu(false); };

  const login = (email, password) => {
    const u = MOCK_USERS.find(x => x.email === email && x.password === password);
    if (u) { setUser(u); navigate("dashboard"); showToast("Welcome back, " + u.name + "! 🚀"); }
    else showToast("Invalid credentials", "error");
  };

  const logout = () => { setUser(null); navigate("landing"); showToast("Logged out successfully"); };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));

  // ── Styles ──────────────────────────────────────────────────────────────────
  const S = {
    app: { fontFamily: "'Sora', 'SF Pro Display', -apple-system, sans-serif", background: bg, color: text, minHeight: "100vh", transition: "all 0.3s ease" },
    btn: (variant = "primary") => ({
      padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
      transition: "all 0.2s ease", display: "inline-flex", alignItems: "center", gap: 8,
      ...(variant === "primary" ? {
        background: `linear-gradient(135deg, ${accent}, #9333ea)`,
        color: "#fff", boxShadow: `0 4px 20px ${accent}55`,
      } : variant === "ghost" ? {
        background: "transparent", color: text, border: `1px solid ${border}`,
      } : variant === "danger" ? {
        background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff",
      } : { background: `${accent}22`, color: neon, border: `1px solid ${accent}44` }),
    }),
    card: { background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24 },
    input: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${border}`, background: dark ? "#0d0d1a" : "#f8f9fe", color: text, fontSize: 14, outline: "none", boxSizing: "border-box" },
    label: { fontSize: 13, fontWeight: 600, color: sub, marginBottom: 6, display: "block" },
    stat: { background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "20px 24px", flex: 1 },
  };

  // ── Toast ───────────────────────────────────────────────────────────────────
  const Toast = () => toast ? (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: toast.type === "error" ? "#7f1d1d" : "#14532d",
      border: `1px solid ${toast.type === "error" ? "#dc2626" : "#16a34a"}`,
      color: "#fff", padding: "14px 20px", borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 10, maxWidth: 340,
      animation: "slideIn 0.3s ease",
    }}>
      {toast.type === "error" ? "❌" : "✅"} {toast.msg}
    </div>
  ) : null;

  // ── Landing Page ────────────────────────────────────────────────────────────
  const LandingPage = () => (
    <div style={{ minHeight: "100vh", background: "#05050f", color: "#e8e8ff", overflow: "hidden" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid #1a1a2e", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100, background: "rgba(5,5,15,0.8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 20, fontWeight: 800, background: `linear-gradient(135deg, ${neon}, ${cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NeuroVerse X</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={() => navigate("pricing")} style={{ background: "none", border: "none", color: "#9090b0", cursor: "pointer", fontSize: 14 }}>Pricing</button>
          <button onClick={() => navigate("help")} style={{ background: "none", border: "none", color: "#9090b0", cursor: "pointer", fontSize: 14 }}>Help</button>
          <button onClick={() => navigate("login")} style={{ ...S.btn("ghost"), borderColor: "#2a2a3e" }}>Login</button>
          <button onClick={() => navigate("register")} style={S.btn()}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "100px 20px 80px", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${accent}20, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }}/>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${accent}20`, border: `1px solid ${accent}40`, borderRadius: 30, padding: "8px 18px", marginBottom: 32, fontSize: 13, color: neon }}>
          ✨ AI-Powered TikTok Growth Platform
        </div>
        <h1 style={{ fontSize: "clamp(42px,7vw,80px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px" }}>
          Go{" "}
          <span style={{ background: `linear-gradient(135deg, ${neon}, ${cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Viral</span>
          {" "}with<br/>Neural Intelligence
        </h1>
        <p style={{ fontSize: 18, color: "#7070a0", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7 }}>
          AI captions, trending hashtags, viral hooks, and real-time analytics — everything you need to dominate TikTok.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("register")} style={{ ...S.btn(), padding: "16px 36px", fontSize: 16 }}>
            🚀 Start for Free
          </button>
          <button onClick={() => { login("demo@neuroverse.ai", "demo123"); }} style={{ ...S.btn("outline"), padding: "16px 36px", fontSize: 16 }}>
            ▶ Live Demo
          </button>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 72, flexWrap: "wrap" }}>
          {[["500K+","Creators"], ["2.4B","Views Generated"], ["98%","Satisfaction"], ["10x","Average Growth"]].map(([n,l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, background: `linear-gradient(135deg, ${neon}, ${cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</div>
              <div style={{ fontSize: 13, color: "#5050708" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 800, marginBottom: 48 }}>Everything you need to go viral</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            { icon: "🤖", title: "AI Caption Generator", desc: "Generate scroll-stopping captions that drive engagement in seconds." },
            { icon: "📈", title: "Trend Discovery", desc: "Spot viral trends before they explode with our AI trend radar." },
            { icon: "#️⃣", title: "Smart Hashtags", desc: "AI-curated hashtags that maximize your reach and discoverability." },
            { icon: "🎣", title: "Hook Generator", desc: "First 3 seconds decide everything. Our AI writes irresistible hooks." },
            { icon: "📊", title: "Real Analytics", desc: "Deep insights into your engagement, reach, and viral score." },
            { icon: "🗓️", title: "Content Planner", desc: "AI schedules your posts for peak performance times automatically." },
          ].map(f => (
            <div key={f.title} style={{ background: "#0e0e1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 28, transition: "all 0.3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}66`; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e2e"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "#7070a0", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "80px 20px", background: `linear-gradient(135deg, ${accent}15, #0a0a2010)`, margin: "40px", borderRadius: 24, border: `1px solid ${accent}30` }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Ready to go viral?</h2>
        <p style={{ color: "#7070a0", marginBottom: 32 }}>Join 500,000+ creators already using NeuroVerse X</p>
        <button onClick={() => navigate("register")} style={{ ...S.btn(), padding: "16px 40px", fontSize: 16 }}>🚀 Start Free Today</button>
      </div>
    </div>
  );

  // ── Auth Pages ──────────────────────────────────────────────────────────────
  const AuthPage = ({ mode }) => {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [err, setErr] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handle = async () => {
      setErr(""); setSubmitting(true);
      await new Promise(r => setTimeout(r, 800));
      if (mode === "login") {
        const u = MOCK_USERS.find(x => x.email === form.email && x.password === form.password);
        if (u) { setUser(u); navigate("dashboard"); showToast("Welcome back! 🚀"); }
        else { setErr("Invalid email or password"); setSubmitting(false); }
      } else if (mode === "register") {
        if (!form.name || !form.email || !form.password) { setErr("All fields required"); setSubmitting(false); return; }
        if (form.password.length < 6) { setErr("Password must be at least 6 characters"); setSubmitting(false); return; }
        const newUser = { ...form, plan: "Free" };
        MOCK_USERS.push(newUser); setUser(newUser); navigate("dashboard"); showToast("Account created! 🎉");
      } else {
        showToast("Reset link sent to " + form.email); navigate("login");
      }
    };

    return (
      <div style={{ minHeight: "100vh", background: "#05050f", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e8e8ff", margin: "0 0 8px" }}>
              {mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Reset password"}
            </h1>
            <p style={{ color: "#5050708", fontSize: 14, margin: 0, color: "#7070a0" }}>
              {mode === "login" ? "Sign in to your NeuroVerse X account" : mode === "register" ? "Start growing on TikTok with AI" : "We'll send you a reset link"}
            </p>
          </div>

          <div style={{ background: "#0e0e1a", border: "1px solid #1e1e2e", borderRadius: 20, padding: 36 }}>
            {err && <div style={{ background: "#7f1d1d", border: "1px solid #dc2626", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#fca5a5", fontSize: 14 }}>⚠️ {err}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {mode === "register" && (
                <div>
                  <label style={{ ...S.label, color: "#9090b0" }}>Full Name</label>
                  <input style={{ ...S.input, background: "#0a0a15", border: "1px solid #2a2a3e", color: "#e8e8ff" }} placeholder="Alex Nova" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
                </div>
              )}
              <div>
                <label style={{ ...S.label, color: "#9090b0" }}>Email</label>
                <input style={{ ...S.input, background: "#0a0a15", border: "1px solid #2a2a3e", color: "#e8e8ff" }} type="email" placeholder={mode === "login" ? "demo@neuroverse.ai" : "you@example.com"} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
              </div>
              {mode !== "forgot" && (
                <div>
                  <label style={{ ...S.label, color: "#9090b0" }}>Password</label>
                  <input style={{ ...S.input, background: "#0a0a15", border: "1px solid #2a2a3e", color: "#e8e8ff" }} type="password" placeholder={mode === "login" ? "demo123" : "Min. 6 characters"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handle()}/>
                </div>
              )}

              {mode === "login" && (
                <div style={{ textAlign: "right" }}>
                  <button onClick={() => navigate("forgot")} style={{ background: "none", border: "none", color: neon, cursor: "pointer", fontSize: 13 }}>Forgot password?</button>
                </div>
              )}

              <button onClick={handle} disabled={submitting} style={{ ...S.btn(), width: "100%", justifyContent: "center", padding: "14px", fontSize: 15, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "⏳ Please wait..." : mode === "login" ? "🔓 Sign In" : mode === "register" ? "🚀 Create Account" : "📧 Send Reset Link"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 24, color: "#7070a0", fontSize: 14 }}>
              {mode === "login" ? <>No account? <button onClick={() => navigate("register")} style={{ background: "none", border: "none", color: neon, cursor: "pointer", fontWeight: 600 }}>Sign up free</button></> :
               mode === "register" ? <>Have an account? <button onClick={() => navigate("login")} style={{ background: "none", border: "none", color: neon, cursor: "pointer", fontWeight: 600 }}>Sign in</button></> :
               <button onClick={() => navigate("login")} style={{ background: "none", border: "none", color: neon, cursor: "pointer", fontWeight: 600 }}>← Back to login</button>}
            </div>

            {mode === "login" && (
              <div style={{ marginTop: 20, padding: "12px 16px", background: `${accent}15`, border: `1px solid ${accent}30`, borderRadius: 10, fontSize: 13, color: "#9090b0", textAlign: "center" }}>
                Demo: <strong style={{ color: neon }}>demo@neuroverse.ai</strong> / <strong style={{ color: neon }}>demo123</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── App Shell (authenticated) ───────────────────────────────────────────────
  const navItems = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    { key: "analytics", icon: "analytics", label: "Analytics" },
    { key: "trends", icon: "trend", label: "Trend Discovery" },
    { key: "caption", icon: "caption", label: "AI Captions" },
    { key: "hashtag", icon: "hashtag", label: "AI Hashtags" },
    { key: "hook", icon: "hook", label: "AI Hook Writer" },
    { key: "profile", icon: "profile", label: "Profile" },
    { key: "pricing", icon: "pricing", label: "Upgrade Plan" },
    { key: "settings", icon: "settings", label: "Settings" },
    { key: "help", icon: "help", label: "Help Center" },
  ];

  const AppShell = ({ children }) => (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 70, minHeight: "100vh", background: dark ? "#08080f" : "#ffffff",
        borderRight: `1px solid ${border}`, transition: "width 0.3s ease", overflow: "hidden",
        display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, zIndex: 50,
        boxShadow: "4px 0 20px rgba(0,0,0,0.2)",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚡</div>
          {sidebarOpen && <span style={{ fontSize: 16, fontWeight: 800, background: `linear-gradient(135deg, ${neon}, ${cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" }}>NeuroVerse X</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {navItems.map(({ key, icon, label }) => {
            const active = page === key;
            return (
              <button key={key} onClick={() => navigate(key)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2,
                background: active ? `${accent}25` : "transparent",
                color: active ? neon : sub,
                borderLeft: active ? `3px solid ${neon}` : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = dark ? "#1a1a2e" : "#f0f0ff"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon name={icon} size={18} color={active ? neon : sub}/>
                {sidebarOpen && <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "16px 12px", borderTop: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, ${cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {user?.name?.[0] || "U"}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: sub }}>{user?.plan} Plan</div>
              </div>
            )}
            {sidebarOpen && <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", color: sub, padding: 4 }}><Icon name="logout" size={16} color={sub}/></button>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: sidebarOpen ? 240 : 70, transition: "margin-left 0.3s ease", minHeight: "100vh" }}>
        {/* Topbar */}
        <div style={{ position: "sticky", top: 0, zIndex: 40, background: dark ? "rgba(10,10,15,0.95)" : "rgba(240,242,247,0.95)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: sub, padding: 6 }}>
              <Icon name="menu" size={20} color={sub}/>
            </button>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {navItems.find(n => n.key === page)?.label || "Dashboard"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setDark(!dark)} style={{ background: "none", border: `1px solid ${border}`, borderRadius: 8, cursor: "pointer", color: sub, padding: "6px 10px", display: "flex" }}>
              <Icon name={dark ? "sun" : "moon"} size={16} color={sub}/>
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: "none", border: `1px solid ${border}`, borderRadius: 8, cursor: "pointer", color: sub, padding: "6px 10px", display: "flex", position: "relative" }}>
                <Icon name="bell" size={16} color={sub}/>
                {unreadCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: 44, width: 340, background: card, border: `1px solid ${border}`, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", zIndex: 100, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700 }}>Notifications</span>
                    <button onClick={markAllRead} style={{ background: "none", border: "none", color: neon, cursor: "pointer", fontSize: 12 }}>Mark all read</button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${border}`, background: n.read ? "transparent" : `${accent}08`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20 }}>{n.type === "viral" ? "🔥" : n.type === "trend" ? "📈" : n.type === "follow" ? "👥" : n.type === "ai" ? "🤖" : "⚙️"}</span>
                      <div>
                        <div style={{ fontSize: 13, lineHeight: 1.4 }}>{n.msg}</div>
                        <div style={{ fontSize: 11, color: sub, marginTop: 4 }}>{n.time}</div>
                      </div>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: neon, marginLeft: "auto", marginTop: 4, flexShrink: 0 }}/>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: 28 }} onClick={() => setNotifOpen(false)}>
          {children}
        </div>
      </main>
    </div>
  );

  // ── Dashboard Page ──────────────────────────────────────────────────────────
  const DashboardPage = () => (
    <div>
      {/* Welcome */}
      <div style={{ background: `linear-gradient(135deg, ${accent}30, ${cyan}15)`, border: `1px solid ${accent}40`, borderRadius: 20, padding: "28px 32px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800 }}>Welcome back, {user?.name?.split(" ")[0]}! 👋</h2>
          <p style={{ margin: 0, color: sub, fontSize: 14 }}>Your content is trending! Here's today's performance overview.</p>
        </div>
        <button onClick={() => navigate("caption")} style={S.btn()}>🤖 Generate Content</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
        {[
          { label: "Total Views", value: "2.4M", change: "+23%", icon: "👁️", color: cyan, data: ANALYTICS.views },
          { label: "Followers", value: "3,240", change: "+12%", icon: "👥", color: neon, data: ANALYTICS.followers },
          { label: "Engagement Rate", value: "9.6%", change: "+1.4%", icon: "💜", color: "#f59e0b", data: ANALYTICS.engagement },
          { label: "Viral Score", value: "94/100", change: "+8pts", icon: "🔥", color: "#ef4444", data: [60,65,70,75,72,78,82,85,88,90,92,94] },
        ].map(s => (
          <div key={s.label} style={S.stat}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: sub, marginBottom: 4 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>↑ {s.change} this month</div>
              </div>
            </div>
            <MiniChart data={s.data} color={s.color}/>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        <div style={S.card}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>📊 Monthly Views</h3>
          <BarChart data={ANALYTICS.views} labels={ANALYTICS.months} color={cyan} height={160}/>
        </div>
        <div style={S.card}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>📈 Follower Growth</h3>
          <BarChart data={ANALYTICS.followers} labels={ANALYTICS.months} color={neon} height={160}/>
        </div>
      </div>

      {/* Trending + AI Tools */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={S.card}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>🔥 Hot Trends Right Now</h3>
          {TRENDS.slice(0, 5).map(t => (
            <div key={t.tag} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }}/>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t.tag}</span>
              </div>
              <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>{t.growth}</span>
            </div>
          ))}
          <button onClick={() => navigate("trends")} style={{ ...S.btn("outline"), marginTop: 16, width: "100%", justifyContent: "center" }}>View All Trends →</button>
        </div>

        <div style={S.card}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>🤖 AI Tools Quick Access</h3>
          {[
            { key: "caption", icon: "💬", label: "Caption Generator", desc: "AI-powered captions" },
            { key: "hashtag", icon: "#️⃣", label: "Hashtag Generator", desc: "Max reach hashtags" },
            { key: "hook", icon: "🎣", label: "Hook Writer", desc: "Viral first lines" },
          ].map(t => (
            <button key={t.key} onClick={() => navigate(t.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}`, background: "transparent", cursor: "pointer", color: text, marginBottom: 10, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}15`; e.currentTarget.style.borderColor = `${accent}44`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = border; }}>
              <span style={{ fontSize: 24 }}>{t.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: sub }}>{t.desc}</div>
              </div>
              <span style={{ marginLeft: "auto", color: sub }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Analytics Page ──────────────────────────────────────────────────────────
  const AnalyticsPage = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 28 }}>
        {[
          { label: "Impressions", value: "4.8M", icon: "👁️", change: "+31%" },
          { label: "Profile Visits", value: "142K", icon: "🔍", change: "+18%" },
          { label: "Avg. Watch Time", value: "14.2s", icon: "⏱️", change: "+5%" },
          { label: "Share Rate", value: "3.8%", icon: "📤", change: "+0.9%" },
          { label: "Comment Rate", value: "2.1%", icon: "💬", change: "+0.4%" },
          { label: "Save Rate", value: "4.9%", icon: "🔖", change: "+1.2%" },
        ].map(s => (
          <div key={s.label} style={S.stat}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: sub }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, margin: "6px 0" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#22c55e" }}>↑ {s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={S.card}>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>📈 Engagement Rate Trend</h3>
          <p style={{ color: sub, fontSize: 13, margin: "0 0 24px" }}>Monthly engagement rate over the past year</p>
          <BarChart data={ANALYTICS.engagement} labels={ANALYTICS.months} color="#f59e0b" height={160}/>
        </div>
        <div style={S.card}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>📊 Top Content Types</h3>
          {[
            { type: "Trending Audio", pct: 78, color: neon },
            { type: "POV Videos", pct: 65, color: cyan },
            { type: "Tutorials", pct: 54, color: "#f59e0b" },
            { type: "Duets", pct: 42, color: "#ef4444" },
          ].map(c => (
            <div key={c.type} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span>{c.type}</span><span style={{ color: c.color }}>{c.pct}%</span>
              </div>
              <div style={{ height: 6, background: border, borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 4, transition: "width 1s ease" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>📅 Best Time to Post</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, di) => (
            <div key={day}>
              <div style={{ textAlign: "center", fontSize: 12, color: sub, marginBottom: 8 }}>{day}</div>
              {[7,9,12,15,18,20,22].map((h, hi) => {
                const val = Math.random();
                return <div key={h} style={{ height: 32, borderRadius: 6, marginBottom: 4, background: val > 0.7 ? neon : val > 0.4 ? `${neon}60` : `${neon}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: val > 0.7 ? "#000" : sub }}>{h}:00</div>;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── AI Tool Page (generic) ──────────────────────────────────────────────────
  const AIToolPage = ({ type }) => {
    const [topic, setTopic] = useState("");
    const [niche, setNiche] = useState("lifestyle");
    const [result, setResult] = useState("");
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const configs = {
      caption: {
        title: "💬 AI Caption Generator",
        desc: "Generate viral TikTok captions that stop the scroll",
        placeholder: "Describe your video content...",
        systemPrompt: "You are a viral TikTok content expert. Generate 3 engaging, trendy TikTok captions with emojis. Each should be punchy, relatable, and designed to drive engagement. Format: numbered list.",
        userPrompt: (t, n) => `Create 3 viral TikTok captions for a ${n} video about: ${t}`,
      },
      hashtag: {
        title: "#️⃣ AI Hashtag Generator",
        desc: "AI-curated hashtags to maximize your reach",
        placeholder: "What is your video about?",
        systemPrompt: "You are a TikTok SEO expert. Generate 20 viral hashtags grouped as: 5 mega (1B+), 5 large (100M+), 5 medium (10M+), 5 niche (<10M). Label each group. Include trending ones.",
        userPrompt: (t, n) => `Generate viral TikTok hashtags for a ${n} video about: ${t}`,
      },
      hook: {
        title: "🎣 AI Hook Writer",
        desc: "First 3 seconds that make viewers stay",
        placeholder: "What message do you want to convey?",
        systemPrompt: "You are a viral TikTok hook expert. Create 5 irresistible opening hooks (first 1-2 sentences). Use psychology: curiosity gap, bold claims, relatable scenarios. Number each hook.",
        userPrompt: (t, n) => `Write 5 viral TikTok opening hooks for a ${n} video about: ${t}`,
      },
    };

    const cfg = configs[type];

    const generate = async () => {
      if (!topic.trim()) { showToast("Please enter a topic first", "error"); return; }
      setGenerating(true); setResult("");
      try {
        const res = await callAI(cfg.systemPrompt, cfg.userPrompt(topic, niche));
        setResult(res);
      } catch { setResult("⚠️ Generation failed. Please try again."); }
      setGenerating(false);
    };

    const copy = () => { navigator.clipboard.writeText(result); setCopied(true); showToast("Copied to clipboard!"); setTimeout(() => setCopied(false), 2000); };

    return (
      <div style={{ maxWidth: 780 }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>{cfg.title}</h2>
          <p style={{ margin: 0, color: sub }}>{cfg.desc}</p>
        </div>

        <div style={S.card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={S.label}>Video Topic / Description</label>
              <textarea style={{ ...S.input, height: 100, resize: "vertical", fontFamily: "inherit" }}
                placeholder={cfg.placeholder} value={topic} onChange={e => setTopic(e.target.value)}/>
            </div>
            <div>
              <label style={S.label}>Niche</label>
              <select style={{ ...S.input, height: 100 }} value={niche} onChange={e => setNiche(e.target.value)}>
                {["lifestyle","fashion","beauty","fitness","food","travel","tech","education","comedy","gaming","music","finance"].map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase()+n.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <button onClick={generate} disabled={generating} style={{ ...S.btn(), width: "100%", justifyContent: "center", padding: "14px" }}>
            {generating ? "⚡ AI is generating..." : "🚀 Generate with AI"}
          </button>
        </div>

        {generating && (
          <div style={{ ...S.card, marginTop: 20, textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 1s linear infinite", display: "inline-block" }}>⚡</div>
            <div style={{ color: sub }}>Neural network processing...</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: neon, animation: `bounce 0.8s ease ${i*0.2}s infinite` }}/>)}
            </div>
          </div>
        )}

        {result && !generating && (
          <div style={{ ...S.card, marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>✨ AI Generated Results</h3>
              <button onClick={copy} style={S.btn("outline")}>
                <Icon name={copied ? "check" : "copy"} size={14}/> {copied ? "Copied!" : "Copy All"}
              </button>
            </div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 14, color: text }}>{result}</div>
          </div>
        )}
      </div>
    );
  };

  // ── Trends Page ─────────────────────────────────────────────────────────────
  const TrendsPage = () => {
    const [search, setSearch] = useState("");
    const filtered = TRENDS.filter(t => t.tag.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ position: "relative", maxWidth: 400 }}>
            <input style={{ ...S.input, paddingLeft: 44 }} placeholder="Search trends..." value={search} onChange={e => setSearch(e.target.value)}/>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={16} color={sub}/></div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map((t, i) => (
            <div key={t.tag} style={{ ...S.card, borderColor: `${t.color}40`, transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${t.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: t.color }}>{t.tag}</div>
                  <div style={{ fontSize: 12, color: sub, marginTop: 4 }}>{t.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>{t.score}</div>
                  <div style={{ fontSize: 10, color: sub }}>Viral Score</div>
                </div>
              </div>
              <div style={{ height: 6, background: border, borderRadius: 4, marginBottom: 12 }}>
                <div style={{ height: "100%", width: `${t.score}%`, background: t.color, borderRadius: 4 }}/>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>↑ {t.growth}</span>
                <button onClick={() => { navigate("hashtag"); showToast(`Using ${t.tag} as topic`); }} style={{ ...S.btn("outline"), padding: "6px 14px", fontSize: 12 }}>
                  Use This Trend
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Profile Page ────────────────────────────────────────────────────────────
  const ProfilePage = () => {
    const [form, setForm] = useState({ name: user?.name || "", bio: "TikTok creator & AI enthusiast 🚀", niche: "lifestyle", website: "https://neuroverse.ai" });
    const [saved, setSaved] = useState(false);

    const save = () => { setSaved(true); setUser({ ...user, name: form.name }); showToast("Profile updated!"); setTimeout(() => setSaved(false), 2000); };

    return (
      <div style={{ maxWidth: 700 }}>
        {/* Cover */}
        <div style={{ height: 180, borderRadius: "16px 16px 0 0", background: `linear-gradient(135deg, ${accent}, ${cyan})`, marginBottom: 0, position: "relative" }}>
          <div style={{ position: "absolute", bottom: -40, left: 32, width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #9333ea)`, border: `4px solid ${bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff" }}>
            {user?.name?.[0]}
          </div>
        </div>

        <div style={{ ...S.card, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingTop: 56 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>{user?.name}</h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${accent}20`, border: `1px solid ${accent}40`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: neon }}>✨ {user?.plan} Plan</div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[["3.2K","Followers"],["142","Videos"],["2.4M","Total Views"]].map(([n,l]) => <div key={l} style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800 }}>{n}</div><div style={{ fontSize: 12, color: sub }}>{l}</div></div>)}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[
              { label: "Display Name", key: "name", placeholder: "Your creator name" },
              { label: "Primary Niche", key: "niche", placeholder: "e.g. lifestyle, tech..." },
              { label: "Website / Link", key: "website", placeholder: "https://yoursite.com" },
            ].map(f => (
              <div key={f.key} style={f.key === "bio" ? { gridColumn: "1/-1" } : {}}>
                <label style={S.label}>{f.label}</label>
                <input style={S.input} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}/>
              </div>
            ))}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>Bio</label>
              <textarea style={{ ...S.input, height: 80, resize: "none", fontFamily: "inherit" }} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}/>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={save} style={S.btn()}>
              <Icon name={saved ? "check" : "upload"} size={14}/> {saved ? "Saved!" : "Save Changes"}
            </button>
            <button onClick={() => navigate("pricing")} style={S.btn("outline")}>⬆️ Upgrade Plan</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Settings Page ───────────────────────────────────────────────────────────
  const SettingsPage = () => {
    const [settings, setSettings] = useState({ emailNotifs: true, pushNotifs: true, weeklyReport: true, aiAutoSuggest: true, language: "English", timezone: "UTC+5" });

    return (
      <div style={{ maxWidth: 700 }}>
        {[
          { title: "Notifications", items: [
            { key: "emailNotifs", label: "Email Notifications", desc: "Receive updates via email" },
            { key: "pushNotifs", label: "Push Notifications", desc: "In-app notifications" },
            { key: "weeklyReport", label: "Weekly Report", desc: "Get weekly performance summary" },
            { key: "aiAutoSuggest", label: "AI Auto-Suggestions", desc: "Get AI content ideas automatically" },
          ]},
        ].map(section => (
          <div key={section.title} style={{ ...S.card, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>🔔 {section.title}</h3>
            {section.items.map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>{item.desc}</div>
                </div>
                <button onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })} style={{
                  width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                  background: settings[item.key] ? neon : border,
                  position: "relative", transition: "background 0.3s",
                }}>
                  <div style={{ position: "absolute", top: 3, left: settings[item.key] ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }}/>
                </button>
              </div>
            ))}
          </div>
        ))}

        <div style={S.card}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>🎨 Appearance</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: sub }}>Toggle dark/light theme</div>
            </div>
            <button onClick={() => setDark(!dark)} style={{ ...S.btn("outline"), padding: "8px 20px" }}>
              <Icon name={dark ? "sun" : "moon"} size={14}/> {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        <div style={{ ...S.card, marginTop: 24, borderColor: "#dc262640" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#ef4444" }}>⚠️ Danger Zone</h3>
          <p style={{ color: sub, fontSize: 13, marginBottom: 16 }}>These actions are irreversible. Proceed with caution.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => showToast("Data export started", "success")} style={S.btn("outline")}>📥 Export Data</button>
            <button onClick={() => { logout(); showToast("Account deleted", "error"); }} style={S.btn("danger")}>🗑️ Delete Account</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Pricing Page ────────────────────────────────────────────────────────────
  const PricingPage = () => (
    <div style={{ maxWidth: 900 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 12px" }}>Choose Your Plan</h2>
        <p style={{ color: sub, margin: 0 }}>Start free, scale as you grow</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        {[
          { name: "Free", price: "$0", period: "/month", color: sub, features: ["5 AI generations/day","Basic analytics","5 trend alerts","Community support"], cta: "Current Plan", active: user?.plan === "Free" },
          { name: "Pro", price: "$29", period: "/month", color: neon, features: ["Unlimited AI generations","Advanced analytics","Real-time trends","Priority support","Content planner","API access"], cta: "Upgrade to Pro", active: user?.plan === "Pro", popular: true },
          { name: "Agency", price: "$99", period: "/month", color: cyan, features: ["Everything in Pro","10 team members","White-label reports","Dedicated manager","Custom AI training","SLA guarantee"], cta: "Go Agency", active: false },
        ].map(plan => (
          <div key={plan.name} style={{ ...S.card, position: "relative", borderColor: plan.popular ? `${neon}60` : border, transform: plan.popular ? "scale(1.03)" : "none", boxShadow: plan.popular ? `0 0 40px ${neon}20` : "none" }}>
            {plan.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: neon, color: "#000", borderRadius: 20, padding: "4px 16px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>⭐ Most Popular</div>}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: plan.color }}>{plan.price}</span>
                <span style={{ color: sub, fontSize: 14 }}>{plan.period}</span>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
              {plan.features.map(f => <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 14 }}>
                <span style={{ color: plan.color, fontSize: 16 }}>✓</span>{f}
              </li>)}
            </ul>
            <button onClick={() => showToast(plan.active ? "Already on this plan!" : `Upgrading to ${plan.name}...`)} style={{ ...S.btn(plan.popular ? "primary" : "outline"), width: "100%", justifyContent: "center" }}>
              {plan.active ? "✓ Current Plan" : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Help Center ─────────────────────────────────────────────────────────────
  const HelpPage = () => {
    const faqs = [
      { q: "How does the AI caption generator work?", a: "Our AI analyzes trending TikTok content and generates optimized captions based on your video topic and niche using advanced language models." },
      { q: "How many AI generations do I get on the free plan?", a: "Free users get 5 AI generations per day across all tools (captions, hashtags, and hooks)." },
      { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel at any time from Settings. Your access continues until the end of your billing period." },
      { q: "How accurate are the trend predictions?", a: "Our trend algorithm analyzes millions of TikTok posts in real-time with 94% prediction accuracy for viral content." },
    ];
    const [open, setOpen] = useState(null);

    return (
      <div style={{ maxWidth: 700 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[["📖","Documentation"],["💬","Live Chat"],["📧","Email Support"],["🎥","Video Tutorials"]].map(([icon,label]) => (
            <div key={label} onClick={() => showToast(`Opening ${label}...`)} style={{ ...S.card, textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}60`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>❓ Frequently Asked Questions</h3>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${border}` }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", background: "none", border: "none", cursor: "pointer", color: text, fontSize: 14, fontWeight: 600, textAlign: "left" }}>
                {faq.q} <span style={{ color: neon, fontSize: 20, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {open === i && <div style={{ padding: "0 0 16px", color: sub, fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Page Router ─────────────────────────────────────────────────────────────
  const renderPage = () => {
    if (!user) {
      if (page === "login") return <AuthPage mode="login"/>;
      if (page === "register") return <AuthPage mode="register"/>;
      if (page === "forgot") return <AuthPage mode="forgot"/>;
      if (page === "pricing") return (
        <div style={{ background: "#05050f", minHeight: "100vh", padding: "40px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
              <button onClick={() => navigate("landing")} style={{ background: "none", border: "none", color: neon, cursor: "pointer", fontSize: 14 }}>← Back</button>
            </div>
            <PricingPage/>
          </div>
        </div>
      );
      if (page === "help") return (
        <div style={{ background: "#05050f", minHeight: "100vh", padding: "40px 20px", color: "#e8e8ff" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <button onClick={() => navigate("landing")} style={{ background: "none", border: "none", color: neon, cursor: "pointer", fontSize: 14, marginBottom: 32 }}>← Back</button>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Help Center</h1>
            <HelpPage/>
          </div>
        </div>
      );
      return <LandingPage/>;
    }

    const pageContent = {
      dashboard: <DashboardPage/>,
      analytics: <AnalyticsPage/>,
      trends: <TrendsPage/>,
      caption: <AIToolPage type="caption"/>,
      hashtag: <AIToolPage type="hashtag"/>,
      hook: <AIToolPage type="hook"/>,
      profile: <ProfilePage/>,
      settings: <SettingsPage/>,
      pricing: <PricingPage/>,
      help: <HelpPage/>,
    }[page] || <DashboardPage/>;

    return <AppShell>{pageContent}</AppShell>;
  };

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3a3a5c; border-radius: 3px; }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        select option { background: #12121c; color: #e8e8ff; }
        textarea { font-family: inherit; }
      `}</style>
      {renderPage()}
      <Toast/>
    </div>
  );
}
