import { useState, useRef, useEffect } from "react";

const RATE_TIERS = [
  {
    id: "ice",
    label: "Standard ICE",
    sublabel: "Petrol & diesel cars",
    rate: 0.026,
    displayRate: "2.60%",
    color: "#94a3b8",
    description: "Conventional combustion engine vehicles",
    icon: "⛽",
  },
  {
    id: "green",
    label: "Green EV / Hybrid",
    sublabel: "Electric & hybrid vehicles",
    rate: 0.0208,
    displayRate: "2.08%",
    color: "#4ade80",
    description: "Preferential green financing under SG Green Plan 2030",
    icon: "🌿",
  },
  {
    id: "tesla",
    label: "Tesla Preferential",
    sublabel: "Tesla models only",
    rate: 0.0168,
    displayRate: "1.68%",
    color: "#a78bfa",
    description: "Exclusive bank partnership rate for Tesla vehicles",
    icon: "⚡",
  },
];

const FEATURED_CARS = [
  {
    id: "corolla", name: "Toyota Corolla Altis", short: "Corolla Altis",
    type: "Sedan · Hybrid", price: 175888, omv: 17800,
    coeCategory: "Cat A", loanCap: 70, emoji: "🏆",
    badge: "#1 Best Seller", badgeColor: "#fbbf24",
    rateTier: "green",
    desc: "Singapore's most-loved sedan. Bulletproof reliability, hybrid efficiency.",
  },
  {
    id: "atto3", name: "BYD Atto 3", short: "BYD Atto 3",
    type: "Electric SUV", price: 165888, omv: 28000,
    coeCategory: "Cat B", loanCap: 60, emoji: "🔋",
    badge: "EV Pioneer", badgeColor: "#22d3ee",
    rateTier: "green",
    desc: "The EV that kickstarted Singapore's electric revolution. Smart & compact.",
  },
  {
    id: "model3", name: "Tesla Model 3", short: "Tesla Model 3",
    type: "Electric Sedan", price: 189888, omv: 32000,
    coeCategory: "Cat A", loanCap: 60, emoji: "⚡",
    badge: "Tech Icon", badgeColor: "#a78bfa",
    rateTier: "tesla",
    desc: "Silicon Valley's sedan. Over-the-air updates, Autopilot, zero emissions.",
  },
];

const MORE_CARS = [
  { id: "sealion7",     name: "BYD Sealion 7",           type: "Electric SUV",   price: 215888, omv: 38500, coeCategory: "Cat B", loanCap: 60, emoji: "🚗",  rateTier: "green" },
  { id: "sienta",       name: "Toyota Sienta",            type: "MPV · Hybrid",   price: 168888, omv: 16200, coeCategory: "Cat A", loanCap: 70, emoji: "🚐",  rateTier: "green" },
  { id: "freed",        name: "Honda Freed e:HEV",        type: "MPV · Hybrid",   price: 163888, omv: 15400, coeCategory: "Cat A", loanCap: 70, emoji: "🛻",  rateTier: "green" },
  { id: "mazda3",       name: "Mazda 3",                  type: "Sedan · Petrol", price: 162888, omv: 19800, coeCategory: "Cat A", loanCap: 70, emoji: "🔴",  rateTier: "ice" },
  { id: "bmwx1",        name: "BMW X1",                   type: "SUV · Petrol",   price: 248888, omv: 42000, coeCategory: "Cat B", loanCap: 60, emoji: "🇩🇪", rateTier: "ice" },
  { id: "bmwix1",       name: "BMW iX1",                  type: "Electric SUV",   price: 258888, omv: 44000, coeCategory: "Cat B", loanCap: 60, emoji: "🔵",  rateTier: "green" },
  { id: "merglb",       name: "Mercedes-Benz GLB",        type: "SUV · Petrol",   price: 278888, omv: 46000, coeCategory: "Cat B", loanCap: 60, emoji: "⭐",  rateTier: "ice" },
  { id: "modely",       name: "Tesla Model Y",            type: "Electric SUV",   price: 208888, omv: 35000, coeCategory: "Cat A", loanCap: 60, emoji: "⚡",  rateTier: "tesla" },
  { id: "hyukona",      name: "Hyundai Kona Hybrid",      type: "SUV · Hybrid",   price: 166888, omv: 19200, coeCategory: "Cat A", loanCap: 70, emoji: "🔷",  rateTier: "green" },
  { id: "byddolphin",   name: "BYD Dolphin",              type: "Electric Hatch", price: 158888, omv: 22000, coeCategory: "Cat A", loanCap: 60, emoji: "🐬",  rateTier: "green" },
  { id: "bydm6",        name: "BYD M6",                   type: "Electric MPV",   price: 198888, omv: 36000, coeCategory: "Cat B", loanCap: 60, emoji: "🚌",  rateTier: "green" },
  { id: "gacaionv",     name: "GAC Aion V",               type: "Electric SUV",   price: 162888, omv: 26000, coeCategory: "Cat B", loanCap: 60, emoji: "🇨🇳", rateTier: "green" },
  { id: "civic",        name: "Honda Civic e:HEV",        type: "Sedan · Hybrid", price: 168888, omv: 18500, coeCategory: "Cat A", loanCap: 70, emoji: "🏎",  rateTier: "green" },
  { id: "xpengG6",      name: "Xpeng G6",                 type: "Electric SUV",   price: 198888, omv: 34000, coeCategory: "Cat B", loanCap: 60, emoji: "🤖",  rateTier: "green" },
  { id: "mgzs",         name: "MG ZS EV",                 type: "Electric SUV",   price: 158888, omv: 23000, coeCategory: "Cat A", loanCap: 60, emoji: "🇬🇧", rateTier: "green" },
  { id: "zeekrx",       name: "Zeekr X",                  type: "Electric SUV",   price: 178888, omv: 29000, coeCategory: "Cat B", loanCap: 60, emoji: "💎",  rateTier: "green" },
  { id: "corollacross", name: "Toyota Corolla Cross HEV", type: "SUV · Hybrid",   price: 189888, omv: 21000, coeCategory: "Cat A", loanCap: 60, emoji: "🌿",  rateTier: "green" },
  { id: "mazdacx5",     name: "Mazda CX-5",               type: "SUV · Petrol",   price: 196888, omv: 28000, coeCategory: "Cat B", loanCap: 60, emoji: "🔵",  rateTier: "ice" },
  { id: "subarufore",   name: "Subaru Forester e-Boxer",  type: "SUV · Hybrid",   price: 195888, omv: 24000, coeCategory: "Cat B", loanCap: 60, emoji: "⛰",  rateTier: "green" },
  { id: "nisanserena",  name: "Nissan Serena e-Power",    type: "MPV · e-Power",  price: 202888, omv: 26000, coeCategory: "Cat B", loanCap: 60, emoji: "🌊",  rateTier: "green" },
];

