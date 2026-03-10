import { useState, useRef, useEffect, useCallback } from "react";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, .zz-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* Numbers and codes always monospace */
  .mono { font-family: 'DM Mono', monospace; }

  /* Slider */
  .zz-slider { -webkit-appearance:none; appearance:none; width:100%; height:4px; background:transparent; outline:none; cursor:pointer; }
  .zz-slider::-webkit-slider-runnable-track { height:4px; border-radius:4px; }
  .zz-slider::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; background:radial-gradient(circle,#fbbf24 30%,#d97706 100%); border-radius:50%; margin-top:-8px; box-shadow:0 0 10px rgba(217,119,6,0.5),0 2px 4px rgba(0,0,0,0.5); border:2px solid #0a0a0a; }
  .zz-slider::-moz-range-thumb { width:20px; height:20px; background:radial-gradient(circle,#fbbf24 30%,#d97706 100%); border-radius:50%; border:2px solid #0a0a0a; box-shadow:0 0 10px rgba(217,119,6,0.5); cursor:pointer; }

  /* Scrollbar */
  .zz-scroll::-webkit-scrollbar { width:3px; }
  .zz-scroll::-webkit-scrollbar-thumb { background:rgba(217,119,6,0.3); border-radius:2px; }

  /* Animations */
  @keyframes barGrow   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes stamp     { 0%{opacity:0;transform:scale(1.25);letter-spacing:4px} 65%{opacity:1;transform:scale(0.97)} 100%{transform:scale(1);letter-spacing:-0.5px} }
  @keyframes ringOut   { 0%{transform:scale(0.7);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
  @keyframes spinIn    { from{transform:rotate(-150deg) scale(0);opacity:0} to{transform:rotate(0) scale(1);opacity:1} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

  /* Card hover */
  .car-card { transition: all 0.15s ease; }
  .car-card:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.15) !important; }
  .car-card.selected:hover { background: rgba(217,119,6,0.12) !important; border-color: rgba(217,119,6,0.65) !important; }

  /* Dropdown rows */
  .dd-row:hover { background: rgba(255,255,255,0.05) !important; }
`;

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  // Text hierarchy
  textPrimary:   "#f5f4f2",   // Main readable text
  textSecondary: "#b8b4ae",   // Supporting text
  textMuted:     "#6b6760",   // Labels, hints
  textDim:       "#3d3a36",   // Inactive / decorative

  // Surfaces
  bg:            "#0a0a0a",
  surface:       "#131210",
  surfaceHover:  "#1a1815",
  border:        "rgba(255,255,255,0.07)",
  borderStrong:  "rgba(255,255,255,0.12)",

  // Accent
  gold:          "#d97706",
  goldLight:     "#fbbf24",
  goldFaint:     "rgba(217,119,6,0.08)",

  // Semantic
  green:  "#4ade80",
  amber:  "#fbbf24",
  red:    "#f87171",

  // Type scale
  xs:   "11px",
  sm:   "13px",
  base: "15px",
  lg:   "17px",
  xl:   "22px",
  xxl:  "28px",
  hero: "36px",

  // Spacing
  r:  "6px",    // border radius base
  rL: "10px",   // large radius
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const RATE_TIERS = [
  { id:"ice",   label:"Standard ICE",       sub:"Petrol & diesel cars",       rate:0.026,  display:"2.60%", color:"#94a3b8", icon:"⛽" },
  { id:"green", label:"Green EV / Hybrid",  sub:"Electric & hybrid vehicles", rate:0.0208, display:"2.08%", color:"#4ade80", icon:"🌿" },
  { id:"tesla", label:"Tesla Preferential", sub:"Tesla models only",          rate:0.0168, display:"1.68%", color:"#a78bfa", icon:"⚡" },
];

const FEATURED_CARS = [
  { id:"corolla", name:"Toyota Corolla Altis", short:"Corolla Altis", type:"Sedan · Hybrid",  price:175888, omv:17800, coeCategory:"Cat A", loanCap:70, emoji:"🏆", badge:"#1 Best Seller", badgeColor:"#fbbf24", rateTier:"green", desc:"Singapore's most-loved sedan. Reliable hybrid, low running costs." },
  { id:"atto3",   name:"BYD Atto 3",           short:"BYD Atto 3",   type:"Electric SUV",     price:165888, omv:28000, coeCategory:"Cat B", loanCap:60, emoji:"🔋", badge:"EV Pioneer",    badgeColor:"#22d3ee", rateTier:"green", desc:"The EV that started Singapore's electric revolution. Smart & compact." },
  { id:"model3",  name:"Tesla Model 3",         short:"Model 3",      type:"Electric Sedan",   price:189888, omv:32000, coeCategory:"Cat A", loanCap:60, emoji:"⚡", badge:"Tech Icon",     badgeColor:"#a78bfa", rateTier:"tesla", desc:"Silicon Valley's sedan — Autopilot, OTA updates, zero emissions." },
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

const SGD  = (n) => `S$${Math.round(n).toLocaleString("en-SG")}`;

// ─── CALC ────────────────────────────────────────────────────────────────────
function calc(salary, down, tenure, car) {
  if (!car||!salary||!down) return null;
  const tier    = RATE_TIERS.find(t=>t.id===car.rateTier);
  const lcPct   = car.loanCap/100;
  const dcPct   = 1-lcPct;
  const reqDown = car.price*dcPct;
  const loan    = car.price*lcPct;
  const canDown = down>=reqDown;
  const months  = tenure*12;
  const interest= loan*tier.rate*tenure;
  const repay   = loan+interest;
  const monthly = repay/months;
  const takeHome= salary*0.80;
  const maxInst = takeHome*0.30;
  const ratio   = monthly/takeHome;
  const iceInt  = loan*0.026*tenure;
  const saving  = iceInt-interest;
  const totalCoo= (canDown?down:reqDown)+repay;
  const coo     = [1,2,3,5,7].map(y=>({ year:y, paid:(canDown?down:reqDown)+monthly*Math.min(y,tenure)*12, done:y<=tenure }));

  let verdict,vc,vbg,vborder;
  if (!canDown)       { verdict="Insufficient Downpayment"; vc=T.red;   vbg="rgba(248,113,113,0.06)"; vborder="rgba(248,113,113,0.25)"; }
  else if(ratio<=0.30){ verdict="Affordable";               vc=T.green; vbg="rgba(74,222,128,0.06)";  vborder="rgba(74,222,128,0.25)";  }
  else if(ratio<=0.45){ verdict="Stretch";                  vc=T.amber; vbg="rgba(251,191,36,0.06)";  vborder="rgba(251,191,36,0.30)";  }
  else                { verdict="Out of Range";              vc=T.red;   vbg="rgba(248,113,113,0.06)"; vborder="rgba(248,113,113,0.25)"; }

  return { car,tier,loan,reqDown,canDown,shortfall:Math.max(0,reqDown-down),
           monthly,interest,repay,takeHome,maxInst,ratio,months,
           verdict,vc,vbg,vborder,lcPct,dcPct,saving,coo,totalCoo };
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useCountUp(target, ms=800, delay=0) {
  const [v,setV]=useState(0);
  const raf=useRef(null); const t0=useRef(null); const from=useRef(0);
  useEffect(()=>{
    from.current=0; setV(0); t0.current=null;
    if(raf.current) cancelAnimationFrame(raf.current);
    const id=setTimeout(()=>{
      const step=ts=>{
        if(!t0.current) t0.current=ts;
        const p=Math.min((ts-t0.current)/ms,1);
        setV(Math.round(target*(1-Math.pow(1-p,4))));
        if(p<1) raf.current=requestAnimationFrame(step);
      };
      raf.current=requestAnimationFrame(step);
    },delay);
    return()=>{ clearTimeout(id); if(raf.current) cancelAnimationFrame(raf.current); };
  },[target,delay]);
  return v;
}

function useDebounce(val, ms) {
  const [dv,setDv]=useState(val);
  useEffect(()=>{ const t=setTimeout(()=>setDv(val),ms); return()=>clearTimeout(t); },[val,ms]);
  return dv;
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:T.xs, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, fontFamily:"'DM Mono',monospace" }}>
      {children}
    </div>
  );
}

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────
function MoneyInput({ label, hint, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const filled = value !== "";
  return (
    <div>
      <label style={{ display:"block", fontSize:T.sm, fontWeight:600, color:T.textSecondary, marginBottom:8 }}>{label}</label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:T.sm, fontWeight:600, color: focused||filled ? T.gold : T.textMuted, pointerEvents:"none", transition:"color 0.2s" }}>S$</span>
        <input type="text" inputMode="numeric" value={value} onChange={onChange}
          placeholder="0"
          onFocus={e=>{ setFocused(true); e.target.style.borderColor="rgba(217,119,6,0.6)"; e.target.style.boxShadow="0 0 0 3px rgba(217,119,6,0.12)"; }}
          onBlur={e=>{ setFocused(false); e.target.style.borderColor=filled?"rgba(217,119,6,0.4)":T.border; e.target.style.boxShadow="none"; }}
          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${filled?"rgba(217,119,6,0.4)":T.border}`, borderRadius:T.r, padding:"12px 14px 12px 36px", color:T.textPrimary, fontSize:T.lg, fontFamily:"'DM Mono',monospace", fontWeight:500, outline:"none", transition:"border-color 0.2s, box-shadow 0.2s" }}
        />
      </div>
      {hint && <p style={{ marginTop:6, fontSize:T.xs, color:T.textMuted, lineHeight:1.5 }}>{hint}</p>}
    </div>
  );
}

