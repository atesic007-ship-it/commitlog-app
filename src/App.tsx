import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Flame, Clock, BookOpen, Target, Plus, X, Trash2 } from "lucide-react";

// ---------- design tokens ----------
const C = {
  bg: "#0B0D12",
  surface: "#12141B",
  surface2: "#171A22",
  surface3: "#1D2129",
  border: "#242833",
  borderStrong: "#333947",
  text: "#EDEBE6",
  muted: "#9296A6",
  faint: "#5C6070",
  amber: "#E8A55C",
  amberSoft: "#4A3A24",
  teal: "#5FA8A8",
  danger: "#D8837E",
};

const TECH_PRESETS = [
  { key: "javascript", label: "JavaScript", color: "#E8A55C" },
  { key: "typescript", label: "TypeScript", color: "#6C8EE0" },
  { key: "html", label: "HTML", color: "#D97A4C" },
  { key: "css", label: "CSS", color: "#D9639A" },
  { key: "sassless", label: "Sass / Less", color: "#C97BC9" },
  { key: "bootstrap", label: "Bootstrap", color: "#9C6BC7" },
  { key: "react", label: "React", color: "#5FC4D6" },
  { key: "redux", label: "Redux", color: "#8B7FE8" },
  { key: "tailwind", label: "Tailwind CSS", color: "#4FB8B0" },
  { key: "nextjs", label: "Next.js", color: "#8FA88F" },
  { key: "vue", label: "Vue.js", color: "#6FCF8E" },
  { key: "other", label: "Ostalo", color: "#A6A0B8" },
];

interface Session {
  id: string;
  techKey: string;
  techLabel: string;
  topic: string;
  minutes: number;
  date: string; // YYYY-MM-DD
}

const STORAGE_KEY = "commitlog-data-v1";
const todayISO = () => new Date().toISOString().slice(0, 10);

function fmtDuration(min: number): string {
  if (min <= 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("sr-RS", { day: "2-digit", month: "short" });
}

function techColor(key: string): string {
  return TECH_PRESETS.find((t) => t.key === key)?.color || C.teal;
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ---------- small UI pieces ----------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: C.faint,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div
      style={{
        background: C.surface2,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minWidth: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Eyebrow>{label}</Eyebrow>
        <span style={{ color: accent || C.amber, display: "flex", opacity: 0.9 }}>{icon}</span>
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 25,
          fontWeight: 600,
          color: C.text,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {value}
        {sub && <span style={{ fontSize: 12, color: C.faint, marginLeft: 8, fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
}

function Heatmap({ sessions }: { sessions: Session[] }) {
  const weeks = 20;
  const dayTotals = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      map[s.date] = (map[s.date] || 0) + s.minutes;
    });
    return map;
  }, [sessions]);

  const cols = useMemo(() => {
    const end = startOfWeek(new Date());
    end.setDate(end.getDate() + 6);
    const start = new Date(end);
    start.setDate(start.getDate() - weeks * 7 + 1);

    const grid: { date: string; minutes: number }[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: { date: string; minutes: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start);
        dt.setDate(dt.getDate() + w * 7 + d);
        const iso = dt.toISOString().slice(0, 10);
        col.push({ date: iso, minutes: dayTotals[iso] || 0 });
      }
      grid.push(col);
    }
    return grid;
  }, [dayTotals]);

  const level = (min: number) => {
    if (min <= 0) return C.surface;
    if (min < 30) return C.amberSoft;
    if (min < 60) return "#7A5730";
    if (min < 120) return "#B57A3A";
    return C.amber;
  };

  const cell = 11;
  const gap = 3;
  const todayStr = todayISO();

  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <svg
        width={cols.length * (cell + gap)}
        height={7 * (cell + gap)}
        role="img"
        aria-label="Grafik dnevne aktivnosti učenja"
      >
        {cols.map((col, ci) =>
          col.map((day, di) => (
            <rect
              key={day.date}
              x={ci * (cell + gap)}
              y={di * (cell + gap)}
              width={cell}
              height={cell}
              rx={2.5}
              fill={level(day.minutes)}
              stroke={day.date === todayStr ? C.borderStrong : "transparent"}
              strokeWidth={day.date === todayStr ? 1 : 0}
            >
              <title>{day.date}: {fmtDuration(day.minutes)}</title>
            </rect>
          ))
        )}
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11, color: C.faint }}>
        <span>Manje</span>
        {[C.surface, C.amberSoft, "#7A5730", "#B57A3A", C.amber].map((c, i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, border: `1px solid ${C.border}` }} />
        ))}
        <span>Više</span>
      </div>
    </div>
  );
}