const ALL_CARS = [...FEATURED_CARS, ...MORE_CARS];
const SGD = (n) => `S$${Math.round(n).toLocaleString("en-SG")}`;

function calcAffordability({ salaryRaw, downpaymentRaw, tenure, car, rateOverride }) {
  const salary = parseInt(salaryRaw || "0", 10);
  const downpayment = parseInt(downpaymentRaw || "0", 10);
  if (!car || salary === 0 || downpayment === 0) return null;

  const tier = RATE_TIERS.find(t => t.id === (rateOverride || car.rateTier));
  const annualRate = tier.rate;
  const loanCapPct = car.loanCap / 100;
  const downCapPct = 1 - loanCapPct;
  const requiredDownpayment = car.price * downCapPct;
  const maxLoan = car.price * loanCapPct;
  const downpaymentShortfall = Math.max(0, requiredDownpayment - downpayment);
  const canAffordDownpayment = downpayment >= requiredDownpayment;
  const months = tenure * 12;
  const totalInterest = maxLoan * annualRate * tenure;
  const totalRepayable = maxLoan + totalInterest;
  const monthlyInstalment = totalRepayable / months;
  const takeHome = salary * 0.80;
  const maxAffordableInstalment = takeHome * 0.30;
  const instalmentRatio = monthlyInstalment / takeHome;

  // Compute savings vs ICE baseline
  const iceRate = RATE_TIERS.find(t => t.id === "ice").rate;
  const iceInterest = maxLoan * iceRate * tenure;
  const interestSavings = iceInterest - totalInterest;
  const monthlySavings = interestSavings / months;

  let verdict, verdictColor, verdictBg, verdictBorder, explanation;
  if (!canAffordDownpayment) {
    verdict = "Insufficient Downpayment"; verdictColor = "#f87171";
    verdictBg = "rgba(248,113,113,0.07)"; verdictBorder = "rgba(248,113,113,0.3)";
    explanation = `${SGD(requiredDownpayment)} minimum required (${100 - car.loanCap}% of price). You're short by ${SGD(downpaymentShortfall)}.`;
  } else if (instalmentRatio <= 0.30) {
    verdict = "Affordable"; verdictColor = "#4ade80";
    verdictBg = "rgba(74,222,128,0.07)"; verdictBorder = "rgba(74,222,128,0.3)";
    explanation = `Monthly instalment of ${SGD(monthlyInstalment)} is ${(instalmentRatio * 100).toFixed(1)}% of take-home — within the 30% comfort threshold.`;
  } else if (instalmentRatio <= 0.45) {
    verdict = "Stretch"; verdictColor = "#fbbf24";
    verdictBg = "rgba(251,191,36,0.07)"; verdictBorder = "rgba(251,191,36,0.35)";
    explanation = `Instalment of ${SGD(monthlyInstalment)} is ${(instalmentRatio * 100).toFixed(1)}% of take-home. Manageable, but leaves limited breathing room.`;
  } else {
    verdict = "Out of Range"; verdictColor = "#f87171";
    verdictBg = "rgba(248,113,113,0.07)"; verdictBorder = "rgba(248,113,113,0.3)";
    explanation = `Instalment of ${SGD(monthlyInstalment)} is ${(instalmentRatio * 100).toFixed(1)}% of take-home — exceeds the 45% limit. Try a longer tenure or higher downpayment.`;
  }

  return {
    car, tier, maxLoan, requiredDownpayment, downpaymentShortfall,
    canAffordDownpayment, monthlyInstalment, totalInterest, totalRepayable,
    takeHome, maxAffordableInstalment, instalmentRatio, months,
    verdict, verdictColor, verdictBg, verdictBorder, explanation,
    loanCapPct, downCapPct, annualRate, interestSavings, monthlySavings,
  };
}