// ─── STAT BOX ────────────────────────────────────────────────────────────────
function StatBox({ label, value, sub, accent, delay=0, visible }) {
  const num = parseInt(String(value).replace(/\D/g,""),10)||0;
  const anim = useCountUp(visible?num:0, 900, delay+200);
  const pre = String(value).startsWith("S$")?"S$":"";
  const [in_,setIn]=useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),delay);return()=>clearTimeout(t);}else setIn(false); },[visible,delay]);
  return (
    <div style={{ background: accent?"rgba(217,119,6,0.07)":"rgba(255,255,255,0.03)", border:`1px solid ${accent?"rgba(217,119,6,0.2)":T.border}`, borderRadius:T.r, padding:"14px 16px", opacity:in_?1:0, transform:in_?"translateY(0)":"translateY(8px)", transition:"opacity 0.4s ease, transform 0.4s ease" }}>
      <div style={{ fontSize:T.xs, fontWeight:600, color:T.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
      <div style={{ fontSize:T.xl, fontFamily:"'DM Mono',monospace", fontWeight:500, color: accent?T.goldLight:T.textPrimary, lineHeight:1, marginBottom: sub?4:0 }}>
        {pre}{anim.toLocaleString("en-SG")}
      </div>
      {sub && <div style={{ fontSize:T.xs, color:T.textMuted, lineHeight:1.4 }}>{sub}</div>}
    </div>
  );
}

// ─── GAUGE BAR ───────────────────────────────────────────────────────────────
function GaugeBar({ ratio, visible }) {
  const pct = Math.min(ratio*100,100);
  const color = pct<=30?T.green:pct<=45?T.amber:T.red;
  const label = pct<=30?"Comfortable":pct<=45?"Getting Stretched":"Too High";
  const [w,setW]=useState(0);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setW(pct),200);return()=>clearTimeout(t);}else setW(0); },[visible,pct]);
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:T.sm, color:T.textSecondary, fontWeight:500 }}>Monthly burden on take-home pay</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:T.sm, fontFamily:"'DM Mono',monospace", fontWeight:600, color }}>{pct.toFixed(1)}%</span>
          <span style={{ fontSize:T.xs, color, fontWeight:500, background:`${color}18`, border:`1px solid ${color}44`, borderRadius:4, padding:"1px 7px" }}>{label}</span>
        </div>
      </div>
      <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", left:"30%", top:0, bottom:0, width:1, background:"rgba(74,222,128,0.35)" }}/>
        <div style={{ position:"absolute", left:"45%", top:0, bottom:0, width:1, background:"rgba(251,191,36,0.35)" }}/>
        <div style={{ height:"100%", width:`${w}%`, background:`linear-gradient(90deg,#4ade80 0%,#4ade80 30%,#fbbf24 45%,#f87171 70%)`, borderRadius:4, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
        <span style={{ fontSize:T.xs, color:T.green }}>Safe ≤ 30%</span>
        <span style={{ fontSize:T.xs, color:T.amber }}>Stretch ≤ 45%</span>
        <span style={{ fontSize:T.xs, color:T.red }}>Too high &gt; 45%</span>
      </div>
    </div>
  );
}

