import { useState, useRef, useEffect, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const RATE_TIERS = [
  { id: "ice",   label: "Standard ICE",       sublabel: "Petrol & diesel",          rate: 0.026,  displayRate: "2.60%", color: "#94a3b8", icon: "⛽" },
  { id: "green", label: "Green EV / Hybrid",  sublabel: "Electric & hybrid",        rate: 0.0208, displayRate: "2.08%", color: "#4ade80", icon: "🌿" },
  { id: "tesla", label: "Tesla Preferential", sublabel: "Tesla models only",        rate: 0.0168, displayRate: "1.68%", color: "#a78bfa", icon: "⚡" },
];

const FEATURED_CARS = [
  { id:"corolla", name:"Toyota Corolla Altis", short:"Corolla Altis", type:"Sedan · Hybrid",  price:175888, omv:17800, coeCategory:"Cat A", loanCap:70, emoji:"🏆", badge:"#1 Best Seller", badgeColor:"#fbbf24", rateTier:"green", desc:"Singapore's most-loved sedan. Bulletproof reliability, hybrid efficiency." },
  { id:"atto3",   name:"BYD Atto 3",           short:"BYD Atto 3",   type:"Electric SUV",     price:165888, omv:28000, coeCategory:"Cat B", loanCap:60, emoji:"🔋", badge:"EV Pioneer",    badgeColor:"#22d3ee", rateTier:"green", desc:"The EV that kickstarted Singapore's electric revolution. Smart & compact." },
  { id:"model3",  name:"Tesla Model 3",         short:"Model 3",      type:"Electric Sedan",   price:189888, omv:32000, coeCategory:"Cat A", loanCap:60, emoji:"⚡", badge:"Tech Icon",     badgeColor:"#a78bfa", rateTier:"tesla", desc:"Silicon Valley's sedan. Over-the-air updates, Autopilot, zero emissions." },
];

const MORE_CARS = [
  { id:"sealion7",     name:"BYD Sealion 7",           type:"Electric SUV",   price:215888, omv:38500, coeCategory:"Cat B", loanCap:60, emoji:"🚗",  rateTier:"green" },
  { id:"sienta",       name:"Toyota Sienta",            type:"MPV · Hybrid",   price:168888, omv:16200, coeCategory:"Cat A", loanCap:70, emoji:"🚐",  rateTier:"green" },
  { id:"freed",        name:"Honda Freed e:HEV",        type:"MPV · Hybrid",   price:163888, omv:15400, coeCategory:"Cat A", loanCap:70, emoji:"🛻",  rateTier:"green" },
  { id:"mazda3",       name:"Mazda 3",                  type:"Sedan · Petrol", price:162888, omv:19800, coeCategory:"Cat A", loanCap:70, emoji:"🔴",  rateTier:"ice"   },
  { id:"bmwx1",        name:"BMW X1",                   type:"SUV · Petrol",   price:248888, omv:42000, coeCategory:"Cat B", loanCap:60, emoji:"🇩🇪", rateTier:"ice"   },
  { id:"bmwix1",       name:"BMW iX1",                  type:"Electric SUV",   price:258888, omv:44000, coeCategory:"Cat B", loanCap:60, emoji:"🔵",  rateTier:"green" },
  { id:"merglb",       name:"Mercedes-Benz GLB",        type:"SUV · Petrol",   price:278888, omv:46000, coeCategory:"Cat B", loanCap:60, emoji:"⭐",  rateTier:"ice"   },
  { id:"modely",       name:"Tesla Model Y",            type:"Electric SUV",   price:208888, omv:35000, coeCategory:"Cat A", loanCap:60, emoji:"⚡",  rateTier:"tesla" },
  { id:"hyukona",      name:"Hyundai Kona Hybrid",      type:"SUV · Hybrid",   price:166888, omv:19200, coeCategory:"Cat A", loanCap:70, emoji:"🔷",  rateTier:"green" },
  { id:"byddolphin",   name:"BYD Dolphin",              type:"Electric Hatch", price:158888, omv:22000, coeCategory:"Cat A", loanCap:60, emoji:"🐬",  rateTier:"green" },
  { id:"bydm6",        name:"BYD M6",                   type:"Electric MPV",   price:198888, omv:36000, coeCategory:"Cat B", loanCap:60, emoji:"🚌",  rateTier:"green" },
  { id:"gacaionv",     name:"GAC Aion V",               type:"Electric SUV",   price:162888, omv:26000, coeCategory:"Cat B", loanCap:60, emoji:"🇨🇳", rateTier:"green" },
  { id:"civic",        name:"Honda Civic e:HEV",        type:"Sedan · Hybrid", price:168888, omv:18500, coeCategory:"Cat A", loanCap:70, emoji:"🏎",  rateTier:"green" },
  { id:"xpengG6",      name:"Xpeng G6",                 type:"Electric SUV",   price:198888, omv:34000, coeCategory:"Cat B", loanCap:60, emoji:"🤖",  rateTier:"green" },
  { id:"mgzs",         name:"MG ZS EV",                 type:"Electric SUV",   price:158888, omv:23000, coeCategory:"Cat A", loanCap:60, emoji:"🇬🇧", rateTier:"green" },
  { id:"zeekrx",       name:"Zeekr X",                  type:"Electric SUV",   price:178888, omv:29000, coeCategory:"Cat B", loanCap:60, emoji:"💎",  rateTier:"green" },
  { id:"corollacross", name:"Toyota Corolla Cross HEV", type:"SUV · Hybrid",   price:189888, omv:21000, coeCategory:"Cat A", loanCap:60, emoji:"🌿",  rateTier:"green" },
  { id:"mazdacx5",     name:"Mazda CX-5",               type:"SUV · Petrol",   price:196888, omv:28000, coeCategory:"Cat B", loanCap:60, emoji:"🔵",  rateTier:"ice"   },
  { id:"subarufore",   name:"Subaru Forester e-Boxer",  type:"SUV · Hybrid",   price:195888, omv:24000, coeCategory:"Cat B", loanCap:60, emoji:"⛰",  rateTier:"green" },
  { id:"nisanserena",  name:"Nissan Serena e-Power",    type:"MPV · e-Power",  price:202888, omv:26000, coeCategory:"Cat B", loanCap:60, emoji:"🌊",  rateTier:"green" },
];

const ALL_CARS = [...FEATURED_CARS, ...MORE_CARS];
const SGD  = (n) => `S$${Math.round(n).toLocaleString("en-SG")}`;
const SGDk = (n) => n >= 1000 ? `S$${(n/1000).toFixed(1)}k` : SGD(n);

// ─── CALC ENGINE ─────────────────────────────────────────────────────────────
function calc(salary, downpayment, tenure, car) {
  if (!car || !salary || !downpayment) return null;
  const tier       = RATE_TIERS.find(t => t.id === car.rateTier);
  const rate       = tier.rate;
  const lcPct      = car.loanCap / 100;
  const dcPct      = 1 - lcPct;
  const reqDown    = car.price * dcPct;
  const loan       = car.price * lcPct;
  const canDown    = downpayment >= reqDown;
  const months     = tenure * 12;
  const interest   = loan * rate * tenure;
  const repayable  = loan + interest;
  const monthly    = repayable / months;
  const takeHome   = salary * 0.80;
  const maxInst    = takeHome * 0.30;
  const ratio      = monthly / takeHome;
  const iceInt     = loan * 0.026 * tenure;
  const saving     = iceInt - interest;
  // COO milestones
  const coo = [1,2,3,5,7].map(y => {
    const mo = Math.min(y, tenure) * 12;
    const paid = monthly * mo + (canDown ? downpayment : reqDown);
    return { year: y, paid, done: y <= tenure };
  });

  let verdict, vc, vbg, vb;
  if (!canDown)        { verdict="Insufficient Downpayment"; vc="#f87171"; vbg="rgba(248,113,113,0.07)"; vb="rgba(248,113,113,0.3)"; }
  else if (ratio<=0.30){ verdict="Affordable";               vc="#4ade80"; vbg="rgba(74,222,128,0.07)";  vb="rgba(74,222,128,0.3)";  }
  else if (ratio<=0.45){ verdict="Stretch";                  vc="#fbbf24"; vbg="rgba(251,191,36,0.07)";  vb="rgba(251,191,36,0.35)"; }
  else                 { verdict="Out of Range";              vc="#f87171"; vbg="rgba(248,113,113,0.07)"; vb="rgba(248,113,113,0.3)"; }

  return { car, tier, loan, reqDown, canDown, shortfall: Math.max(0,reqDown-downpayment),
           monthly, interest, repayable, takeHome, maxInst, ratio, months,
           verdict, vc, vbg, vb, lcPct, dcPct, rate, saving, coo,
           totalCoo: downpayment + repayable };
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useCountUp(target, ms=800, delay=0) {
  const [v, setV] = useState(0);
  const raf = useRef(null); const t0 = useRef(null); const from = useRef(0);
  useEffect(() => {
    from.current = 0; setV(0); t0.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    const id = setTimeout(() => {
      const step = ts => {
        if (!t0.current) t0.current = ts;
        const p = Math.min((ts-t0.current)/ms, 1);
        const e = 1-Math.pow(1-p,4);
        setV(Math.round(target*e));
        if (p<1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(id); if(raf.current) cancelAnimationFrame(raf.current); };
  }, [target, delay]);
  return v;
}

function useDebounce(val, ms) {
  const [dv, setDv] = useState(val);
  useEffect(() => { const t = setTimeout(()=>setDv(val), ms); return ()=>clearTimeout(t); }, [val, ms]);
  return dv;
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
const MONO = { fontFamily:"monospace" };

function Pill({ icon, label, value, color }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${color}15`, border:`1px solid ${color}44`, borderRadius:20, padding:"4px 10px" }}>
      <span style={{ fontSize:11 }}>{icon}</span>
      <span style={{ ...MONO, fontSize:10, color, letterSpacing:1 }}>{label}</span>
      <span style={{ ...MONO, fontSize:12, color, fontWeight:700 }}>{value}</span>
    </div>
  );
}

function VerdictIcon({ v, vc, glow }) {
  const icon = v==="Affordable" ? "✦" : v==="Stretch" ? "◈" : "✕";
  return (
    <div style={{ width:52, height:52, borderRadius:"50%", background:`radial-gradient(circle,${vc}22 0%,${vc}08 100%)`, border:`2px solid ${vc}55`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow: glow?`0 0 20px ${vc}50,0 0 40px ${vc}20`:"none", transition:"box-shadow 0.6s" }}>
      <span style={{ fontSize:20, color:vc }}>{icon}</span>
    </div>
  );
}

function GaugeBar({ ratio, visible }) {
  const pct = Math.min(ratio*100, 100);
  const color = pct<=30?"#4ade80":pct<=45?"#fbbf24":"#f87171";
  const [w, setW] = useState(0);
  useEffect(() => { if(visible){const t=setTimeout(()=>setW(pct),150);return()=>clearTimeout(t);}else setW(0); }, [visible,pct]);
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ ...MONO, fontSize:9, letterSpacing:2, color:"#57534e", textTransform:"uppercase" }}>Instalment / Take-home</span>
        <span style={{ ...MONO, fontSize:11, color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", left:"30%", top:0, bottom:0, width:1, background:"rgba(74,222,128,0.4)" }}/>
        <div style={{ position:"absolute", left:"45%", top:0, bottom:0, width:1, background:"rgba(251,191,36,0.4)" }}/>
        <div style={{ height:"100%", width:`${w}%`, background:"linear-gradient(90deg,#4ade80 30%,#fbbf24 45%,#f87171 70%)", borderRadius:3, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        <span style={{ ...MONO, fontSize:9, color:"#4ade80" }}>≤30% Safe</span>
        <span style={{ ...MONO, fontSize:9, color:"#fbbf24" }}>≤45% Stretch</span>
        <span style={{ ...MONO, fontSize:9, color:"#f87171" }}>&gt;45% Risky</span>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, accent, delay=0, visible }) {
  const num = parseInt(String(value).replace(/\D/g,""),10)||0;
  const anim = useCountUp(visible?num:0, 900, delay+250);
  const pre = String(value).startsWith("S$")?"S$":"";
  const [in_, setIn] = useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),delay);return()=>clearTimeout(t);}else setIn(false); },[visible,delay]);
  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${accent?"rgba(217,119,6,0.22)":"rgba(255,255,255,0.06)"}`, borderRadius:3, padding:"13px 15px", position:"relative", overflow:"hidden", opacity:in_?1:0, transform:in_?"translateY(0)":"translateY(10px)", transition:"opacity 0.45s ease, transform 0.45s ease" }}>
      {accent && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#d97706,transparent)" }}/>}
      <div style={{ ...MONO, fontSize:9, letterSpacing:2, color:"#78716c", textTransform:"uppercase", marginBottom:5 }}>{label}</div>
      <div style={{ ...MONO, fontSize:19, color:accent?"#fbbf24":"#e7e5e4", lineHeight:1 }}>{pre}{anim.toLocaleString("en-SG")}</div>
      {sub && <div style={{ marginTop:3, fontSize:11, color:"#57534e" }}>{sub}</div>}
    </div>
  );
}

// COO Timeline
function COOTimeline({ coo, totalCoo, tenure, visible }) {
  const [in_, setIn] = useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),500);return()=>clearTimeout(t);}else setIn(false); },[visible]);
  const max = totalCoo;
  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:3, padding:"16px 18px", marginBottom:14, opacity:in_?1:0, transform:in_?"translateY(0)":"translateY(8px)", transition:"opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s" }}>
      <div style={{ ...MONO, fontSize:9, letterSpacing:2, color:"#78716c", textTransform:"uppercase", marginBottom:14 }}>Total Cost of Ownership Milestones</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {coo.filter(m=>m.done).map((m,i) => {
          const pct = Math.min((m.paid/max)*100,100);
          const isLast = m.year===tenure;
          return (
            <div key={m.year}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ ...MONO, fontSize:10, color: isLast?"#fbbf24":"#78716c" }}>Year {m.year}{isLast?" (loan end)":""}</span>
                <span style={{ ...MONO, fontSize:11, color: isLast?"#fbbf24":"#a8a29e", fontWeight: isLast?"700":"400" }}>{SGD(m.paid)}</span>
              </div>
              <div style={{ height:3, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width: in_?`${pct}%`:"0%", background: isLast?"linear-gradient(90deg,#d97706,#fbbf24)":"rgba(255,255,255,0.15)", borderRadius:2, transition:`width ${0.8+i*0.1}s cubic-bezier(0.16,1,0.3,1) ${0.6+i*0.08}s` }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <span style={{ ...MONO, fontSize:9, letterSpacing:2, color:"#57534e", textTransform:"uppercase" }}>Grand total over {tenure} years</span>
        <span style={{ ...MONO, fontSize:18, color:"#fbbf24", fontWeight:700 }}>{SGD(totalCoo)}</span>
      </div>
    </div>
  );
}

// Rate table
function RateTable({ car, tenure, loan, visible }) {
  const months = tenure*12;
  const [in_, setIn] = useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),600);return()=>clearTimeout(t);}else setIn(false); },[visible]);
  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden", marginBottom:14, opacity:in_?1:0, transform:in_?"translateY(0)":"translateY(8px)", transition:"opacity 0.5s ease, transform 0.5s ease" }}>
      <div style={{ padding:"9px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.02)" }}>
        <span style={{ ...MONO, fontSize:9, letterSpacing:2, color:"#78716c", textTransform:"uppercase" }}>Rate Comparison — same loan &amp; tenure</span>
      </div>
      {RATE_TIERS.map((tier,i)=>{
        const int_ = loan*tier.rate*tenure;
        const mo   = (loan+int_)/months;
        const active = tier.id===car.rateTier;
        const disabled = tier.id==="tesla"&&car.rateTier!=="tesla";
        return (
          <div key={tier.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderBottom:i<2?"1px solid rgba(255,255,255,0.04)":"none", background:active?"rgba(217,119,6,0.05)":"transparent", opacity:disabled?0.3:1 }}>
            <span style={{ fontSize:13, flexShrink:0 }}>{tier.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ ...MONO, fontSize:10, color:active?"#fbbf24":"#a8a29e" }}>{tier.label}</div>
              <div style={{ ...MONO, fontSize:9, color:"#57534e", marginTop:1 }}>{tier.displayRate} flat{disabled?" · Tesla only":""}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ ...MONO, fontSize:12, color:active?"#fbbf24":"#78716c" }}>{SGD(mo)}/mo</div>
              <div style={{ ...MONO, fontSize:9, color:"#57534e", marginTop:1 }}>Interest: {SGD(int_)}</div>
            </div>
            {active && <div style={{ width:6, height:6, borderRadius:"50%", background:"#d97706", boxShadow:"0 0 6px #d97706", flexShrink:0 }}/>}
          </div>
        );
      })}
    </div>
  );
}