function useCountUp(target, duration = 700) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null); const startRef = useRef(null); const fromRef = useRef(0);
  useEffect(() => {
    fromRef.current = display; startRef.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(fromRef.current + (target - fromRef.current) * ease));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return display;
}

function MetricCard({ label, value, sub, accent, highlight }) {
  const numVal = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
  const animated = useCountUp(numVal);
  const prefix = String(value).startsWith("S$") ? "S$" : "";
  return (
    <div style={{ background: highlight ? "rgba(167,139,250,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${highlight ? "rgba(167,139,250,0.25)" : accent ? "rgba(217,119,6,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "3px", padding: "14px 16px", position: "relative", overflow: "hidden" }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#d97706,transparent)" }} />}
      {highlight && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#a78bfa,transparent)" }} />}
      <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "2px", color: "#78716c", textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontFamily: "monospace", fontSize: "20px", color: highlight ? "#c4b5fd" : accent ? "#fbbf24" : "#e7e5e4", lineHeight: 1 }}>{prefix}{animated.toLocaleString("en-SG")}</div>
      {sub && <div style={{ marginTop: "4px", fontSize: "11px", color: "#57534e" }}>{sub}</div>}
    </div>
  );
}

function GaugeBar({ ratio }) {
  const pct = Math.min(ratio * 100, 100);
  const color = pct <= 30 ? "#4ade80" : pct <= 45 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "2px", color: "#57534e", textTransform: "uppercase" }}>Instalment / Take-home</span>
        <span style={{ fontFamily: "monospace", fontSize: "12px", color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: "30%", top: 0, bottom: 0, width: "1px", background: "rgba(74,222,128,0.4)" }} />
        <div style={{ position: "absolute", left: "45%", top: 0, bottom: 0, width: "1px", background: "rgba(251,191,36,0.4)" }} />
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#4ade80 30%,#fbbf24 45%,#f87171 70%)", borderRadius: "3px", transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)", clipPath: `inset(0 ${100 - pct}% 0 0)` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#4ade80" }}>≤30% Safe</span>
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#fbbf24" }}>≤45% Stretch</span>
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#f87171" }}>&gt;45% Risky</span>
      </div>
    </div>
  );
}