// ─── COO TIMELINE ────────────────────────────────────────────────────────────
function COOTimeline({ coo, totalCoo, tenure, visible }) {
  const [in_,setIn]=useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),500);return()=>clearTimeout(t);}else setIn(false); },[visible]);
  const max = totalCoo;
  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${T.border}`, borderRadius:T.r, padding:"16px 18px", marginBottom:14, opacity:in_?1:0, transform:in_?"translateY(0)":"translateY(8px)", transition:"opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s" }}>
      <SectionLabel>Total Cost of Ownership Milestones</SectionLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {coo.filter(m=>m.done).map((m,i)=>{
          const pct=Math.min((m.paid/max)*100,100);
          const isLast=m.year===tenure;
          return (
            <div key={m.year}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, alignItems:"baseline" }}>
                <span style={{ fontSize:T.sm, color:isLast?T.goldLight:T.textSecondary, fontWeight:isLast?600:400 }}>
                  Year {m.year}{isLast?" — loan ends":""}
                </span>
                <span style={{ fontSize:T.base, fontFamily:"'DM Mono',monospace", fontWeight:600, color:isLast?T.goldLight:T.textPrimary }}>{SGD(m.paid)}</span>
              </div>
              <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:in_?`${pct}%`:"0%", background:isLast?`linear-gradient(90deg,${T.gold},${T.goldLight})`:"rgba(255,255,255,0.18)", borderRadius:2, transition:`width ${0.8+i*0.12}s cubic-bezier(0.16,1,0.3,1) ${0.6+i*0.09}s` }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:T.sm, color:T.textMuted }}>Grand total over {tenure} years</span>
        <span style={{ fontSize:T.xl, fontFamily:"'DM Mono',monospace", fontWeight:600, color:T.goldLight }}>{SGD(totalCoo)}</span>
      </div>
    </div>
  );
}

// ─── RATE TABLE ──────────────────────────────────────────────────────────────
function RateTable({ car, tenure, loan, visible }) {
  const months=tenure*12;
  const [in_,setIn]=useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),650);return()=>clearTimeout(t);}else setIn(false); },[visible]);
  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${T.border}`, borderRadius:T.r, overflow:"hidden", marginBottom:14, opacity:in_?1:0, transform:in_?"translateY(0)":"translateY(8px)", transition:"opacity 0.5s ease, transform 0.5s ease" }}>
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, background:"rgba(255,255,255,0.02)" }}>
        <SectionLabel>Interest Rate Comparison — same loan &amp; tenure</SectionLabel>
      </div>
      {RATE_TIERS.map((tier,i)=>{
        const int_=loan*tier.rate*tenure;
        const mo=(loan+int_)/months;
        const active=tier.id===car.rateTier;
        const disabled=tier.id==="tesla"&&car.rateTier!=="tesla";
        return (
          <div key={tier.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:i<2?`1px solid ${T.border}`:"none", background:active?"rgba(217,119,6,0.05)":"transparent", opacity:disabled?0.3:1 }}>
            <span style={{ fontSize:16, flexShrink:0 }}>{tier.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:T.sm, fontWeight:600, color:active?T.goldLight:T.textSecondary }}>{tier.label}</div>
              <div style={{ fontSize:T.xs, color:T.textMuted, marginTop:2 }}>{tier.display} flat rate{disabled?" · Tesla vehicles only":""}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:T.base, fontFamily:"'DM Mono',monospace", fontWeight:600, color:active?T.goldLight:T.textSecondary }}>{SGD(mo)}/mo</div>
              <div style={{ fontSize:T.xs, color:T.textMuted, marginTop:2 }}>Total interest: {SGD(int_)}</div>
            </div>
            {active && <div style={{ width:6, height:6, borderRadius:"50%", background:T.gold, boxShadow:`0 0 6px ${T.gold}`, flexShrink:0 }}/>}
          </div>
        );
      })}
    </div>
  );
}