// ---------- demo seed (prikazano samo dok korisnik ne unese svoje podatke) ----------
function buildSeedSessions(): Session[] {
  const mk = (daysAgo: number, techKey: string, topic: string, minutes: number): Session => {
    const preset = TECH_PRESETS.find((t) => t.key === techKey)!;
    return {
      id: `seed-${daysAgo}-${techKey}-${minutes}`,
      techKey,
      techLabel: preset.label,
      topic,
      minutes,
      date: isoDaysAgo(daysAgo),
    };
  };
  return [
    mk(0, "react", "Custom hooks — useLocalStorage", 45),
    mk(1, "typescript", "Generics i utility tipovi", 60),
    mk(1, "javascript", "Event loop i mikrotaskovi", 30),
    mk(2, "redux", "Redux Toolkit — slices i reducers", 50),
    mk(3, "css", "CSS grid — responsive layout", 40),
    mk(4, "typescript", "Discriminated unions", 35),
    mk(5, "react", "React Query — keširanje podataka", 55),
    mk(6, "nextjs", "App router i server komponente", 45),
    mk(7, "html", "Semantički HTML i pristupačnost", 25),
    mk(8, "javascript", "Async/await i error handling", 30),
    mk(9, "react", "Performance — useMemo, useCallback", 60),
    mk(10, "typescript", "Tipovanje React propova", 40),
    mk(11, "sassless", "Nested pravila i mixin-i u Sass-u", 35),
    mk(12, "tailwind", "Utility-first pristup i responsive klase", 25),
    mk(13, "react", "Testiranje sa React Testing Library", 50),
    mk(14, "css", "Flexbox — poravnanje i razmak", 30),
    mk(15, "redux", "Middleware i async akcije (thunk)", 40),
    mk(16, "javascript", "Closures i scope", 35),
    mk(17, "nextjs", "Rute i layout fajlovi", 40),
    mk(19, "typescript", "Interfejsi vs type alias", 30),
    mk(21, "react", "Routing sa React Router", 45),
    mk(22, "html", "Forme i validacija bez JS-a", 20),
    mk(23, "javascript", "Prototipi i nasleđivanje", 40),
    mk(25, "react", "Forme i kontrolisane komponente", 50),
    mk(27, "tailwind", "Custom teme i dizajn tokeni", 35),
    mk(29, "sassless", "Promenljive i partiali u Less-u", 30),
    mk(30, "typescript", "Generic komponente u Reactu", 45),
    mk(33, "css", "Animacije i tranzicije", 25),
    mk(36, "javascript", "Prototype chain deep dive", 30),
    mk(38, "vue", "Composition API osnove", 40),
    mk(40, "bootstrap", "Grid sistem i utility klase", 30),
    mk(42, "redux", "Selectors i normalizacija stanja", 35),
    mk(44, "html", "Meta tagovi i SEO osnove", 20),
  ];
}