// Rate comparison mini-table shown in results
function RateComparisonTable({ car, tenure, maxLoan }) {
  const months = tenure * 12;
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "16px" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <span style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "2px", color: "#78716c", textTransform: "uppercase" }}>Rate Comparison — same loan, same tenure</span>
      </div>
      {RATE_TIERS.map((tier, i) => {
        const interest = maxLoan * tier.rate * tenure;
        const monthly = (maxLoan + interest) / months;
        const isActive = tier.id === car.rateTier;
        const isDisabled = tier.id === "tesla" && car.rateTier !== "tesla";
        return (
          <div key={tier.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderBottom: i < RATE_TIERS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: isActive ? "rgba(217,119,6,0.05)" : "transparent", opacity: isDisabled ? 0.35 : 1 }}>
            <span style={{ fontSize: "14px", flexShrink: 0 }}>{tier.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: isActive ? "#fbbf24" : "#a8a29e" }}>{tier.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#57534e", marginTop: "1px" }}>{tier.displayRate} flat · {isDisabled ? "Tesla only" : tier.sublabel}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: isActive ? "#fbbf24" : "#78716c" }}>{SGD(monthly)}/mo</div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#57534e", marginTop: "1px" }}>Total interest: {SGD(interest)}</div>
            </div>
            {isActive && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d97706", boxShadow: "0 0 6px #d97706", flexShrink: 0 }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function SingaporeCarCalculator() {
  const [salary, setSalary] = useState("");
  const [downpayment, setDownpayment] = useState("");
  const [tenure, setTenure] = useState(5);
  const [selectedCar, setSelectedCar] = useState(null);
  const [salaryRaw, setSalaryRaw] = useState("");
  const [downpaymentRaw, setDownpaymentRaw] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSalary = (e) => { const r = e.target.value.replace(/\D/g, ""); setSalaryRaw(r); setSalary(r ? Number(r).toLocaleString("en-SG") : ""); setShowResults(false); };
  const handleDown = (e) => { const r = e.target.value.replace(/\D/g, ""); setDownpaymentRaw(r); setDownpayment(r ? Number(r).toLocaleString("en-SG") : ""); setShowResults(false); };
  const pickCar = (car) => { setSelectedCar(car); setShowResults(false); setDropdownOpen(false); };
  const isComplete = salaryRaw && downpaymentRaw && selectedCar;

  const handleCalculate = () => {
    const r = calcAffordability({ salaryRaw, downpaymentRaw, tenure, car: selectedCar });
    setResults(r); setShowResults(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const LABEL = { fontFamily: "monospace", fontSize: "10px", letterSpacing: "3px", color: "#78716c", textTransform: "uppercase", display: "block", marginBottom: "10px" };
  const inputCss = (filled) => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${filled ? "rgba(217,119,6,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "3px", padding: "14px 16px 14px 44px", color: "#fafaf9", fontSize: "18px", fontFamily: "monospace", letterSpacing: "1px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: filled ? "0 0 0 3px rgba(217,119,6,0.08), inset 0 1px 3px rgba(0,0,0,0.3)" : "inset 0 1px 3px rgba(0,0,0,0.3)" });

  const activeTier = selectedCar ? RATE_TIERS.find(t => t.id === selectedCar.rateTier) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", backgroundImage: `radial-gradient(ellipse at 20% 50%,rgba(217,119,6,0.07) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(180,83,9,0.05) 0%,transparent 40%),repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(217,119,6,0.03) 79px,rgba(217,119,6,0.03) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(217,119,6,0.03) 79px,rgba(217,119,6,0.03) 80px)`, fontFamily: "Georgia,serif", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>

        {/* INPUT CARD */}
        <div style={{ background: "linear-gradient(145deg,#141414,#0f0f0f)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: "4px", boxShadow: "0 0 0 1px rgba(0,0,0,0.8),0 40px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}>
          <div style={{ height: "3px", background: "linear-gradient(90deg,transparent,#d97706,#fbbf24,#d97706,transparent)" }} />

          <div style={{ padding: "36px 40px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{ width: "6px", height: "6px", background: "#d97706", borderRadius: "50%", boxShadow: "0 0 8px #d97706" }} />
              <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "4px", color: "#78716c", textTransform: "uppercase" }}>Financial Assessment Tool</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "400", color: "#fafaf9", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: "8px" }}>
              Car Affordability<br /><span style={{ color: "#d97706", fontStyle: "italic" }}>Calculator</span>
            </h1>
            <p style={{ fontSize: "13px", color: "#57534e", lineHeight: 1.5 }}>Singapore MAS-compliant · 23 car models · Tiered interest rates</p>
          </div>

          <div style={{ padding: "32px 40px 40px" }}>

            {/* Salary */}
            <div style={{ marginBottom: "28px" }}>
              <label style={LABEL}>Monthly Gross Salary</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#d97706", fontSize: "14px", fontWeight: "600", pointerEvents: "none" }}>S$</span>
                <input type="text" inputMode="numeric" value={salary} onChange={handleSalary} placeholder="0" style={inputCss(!!salaryRaw)}
                  onFocus={e => { e.target.style.borderColor = "rgba(217,119,6,0.7)"; e.target.style.boxShadow = "0 0 0 4px rgba(217,119,6,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = salaryRaw ? "rgba(217,119,6,0.5)" : "rgba(255,255,255,0.08)"; e.target.style.boxShadow = salaryRaw ? "0 0 0 3px rgba(217,119,6,0.08)" : "none"; }} />
              </div>
              {salaryRaw && parseInt(salaryRaw) > 0 && (
                <p style={{ marginTop: "6px", fontSize: "11px", color: "#57534e", fontFamily: "monospace" }}>
                  Take-home after CPF: <span style={{ color: "#d97706" }}>S${Math.floor(parseInt(salaryRaw) * 0.8).toLocaleString("en-SG")}/mo</span> · Max instalment: <span style={{ color: "#d97706" }}>S${Math.floor(parseInt(salaryRaw) * 0.8 * 0.3).toLocaleString("en-SG")}/mo</span>
                </p>
              )}
            </div>

            {/* Downpayment */}
            <div style={{ marginBottom: "28px" }}>
              <label style={LABEL}>Available Downpayment (Cash)</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#d97706", fontSize: "14px", fontWeight: "600", pointerEvents: "none" }}>S$</span>
                <input type="text" inputMode="numeric" value={downpayment} onChange={handleDown} placeholder="0" style={inputCss(!!downpaymentRaw)}
                  onFocus={e => { e.target.style.borderColor = "rgba(217,119,6,0.7)"; e.target.style.boxShadow = "0 0 0 4px rgba(217,119,6,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = downpaymentRaw ? "rgba(217,119,6,0.5)" : "rgba(255,255,255,0.08)"; e.target.style.boxShadow = downpaymentRaw ? "0 0 0 3px rgba(217,119,6,0.08)" : "none"; }} />
              </div>
              <p style={{ marginTop: "6px", fontSize: "11px", color: "#57534e", fontFamily: "monospace" }}>Full cash required — no CPF, no loan top-up</p>
            </div>

            {/* Car selection */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                <label style={{ ...LABEL, marginBottom: 0 }}>Choose Your Car</label>
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#57534e", letterSpacing: "1px" }}>2025 Singapore market prices</span>
              </div>

              {/* Featured 3 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "10px" }}>
                {FEATURED_CARS.map((car) => {
                  const sel = selectedCar?.id === car.id;
                  const tier = RATE_TIERS.find(t => t.id === car.rateTier);
                  return (
                    <button key={car.id} onClick={() => pickCar(car)} style={{ padding: "14px 12px", textAlign: "left", cursor: "pointer", background: sel ? "rgba(217,119,6,0.1)" : "rgba(255,255,255,0.02)", border: sel ? "1px solid rgba(217,119,6,0.6)" : "1px solid rgba(255,255,255,0.07)", borderRadius: "3px", transition: "all 0.15s", boxShadow: sel ? "0 0 0 3px rgba(217,119,6,0.08),inset 0 0 20px rgba(217,119,6,0.04)" : "none", position: "relative" }}>
                      <div style={{ position: "absolute", top: "10px", right: "10px", width: "12px", height: "12px", border: `2px solid ${sel ? "#d97706" : "rgba(255,255,255,0.15)"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sel && <div style={{ width: "5px", height: "5px", background: "#d97706", borderRadius: "50%" }} />}
                      </div>
                      <div style={{ fontSize: "24px", marginBottom: "8px", lineHeight: 1 }}>{car.emoji}</div>
                      <div style={{ fontSize: "12px", color: sel ? "#fafaf9" : "#a8a29e", fontFamily: "Georgia,serif", lineHeight: 1.3, marginBottom: "5px" }}>{car.name}</div>
                      <div style={{ fontSize: "10px", color: sel ? "#d97706" : "#57534e", fontFamily: "monospace", marginBottom: "5px" }}>{car.type}</div>
                      <div style={{ fontFamily: "monospace", fontSize: "12px", color: sel ? "#fbbf24" : "#57534e", fontWeight: "600", marginBottom: "6px" }}>{SGD(car.price)}</div>
                      {/* Rate badge */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "3px", background: sel ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.04)", border: `1px solid ${sel ? tier.color + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: "2px", padding: "2px 5px" }}>
                        <span style={{ fontSize: "9px" }}>{tier.icon}</span>
                        <span style={{ fontFamily: "monospace", fontSize: "9px", color: sel ? tier.color : "#57534e", letterSpacing: "0.5px" }}>{tier.displayRate}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* More cars dropdown */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button onClick={() => setDropdownOpen(o => !o)} style={{ width: "100%", padding: "12px 16px", background: dropdownOpen ? "rgba(217,119,6,0.08)" : MORE_CARS.some(c => c.id === selectedCar?.id) ? "rgba(217,119,6,0.06)" : "rgba(255,255,255,0.02)", border: MORE_CARS.some(c => c.id === selectedCar?.id) ? "1px solid rgba(217,119,6,0.5)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "16px" }}>{MORE_CARS.some(c => c.id === selectedCar?.id) ? selectedCar.emoji : "🔽"}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "2px", color: MORE_CARS.some(c => c.id === selectedCar?.id) ? "#fbbf24" : "#78716c", textTransform: "uppercase" }}>
                      {MORE_CARS.some(c => c.id === selectedCar?.id) ? selectedCar.name : "More Cars — 20 popular models"}
                    </span>
                  </div>
                  <span style={{ color: "#57534e", fontSize: "12px", transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "none", display: "inline-block" }}>▾</span>
                </button>
                {dropdownOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50, background: "#161616", border: "1px solid rgba(217,119,6,0.25)", borderRadius: "3px", boxShadow: "0 20px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(0,0,0,0.6)", maxHeight: "320px", overflowY: "auto" }}>
                    <style>{`.dd-scroll::-webkit-scrollbar{width:4px}.dd-scroll::-webkit-scrollbar-track{background:rgba(255,255,255,0.02)}.dd-scroll::-webkit-scrollbar-thumb{background:rgba(217,119,6,0.3);border-radius:2px}`}</style>
                    <div className="dd-scroll" style={{ maxHeight: "320px", overflowY: "auto" }}>
                      {MORE_CARS.map((car, i) => {
                        const sel = selectedCar?.id === car.id;
                        const tier = RATE_TIERS.find(t => t.id === car.rateTier);
                        return (
                          <button key={car.id} onClick={() => pickCar(car)} style={{ width: "100%", padding: "11px 16px", display: "flex", alignItems: "center", gap: "12px", textAlign: "left", cursor: "pointer", background: sel ? "rgba(217,119,6,0.1)" : "transparent", border: "none", borderBottom: i < MORE_CARS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.1s" }}
                            onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                            onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}>
                            <span style={{ fontSize: "18px", flexShrink: 0 }}>{car.emoji}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", color: sel ? "#fafaf9" : "#c7c4c0", fontFamily: "Georgia,serif" }}>{car.name}</div>
                              <div style={{ fontSize: "10px", color: "#57534e", fontFamily: "monospace", marginTop: "1px" }}>{car.type} · {car.coeCategory} · {car.loanCap}% loan cap</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flexShrink: 0 }}>
                              <div style={{ fontFamily: "monospace", fontSize: "12px", color: sel ? "#fbbf24" : "#78716c" }}>{SGD(car.price)}</div>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "3px", background: "rgba(255,255,255,0.04)", border: `1px solid ${tier.color}33`, borderRadius: "2px", padding: "1px 5px" }}>
                                <span style={{ fontSize: "9px" }}>{tier.icon}</span>
                                <span style={{ fontFamily: "monospace", fontSize: "9px", color: tier.color }}>{tier.displayRate}</span>
                              </div>
                            </div>
                            {sel && <span style={{ color: "#d97706", fontSize: "12px" }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected car info + rate pill */}
              {selectedCar && activeTier && (
                <div style={{ marginTop: "10px", padding: "12px 14px", background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.12)", borderRadius: "3px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "1px", color: "#78716c", textTransform: "uppercase" }}>Interest Rate Applied</span>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${activeTier.color}15`, border: `1px solid ${activeTier.color}55`, borderRadius: "20px", padding: "3px 10px" }}>
                      <span style={{ fontSize: "12px" }}>{activeTier.icon}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: activeTier.color, letterSpacing: "1px" }}>{activeTier.label}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "13px", color: activeTier.color, fontWeight: "700" }}>{activeTier.displayRate}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: "#78716c", fontFamily: "Georgia,serif", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
                    {FEATURED_CARS.find(c => c.id === selectedCar.id)?.desc ?? `${selectedCar.name} — ${selectedCar.type}.`}
                    {" "}<span style={{ color: "#d97706" }}>{selectedCar.loanCap}% loan cap</span>, min. downpayment <span style={{ color: "#d97706" }}>{SGD(selectedCar.price * (1 - selectedCar.loanCap / 100))}</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Tenure */}
            <div style={{ marginBottom: "36px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", ...LABEL, marginBottom: "16px" }}>
                <span>Loan Tenure</span>
                <span style={{ fontSize: "22px", color: "#fbbf24", fontFamily: "monospace" }}>{tenure}<span style={{ fontSize: "12px", color: "#78716c", marginLeft: "4px" }}>yr{tenure > 1 ? "s" : ""}</span></span>
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                {[1,2,3,4,5,6,7].map(y => <span key={y} style={{ fontFamily: "monospace", fontSize: "10px", color: tenure === y ? "#d97706" : "#3c3836", width: "14px", textAlign: "center" }}>{y}</span>)}
              </div>
              <style>{`.sgcar-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;background:transparent;outline:none;cursor:pointer}.sgcar-slider::-webkit-slider-runnable-track{height:3px;background:linear-gradient(90deg,#d97706 ${(tenure-1)/6*100}%,rgba(255,255,255,0.1) ${(tenure-1)/6*100}%);border-radius:2px}.sgcar-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;background:radial-gradient(circle,#fbbf24 30%,#d97706 100%);border-radius:50%;margin-top:-9.5px;box-shadow:0 0 12px rgba(217,119,6,0.5),0 2px 6px rgba(0,0,0,0.5);border:2px solid #0a0a0a}.sgcar-slider::-moz-range-thumb{width:22px;height:22px;background:radial-gradient(circle,#fbbf24 30%,#d97706 100%);border-radius:50%;border:2px solid #0a0a0a;box-shadow:0 0 12px rgba(217,119,6,0.5);cursor:pointer}`}</style>
              <input type="range" className="sgcar-slider" min={1} max={7} step={1} value={tenure} onChange={e => { setTenure(Number(e.target.value)); setShowResults(false); }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <span style={{ fontSize: "11px", color: "#57534e", fontFamily: "monospace" }}>Shorter · Less interest</span>
                <span style={{ fontSize: "11px", color: "#57534e", fontFamily: "monospace" }}>Longer · Lower monthly</span>
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleCalculate} disabled={!isComplete} style={{ width: "100%", padding: "16px", background: isComplete ? "linear-gradient(135deg,#d97706,#b45309,#92400e)" : "rgba(255,255,255,0.04)", border: isComplete ? "1px solid rgba(217,119,6,0.4)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "3px", color: isComplete ? "#fafaf9" : "#3c3836", fontSize: "12px", letterSpacing: "4px", fontFamily: "monospace", textTransform: "uppercase", cursor: isComplete ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: isComplete ? "0 8px 32px rgba(217,119,6,0.25)" : "none" }}>
              {isComplete ? `Analyse ${selectedCar?.short ?? selectedCar?.name} →` : "Complete all fields to continue"}
            </button>
            <p style={{ marginTop: "20px", textAlign: "center", fontSize: "10px", color: "#292524", fontFamily: "monospace", letterSpacing: "1px" }}>Prices indicative incl. COE · Based on MAS regulations · For reference only</p>
          </div>
          <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(217,119,6,0.2),transparent)" }} />
        </div>

        {/* RESULTS CARD */}
        {showResults && results && (
          <div ref={resultsRef} style={{ marginTop: "20px", background: "linear-gradient(145deg,#141414,#0f0f0f)", border: `1px solid ${results.verdictBorder}`, borderRadius: "4px", boxShadow: "0 0 0 1px rgba(0,0,0,0.8),0 40px 80px rgba(0,0,0,0.6)", overflow: "hidden", animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{ height: "3px", background: `linear-gradient(90deg,transparent,${results.verdictColor},transparent)` }} />

            <div style={{ padding: "24px 40px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: results.verdictBg }}>
              {/* Car + rate pills */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "5px 12px 5px 8px" }}>
                  <span style={{ fontSize: "16px" }}>{results.car.emoji}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#a8a29e" }}>{results.car.name}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#57534e" }}>·</span>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#d97706" }}>{SGD(results.car.price)}</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${results.tier.color}15`, border: `1px solid ${results.tier.color}55`, borderRadius: "20px", padding: "5px 12px" }}>
                  <span style={{ fontSize: "12px" }}>{results.tier.icon}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: results.tier.color }}>{results.tier.label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: results.tier.color, fontWeight: "700" }}>{results.tier.displayRate}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "3px", color: "#78716c", textTransform: "uppercase", marginBottom: "5px" }}>Assessment Verdict</div>
                  <div style={{ fontSize: "30px", color: results.verdictColor, fontStyle: "italic" }}>{results.verdict}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "2px", color: "#78716c", textTransform: "uppercase", marginBottom: "3px" }}>Instalment Burden</div>
                  <div style={{ fontFamily: "monospace", fontSize: "26px", color: results.verdictColor }}>{(results.instalmentRatio * 100).toFixed(1)}<span style={{ fontSize: "13px" }}>%</span></div>
                </div>
              </div>
              <p style={{ marginTop: "10px", fontSize: "13px", color: "#a8a29e", lineHeight: 1.6, fontFamily: "Georgia,serif" }}>{results.explanation}</p>
            </div>

            <div style={{ padding: "24px 40px 32px" }}>
              {results.canAffordDownpayment && <GaugeBar ratio={results.instalmentRatio} />}
              {!results.canAffordDownpayment && (
                <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "3px", padding: "14px 16px", marginBottom: "20px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "2px", color: "#f87171", textTransform: "uppercase", marginBottom: "6px" }}>⚠ Downpayment Shortfall</div>
                  <p style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.6, fontFamily: "Georgia,serif", margin: 0 }}>
                    You need <span style={{ color: "#fbbf24" }}>{SGD(results.requiredDownpayment)}</span> minimum ({100 - results.car.loanCap}% of price). Save an additional <span style={{ color: "#f87171" }}>{SGD(results.downpaymentShortfall)}</span> to qualify.
                  </p>
                </div>
              )}

              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                <MetricCard label="Car Price" value={`S$${results.car.price}`} sub={`${results.car.coeCategory} · incl. COE`} accent />
                <MetricCard label="Max Loan" value={`S$${Math.round(results.maxLoan)}`} sub={`${results.car.loanCap}% of purchase price`} />
                <MetricCard label="Monthly Instalment" value={`S$${Math.round(results.monthlyInstalment)}`} sub={`${tenure} yrs @ ${results.tier.displayRate} flat`} accent />
                <MetricCard label="Total Interest" value={`S$${Math.round(results.totalInterest)}`} sub={`Total repayable: ${SGD(results.totalRepayable)}`} />
              </div>

              {/* Interest savings banner — only for green/tesla */}
              {results.tier.id !== "ice" && results.interestSavings > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: `${results.tier.color}0f`, border: `1px solid ${results.tier.color}33`, borderRadius: "3px", padding: "12px 16px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>💰</span>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "2px", color: results.tier.color, textTransform: "uppercase", marginBottom: "3px" }}>Green Rate Savings vs Standard ICE</div>
                    <div style={{ fontSize: "13px", color: "#e7e5e4", fontFamily: "Georgia,serif" }}>
                      You save <span style={{ color: results.tier.color, fontWeight: "bold" }}>{SGD(results.interestSavings)}</span> in total interest — that's <span style={{ color: results.tier.color }}>{SGD(results.monthlySavings)}/mo</span> less over {tenure} years.
                    </div>
                  </div>
                </div>
              )}

              {/* Rate comparison table */}
              <RateComparisonTable car={results.car} tenure={tenure} maxLoan={results.maxLoan} />

              {/* Breakdown */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: results.verdict !== "Affordable" ? "16px" : "0" }}>
                {[
                  ["Min. downpayment required", SGD(results.requiredDownpayment), !results.canAffordDownpayment],
                  ["Your downpayment", SGD(parseInt(downpaymentRaw)), results.canAffordDownpayment],
                  ["Take-home after 20% CPF", `${SGD(results.takeHome)}/mo`, false],
                  ["Comfortable max instalment (30%)", `${SGD(results.maxAffordableInstalment)}/mo`, false],
                  ["OMV", SGD(results.car.omv), false],
                  ["Loan cap rule", `OMV ${results.car.omv <= 20000 ? "≤$20k → 70%" : ">$20k → 60%"}`, false],
                  ["Interest rate tier", `${results.tier.icon} ${results.tier.label} @ ${results.tier.displayRate}`, false],
                ].map(([k, v, hl], i, a) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < a.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: hl ? "rgba(217,119,6,0.05)" : "transparent" }}>
                    <span style={{ fontSize: "11px", color: "#78716c", fontFamily: "monospace" }}>{k}</span>
                    <span style={{ fontSize: "12px", color: hl ? "#fbbf24" : "#d6d3d1", fontFamily: "monospace", fontWeight: hl ? "600" : "400" }}>{v}</span>
                  </div>
                ))}
              </div>

              {results.verdict !== "Affordable" && (
                <div style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.15)", borderRadius: "3px", padding: "14px 16px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "2px", color: "#78716c", textTransform: "uppercase", marginBottom: "6px" }}>💡 Suggestion</div>
                  <p style={{ fontSize: "12px", color: "#a8a29e", lineHeight: 1.6, fontFamily: "Georgia,serif", margin: 0 }}>
                    {!results.canAffordDownpayment
                      ? `Save ${SGD(results.downpaymentShortfall)} more to meet the minimum. Alternatively, the Honda Freed or Toyota Sienta require lower minimums at ~${SGD(163888 * 0.30)}.`
                      : results.verdict === "Stretch"
                      ? `Extending to 7 years lowers your monthly to ~${SGD(results.maxLoan * (1 + results.annualRate * 7) / 84)}. Or switch to a Cat A hybrid for a lower loan amount.`
                      : `Your comfortable budget is ~${SGD(results.takeHome * 0.30 * tenure * 12 / (1 + results.annualRate * tenure) / results.loanCapPct)}. The Corolla Altis, Honda Freed, or BYD Dolphin may be better fits.`}
                  </p>
                </div>
              )}
            </div>
            <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(217,119,6,0.2),transparent)" }} />
          </div>
        )}
      </div>
    </div>
  );
}