// ─── CAR PICKER ──────────────────────────────────────────────────────────────
function CarPicker({ value, onChange, label, slot }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{
    const h=(e)=>{ if(ref.current&&!ref.current.contains(e.target))setOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  const pick=(car)=>{ onChange(car); setOpen(false); };
  const slotColor = slot==="A" ? "#d97706" : "#22d3ee";

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ ...MONO, fontSize:9, letterSpacing:3, color:"#78716c", textTransform:"uppercase", marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ background:slotColor, color:"#000", fontSize:9, fontWeight:700, borderRadius:2, padding:"1px 6px" }}>{slot}</span>
        {label}
      </div>

      {/* Featured 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:8 }}>
        {FEATURED_CARS.map(car=>{
          const sel=value?.id===car.id;
          const tier=RATE_TIERS.find(t=>t.id===car.rateTier);
          return (
            <button key={car.id} onClick={()=>pick(car)} style={{ padding:"11px 9px", textAlign:"left", cursor:"pointer", background:sel?"rgba(217,119,6,0.1)":"rgba(255,255,255,0.02)", border:sel?"1px solid rgba(217,119,6,0.6)":"1px solid rgba(255,255,255,0.07)", borderRadius:3, transition:"all 0.15s", position:"relative" }}>
              {sel && <div style={{ position:"absolute", top:6, right:6, width:6, height:6, borderRadius:"50%", background:"#d97706", boxShadow:"0 0 6px #d97706" }}/>}
              <div style={{ fontSize:20, marginBottom:6, lineHeight:1 }}>{car.emoji}</div>
              <div style={{ fontSize:11, color:sel?"#fafaf9":"#a8a29e", fontFamily:"Georgia,serif", lineHeight:1.3, marginBottom:4 }}>{car.name}</div>
              <div style={{ ...MONO, fontSize:11, color:sel?"#fbbf24":"#57534e", fontWeight:600, marginBottom:4 }}>{SGD(car.price)}</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:2, background:"rgba(0,0,0,0.3)", border:`1px solid ${tier.color}44`, borderRadius:2, padding:"1px 4px" }}>
                <span style={{ fontSize:8 }}>{tier.icon}</span>
                <span style={{ ...MONO, fontSize:8, color:tier.color }}>{tier.displayRate}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dropdown */}
      <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", padding:"10px 14px", background:open?"rgba(217,119,6,0.08)":MORE_CARS.some(c=>c.id===value?.id)?"rgba(217,119,6,0.06)":"rgba(255,255,255,0.02)", border:MORE_CARS.some(c=>c.id===value?.id)?"1px solid rgba(217,119,6,0.5)":"1px solid rgba(255,255,255,0.1)", borderRadius:3, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.15s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:14 }}>{MORE_CARS.some(c=>c.id===value?.id)?value.emoji:"🔽"}</span>
          <span style={{ ...MONO, fontSize:10, letterSpacing:2, color:MORE_CARS.some(c=>c.id===value?.id)?"#fbbf24":"#78716c", textTransform:"uppercase" }}>
            {MORE_CARS.some(c=>c.id===value?.id)?value.name:"20 more models"}
          </span>
        </div>
        <span style={{ color:"#57534e", fontSize:11, display:"inline-block", transition:"transform 0.2s", transform:open?"rotate(180deg)":"none" }}>▾</span>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 3px)", left:0, right:0, zIndex:99, background:"#161616", border:"1px solid rgba(217,119,6,0.25)", borderRadius:3, boxShadow:"0 20px 60px rgba(0,0,0,0.9)", maxHeight:280, overflowY:"auto" }}>
          <style>{`.dds::-webkit-scrollbar{width:3px}.dds::-webkit-scrollbar-thumb{background:rgba(217,119,6,0.3);border-radius:2px}`}</style>
          <div className="dds" style={{ maxHeight:280, overflowY:"auto" }}>
            {MORE_CARS.map((car,i)=>{
              const sel=value?.id===car.id;
              const tier=RATE_TIERS.find(t=>t.id===car.rateTier);
              return (
                <button key={car.id} onClick={()=>pick(car)} style={{ width:"100%", padding:"9px 14px", display:"flex", alignItems:"center", gap:10, textAlign:"left", cursor:"pointer", background:sel?"rgba(217,119,6,0.1)":"transparent", border:"none", borderBottom:i<MORE_CARS.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}
                  onMouseEnter={e=>{ if(!sel)e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e=>{ if(!sel)e.currentTarget.style.background="transparent"; }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{car.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:sel?"#fafaf9":"#c7c4c0", fontFamily:"Georgia,serif" }}>{car.name}</div>
                    <div style={{ ...MONO, fontSize:9, color:"#57534e", marginTop:1 }}>{car.type} · {car.coeCategory} · {car.loanCap}% cap</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
                    <span style={{ ...MONO, fontSize:11, color:sel?"#fbbf24":"#78716c" }}>{SGD(car.price)}</span>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:2, background:"rgba(255,255,255,0.04)", border:`1px solid ${tier.color}33`, borderRadius:2, padding:"1px 4px" }}>
                      <span style={{ fontSize:8 }}>{tier.icon}</span>
                      <span style={{ ...MONO, fontSize:8, color:tier.color }}>{tier.displayRate}</span>
                    </div>
                  </div>
                  {sel&&<span style={{ color:"#d97706", fontSize:11 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESULT PANEL ────────────────────────────────────────────────────────────
function ResultPanel({ r, tenure, visible, slim=false }) {
  const [phase, setPhase] = useState(0);
  useEffect(()=>{
    if(!visible||!r){ setPhase(0); return; }
    setPhase(0);
    const t1=setTimeout(()=>setPhase(1),40);
    const t2=setTimeout(()=>setPhase(2),350);
    const t3=setTimeout(()=>setPhase(3),620);
    const t4=setTimeout(()=>setPhase(4),820);
    return()=>{ clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearTimeout(t4); };
  },[visible, r?.verdict, r?.car?.id, tenure]);

  if (!r) return (
    <div style={{ flex:1, background:"rgba(255,255,255,0.01)", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", minHeight:200, padding:20 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:28, marginBottom:10, opacity:0.3 }}>◻</div>
        <div style={{ ...MONO, fontSize:10, letterSpacing:2, color:"#3c3836", textTransform:"uppercase" }}>Select a car</div>
      </div>
    </div>
  );

  const { vc, vbg, vb, car, tier, verdict, ratio, monthly, loan, interest, repayable, takeHome, maxInst, reqDown, canDown, shortfall, saving, coo, totalCoo, lcPct } = r;
  const glowing = phase>=2;
  const contentIn = phase>=3;
  const metricsIn = phase>=4;
  const verdictIcon = verdict==="Affordable"?"✦":verdict==="Stretch"?"◈":"✕";

  return (
    <div style={{ flex:1, background:"linear-gradient(145deg,#141414,#0f0f0f)", border:`1px solid ${phase>=1?vb:"rgba(255,255,255,0.06)"}`, borderRadius:4, overflow:"hidden", opacity:phase>=1?1:0, transform:phase>=1?"translateY(0) scale(1)":"translateY(20px) scale(0.98)", transition:"opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1), border-color 0.4s, box-shadow 0.6s", boxShadow:glowing?`0 0 0 1px rgba(0,0,0,0.8),0 24px 60px rgba(0,0,0,0.6),0 0 50px ${vc}15`:"0 0 0 1px rgba(0,0,0,0.8),0 24px 60px rgba(0,0,0,0.6)" }}>
      <style>{`
        @keyframes barGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes stamp{0%{opacity:0;transform:scale(1.3);letter-spacing:5px}60%{opacity:1;transform:scale(0.97)}100%{transform:scale(1);letter-spacing:-0.5px}}
        @keyframes ringOut{0%{transform:scale(0.7);opacity:0.9}100%{transform:scale(2.4);opacity:0}}
        @keyframes spinIn{from{transform:rotate(-180deg) scale(0);opacity:0}to{transform:rotate(0) scale(1);opacity:1}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      `}</style>

      {/* top bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,transparent,${vc},transparent)`, transformOrigin:"center", animation:phase>=1?"barGrow 0.55s cubic-bezier(0.16,1,0.3,1) forwards":"none" }}/>

      {/* ambient glow */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:180, background:`radial-gradient(ellipse at 50% 0%,${vc}10 0%,transparent 70%)`, opacity:glowing?1:0, transition:"opacity 0.8s ease", pointerEvents:"none" }}/>

      {/* ── HERO ── */}
      <div style={{ padding:slim?"20px 22px 16px":"24px 28px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:vbg, position:"relative", overflow:"hidden" }}>
        {/* ring burst */}
        {phase>=2 && <div style={{ position:"absolute", top:40, left:"50%", transform:"translateX(-50%)", width:56, height:56, border:`2px solid ${vc}`, borderRadius:"50%", animation:"ringOut 0.7s ease-out forwards", pointerEvents:"none" }}/>}

        {/* car pill */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14, opacity:contentIn?1:0, transform:contentIn?"translateY(0)":"translateY(6px)", transition:"opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"4px 10px 4px 7px" }}>
            <span style={{ fontSize:14 }}>{car.emoji}</span>
            <span style={{ ...MONO, fontSize:10, color:"#a8a29e" }}>{car.name}</span>
            <span style={{ ...MONO, fontSize:9, color:"#57534e" }}>·</span>
            <span style={{ ...MONO, fontSize:10, color:"#d97706" }}>{SGD(car.price)}</span>
          </div>
          <Pill icon={tier.icon} label={tier.label} value={tier.displayRate} color={tier.color}/>
        </div>

        {/* verdict row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
            <VerdictIcon v={verdict} vc={vc} glow={glowing}/>
            <div>
              <div style={{ ...MONO, fontSize:9, letterSpacing:3, color:"#57534e", textTransform:"uppercase", marginBottom:5, opacity:contentIn?1:0, transition:"opacity 0.3s" }}>Verdict</div>
              <div style={{ fontSize:slim?24:28, color:vc, fontStyle:"italic", fontFamily:"Georgia,serif", lineHeight:1, opacity:contentIn?1:0, background:glowing?`linear-gradient(90deg,${vc} 0%,#fff 40%,${vc} 60%,${vc} 100%)`:vc, backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:phase>=3?"stamp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"+(glowing?", shimmer 2.5s linear 1s 2":""):"none" }}>{verdict}</div>
            </div>
          </div>
          <div style={{ textAlign:"right", animation:contentIn?"pctIn 0.4s ease 0.3s both":"none" }}>
            <div style={{ ...MONO, fontSize:9, letterSpacing:2, color:"#57534e", textTransform:"uppercase", marginBottom:3 }}>Burden</div>
            <div style={{ ...MONO, fontSize:32, color:vc, lineHeight:1, textShadow:glowing?`0 0 18px ${vc}70`:"none", transition:"text-shadow 0.6s" }}>{(ratio*100).toFixed(1)}<span style={{ fontSize:14 }}>%</span></div>
          </div>
        </div>

        {!canDown ? (
          <p style={{ marginTop:12, fontSize:12, color:"#a8a29e", lineHeight:1.7, fontFamily:"Georgia,serif", opacity:contentIn?1:0, transition:"opacity 0.5s ease 0.3s" }}>
            Needs <span style={{ color:"#fbbf24" }}>{SGD(reqDown)}</span> minimum ({100-car.loanCap}% of price). Short by <span style={{ color:"#f87171" }}>{SGD(shortfall)}</span>.
          </p>
        ) : (
          <p style={{ marginTop:12, fontSize:12, color:"#a8a29e", lineHeight:1.7, fontFamily:"Georgia,serif", opacity:contentIn?1:0, transition:"opacity 0.5s ease 0.3s" }}>
            {verdict==="Affordable"?`${SGD(monthly)}/mo is ${(ratio*100).toFixed(1)}% of take-home — within the 30% comfort threshold.`
            :verdict==="Stretch"?`${SGD(monthly)}/mo is ${(ratio*100).toFixed(1)}% of take-home — manageable, but limited breathing room.`
            :`${SGD(monthly)}/mo is ${(ratio*100).toFixed(1)}% of take-home — exceeds the 45% limit.`}
          </p>
        )}
      </div>

      {/* ── BODY ── */}
      <div style={{ padding:slim?"14px 22px 22px":"18px 28px 28px" }}>
        {canDown && <GaugeBar ratio={ratio} visible={metricsIn}/>}

        {/* stat grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:12 }}>
          <StatBox label="Monthly"    value={`S$${Math.round(monthly)}`}  sub={`${tenure}yr @ ${tier.displayRate}`}  accent delay={0}   visible={metricsIn}/>
          <StatBox label="Max Loan"   value={`S$${Math.round(loan)}`}     sub={`${car.loanCap}% of price`}                  delay={80}  visible={metricsIn}/>
          <StatBox label="Interest"   value={`S$${Math.round(interest)}`} sub={`Total: ${SGD(repayable)}`}           accent delay={160} visible={metricsIn}/>
          <StatBox label="Take-home"  value={`S$${Math.round(takeHome)}`} sub={`Max 30%: ${SGD(maxInst)}/mo`}               delay={240} visible={metricsIn}/>
        </div>

        {/* COO Timeline */}
        <COOTimeline coo={coo} totalCoo={totalCoo} tenure={tenure} visible={metricsIn}/>

        {/* green savings */}
        {tier.id!=="ice" && saving>0 && (
          <div style={{ display:"flex", alignItems:"center", gap:10, background:`${tier.color}0e`, border:`1px solid ${tier.color}33`, borderRadius:3, padding:"11px 14px", marginBottom:12, opacity:metricsIn?1:0, transition:"opacity 0.5s ease 0.45s" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💰</span>
            <div>
              <div style={{ ...MONO, fontSize:9, letterSpacing:2, color:tier.color, textTransform:"uppercase", marginBottom:2 }}>Green Rate Savings vs ICE</div>
              <div style={{ fontSize:12, color:"#e7e5e4", fontFamily:"Georgia,serif" }}>Save <span style={{ color:tier.color, fontWeight:"bold" }}>{SGD(saving)}</span> total — <span style={{ color:tier.color }}>{SGD(saving/(tenure*12))}/mo</span> less</div>
            </div>
          </div>
        )}

        {/* rate table */}
        {!slim && <RateTable car={car} tenure={tenure} loan={loan} visible={metricsIn}/>}

        {/* suggestion */}
        {verdict!=="Affordable" && (
          <div style={{ background:"rgba(217,119,6,0.06)", border:"1px solid rgba(217,119,6,0.15)", borderRadius:3, padding:"12px 14px", opacity:metricsIn?1:0, transform:metricsIn?"translateY(0)":"translateY(6px)", transition:"opacity 0.5s ease 0.85s, transform 0.5s ease 0.85s" }}>
            <div style={{ ...MONO, fontSize:9, letterSpacing:2, color:"#78716c", textTransform:"uppercase", marginBottom:5 }}>💡 Suggestion</div>
            <p style={{ fontSize:12, color:"#a8a29e", lineHeight:1.6, fontFamily:"Georgia,serif", margin:0 }}>
              {!canDown?`Save ${SGD(shortfall)} more. Honda Freed / Toyota Sienta have lower minimums.`
              :verdict==="Stretch"?`Extend to 7 years → ~${SGD(loan*(1+r.rate*7)/84)}/mo. Or consider a Cat A hybrid.`
              :`Comfortable budget ~${SGD(takeHome*0.30*tenure*12/(1+r.rate*tenure)/lcPct)}. Corolla Altis or BYD Dolphin may fit better.`}
            </p>
          </div>
        )}
      </div>
      <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(217,119,6,0.2),transparent)" }}/>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  const [salaryRaw, setSalaryRaw]     = useState("");
  const [salary, setSalary]           = useState("");
  const [downRaw, setDownRaw]         = useState("");
  const [down, setDown]               = useState("");
  const [tenure, setTenure]           = useState(5);
  const [mode, setMode]               = useState("single");   // "single" | "compare"
  const [carA, setCarA]               = useState(null);
  const [carB, setCarB]               = useState(null);
  const [calculated, setCalculated]   = useState(false);
  const resultsRef                    = useRef(null);

  const dSalary  = useDebounce(parseInt(salaryRaw||"0",10),  120);
  const dDown    = useDebounce(parseInt(downRaw||"0",10),    120);
  const dTenure  = useDebounce(tenure, 80);

  // live results — recalc whenever inputs change
  const rA = (calculated && carA) ? calc(dSalary, dDown, dTenure, carA) : null;
  const rB = (calculated && carB && mode==="compare") ? calc(dSalary, dDown, dTenure, carB) : null;

  // trigger first calculation
  const handleCalc = () => {
    setCalculated(true);
    setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),120);
  };

  const handleSalary = e => { const r=e.target.value.replace(/\D/g,""); setSalaryRaw(r); setSalary(r?Number(r).toLocaleString("en-SG"):""); };
  const handleDown   = e => { const r=e.target.value.replace(/\D/g,""); setDownRaw(r);   setDown(r?Number(r).toLocaleString("en-SG"):"");   };

  const isReady = salaryRaw && downRaw && carA && (mode==="single" || carB);
  const LABEL = { ...MONO, fontSize:10, letterSpacing:3, color:"#78716c", textTransform:"uppercase", display:"block", marginBottom:10 };
  const inputCss = filled => ({ width:"100%", background:"rgba(255,255,255,0.03)", border:`1px solid ${filled?"rgba(217,119,6,0.5)":"rgba(255,255,255,0.08)"}`, borderRadius:3, padding:"14px 16px 14px 44px", color:"#fafaf9", fontSize:18, ...MONO, letterSpacing:1, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s, box-shadow 0.2s", boxShadow:filled?"0 0 0 3px rgba(217,119,6,0.08),inset 0 1px 3px rgba(0,0,0,0.3)":"inset 0 1px 3px rgba(0,0,0,0.3)" });

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", backgroundImage:`radial-gradient(ellipse at 20% 50%,rgba(217,119,6,0.07) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(180,83,9,0.05) 0%,transparent 40%),repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(217,119,6,0.03) 79px,rgba(217,119,6,0.03) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(217,119,6,0.03) 79px,rgba(217,119,6,0.03) 80px)`, fontFamily:"Georgia,serif", display:"flex", justifyContent:"center", padding:"40px 16px 80px" }}>
      <div style={{ width:"100%", maxWidth: mode==="compare"?1100:600, transition:"max-width 0.4s ease" }}>

        {/* ══ INPUT CARD ══ */}
        <div style={{ background:"linear-gradient(145deg,#141414,#0f0f0f)", border:"1px solid rgba(217,119,6,0.25)", borderRadius:4, boxShadow:"0 0 0 1px rgba(0,0,0,0.8),0 40px 80px rgba(0,0,0,0.6)", overflow:"hidden", marginBottom:16 }}>
          <div style={{ height:3, background:"linear-gradient(90deg,transparent,#d97706,#fbbf24,#d97706,transparent)" }}/>

          {/* header */}
          <div style={{ padding:"30px 36px 24px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <div style={{ width:6, height:6, background:"#d97706", borderRadius:"50%", boxShadow:"0 0 8px #d97706" }}/>
                  <span style={{ ...MONO, fontSize:10, letterSpacing:4, color:"#78716c", textTransform:"uppercase" }}>Financial Assessment Tool</span>
                </div>
                <h1 style={{ fontSize:26, fontWeight:400, color:"#fafaf9", letterSpacing:"-0.5px", lineHeight:1.2, marginBottom:6 }}>Car Affordability<br/><span style={{ color:"#d97706", fontStyle:"italic" }}>Calculator</span></h1>
              </div>
              {/* mode toggle */}
              <div style={{ display:"flex", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:3, padding:3, flexShrink:0, alignSelf:"flex-start", marginTop:4 }}>
                {["single","compare"].map(m=>(
                  <button key={m} onClick={()=>{ setMode(m); setCalculated(false); }} style={{ padding:"8px 16px", ...MONO, fontSize:10, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", borderRadius:2, border:"none", background:mode===m?"linear-gradient(135deg,#d97706,#b45309)":"transparent", color:mode===m?"#fafaf9":"#78716c", transition:"all 0.2s", boxShadow:mode===m?"0 2px 8px rgba(217,119,6,0.3)":"none" }}>{m==="single"?"Single":"Compare"}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding:"26px 36px 32px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24 }}>
              {/* salary */}
              <div>
                <label style={LABEL}>Monthly Gross Salary</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"#d97706", fontSize:14, fontWeight:600, pointerEvents:"none" }}>S$</span>
                  <input type="text" inputMode="numeric" value={salary} onChange={handleSalary} placeholder="0" style={inputCss(!!salaryRaw)}
                    onFocus={e=>{e.target.style.borderColor="rgba(217,119,6,0.7)";e.target.style.boxShadow="0 0 0 4px rgba(217,119,6,0.1)";}}
                    onBlur={e=>{e.target.style.borderColor=salaryRaw?"rgba(217,119,6,0.5)":"rgba(255,255,255,0.08)";e.target.style.boxShadow=salaryRaw?"0 0 0 3px rgba(217,119,6,0.08)":"none";}}/>
                </div>
                {salaryRaw&&parseInt(salaryRaw)>0&&(
                  <p style={{ marginTop:5, fontSize:11, color:"#57534e", ...MONO }}>Take-home: <span style={{ color:"#d97706" }}>S${Math.floor(parseInt(salaryRaw)*0.8).toLocaleString("en-SG")}/mo</span> · Max inst: <span style={{ color:"#d97706" }}>S${Math.floor(parseInt(salaryRaw)*0.8*0.3).toLocaleString("en-SG")}/mo</span></p>
                )}
              </div>
              {/* downpayment */}
              <div>
                <label style={LABEL}>Available Downpayment (Cash)</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"#d97706", fontSize:14, fontWeight:600, pointerEvents:"none" }}>S$</span>
                  <input type="text" inputMode="numeric" value={down} onChange={handleDown} placeholder="0" style={inputCss(!!downRaw)}
                    onFocus={e=>{e.target.style.borderColor="rgba(217,119,6,0.7)";e.target.style.boxShadow="0 0 0 4px rgba(217,119,6,0.1)";}}
                    onBlur={e=>{e.target.style.borderColor=downRaw?"rgba(217,119,6,0.5)":"rgba(255,255,255,0.08)";e.target.style.boxShadow=downRaw?"0 0 0 3px rgba(217,119,6,0.08)":"none";}}/>
                </div>
                <p style={{ marginTop:5, fontSize:11, color:"#57534e", ...MONO }}>Full cash · no CPF · no loan top-up</p>
              </div>
            </div>

            {/* car pickers */}
            <div style={{ display:"grid", gridTemplateColumns:mode==="compare"?"1fr 1fr":"1fr", gap:20, marginBottom:24 }}>
              <CarPicker value={carA} onChange={c=>{ setCarA(c); setCalculated(false); }} label="Select Car" slot="A"/>
              {mode==="compare" && (
                <CarPicker value={carB} onChange={c=>{ setCarB(c); setCalculated(false); }} label="Compare Against" slot="B"/>
              )}
            </div>

            {/* tenure scrubber */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", ...LABEL, marginBottom:14 }}>
                <span>Loan Tenure</span>
                <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <span style={{ fontSize:22, color:"#fbbf24", ...MONO }}>{tenure}</span>
                  <span style={{ fontSize:11, color:"#78716c", ...MONO }}>yr{tenure>1?"s":""}</span>
                  {calculated && <span style={{ fontSize:10, color:"#57534e", ...MONO, marginLeft:8 }}>← drag to update live</span>}
                </div>
              </label>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                {[1,2,3,4,5,6,7].map(y=><span key={y} style={{ ...MONO, fontSize:10, color:tenure===y?"#d97706":"#3c3836", width:14, textAlign:"center" }}>{y}</span>)}
              </div>
              <style>{`.sgcar-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;background:transparent;outline:none;cursor:pointer}.sgcar-slider::-webkit-slider-runnable-track{height:3px;background:linear-gradient(90deg,#d97706 ${(tenure-1)/6*100}%,rgba(255,255,255,0.1) ${(tenure-1)/6*100}%);border-radius:2px}.sgcar-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;background:radial-gradient(circle,#fbbf24 30%,#d97706 100%);border-radius:50%;margin-top:-9.5px;box-shadow:0 0 12px rgba(217,119,6,0.5),0 2px 6px rgba(0,0,0,0.5);border:2px solid #0a0a0a}.sgcar-slider::-moz-range-thumb{width:22px;height:22px;background:radial-gradient(circle,#fbbf24 30%,#d97706 100%);border-radius:50%;border:2px solid #0a0a0a;box-shadow:0 0 12px rgba(217,119,6,0.5);cursor:pointer}`}</style>
              <input type="range" className="sgcar-slider" min={1} max={7} step={1} value={tenure} onChange={e=>setTenure(Number(e.target.value))}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:7 }}>
                <span style={{ fontSize:11, color:"#57534e", ...MONO }}>Shorter · Less interest</span>
                <span style={{ fontSize:11, color:"#57534e", ...MONO }}>Longer · Lower monthly</span>
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleCalc} disabled={!isReady} style={{ width:"100%", padding:16, background:isReady?"linear-gradient(135deg,#d97706,#b45309,#92400e)":"rgba(255,255,255,0.04)", border:isReady?"1px solid rgba(217,119,6,0.4)":"1px solid rgba(255,255,255,0.06)", borderRadius:3, color:isReady?"#fafaf9":"#3c3836", fontSize:12, letterSpacing:4, ...MONO, textTransform:"uppercase", cursor:isReady?"pointer":"not-allowed", transition:"all 0.2s", boxShadow:isReady?"0 8px 32px rgba(217,119,6,0.25)":"none" }}>
              {isReady?(calculated?`↻ Recalculate${mode==="compare"?" Comparison":""}`:mode==="compare"?`Compare Cars →`:`Analyse ${carA?.short??carA?.name} →`):"Complete all fields to continue"}
            </button>
            {calculated && <p style={{ marginTop:10, textAlign:"center", fontSize:10, color:"#3c3836", ...MONO, letterSpacing:1 }}>Results update live as you adjust tenure ↑</p>}
            <p style={{ marginTop:8, textAlign:"center", fontSize:10, color:"#292524", ...MONO, letterSpacing:1 }}>Prices indicative incl. COE · Based on MAS regulations · For reference only</p>
          </div>
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(217,119,6,0.2),transparent)" }}/>
        </div>

        {/* ══ RESULTS ══ */}
        <div ref={resultsRef}>
          {mode==="single" ? (
            <ResultPanel r={rA} tenure={dTenure} visible={!!rA}/>
          ) : (
            <div>
              {/* compare header */}
              {(rA||rB) && (
                <div style={{ marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                  <span style={{ ...MONO, fontSize:9, letterSpacing:3, color:"#57534e", textTransform:"uppercase" }}>Side-by-Side Comparison</span>
                  {rA&&rB&&rA.monthly&&rB.monthly&&(
                    <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"5px 12px" }}>
                      <span style={{ ...MONO, fontSize:10, color:"#78716c" }}>Monthly diff:</span>
                      <span style={{ ...MONO, fontSize:11, color: Math.abs(rA.monthly-rB.monthly)<100?"#4ade80":"#fbbf24", fontWeight:700 }}>
                        {SGD(Math.abs(rA.monthly-rB.monthly))}/mo
                        {" "}({rA.monthly<rB.monthly?`${rA.car.short} cheaper`:`${rB.car.short} cheaper`})
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, alignItems:"start" }}>
                <ResultPanel r={rA} tenure={dTenure} visible={!!rA} slim/>
                <ResultPanel r={rB} tenure={dTenure} visible={!!rB} slim/>
              </div>
              {/* COO comparison bar */}
              {rA&&rB&&rA.canDown&&rB.canDown&&(
                <div style={{ marginTop:12, background:"linear-gradient(145deg,#141414,#0f0f0f)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:4, padding:"18px 24px" }}>
                  <div style={{ ...MONO, fontSize:9, letterSpacing:2, color:"#78716c", textTransform:"uppercase", marginBottom:14 }}>Total Cost Comparison over {dTenure} years</div>
                  {[{r:rA,slot:"A",color:"#d97706"},{r:rB,slot:"B",color:"#22d3ee"}].map(({r,slot,color})=>{
                    const maxTco = Math.max(rA.totalCoo, rB.totalCoo);
                    const pct = (r.totalCoo/maxTco)*100;
                    const cheaper = r.totalCoo <= Math.min(rA.totalCoo,rB.totalCoo);
                    return (
                      <div key={slot} style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, alignItems:"baseline" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ ...MONO, fontSize:9, background:color, color:"#000", borderRadius:2, padding:"1px 5px", fontWeight:700 }}>{slot}</span>
                            <span style={{ fontSize:12, color:"#a8a29e", fontFamily:"Georgia,serif" }}>{r.car.name}</span>
                            {cheaper&&<span style={{ ...MONO, fontSize:9, color:"#4ade80", border:"1px solid rgba(74,222,128,0.3)", borderRadius:2, padding:"1px 5px" }}>CHEAPER</span>}
                          </div>
                          <span style={{ ...MONO, fontSize:14, color, fontWeight:700 }}>{SGD(r.totalCoo)}</span>
                        </div>
                        <div style={{ height:6, background:"rgba(255,255,255,0.04)", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${color}99,${color})`, borderRadius:3, transition:"width 1s cubic-bezier(0.16,1,0.3,1) 0.3s" }}/>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ ...MONO, fontSize:9, color:"#57534e", textTransform:"uppercase", letterSpacing:1 }}>You save over {dTenure} years by picking {rA.totalCoo<=rB.totalCoo?rA.car.short:rB.car.short}</span>
                    <span style={{ ...MONO, fontSize:16, color:"#4ade80", fontWeight:700 }}>{SGD(Math.abs(rA.totalCoo-rB.totalCoo))}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}