// ---------- main app ----------

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const [fTech, setFTech] = useState(TECH_PRESETS[0].key);
  const [fCustomLabel, setFCustomLabel] = useState("");
  const [fTopic, setFTopic] = useState("");
  const [fMinutes, setFMinutes] = useState("30");
  const [fDate, setFDate] = useState(todayISO());
  const [formError, setFormError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let found = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSessions(parsed.sessions || []);
        found = true;
      }
    } catch (e) {
      // nema još sačuvanih podataka
    }
    if (!found) {
      // prvi put — učitaj primer podataka da se vidi kako dashboard izgleda
      setSessions(buildSeedSessions());
      setIsDemo(true);
    }
    setLoading(false);
  }, []);

  function clearDemo() {
    setSessions([]);
    setIsDemo(false);
  }

  useEffect(() => {
    if (loading) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions }));
    } catch (e) {
      console.error("Čuvanje nije uspelo", e);
    }
  }, [sessions, loading]);

  const totalMinutes = useMemo(() => sessions.reduce((a, s) => a + s.minutes, 0), [sessions]);

  const weekMinutes = useMemo(() => {
    const ws = startOfWeek(new Date());
    return sessions.filter((s) => new Date(s.date) >= ws).reduce((a, s) => a + s.minutes, 0);
  }, [sessions]);

  const avgSession = useMemo(() => {
    if (!sessions.length) return 0;
    return Math.round(totalMinutes / sessions.length);
  }, [sessions, totalMinutes]);

  const streak = useMemo(() => {
    const dates = new Set(sessions.map((s) => s.date));
    let count = 0;
    let cursor = new Date();
    if (!dates.has(todayISO())) cursor.setDate(cursor.getDate() - 1);
    while (dates.has(cursor.toISOString().slice(0, 10))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [sessions]);

  const minutesByTech = useMemo(() => {
    const map: Record<string, { label: string; minutes: number; color: string }> = {};
    sessions.forEach((s) => {
      if (!map[s.techKey]) map[s.techKey] = { label: s.techLabel, minutes: 0, color: techColor(s.techKey) };
      map[s.techKey].minutes += s.minutes;
    });
    return Object.entries(map).map(([key, v]) => ({ key, ...v })).sort((a, b) => b.minutes - a.minutes);
  }, [sessions]);

  const trend14 = useMemo(() => {
    const arr: { label: string; minuti: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const iso = isoDaysAgo(i);
      const sum = sessions.filter((s) => s.date === iso).reduce((a, s) => a + s.minutes, 0);
      const d = new Date(iso);
      arr.push({ label: d.toLocaleDateString("sr-RS", { day: "2-digit", month: "2-digit" }), minuti: sum });
    }
    return arr;
  }, [sessions]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [sessions]);

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function resetForm() {
    setFTech(TECH_PRESETS[0].key);
    setFCustomLabel("");
    setFTopic("");
    setFMinutes("30");
    setFDate(todayISO());
    setFormError("");
  }

  function submitSession() {
    const topic = fTopic.trim();
    const minutes = parseInt(fMinutes, 10);
    if (!topic) return setFormError("Unesi temu ili lekciju koju si učio/la.");
    if (!minutes || minutes <= 0) return setFormError("Unesi trajanje veće od 0 minuta.");
    if (!fDate) return setFormError("Izaberi datum.");

    const preset = TECH_PRESETS.find((t) => t.key === fTech)!;
    const label = fTech === "other" && fCustomLabel.trim() ? fCustomLabel.trim() : preset.label;

    const session: Session = {
      id: (crypto as any).randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      techKey: fTech,
      techLabel: label,
      topic,
      minutes,
      date: fDate,
    };
    setSessions((prev) => [session, ...prev]);
    setIsDemo(false);
    setFormOpen(false);
    resetForm();
  }

  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');`;

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: "Inter, sans-serif" }}>
        <style>{fontImport}</style>
        Učitavanje...
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      <style>{`
        ${fontImport}
        * { box-sizing: border-box; }
        input, select { font-family: 'Inter', sans-serif; }
        ::placeholder { color: ${C.faint}; }
        select:focus, input:focus { outline: 2px solid ${C.amber}; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid ${C.amber}; outline-offset: 2px; }
        .session-row:hover { background: ${C.surface3}; }
        .session-row:hover .delete-btn { color: ${C.danger}; }
      `}</style>

      {/* top bar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: C.amber, display: "inline-block" }} />
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em" }}>
                commit.log
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 1 }}>
                Praćenje vremena učenja po tehnologijama i ciljevima
              </div>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setFormOpen(true); }}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: C.amber, color: "#241705", border: "none",
              borderRadius: 9, padding: "10px 16px", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
            }}
          >
            <Plus size={15} /> Nova sesija
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "24px 24px 60px" }}>
        {isDemo && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
              background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "10px 16px", marginBottom: 16, fontSize: 13, color: C.muted,
            }}
          >
            <span>
              Ovo su <span style={{ color: C.text, fontWeight: 500 }}>primer podaci</span> koji pokazuju kako dashboard izgleda kad se koristi.
            </span>
            <button
              onClick={clearDemo}
              style={{
                background: "transparent", border: `1px solid ${C.border}`, color: C.text,
                borderRadius: 8, padding: "6px 12px", fontSize: 12.5, cursor: "pointer", flexShrink: 0,
              }}
            >
              Obriši primer i počni iznova
            </button>
          </div>
        )}
        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard icon={<Clock size={15} />} label="Ukupno vreme" value={fmtDuration(totalMinutes)} />
          <StatCard icon={<Target size={15} />} label="Ova nedelja" value={fmtDuration(weekMinutes)} accent={C.teal} />
          <StatCard icon={<Flame size={15} />} label="Trenutni niz" value={String(streak)} sub={streak === 1 ? "dan" : "dana"} />
          <StatCard icon={<BookOpen size={15} />} label="Sesije" value={String(sessions.length)} accent={C.teal} />
          <StatCard icon={<Clock size={15} />} label="Prosek po sesiji" value={fmtDuration(avgSession)} />
        </div>

        {sessions.length === 0 ? (
          <div
            style={{
              background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "48px 24px", textAlign: "center", color: C.muted,
            }}
          >
            <div style={{ fontSize: 15, color: C.text, marginBottom: 6, fontWeight: 500 }}>Još nema zabeleženih sesija</div>
            <div style={{ fontSize: 13.5, marginBottom: 16 }}>Dodaj prvu sesiju i počni da pratiš svoj napredak kroz tehnologije.</div>
            <button
              onClick={() => { resetForm(); setFormOpen(true); }}
              style={{
                background: "transparent", border: `1px solid ${C.amber}`, color: C.amber,
                borderRadius: 9, padding: "9px 16px", fontSize: 13.5, cursor: "pointer", fontWeight: 500,
              }}
            >
              + Dodaj prvu sesiju
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 14, marginBottom: 14 }} className="main-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
                <Panel title="Aktivnost" subtitle="Koliko si učio svakog dana, poslednjih par meseci">
                  <Heatmap sessions={sessions} />
                </Panel>

                <Panel title="Trend poslednjih 14 dana">
                  <div style={{ height: 210 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend14} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillAmber" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={C.amber} stopOpacity={0.45} />
                            <stop offset="100%" stopColor={C.amber} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" stroke={C.faint} fontSize={11} tickLine={false} axisLine={{ stroke: C.border }} interval={1} />
                        <YAxis stroke={C.faint} fontSize={11} tickLine={false} axisLine={false} width={34} />
                        <Tooltip
                          contentStyle={{ background: C.surface3, border: `1px solid ${C.borderStrong}`, borderRadius: 8, fontSize: 12, color: C.text }}
                          labelStyle={{ color: C.muted }}
                          formatter={(v: number) => [fmtDuration(v), "vreme"]}
                        />
                        <Area type="monotone" dataKey="minuti" stroke={C.amber} strokeWidth={2} fill="url(#fillAmber)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
                <Panel title="Vreme po tehnologiji" subtitle="Koliko od ukupnog vremena ide na svaku tehnologiju">
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    {minutesByTech.map((t) => {
                      const pct = totalMinutes ? Math.round((t.minutes / totalMinutes) * 100) : 0;
                      return (
                        <div key={t.key}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                            <span style={{ color: C.text }}>{t.label}</span>
                            <span style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                              {fmtDuration(t.minutes)} · {pct}%
                            </span>
                          </div>
                          <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: t.color, borderRadius: 3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>
            </div>

            <Panel title="Sesije">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {sortedSessions.map((s) => (
                  <div
                    key={s.id}
                    className="session-row"
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 4px",
                      borderBottom: `1px solid ${C.border}`, borderRadius: 6, margin: "0 -4px",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: techColor(s.techKey), flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono', monospace", width: 66, flexShrink: 0 }}>
                      {fmtDate(s.date)}
                    </span>
                    <span style={{ fontSize: 13, color: C.muted, width: 100, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.techLabel}
                    </span>
                    <span style={{ fontSize: 13.5, color: C.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.topic}
                    </span>
                    <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: C.amber, flexShrink: 0, minWidth: 50, textAlign: "right" }}>
                      {fmtDuration(s.minutes)}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteSession(s.id)}
                      aria-label="Obriši sesiju"
                      style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 4, display: "flex", flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </div>

      {formOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(6,7,10,0.72)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50,
          }}
          onClick={() => setFormOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.surface2, border: `1px solid ${C.borderStrong}`, borderRadius: 14,
              padding: 24, width: "100%", maxWidth: 420, boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16.5 }}>Nova sesija</div>
              <button
                onClick={() => setFormOpen(false)}
                aria-label="Zatvori"
                style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <Field label="Tehnologija">
              <select value={fTech} onChange={(e) => setFTech(e.target.value)} style={selectStyle}>
                {TECH_PRESETS.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </Field>

            {fTech === "other" && (
              <Field label="Naziv tehnologije">
                <input value={fCustomLabel} onChange={(e) => setFCustomLabel(e.target.value)} placeholder="npr. Rust, Go, SQL..." style={inputStyle} />
              </Field>
            )}

            <Field label="Tema / lekcija">
              <input value={fTopic} onChange={(e) => setFTopic(e.target.value)} placeholder="npr. React hooks — useEffect" style={inputStyle} />
            </Field>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Field label="Trajanje (min)">
                  <input type="number" min={1} value={fMinutes} onChange={(e) => setFMinutes(e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Datum">
                  <input type="date" value={fDate} max={todayISO()} onChange={(e) => setFDate(e.target.value)} style={inputStyle} />
                </Field>
              </div>
            </div>

            {formError && <div style={{ color: C.danger, fontSize: 13, marginBottom: 10 }}>{formError}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setFormOpen(false)}
                style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 9, padding: "10px 0", fontSize: 13.5, cursor: "pointer" }}
              >
                Otkaži
              </button>
              <button
                onClick={submitSession}
                style={{ flex: 1, background: C.amber, border: "none", color: "#241705", borderRadius: 9, padding: "10px 0", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
              >
                Sačuvaj sesiju
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
  color: C.text, fontSize: 13.5, padding: "9px 11px",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function Panel({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "17px 19px", boxShadow: "0 1px 2px rgba(0,0,0,0.35)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: subtitle ? 4 : 15 }}>
        <Eyebrow>{title}</Eyebrow>
        {right}
      </div>
      {subtitle && <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 15 }}>{subtitle}</div>}
      {children}
    </div>
  );
}