// ─── CAR PICKER ──────────────────────────────────────────────────────────────
function CarPicker({ value, onChange, slot }) {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);
  const pick=car=>{ onChange(car); setOpen(false); };
  const slotColor = slot==="A"?T.gold:"#22d3ee";

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
        <span style={{ background:slotColor, color:"#000", fontSize:10, fontWeight:700, borderRadius:3, padding:"2px 7px", fontFamily:"'DM Mono',monospace" }}>{slot}</span>
        <span style={{ fontSize:T.sm, fontWeight:600, color:T.textSecondary }}>Select a car</span>
      </div>

      {/* Featured 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:8 }}>
        {FEATURED_CARS.map(car=>{
          const sel=value?.id===car.id;
          const tier=RATE_TIERS.find(t=>t.id===car.rateTier);
          return (
            <button key={car.id} onClick={()=>pick(car)} className={`car-card${sel?" selected":""}`}
              style={{ padding:"14px 12px", textAlign:"left", cursor:"pointer", background:sel?"rgba(217,119,6,0.09)":"rgba(255,255,255,0.02)", border:`1px solid ${sel?"rgba(217,119,6,0.55)":T.border}`, borderRadius:T.r, position:"relative", boxShadow:sel?"0 0 0 3px rgba(217,119,6,0.08)":"none" }}>
              {sel && <div style={{ position:"absolute", top:8, right:8, width:7, height:7, borderRadius:"50%", background:T.gold, boxShadow:`0 0 6px ${T.gold}` }}/>}
              <div style={{ fontSize:22, marginBottom:8, lineHeight:1 }}>{car.emoji}</div>
              <div style={{ fontSize:T.sm, fontWeight:600, color:sel?T.textPrimary:T.textSecondary, lineHeight:1.4, marginBottom:4 }}>{car.name}</div>
              <div style={{ fontSize:T.xs, color:T.textMuted, marginBottom:6 }}>{car.type}</div>
              <div style={{ fontSize:T.base, fontFamily:"'DM Mono',monospace", fontWeight:600, color:sel?T.goldLight:T.textMuted, marginBottom:6 }}>{SGD(car.price)}</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:3, background:"rgba(0,0,0,0.25)", border:`1px solid ${tier.color}33`, borderRadius:4, padding:"2px 6px" }}>
                <span style={{ fontSize:9 }}>{tier.icon}</span>
                <span style={{ fontSize:T.xs, fontFamily:"'DM Mono',monospace", color:tier.color }}>{tier.display}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* More dropdown */}
      <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", padding:"11px 14px", background:open?"rgba(217,119,6,0.07)":MORE_CARS.some(c=>c.id===value?.id)?"rgba(217,119,6,0.06)":"rgba(255,255,255,0.02)", border:MORE_CARS.some(c=>c.id===value?.id)?`1px solid rgba(217,119,6,0.45)`:`1px solid ${T.border}`, borderRadius:T.r, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.15s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>{MORE_CARS.some(c=>c.id===value?.id)?value.emoji:"🔽"}</span>
          <span style={{ fontSize:T.sm, fontWeight:500, color:MORE_CARS.some(c=>c.id===value?.id)?T.goldLight:T.textMuted }}>
            {MORE_CARS.some(c=>c.id===value?.id)?value.name:"Browse 20 more popular models"}
          </span>
        </div>
        <span style={{ color:T.textMuted, fontSize:11, display:"inline-block", transition:"transform 0.2s", transform:open?"rotate(180deg)":"none" }}>▾</span>
      </button>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:99, background:"#161410", border:`1px solid rgba(217,119,6,0.2)`, borderRadius:T.r, boxShadow:"0 20px 60px rgba(0,0,0,0.85)", maxHeight:300, overflowY:"auto" }} className="zz-scroll">
          {MORE_CARS.map((car,i)=>{
            const sel=value?.id===car.id;
            const tier=RATE_TIERS.find(t=>t.id===car.rateTier);
            return (
              <button key={car.id} onClick={()=>pick(car)} className="dd-row"
                style={{ width:"100%", padding:"10px 14px", display:"flex", alignItems:"center", gap:12, textAlign:"left", cursor:"pointer", background:sel?"rgba(217,119,6,0.08)":"transparent", border:"none", borderBottom:i<MORE_CARS.length-1?`1px solid rgba(255,255,255,0.04)`:"none" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{car.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:T.sm, fontWeight:500, color:sel?T.textPrimary:T.textSecondary }}>{car.name}</div>
                  <div style={{ fontSize:T.xs, color:T.textMuted, marginTop:2 }}>{car.type} · {car.coeCategory} · {car.loanCap}% loan cap</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                  <span style={{ fontSize:T.sm, fontFamily:"'DM Mono',monospace", fontWeight:600, color:sel?T.goldLight:T.textSecondary }}>{SGD(car.price)}</span>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:3, background:"rgba(0,0,0,0.2)", border:`1px solid ${tier.color}33`, borderRadius:3, padding:"1px 5px" }}>
                    <span style={{ fontSize:9 }}>{tier.icon}</span>
                    <span style={{ fontSize:T.xs, fontFamily:"'DM Mono',monospace", color:tier.color }}>{tier.display}</span>
                  </div>
                </div>
                {sel && <span style={{ color:T.gold, fontSize:13 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected car hint */}
      {value && (
        <div style={{ marginTop:8, padding:"10px 14px", background:T.goldFaint, border:`1px solid rgba(217,119,6,0.15)`, borderRadius:T.r }}>
          <div style={{ fontSize:T.xs, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>About this car</div>
          <p style={{ fontSize:T.sm, color:T.textSecondary, lineHeight:1.6, marginBottom:6 }}>
            {FEATURED_CARS.find(c=>c.id===value.id)?.desc ?? `${value.name} — ${value.type}.`}
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <span style={{ fontSize:T.xs, color:T.textMuted }}>OMV {SGD(value.omv)} → <span style={{ color:T.gold, fontWeight:600 }}>{value.loanCap}% loan cap</span></span>
            <span style={{ fontSize:T.xs, color:T.textMuted }}>Min. downpayment: <span style={{ color:T.gold, fontWeight:600 }}>{SGD(value.price*(1-value.loanCap/100))}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESULT PANEL ────────────────────────────────────────────────────────────
function ResultPanel({ r, tenure, visible, slim=false }) {
  const [phase,setPhase]=useState(0);
  useEffect(()=>{
    if(!visible||!r){ setPhase(0); return; }
    setPhase(0);
    const t1=setTimeout(()=>setPhase(1),40);
    const t2=setTimeout(()=>setPhase(2),380);
    const t3=setTimeout(()=>setPhase(3),650);
    const t4=setTimeout(()=>setPhase(4),850);
    return()=>{ clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearTimeout(t4); };
  },[visible,r?.verdict,r?.car?.id,tenure]);

  if(!r) return (
    <div style={{ flex:1, background:"rgba(255,255,255,0.01)", border:`2px dashed ${T.border}`, borderRadius:T.rL, display:"flex", alignItems:"center", justifyContent:"center", minHeight:220, padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:10, opacity:0.2 }}>◻</div>
        <div style={{ fontSize:T.sm, color:T.textDim, fontWeight:500 }}>Select a car to see results</div>
      </div>
    </div>
  );

  const {vc,vbg,vborder,car,tier,verdict,ratio,monthly,loan,interest,repay,takeHome,maxInst,reqDown,canDown,shortfall,saving,coo,totalCoo,lcPct} = r;
  const glowing=phase>=2; const contentIn=phase>=3; const metricsIn=phase>=4;
  const verdictIcon=verdict==="Affordable"?"✦":verdict==="Stretch"?"◈":"✕";

  return (
    <div style={{ flex:1, background:T.surface, border:`1px solid ${phase>=1?vborder:T.border}`, borderRadius:T.rL, overflow:"hidden", opacity:phase>=1?1:0, transform:phase>=1?"translateY(0) scale(1)":"translateY(20px) scale(0.98)", transition:"opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1), border-color 0.4s ease, box-shadow 0.6s ease", boxShadow:glowing?`0 0 0 1px rgba(0,0,0,0.8),0 24px 60px rgba(0,0,0,0.5),0 0 50px ${vc}12`:"0 0 0 1px rgba(0,0,0,0.8),0 24px 60px rgba(0,0,0,0.5)" }}>

      {/* top bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,transparent,${vc},transparent)`, transformOrigin:"center", animation:phase>=1?"barGrow 0.55s cubic-bezier(0.16,1,0.3,1) forwards":"none" }}/>

      {/* ambient glow */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:160, background:`radial-gradient(ellipse at 50% 0%,${vc}0e 0%,transparent 70%)`, opacity:glowing?1:0, transition:"opacity 0.8s ease", pointerEvents:"none" }}/>

      {/* ── VERDICT HERO ── */}
      <div style={{ padding:slim?"20px 22px 18px":"26px 28px 22px", borderBottom:`1px solid ${T.border}`, background:vbg, position:"relative", overflow:"hidden" }}>
        {phase>=2 && <div style={{ position:"absolute", top:44, left:"50%", transform:"translateX(-50%)", width:52, height:52, border:`2px solid ${vc}`, borderRadius:"50%", animation:"ringOut 0.7s ease-out forwards", pointerEvents:"none" }}/>}

        {/* Pills row */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18, opacity:contentIn?1:0, transform:contentIn?"translateY(0)":"translateY(6px)", transition:"opacity 0.4s 0.1s, transform 0.4s 0.1s" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,0,0,0.3)", border:`1px solid ${T.borderStrong}`, borderRadius:20, padding:"5px 12px 5px 8px" }}>
            <span style={{ fontSize:15 }}>{car.emoji}</span>
            <span style={{ fontSize:T.sm, fontWeight:500, color:T.textSecondary }}>{car.name}</span>
            <span style={{ color:T.textDim }}>·</span>
            <span style={{ fontSize:T.sm, fontFamily:"'DM Mono',monospace", fontWeight:600, color:T.gold }}>{SGD(car.price)}</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${tier.color}12`, border:`1px solid ${tier.color}44`, borderRadius:20, padding:"5px 12px" }}>
            <span style={{ fontSize:11 }}>{tier.icon}</span>
            <span style={{ fontSize:T.xs, fontWeight:600, color:tier.color }}>{tier.label}</span>
            <span style={{ fontSize:T.sm, fontFamily:"'DM Mono',monospace", fontWeight:700, color:tier.color }}>{tier.display}</span>
          </div>
        </div>

        {/* Verdict row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {/* Icon circle */}
            <div style={{ width:50, height:50, borderRadius:"50%", background:`radial-gradient(circle,${vc}20 0%,${vc}08 100%)`, border:`2px solid ${vc}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:glowing?`0 0 18px ${vc}45,0 0 35px ${vc}18`:"none", transition:"box-shadow 0.6s", animation:glowing?"glowPulse 2.5s ease-in-out 2":undefined }}>
              <span style={{ fontSize:19, color:vc, animation:phase>=2?"spinIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards":undefined }}>{verdictIcon}</span>
            </div>
            <div>
              <div style={{ fontSize:T.xs, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5, opacity:contentIn?1:0, transition:"opacity 0.3s" }}>Your verdict</div>
              <div style={{ fontSize:slim?22:28, color:vc, fontStyle:"italic", fontFamily:"Georgia,'Times New Roman',serif", lineHeight:1, opacity:contentIn?1:0, background:glowing?`linear-gradient(90deg,${vc} 0%,#fff 42%,${vc} 58%,${vc} 100%)`:vc, backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:phase>=3?"stamp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards"+(glowing?",shimmer 2.5s linear 0.8s 2":""):undefined }}>
                {verdict}
              </div>
            </div>
          </div>
          <div style={{ textAlign:"right", opacity:contentIn?1:0, transition:"opacity 0.4s 0.3s" }}>
            <div style={{ fontSize:T.xs, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Instalment burden</div>
            <div style={{ fontSize:34, fontFamily:"'DM Mono',monospace", fontWeight:500, color:vc, lineHeight:1, textShadow:glowing?`0 0 16px ${vc}65`:"none", transition:"text-shadow 0.6s" }}>
              {(ratio*100).toFixed(1)}<span style={{ fontSize:15 }}>%</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p style={{ marginTop:14, fontSize:T.sm, color:T.textSecondary, lineHeight:1.7, opacity:contentIn?1:0, transform:contentIn?"translateY(0)":"translateY(5px)", transition:"opacity 0.5s 0.35s, transform 0.5s 0.35s" }}>
          {!canDown
            ? <>Minimum downpayment is <strong style={{ color:T.goldLight }}>{SGD(reqDown)}</strong> ({100-car.loanCap}% of price). You're short by <strong style={{ color:T.red }}>{SGD(shortfall)}</strong>.</>
            : verdict==="Affordable"
            ? <>{SGD(monthly)}/mo is {(ratio*100).toFixed(1)}% of your take-home — comfortably within the 30% threshold. You're in good shape.</>
            : verdict==="Stretch"
            ? <>{SGD(monthly)}/mo is {(ratio*100).toFixed(1)}% of your take-home. Manageable, but you'll have limited savings buffer each month.</>
            : <>{SGD(monthly)}/mo is {(ratio*100).toFixed(1)}% of your take-home — above the 45% limit. Consider a longer tenure or a less expensive car.</>}
        </p>
      </div>

      {/* ── DETAILS ── */}
      <div style={{ padding:slim?"16px 22px 24px":"20px 28px 28px" }}>
        {canDown && <GaugeBar ratio={ratio} visible={metricsIn}/>}

        {/* Downpayment warning */}
        {!canDown && (
          <div style={{ background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:T.r, padding:"14px 16px", marginBottom:16, opacity:metricsIn?1:0, transition:"opacity 0.5s" }}>
            <div style={{ fontSize:T.xs, fontWeight:700, color:T.red, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>⚠ Downpayment Shortfall</div>
            <p style={{ fontSize:T.sm, color:T.textSecondary, lineHeight:1.6 }}>
              You need <strong style={{ color:T.goldLight }}>{SGD(reqDown)}</strong> minimum ({100-car.loanCap}% of the car price). Save an additional <strong style={{ color:T.red }}>{SGD(shortfall)}</strong> to qualify for this loan.
            </p>
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
          <StatBox label="Monthly instalment" value={`S$${Math.round(monthly)}`}  sub={`${tenure} yr loan at ${tier.display}`} accent delay={0}   visible={metricsIn}/>
          <StatBox label="Maximum loan"        value={`S$${Math.round(loan)}`}     sub={`${car.loanCap}% of purchase price`}          delay={80}  visible={metricsIn}/>
          <StatBox label="Total interest"      value={`S$${Math.round(interest)}`} sub={`Total repayable: ${SGD(repay)}`}        accent delay={160} visible={metricsIn}/>
          <StatBox label="Your take-home"       value={`S$${Math.round(takeHome)}`} sub={`Comfortable max: ${SGD(maxInst)}/mo`}         delay={240} visible={metricsIn}/>
        </div>

        {/* COO */}
        <COOTimeline coo={coo} totalCoo={totalCoo} tenure={tenure} visible={metricsIn}/>

        {/* Green savings */}
        {tier.id!=="ice"&&saving>0&&(
          <div style={{ display:"flex", alignItems:"flex-start", gap:12, background:`${tier.color}0d`, border:`1px solid ${tier.color}30`, borderRadius:T.r, padding:"13px 16px", marginBottom:14, opacity:metricsIn?1:0, transition:"opacity 0.5s 0.45s" }}>
            <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>💰</span>
            <div>
              <div style={{ fontSize:T.xs, fontWeight:700, color:tier.color, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Green rate savings vs standard ICE</div>
              <p style={{ fontSize:T.sm, color:T.textSecondary, lineHeight:1.6 }}>
                You save <strong style={{ color:tier.color }}>{SGD(saving)}</strong> in total interest — that's <strong style={{ color:tier.color }}>{SGD(saving/(tenure*12))}/mo</strong> less over {tenure} years.
              </p>
            </div>
          </div>
        )}

        {/* Rate table */}
        {!slim && <RateTable car={car} tenure={tenure} loan={loan} visible={metricsIn}/>}

        {/* Suggestion */}
        {verdict!=="Affordable"&&(
          <div style={{ background:T.goldFaint, border:`1px solid rgba(217,119,6,0.18)`, borderRadius:T.r, padding:"13px 16px", opacity:metricsIn?1:0, transform:metricsIn?"translateY(0)":"translateY(6px)", transition:"opacity 0.5s 0.9s, transform 0.5s 0.9s" }}>
            <div style={{ fontSize:T.xs, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>💡 What you could do</div>
            <p style={{ fontSize:T.sm, color:T.textSecondary, lineHeight:1.7 }}>
              {!canDown
                ? <>Save <strong style={{ color:T.goldLight }}>{SGD(shortfall)}</strong> more to meet the minimum downpayment. Alternatively, the Honda Freed or Toyota Sienta have lower minimums at around {SGD(163888*0.30)}.</>
                : verdict==="Stretch"
                ? <>Extending to 7 years would lower your monthly to approximately <strong style={{ color:T.goldLight }}>{SGD(loan*(1+r?.rate*7||0.026*7)/84)}</strong>. A Cat A hybrid like the Corolla Altis also has a smaller loan amount.</>
                : <>Based on your salary, your comfortable car budget is around <strong style={{ color:T.goldLight }}>{SGD(takeHome*0.30*tenure*12/(1+r?.rate*tenure||0.026*tenure)/lcPct)}</strong>. Consider the Corolla Altis, Honda Freed, or BYD Dolphin.</>}
            </p>
          </div>
        )}
      </div>
      <div style={{ height:1, background:`linear-gradient(90deg,transparent,rgba(217,119,6,0.18),transparent)` }}/>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  const [salaryRaw,setSalaryRaw]=useState("");
  const [salary,setSalary]=useState("");
  const [downRaw,setDownRaw]=useState("");
  const [down,setDown]=useState("");
  const [tenure,setTenure]=useState(5);
  const [mode,setMode]=useState("single");
  const [carA,setCarA]=useState(null);
  const [carB,setCarB]=useState(null);
  const [calculated,setCalculated]=useState(false);
  const resultsRef=useRef(null);

  const dSalary  = useDebounce(parseInt(salaryRaw||"0",10), 120);
  const dDown    = useDebounce(parseInt(downRaw||"0",10),   120);
  const dTenure  = useDebounce(tenure, 80);

  const rA = (calculated&&carA) ? calc(dSalary,dDown,dTenure,carA) : null;
  const rB = (calculated&&carB&&mode==="compare") ? calc(dSalary,dDown,dTenure,carB) : null;

  const handleSalary = e => { const r=e.target.value.replace(/\D/g,""); setSalaryRaw(r); setSalary(r?Number(r).toLocaleString("en-SG"):""); };
  const handleDown   = e => { const r=e.target.value.replace(/\D/g,""); setDownRaw(r);   setDown(r?Number(r).toLocaleString("en-SG"):"");   };
  const isReady      = salaryRaw&&downRaw&&carA&&(mode==="single"||carB);

  const handleCalc = () => {
    setCalculated(true);
    setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),120);
  };

  const trackBg = `linear-gradient(90deg, ${T.gold} ${(tenure-1)/6*100}%, rgba(255,255,255,0.1) ${(tenure-1)/6*100}%)`;

  return (
    <>
      <style>{STYLES}</style>
      <div className="zz-root" style={{ minHeight:"100vh", background:T.bg, backgroundImage:`radial-gradient(ellipse at 20% 50%,rgba(217,119,6,0.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 10%,rgba(180,83,9,0.04) 0%,transparent 40%)`, display:"flex", justifyContent:"center", padding:"40px 16px 80px" }}>
        <div style={{ width:"100%", maxWidth:mode==="compare"?1120:640, transition:"max-width 0.4s ease" }}>

          {/* ══ INPUT CARD ══ */}
          <div style={{ background:T.surface, border:`1px solid rgba(217,119,6,0.2)`, borderRadius:T.rL, boxShadow:"0 0 0 1px rgba(0,0,0,0.6),0 32px 80px rgba(0,0,0,0.5)", overflow:"hidden", marginBottom:16 }}>
            <div style={{ height:3, background:`linear-gradient(90deg,transparent,${T.gold},${T.goldLight},${T.gold},transparent)` }}/>

            {/* Header */}
            <div style={{ padding:"28px 32px 24px", borderBottom:`1px solid ${T.border}` }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:6, height:6, background:T.gold, borderRadius:"50%", boxShadow:`0 0 8px ${T.gold}` }}/>
                    <span style={{ fontSize:T.xs, fontFamily:"'DM Mono',monospace", fontWeight:500, color:T.textMuted, letterSpacing:"0.15em", textTransform:"uppercase" }}>Car Loan Calculator</span>
                  </div>
                  <h1 style={{ fontSize:T.xxl, fontWeight:600, color:T.textPrimary, lineHeight:1.15, marginBottom:0 }}>
                    My Zoom Zoom <span style={{ color:T.gold, fontStyle:"italic", fontWeight:400 }}>Plan</span>
                  </h1>
                </div>
                {/* Mode toggle */}
                <div style={{ display:"flex", background:"rgba(255,255,255,0.03)", border:`1px solid ${T.border}`, borderRadius:T.r, padding:3, alignSelf:"flex-start" }}>
                  {["single","compare"].map(m=>(
                    <button key={m} onClick={()=>{ setMode(m); setCalculated(false); }} style={{ padding:"8px 18px", fontSize:T.xs, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer", borderRadius:4, border:"none", fontFamily:"'DM Sans',sans-serif", background:mode===m?`linear-gradient(135deg,${T.gold},#b45309)`:"transparent", color:mode===m?T.textPrimary:T.textMuted, transition:"all 0.2s", boxShadow:mode===m?"0 2px 8px rgba(217,119,6,0.3)":"none" }}>
                      {m==="single"?"Single Car":"Compare Two"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding:"24px 32px 28px" }}>

              {/* Salary + Downpayment row */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
                <MoneyInput
                  label="Monthly Gross Salary"
                  value={salary}
                  onChange={handleSalary}
                  hint={salaryRaw&&parseInt(salaryRaw)>0
                    ? `Take-home after CPF: S$${Math.floor(parseInt(salaryRaw)*0.8).toLocaleString("en-SG")}/mo  ·  30% comfort limit: S$${Math.floor(parseInt(salaryRaw)*0.8*0.3).toLocaleString("en-SG")}/mo`
                    : "Your gross monthly income before CPF deductions"}
                />
                <MoneyInput
                  label="Available Cash Downpayment"
                  value={down}
                  onChange={handleDown}
                  hint="Must be paid in full cash — CPF cannot be used for car loans"
                />
              </div>

              {/* Divider */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
                <div style={{ flex:1, height:1, background:T.border }}/>
                <span style={{ fontSize:T.xs, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.1em" }}>Choose your car</span>
                <div style={{ flex:1, height:1, background:T.border }}/>
              </div>

              {/* Car pickers */}
              <div style={{ display:"grid", gridTemplateColumns:mode==="compare"?"1fr 1fr":"1fr", gap:24, marginBottom:28 }}>
                <CarPicker value={carA} onChange={c=>{ setCarA(c); setCalculated(false); }} slot="A"/>
                {mode==="compare" && (
                  <CarPicker value={carB} onChange={c=>{ setCarB(c); setCalculated(false); }} slot="B"/>
                )}
              </div>

              {/* Divider */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <div style={{ flex:1, height:1, background:T.border }}/>
                <span style={{ fontSize:T.xs, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.1em" }}>Loan tenure</span>
                <div style={{ flex:1, height:1, background:T.border }}/>
              </div>

              {/* Tenure slider */}
              <div style={{ marginBottom:28 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:T.sm, fontWeight:600, color:T.textSecondary }}>How many years to repay?</div>
                    {calculated && <div style={{ fontSize:T.xs, color:T.textMuted, marginTop:2 }}>Drag to update results live</div>}
                  </div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:T.hero, fontFamily:"'DM Mono',monospace", fontWeight:500, color:T.goldLight, lineHeight:1 }}>{tenure}</span>
                    <span style={{ fontSize:T.sm, color:T.textMuted }}>year{tenure>1?"s":""}</span>
                  </div>
                </div>
                {/* Tick marks */}
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, paddingLeft:10, paddingRight:10 }}>
                  {[1,2,3,4,5,6,7].map(y=>(
                    <div key={y} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer" }} onClick={()=>setTenure(y)}>
                      <div style={{ width:1, height:6, background:tenure===y?T.gold:T.border }}/>
                      <span style={{ fontSize:T.xs, fontFamily:"'DM Mono',monospace", color:tenure===y?T.gold:T.textMuted, fontWeight:tenure===y?600:400 }}>{y}</span>
                    </div>
                  ))}
                </div>
                <input type="range" className="zz-slider" min={1} max={7} step={1} value={tenure} onChange={e=>setTenure(Number(e.target.value))}
                  style={{ background:"transparent" }}
                  ref={el=>{ if(el){ el.style.setProperty("--track-bg",trackBg); const track=document.createElement("style"); track.textContent=`.zz-slider::-webkit-slider-runnable-track{background:${trackBg}}`;  document.head.appendChild(track); } }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                  <span style={{ fontSize:T.xs, color:T.textMuted }}>↑ Less total interest</span>
                  <span style={{ fontSize:T.xs, color:T.textMuted }}>Lower monthly payment ↓</span>
                </div>
              </div>

              {/* CTA */}
              <button onClick={handleCalc} disabled={!isReady} style={{ width:"100%", padding:"15px 20px", background:isReady?`linear-gradient(135deg,${T.gold},#b45309,#92400e)`:"rgba(255,255,255,0.04)", border:isReady?`1px solid rgba(217,119,6,0.35)`:`1px solid ${T.border}`, borderRadius:T.r, color:isReady?T.textPrimary:T.textDim, fontSize:T.base, fontWeight:600, letterSpacing:"0.05em", cursor:isReady?"pointer":"not-allowed", transition:"all 0.2s", boxShadow:isReady?"0 6px 28px rgba(217,119,6,0.22)":"none" }}>
                {isReady
                  ? calculated
                    ? `↻  Recalculate${mode==="compare"?" comparison":""}`
                    : mode==="compare"
                    ? `Compare ${carA?.short??carA?.name} vs ${carB?.short??carB?.name}  →`
                    : `Check if I can afford the ${carA?.short??carA?.name}  →`
                  : "Fill in all fields above to continue"}
              </button>
              {calculated && (
                <p style={{ marginTop:10, textAlign:"center", fontSize:T.xs, color:T.textMuted }}>
                  Results update automatically as you adjust the tenure slider above
                </p>
              )}
              <p style={{ marginTop:8, textAlign:"center", fontSize:T.xs, color:T.textDim }}>
                Prices are indicative and include COE · Based on MAS regulations · For reference only
              </p>
            </div>
            <div style={{ height:1, background:`linear-gradient(90deg,transparent,rgba(217,119,6,0.15),transparent)` }}/>
          </div>

          {/* ══ RESULTS ══ */}
          <div ref={resultsRef}>
            {mode==="single" ? (
              <ResultPanel r={rA} tenure={dTenure} visible={!!rA}/>
            ) : (
              <div>
                {(rA||rB) && (
                  <div style={{ marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                    <span style={{ fontSize:T.sm, fontWeight:600, color:T.textSecondary }}>Side-by-side comparison</span>
                    {rA&&rB&&rA.monthly&&rB.monthly&&(
                      <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.03)", border:`1px solid ${T.border}`, borderRadius:20, padding:"6px 14px" }}>
                        <span style={{ fontSize:T.xs, color:T.textMuted }}>Monthly difference:</span>
                        <span style={{ fontSize:T.sm, fontFamily:"'DM Mono',monospace", fontWeight:700, color:T.amber }}>
                          {SGD(Math.abs(rA.monthly-rB.monthly))}/mo
                        </span>
                        <span style={{ fontSize:T.xs, color:T.green, fontWeight:500 }}>
                          ({rA.monthly<rB.monthly?`${rA.car.short} is cheaper`:`${rB.car.short} is cheaper`})
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, alignItems:"start" }}>
                  <ResultPanel r={rA} tenure={dTenure} visible={!!rA} slim/>
                  <ResultPanel r={rB} tenure={dTenure} visible={!!rB} slim/>
                </div>

                {/* Total cost comparison bar */}
                {rA&&rB&&rA.canDown&&rB.canDown&&(
                  <div style={{ marginTop:12, background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rL, padding:"20px 24px" }}>
                    <div style={{ fontSize:T.base, fontWeight:600, color:T.textPrimary, marginBottom:4 }}>Total cost comparison over {dTenure} years</div>
                    <p style={{ fontSize:T.sm, color:T.textMuted, marginBottom:18 }}>Everything you'll pay — downpayment plus all monthly instalments</p>
                    {[{r:rA,slot:"A",color:T.gold},{r:rB,slot:"B",color:"#22d3ee"}].map(({r,slot,color})=>{
                      const maxTco=Math.max(rA.totalCoo,rB.totalCoo);
                      const pct=(r.totalCoo/maxTco)*100;
                      const cheaper=r.totalCoo<=Math.min(rA.totalCoo,rB.totalCoo);
                      return (
                        <div key={slot} style={{ marginBottom:16 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7, alignItems:"center" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <span style={{ background:color, color:"#000", fontSize:T.xs, fontWeight:700, borderRadius:3, padding:"2px 7px", fontFamily:"'DM Mono',monospace" }}>{slot}</span>
                              <span style={{ fontSize:T.sm, fontWeight:500, color:T.textSecondary }}>{r.car.name}</span>
                              {cheaper && <span style={{ fontSize:T.xs, fontWeight:600, color:T.green, background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.25)", borderRadius:4, padding:"1px 7px" }}>CHEAPER</span>}
                            </div>
                            <span style={{ fontSize:T.lg, fontFamily:"'DM Mono',monospace", fontWeight:600, color }}>{SGD(r.totalCoo)}</span>
                          </div>
                          <div style={{ height:8, background:"rgba(255,255,255,0.05)", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${color}88,${color})`, borderRadius:4, transition:"width 1s cubic-bezier(0.16,1,0.3,1) 0.3s" }}/>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:T.sm, fontWeight:500, color:T.textSecondary }}>You save by choosing {rA.totalCoo<=rB.totalCoo?rA.car.short:rB.car.short}</div>
                        <div style={{ fontSize:T.xs, color:T.textMuted, marginTop:2 }}>over the full {dTenure}-year loan period</div>
                      </div>
                      <span style={{ fontSize:T.xxl, fontFamily:"'DM Mono',monospace", fontWeight:600, color:T.green }}>{SGD(Math.abs(rA.totalCoo-rB.totalCoo))}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}