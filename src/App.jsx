import { useState, useRef, useEffect, useCallback } from "react";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, .zz-root { font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

  .zz-slider { -webkit-appearance:none; appearance:none; width:100%; height:4px; background:transparent; outline:none; cursor:pointer; }
  .zz-slider::-webkit-slider-runnable-track { height:4px; border-radius:4px; }
  .zz-slider::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; background:radial-gradient(circle,#fbbf24 30%,#d97706 100%); border-radius:50%; margin-top:-8px; box-shadow:0 0 10px rgba(217,119,6,0.5); border:2px solid #0a0a0a; }
  .zz-slider::-moz-range-thumb { width:20px; height:20px; background:radial-gradient(circle,#fbbf24 30%,#d97706 100%); border-radius:50%; border:2px solid #0a0a0a; cursor:pointer; }
  .zz-scroll::-webkit-scrollbar { width:3px; }
  .zz-scroll::-webkit-scrollbar-thumb { background:rgba(217,119,6,0.3); border-radius:2px; }

  @keyframes barGrow   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes stamp     { 0%{opacity:0;transform:scale(1.2)} 65%{opacity:1;transform:scale(0.97)} 100%{transform:scale(1)} }
  @keyframes ringOut   { 0%{transform:scale(0.7);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
  @keyframes spinIn    { from{transform:rotate(-150deg) scale(0);opacity:0} to{transform:rotate(0) scale(1);opacity:1} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes expandDown { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes glowPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

  .coo-row { cursor:pointer; transition:background 0.15s; border-radius:6px; }
  .coo-row:hover { background:rgba(255,255,255,0.04) !important; }
  .dd-row:hover { background:rgba(255,255,255,0.05) !important; }
  .search-row { transition:background 0.12s; }
  .search-row:hover { background:rgba(255,255,255,0.05) !important; }
  .search-row.active { background:rgba(217,119,6,0.08) !important; }
  .top5-btn { transition:all 0.15s; }
  .top5-btn:hover { border-color:rgba(255,255,255,0.18) !important; background:rgba(255,255,255,0.04) !important; }
  .top5-btn.sel { border-color:rgba(217,119,6,0.6) !important; background:rgba(217,119,6,0.09) !important; }
`;

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  textPrimary:"#f0ede8", textSecondary:"#a89f94", textMuted:"#6b6358", textDim:"#3a3530",
  bg:"#0a0908", surface:"#131110", border:"rgba(255,255,255,0.07)", borderMed:"rgba(255,255,255,0.11)",
  gold:"#d97706", goldLight:"#fbbf24", goldFaint:"rgba(217,119,6,0.08)",
  green:"#4ade80", greenFaint:"rgba(74,222,128,0.08)",
  amber:"#fbbf24", amberFaint:"rgba(251,191,36,0.08)",
  red:"#f87171",  redFaint:"rgba(248,113,113,0.08)",
  xs:"11px", sm:"13px", base:"15px", lg:"17px", xl:"22px", xxl:"28px", hero:"38px",
  r:"6px", rL:"10px",
};

// ─── ALL CARS ────────────────────────────────────────────────────────────────
const ALL_CARS = [
  { id:"sealion7",     name:"BYD Sealion 7",           short:"Sealion 7",      type:"Electric SUV",   price:215888, omv:38500, coe:"Cat B", loanCap:60, emoji:"🚗",  rateTier:"green", top5:true,  rank:1, badge:"#1 Best Seller 2025" },
  { id:"corolla",      name:"Toyota Corolla Altis",     short:"Corolla Altis",  type:"Sedan · Hybrid", price:175888, omv:17800, coe:"Cat A", loanCap:70, emoji:"🏆",  rateTier:"green", top5:true,  rank:2, badge:"#1 Model 2025", desc:"Singapore's most-loved sedan. Reliable hybrid, low running costs." },
  { id:"mazda3",       name:"Mazda 3",                  short:"Mazda 3",        type:"Sedan · Petrol", price:162888, omv:19800, coe:"Cat A", loanCap:70, emoji:"🔴",  rateTier:"ice",   top5:true,  rank:3, badge:"Top 3" },
  { id:"sienta",       name:"Toyota Sienta",            short:"Sienta",         type:"MPV · Hybrid",   price:168888, omv:16200, coe:"Cat A", loanCap:70, emoji:"🚐",  rateTier:"green", top5:true,  rank:4, badge:"Top 4" },
  { id:"freed",        name:"Honda Freed e:HEV",        short:"Freed e:HEV",    type:"MPV · Hybrid",   price:163888, omv:15400, coe:"Cat A", loanCap:70, emoji:"🛻",  rateTier:"green", top5:true,  rank:5, badge:"Top 5" },
  { id:"atto3",        name:"BYD Atto 3",               short:"BYD Atto 3",     type:"Electric SUV",   price:165888, omv:28000, coe:"Cat B", loanCap:60, emoji:"🔋",  rateTier:"green", desc:"The EV that started Singapore's electric revolution. Smart & compact." },
  { id:"model3",       name:"Tesla Model 3",             short:"Model 3",        type:"Electric Sedan", price:189888, omv:32000, coe:"Cat A", loanCap:60, emoji:"⚡",  rateTier:"tesla", desc:"Silicon Valley's sedan — Autopilot, OTA updates, zero emissions." },
  { id:"bmwx1",        name:"BMW X1",                    short:"BMW X1",         type:"SUV · Petrol",   price:248888, omv:42000, coe:"Cat B", loanCap:60, emoji:"🇩🇪", rateTier:"ice"   },
  { id:"bmwix1",       name:"BMW iX1",                   short:"BMW iX1",        type:"Electric SUV",   price:258888, omv:44000, coe:"Cat B", loanCap:60, emoji:"🔵",  rateTier:"green" },
  { id:"merglb",       name:"Mercedes-Benz GLB",         short:"Merc GLB",       type:"SUV · Petrol",   price:278888, omv:46000, coe:"Cat B", loanCap:60, emoji:"⭐",  rateTier:"ice"   },
  { id:"modely",       name:"Tesla Model Y",             short:"Model Y",        type:"Electric SUV",   price:208888, omv:35000, coe:"Cat A", loanCap:60, emoji:"⚡",  rateTier:"tesla" },
  { id:"hyukona",      name:"Hyundai Kona Hybrid",       short:"Kona Hybrid",    type:"SUV · Hybrid",   price:166888, omv:19200, coe:"Cat A", loanCap:70, emoji:"🔷",  rateTier:"green" },
  { id:"byddolphin",   name:"BYD Dolphin",               short:"BYD Dolphin",    type:"Electric Hatch", price:158888, omv:22000, coe:"Cat A", loanCap:60, emoji:"🐬",  rateTier:"green" },
  { id:"bydm6",        name:"BYD M6",                    short:"BYD M6",         type:"Electric MPV",   price:198888, omv:36000, coe:"Cat B", loanCap:60, emoji:"🚌",  rateTier:"green" },
  { id:"gacaionv",     name:"GAC Aion V",                short:"GAC Aion V",     type:"Electric SUV",   price:162888, omv:26000, coe:"Cat B", loanCap:60, emoji:"🇨🇳", rateTier:"green" },
  { id:"civic",        name:"Honda Civic e:HEV",         short:"Civic e:HEV",    type:"Sedan · Hybrid", price:168888, omv:18500, coe:"Cat A", loanCap:70, emoji:"🏎",  rateTier:"green" },
  { id:"xpengG6",      name:"Xpeng G6",                  short:"Xpeng G6",       type:"Electric SUV",   price:198888, omv:34000, coe:"Cat B", loanCap:60, emoji:"🤖",  rateTier:"green" },
  { id:"mgzs",         name:"MG ZS EV",                  short:"MG ZS EV",       type:"Electric SUV",   price:158888, omv:23000, coe:"Cat A", loanCap:60, emoji:"🇬🇧", rateTier:"green" },
  { id:"zeekrx",       name:"Zeekr X",                   short:"Zeekr X",        type:"Electric SUV",   price:178888, omv:29000, coe:"Cat B", loanCap:60, emoji:"💎",  rateTier:"green" },
  { id:"corollacross", name:"Toyota Corolla Cross HEV",  short:"Corolla Cross",  type:"SUV · Hybrid",   price:189888, omv:21000, coe:"Cat A", loanCap:60, emoji:"🌿",  rateTier:"green" },
  { id:"mazdacx5",     name:"Mazda CX-5",                short:"Mazda CX-5",     type:"SUV · Petrol",   price:196888, omv:28000, coe:"Cat B", loanCap:60, emoji:"🔵",  rateTier:"ice"   },
  { id:"subarufore",   name:"Subaru Forester e-Boxer",   short:"Forester",       type:"SUV · Hybrid",   price:195888, omv:24000, coe:"Cat B", loanCap:60, emoji:"⛰",  rateTier:"green" },
  { id:"nisanserena",  name:"Nissan Serena e-Power",     short:"Serena e-Power", type:"MPV · e-Power",  price:202888, omv:26000, coe:"Cat B", loanCap:60, emoji:"🌊",  rateTier:"green" },
];

const TOP5 = ALL_CARS.filter(c => c.top5).sort((a,b) => a.rank - b.rank);
const RATE_TIERS = [
  { id:"ice",   label:"Standard ICE",       sub:"Petrol & diesel",   rate:0.026,  display:"2.60%", color:"#94a3b8", icon:"⛽" },
  { id:"green", label:"Green EV / Hybrid",  sub:"Electric & hybrid", rate:0.0208, display:"2.08%", color:"#4ade80", icon:"🌿" },
  { id:"tesla", label:"Tesla Preferential", sub:"Tesla models only", rate:0.0168, display:"1.68%", color:"#a78bfa", icon:"⚡" },
];

const SGD = n => `S$${Math.round(n).toLocaleString("en-SG")}`;

// ─── DEPRECIATION ────────────────────────────────────────────────────────────
function calcARF(omv) {
  if (omv <= 20000) return omv * 1.0;
  if (omv <= 50000) return 20000 + (omv - 20000) * 1.4;
  if (omv <= 80000) return 20000 + 30000 * 1.4 + (omv - 50000) * 1.8;
  return 20000 + 30000 * 1.4 + 30000 * 1.8 + (omv - 80000) * 2.2;
}

// UPDATED: Budget 2026 PARF schedule (effective 13 Feb 2026)
// Rates reduced by ~45pp across all tiers; cap halved from $60k to $30k
function calcPARF(arf, y) {
  let pct = 0;
  if      (y <= 5)  pct = 0.30;
  else if (y <= 6)  pct = 0.25;
  else if (y <= 7)  pct = 0.20;
  else if (y <= 8)  pct = 0.15;
  else if (y <= 9)  pct = 0.10;
  else if (y <= 10) pct = 0.05;
  // > 10 years: pct stays 0, no PARF rebate
  return Math.min(arf * pct, 30000); // cap reduced from $60k → $30k
}

function estCOE(price, omv) {
  return Math.max(0, price - omv - calcARF(omv) - omv * 0.09 - 220 - price * 0.05);
}

function calcDepr(car, y) {
  const arf = calcARF(car.omv);
  const coe = estCOE(car.price, car.omv);
  const parf = calcPARF(arf, y);
  const coeR = (Math.max(0, 120 - y * 12) / 120) * coe;
  const paper = parf + coeR;
  const total = car.price - paper;
  return { arf, coePaid:coe, parf, coeRebate:coeR, paperValue:paper,
           totalDepr:total, annualDepr:total/y, monthlyDepr:total/y/12 };
}

// ─── CALC ENGINE ─────────────────────────────────────────────────────────────
function calc(salary, down, tenure, car) {
  if (!car || !salary || !down) return null;
  const tier   = RATE_TIERS.find(t => t.id === car.rateTier);
  const maxLoan = car.price * (car.loanCap / 100); // MAS cap ceiling
  const minDown = car.price * (1 - car.loanCap / 100); // regulatory minimum cash

  // UPDATED: loan = whatever is left after the user's own downpayment,
  // capped at the MAS maximum. More cash in → smaller loan.
  const canDown = down >= minDown;
  const loan    = canDown
    ? Math.min(Math.max(0, car.price - down), maxLoan)
    : maxLoan; // show max loan for reference when downpayment is insufficient

  const reqDown  = minDown; // keep for UI display
  const lcPct    = car.loanCap / 100;
  const months   = tenure * 12;
  const interest = loan * tier.rate * tenure;
  const repay    = loan + interest;
  const monthly  = repay / months;
  const takeHome = salary * 0.80;
  const maxInst  = takeHome * 0.30;
  const ratio    = monthly / takeHome;
  const saving   = loan * 0.026 * tenure - interest; // vs ICE baseline on same loan
  const deprAtTenure = calcDepr(car, tenure);
  const totalCoo = (canDown ? down : reqDown) + repay;

  // COO milestones
  const milestoneYears = [1, 2, 3, 5, 7].filter(y => y <= tenure);
  if (!milestoneYears.includes(tenure)) milestoneYears.push(tenure);
  milestoneYears.sort((a,b) => a - b);

  const coo = milestoneYears.map(y => {
    const d  = calcDepr(car, y);
    const lp = monthly * y * 12;
    const ip = (interest / months) * y * 12;
    const pp = lp - ip;
    const du = canDown ? down : reqDown;
    return {
      year:y, done:true, totalPaid:du+lp, downUsed:du, loanPaid:lp,
      interestPaid:ip, principalPaid:pp, netCost:du+lp-d.paperValue,
      paperValue:d.paperValue, parfNow:d.parf, coeRebateNow:d.coeRebate,
      annualDepr:d.annualDepr, totalDepr:du+lp-d.paperValue,
    };
  });

  let verdict, vc, vbg, vborder;
  if (!canDown)        { verdict="Insufficient Downpayment"; vc=T.red;   vbg=T.redFaint;   vborder="rgba(248,113,113,0.25)"; }
  else if (ratio<=0.30){ verdict="Affordable";               vc=T.green; vbg=T.greenFaint;  vborder="rgba(74,222,128,0.25)";  }
  else if (ratio<=0.45){ verdict="Stretch";                  vc=T.amber; vbg=T.amberFaint;  vborder="rgba(251,191,36,0.30)";  }
  else                 { verdict="Out of Range";              vc=T.red;   vbg=T.redFaint;    vborder="rgba(248,113,113,0.25)"; }

  return { car, tier, loan, maxLoan, reqDown, canDown,
           shortfall:Math.max(0, reqDown - down),
           extraDown: canDown ? Math.max(0, down - reqDown) : 0,
           monthly, interest, repay, takeHome, maxInst, ratio, months,
           verdict, vc, vbg, vborder, lcPct, saving, coo, totalCoo, deprAtTenure };
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useCountUp(target, ms=800, delay=0) {
  const [v,setV]=useState(0); const raf=useRef(null); const t0=useRef(null);
  useEffect(()=>{
    setV(0); t0.current=null; if(raf.current) cancelAnimationFrame(raf.current);
    const id=setTimeout(()=>{ const step=ts=>{ if(!t0.current) t0.current=ts; const p=Math.min((ts-t0.current)/ms,1); setV(Math.round(target*(1-Math.pow(1-p,4)))); if(p<1) raf.current=requestAnimationFrame(step); }; raf.current=requestAnimationFrame(step); },delay);
    return()=>{ clearTimeout(id); if(raf.current) cancelAnimationFrame(raf.current); };
  },[target,delay]);
  return v;
}
function useDebounce(val,ms){ const [d,setD]=useState(val); useEffect(()=>{ const t=setTimeout(()=>setD(val),ms); return()=>clearTimeout(t); },[val,ms]); return d; }

// ─── SHARED UI ───────────────────────────────────────────────────────────────
function Divider({label}){
  return <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
    <div style={{flex:1,height:1,background:T.border}}/>
    <span style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</span>
    <div style={{flex:1,height:1,background:T.border}}/>
  </div>;
}

function MoneyInput({label,hint,value,onChange}){
  const [focused,setFocused]=useState(false); const filled=value!=="";
  return <div>
    <label style={{display:"block",fontSize:T.sm,fontWeight:600,color:T.textSecondary,marginBottom:8}}>{label}</label>
    <div style={{position:"relative"}}>
      <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:T.sm,fontWeight:600,color:focused||filled?T.gold:T.textMuted,pointerEvents:"none",transition:"color 0.2s"}}>S$</span>
      <input type="text" inputMode="numeric" value={value} onChange={onChange} placeholder="0"
        onFocus={e=>{setFocused(true);e.target.style.borderColor="rgba(217,119,6,0.6)";e.target.style.boxShadow="0 0 0 3px rgba(217,119,6,0.12)";}}
        onBlur={e=>{setFocused(false);e.target.style.borderColor=filled?"rgba(217,119,6,0.4)":T.border;e.target.style.boxShadow="none";}}
        style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${filled?"rgba(217,119,6,0.4)":T.border}`,borderRadius:T.r,padding:"12px 14px 12px 36px",color:T.textPrimary,fontSize:T.lg,fontFamily:"'DM Mono',monospace",fontWeight:500,outline:"none",transition:"border-color 0.2s,box-shadow 0.2s"}}/>
    </div>
    {hint&&<p style={{marginTop:5,fontSize:T.xs,color:T.textMuted,lineHeight:1.5}}>{hint}</p>}
  </div>;
}

function StatBox({label,value,sub,accent,delay=0,visible}){
  const num=parseInt(String(value).replace(/\D/g,""),10)||0;
  const anim=useCountUp(visible?num:0,900,delay+200);
  const pre=String(value).startsWith("S$")?"S$":"";
  const [in_,setIn]=useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),delay);return()=>clearTimeout(t);}else setIn(false); },[visible,delay]);
  return <div style={{background:accent?"rgba(217,119,6,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${accent?"rgba(217,119,6,0.2)":T.border}`,borderRadius:T.r,padding:"14px 16px",opacity:in_?1:0,transform:in_?"translateY(0)":"translateY(8px)",transition:"opacity 0.4s ease,transform 0.4s ease"}}>
    <div style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
    <div style={{fontSize:T.xl,fontFamily:"'DM Mono',monospace",fontWeight:500,color:accent?T.goldLight:T.textPrimary,lineHeight:1,marginBottom:sub?4:0}}>{pre}{anim.toLocaleString("en-SG")}</div>
    {sub&&<div style={{fontSize:T.xs,color:T.textMuted,lineHeight:1.4}}>{sub}</div>}
  </div>;
}

function GaugeBar({ratio,visible}){
  const pct=Math.min(ratio*100,100);
  const color=pct<=30?T.green:pct<=45?T.amber:T.red;
  const label=pct<=30?"Comfortable":pct<=45?"Getting Stretched":"Too High";
  const [w,setW]=useState(0);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setW(pct),200);return()=>clearTimeout(t);}else setW(0); },[visible,pct]);
  return <div style={{marginBottom:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <span style={{fontSize:T.sm,color:T.textSecondary,fontWeight:500}}>Monthly burden on take-home pay</span>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:T.sm,fontFamily:"'DM Mono',monospace",fontWeight:600,color}}>{pct.toFixed(1)}%</span>
        <span style={{fontSize:T.xs,color,fontWeight:600,background:`${color}20`,border:`1px solid ${color}55`,borderRadius:4,padding:"2px 8px"}}>{label}</span>
      </div>
    </div>
    <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",left:"30%",top:0,bottom:0,width:1,background:"rgba(74,222,128,0.35)"}}/>
      <div style={{position:"absolute",left:"45%",top:0,bottom:0,width:1,background:"rgba(251,191,36,0.35)"}}/>
      <div style={{height:"100%",width:`${w}%`,background:"linear-gradient(90deg,#4ade80 0%,#4ade80 30%,#fbbf24 45%,#f87171 70%)",borderRadius:4,transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)"}}/>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
      <span style={{fontSize:T.xs,color:T.green}}>Safe ≤ 30%</span>
      <span style={{fontSize:T.xs,color:T.amber}}>Stretch ≤ 45%</span>
      <span style={{fontSize:T.xs,color:T.red}}>Too high &gt; 45%</span>
    </div>
  </div>;
}

// ─── COO TIMELINE ────────────────────────────────────────────────────────────
function COOTimeline({coo,totalCoo,tenure,visible}){
  const [in_,setIn]=useState(false);
  const [expanded,setExpanded]=useState(null);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),450);return()=>clearTimeout(t);}else{setIn(false);setExpanded(null);} },[visible]);
  const max=totalCoo;
  return <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,borderRadius:T.r,overflow:"hidden",marginBottom:14,opacity:in_?1:0,transform:in_?"translateY(0)":"translateY(8px)",transition:"opacity 0.5s ease 0.5s,transform 0.5s ease 0.5s"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:"rgba(255,255,255,0.02)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Cost of Ownership Milestones</span>
      <span style={{fontSize:T.xs,color:T.textMuted}}>Click a year for breakdown</span>
    </div>
    <div style={{padding:"10px 12px",display:"flex",flexDirection:"column",gap:2}}>
      {coo.map((m,i)=>{
        const pct=Math.min((m.totalPaid/max)*100,100);
        const isLast=m.year===tenure;
        const isOpen=expanded===m.year;
        return <div key={m.year}>
          <div className="coo-row" onClick={()=>setExpanded(isOpen?null:m.year)} style={{padding:"10px 8px",background:isOpen?"rgba(217,119,6,0.06)":"transparent"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:T.xs,fontFamily:"'DM Mono',monospace",fontWeight:600,color:isLast?T.goldLight:T.textMuted,minWidth:52}}>Year {m.year}</span>
                {isLast&&<span style={{fontSize:T.xs,fontWeight:600,color:T.gold,background:"rgba(217,119,6,0.15)",border:"1px solid rgba(217,119,6,0.3)",borderRadius:4,padding:"1px 7px"}}>Loan ends</span>}
                <span style={{fontSize:T.xs,color:isOpen?T.gold:T.textMuted}}>{isOpen?"▲ hide":"▼ details"}</span>
              </div>
              <span style={{fontSize:T.base,fontFamily:"'DM Mono',monospace",fontWeight:600,color:isLast?T.goldLight:T.textPrimary}}>{SGD(m.totalPaid)}</span>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:in_?`${pct}%`:"0%",background:isLast?`linear-gradient(90deg,${T.gold},${T.goldLight})`:"rgba(255,255,255,0.18)",borderRadius:2,transition:`width ${0.7+i*0.1}s cubic-bezier(0.16,1,0.3,1) ${0.5+i*0.08}s`}}/>
            </div>
          </div>
          {isOpen&&<div style={{animation:"expandDown 0.22s ease forwards",overflow:"hidden",background:"rgba(217,119,6,0.04)",borderTop:"1px solid rgba(217,119,6,0.1)",borderBottom:"1px solid rgba(217,119,6,0.1)",marginBottom:2}}>
            <div style={{padding:"14px 16px"}}>
              <div style={{fontSize:T.xs,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Breakdown at Year {m.year}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[
                  ["Downpayment",       SGD(m.downUsed),      T.textPrimary],
                  ["Loan instalments",  SGD(m.loanPaid),      T.textPrimary],
                  ["↳ Interest paid",   SGD(m.interestPaid),  T.red],
                  ["↳ Principal paid",  SGD(m.principalPaid), T.green],
                  ["PARF rebate",       SGD(m.parfNow),       T.green],
                  ["COE rebate",        SGD(m.coeRebateNow),  T.green],
                  ["Paper value",       SGD(m.paperValue),    T.green],
                  ["Net true cost",     SGD(m.netCost),       T.amber],
                ].map(([k,v,c])=><div key={k} style={{background:"rgba(0,0,0,0.2)",borderRadius:4,padding:"8px 10px"}}>
                  <div style={{fontSize:T.xs,color:T.textMuted,marginBottom:3,lineHeight:1.3}}>{k}</div>
                  <div style={{fontSize:T.sm,fontFamily:"'DM Mono',monospace",fontWeight:600,color:c}}>{v}</div>
                </div>)}
              </div>
              <p style={{marginTop:10,fontSize:T.xs,color:T.textMuted,lineHeight:1.6}}>
                <strong style={{color:T.textSecondary}}>Net true cost</strong> = total paid minus what you'd recover selling today (PARF + COE rebates). PARF rates per Budget 2026 schedule; cap S$30,000.
              </p>
            </div>
          </div>}
        </div>;
      })}
    </div>
    <div style={{padding:"12px 16px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.02)"}}>
      <div>
        <div style={{fontSize:T.sm,fontWeight:600,color:T.textSecondary}}>Total cash out over {tenure} years</div>
        <div style={{fontSize:T.xs,color:T.textMuted,marginTop:2}}>Downpayment + all instalments</div>
      </div>
      <span style={{fontSize:T.xl,fontFamily:"'DM Mono',monospace",fontWeight:600,color:T.goldLight}}>{SGD(totalCoo)}</span>
    </div>
  </div>;
}

// ─── DEPRECIATION CARD ───────────────────────────────────────────────────────
function DepreciationCard({r,tenure,visible}){
  const [in_,setIn]=useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),700);return()=>clearTimeout(t);}else setIn(false); },[visible]);
  if(!r) return null;
  const {deprAtTenure,monthly}=r;
  const lbl=deprAtTenure.annualDepr<12000?"Low":deprAtTenure.annualDepr<18000?"Moderate":"High";
  const clr=deprAtTenure.annualDepr<12000?T.green:deprAtTenure.annualDepr<18000?T.amber:T.red;
  return <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,borderRadius:T.r,overflow:"hidden",marginBottom:14,opacity:in_?1:0,transform:in_?"translateY(0)":"translateY(8px)",transition:"opacity 0.5s ease,transform 0.5s ease"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Depreciation Impact</span>
      <span style={{fontSize:T.xs,fontWeight:600,color:clr,background:`${clr}18`,border:`1px solid ${clr}44`,borderRadius:4,padding:"2px 8px"}}>{lbl} depreciation</span>
    </div>
    <div style={{padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[
          ["Annual loss",   SGD(deprAtTenure.annualDepr),             "Value lost per year"],
          ["Monthly loss",  SGD(deprAtTenure.monthlyDepr),            "Hidden cost per month"],
          ["True monthly",  SGD(monthly+deprAtTenure.monthlyDepr),    "Instalment + depreciation"],
        ].map(([k,v,h])=><div key={k} style={{background:"rgba(0,0,0,0.2)",borderRadius:4,padding:"10px 12px"}}>
          <div style={{fontSize:T.xs,color:T.textMuted,marginBottom:4,lineHeight:1.3}}>{k}</div>
          <div style={{fontSize:T.base,fontFamily:"'DM Mono',monospace",fontWeight:600,color:T.textPrimary,marginBottom:3}}>{v}</div>
          <div style={{fontSize:"10px",color:T.textDim,lineHeight:1.4}}>{h}</div>
        </div>)}
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,borderRadius:T.r,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>What you recover when you sell / scrap</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            ["ARF paid at purchase",          SGD(deprAtTenure.arf),        T.textSecondary, "Additional Registration Fee based on OMV"],
            [`PARF rebate at year ${tenure}`, SGD(deprAtTenure.parf),       T.green,         "Budget 2026 rates; capped at S$30,000"],
            [`COE rebate at year ${tenure}`,  SGD(deprAtTenure.coeRebate),  T.green,         "Unused COE months refunded pro-rated"],
            ["Total paper value",             SGD(deprAtTenure.paperValue), T.goldLight,     "PARF + COE rebate — what you get back"],
            ["Total value lost",              SGD(deprAtTenure.totalDepr),  T.red,           "Price paid minus paper value"],
          ].map(([k,v,c,h])=><div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <div>
              <div style={{fontSize:T.sm,color:T.textSecondary,fontWeight:500}}>{k}</div>
              <div style={{fontSize:T.xs,color:T.textMuted,marginTop:1}}>{h}</div>
            </div>
            <span style={{fontSize:T.sm,fontFamily:"'DM Mono',monospace",fontWeight:600,color:c,flexShrink:0}}>{v}</span>
          </div>)}
        </div>
      </div>
      <p style={{fontSize:T.sm,color:T.textSecondary,lineHeight:1.75}}>
        On top of your instalment of <strong style={{color:T.textPrimary}}>{SGD(monthly)}</strong>, this car depreciates ~<strong style={{color:clr}}>{SGD(deprAtTenure.monthlyDepr)}/mo</strong> — making the true effective cost <strong style={{color:T.textPrimary}}>{SGD(monthly+deprAtTenure.monthlyDepr)}/mo</strong>.
      </p>
    </div>
  </div>;
}

// ─── RATE TABLE ──────────────────────────────────────────────────────────────
function RateTable({car,tenure,loan,visible}){
  const months=tenure*12;
  const [in_,setIn]=useState(false);
  useEffect(()=>{ if(visible){const t=setTimeout(()=>setIn(true),800);return()=>clearTimeout(t);}else setIn(false); },[visible]);
  return <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,borderRadius:T.r,overflow:"hidden",marginBottom:14,opacity:in_?1:0,transform:in_?"translateY(0)":"translateY(8px)",transition:"opacity 0.5s ease,transform 0.5s ease"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`}}>
      <span style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Interest Rate Comparison</span>
    </div>
    {RATE_TIERS.map((tier,i)=>{
      const int_=loan*tier.rate*tenure;
      const mo=(loan+int_)/months;
      const active=tier.id===car.rateTier;
      const disabled=tier.id==="tesla"&&car.rateTier!=="tesla";
      return <div key={tier.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<2?`1px solid ${T.border}`:"none",background:active?"rgba(217,119,6,0.05)":"transparent",opacity:disabled?0.3:1}}>
        <span style={{fontSize:16}}>{tier.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:T.sm,fontWeight:600,color:active?T.goldLight:T.textSecondary}}>{tier.label}</div>
          <div style={{fontSize:T.xs,color:T.textMuted,marginTop:2}}>{tier.display} flat{disabled?" · Tesla only":""}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:T.base,fontFamily:"'DM Mono',monospace",fontWeight:600,color:active?T.goldLight:T.textSecondary}}>{SGD(mo)}/mo</div>
          <div style={{fontSize:T.xs,color:T.textMuted,marginTop:2}}>Interest: {SGD(int_)}</div>
        </div>
        {active&&<div style={{width:6,height:6,borderRadius:"50%",background:T.gold,boxShadow:`0 0 6px ${T.gold}`,flexShrink:0}}/>}
      </div>;
    })}
  </div>;
}

// ─── LIVE SEARCH CAR PICKER ──────────────────────────────────────────────────
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return <span>{text.slice(0,idx)}<mark style={{background:"rgba(217,119,6,0.3)",color:T.goldLight,borderRadius:2,padding:"0 1px"}}>{text.slice(idx,idx+query.length)}</mark>{text.slice(idx+query.length)}</span>;
}

function CarPicker({ value, onChange, slot }) {
  const [query,setQuery]=useState("");
  const [focused,setFocused]=useState(false);
  const [hiIdx,setHiIdx]=useState(-1);
  const inputRef=useRef(null);
  const wrapRef=useRef(null);
  const slotColor=slot==="A"?T.gold:"#22d3ee";

  const filtered=query.trim().length===0?[]:ALL_CARS.filter(c=>
    c.name.toLowerCase().includes(query.toLowerCase())||
    c.type.toLowerCase().includes(query.toLowerCase())||
    c.coe?.toLowerCase().includes(query.toLowerCase())
  ).slice(0,8);

  const showDrop=focused&&query.trim().length>0;

  useEffect(()=>{
    const h=e=>{ if(wrapRef.current&&!wrapRef.current.contains(e.target)){setFocused(false);setQuery("");} };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);

  const select=car=>{onChange(car);setQuery("");setFocused(false);setHiIdx(-1);};
  const handleKey=e=>{
    if(!showDrop) return;
    if(e.key==="ArrowDown"){e.preventDefault();setHiIdx(i=>Math.min(i+1,filtered.length-1));}
    if(e.key==="ArrowUp"){e.preventDefault();setHiIdx(i=>Math.max(i-1,0));}
    if(e.key==="Enter"&&hiIdx>=0) select(filtered[hiIdx]);
    if(e.key==="Escape"){setFocused(false);setQuery("");}
  };
  const tier=value?RATE_TIERS.find(t=>t.id===value.rateTier):null;

  return <div ref={wrapRef}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
      <span style={{background:slotColor,color:"#000",fontSize:10,fontWeight:700,borderRadius:3,padding:"2px 7px",fontFamily:"'DM Mono',monospace"}}>{slot}</span>
      <span style={{fontSize:T.sm,fontWeight:600,color:T.textSecondary}}>Select a car</span>
    </div>

    {/* TOP 5 */}
    <div style={{marginBottom:14}}>
      <div style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>🏅 Top 5 Best-Sellers 2025</div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {TOP5.map(car=>{
          const t=RATE_TIERS.find(r=>r.id===car.rateTier);
          const sel=value?.id===car.id;
          return <button key={car.id} onClick={()=>select(car)} className={`top5-btn${sel?" sel":""}`}
            style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",background:sel?"rgba(217,119,6,0.09)":"rgba(255,255,255,0.02)",border:`1px solid ${sel?"rgba(217,119,6,0.55)":T.border}`,borderRadius:T.r,cursor:"pointer",textAlign:"left",width:"100%"}}>
            <span style={{fontSize:T.xs,fontFamily:"'DM Mono',monospace",fontWeight:700,color:T.textDim,minWidth:18,textAlign:"center"}}>#{car.rank}</span>
            <span style={{fontSize:18,lineHeight:1,flexShrink:0}}>{car.emoji}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:T.sm,fontWeight:600,color:sel?T.textPrimary:T.textSecondary,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{car.name}</div>
              <div style={{fontSize:T.xs,color:T.textMuted,marginTop:1}}>{car.type}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <span style={{fontSize:T.sm,fontFamily:"'DM Mono',monospace",fontWeight:600,color:sel?T.goldLight:T.textMuted}}>{SGD(car.price)}</span>
              <div style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(0,0,0,0.25)",border:`1px solid ${t.color}33`,borderRadius:4,padding:"2px 6px"}}>
                <span style={{fontSize:9}}>{t.icon}</span>
                <span style={{fontSize:T.xs,fontFamily:"'DM Mono',monospace",color:t.color}}>{t.display}</span>
              </div>
              {sel&&<div style={{width:7,height:7,borderRadius:"50%",background:T.gold,boxShadow:`0 0 6px ${T.gold}`}}/>}
            </div>
          </button>;
        })}
      </div>
    </div>

    {/* LIVE SEARCH */}
    <div>
      <div style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>🔍 Or search all 23 models</div>
      <div style={{position:"relative"}}>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",opacity:0.4}}>🔍</span>
          <input ref={inputRef} type="text" value={query}
            onChange={e=>{setQuery(e.target.value);setHiIdx(-1);}}
            onFocus={()=>setFocused(true)}
            onKeyDown={handleKey}
            placeholder="e.g. Tesla, BYD, SUV, Cat A…"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${focused?"rgba(217,119,6,0.5)":T.border}`,borderRadius:T.r,padding:"11px 34px 11px 38px",color:T.textPrimary,fontSize:T.sm,outline:"none",transition:"border-color 0.2s,box-shadow 0.2s",boxShadow:focused?"0 0 0 3px rgba(217,119,6,0.1)":"none"}}/>
          {query&&<button onClick={()=>{setQuery("");inputRef.current?.focus();}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:16,lineHeight:1,padding:0}}>✕</button>}
        </div>
        {showDrop&&<div className="zz-scroll" style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:999,background:"#161410",border:`1px solid rgba(217,119,6,0.22)`,borderRadius:T.r,boxShadow:"0 16px 48px rgba(0,0,0,0.85)",overflow:"hidden",animation:"expandDown 0.18s ease forwards"}}>
          {filtered.length===0
            ?<div style={{padding:"16px 14px",fontSize:T.sm,color:T.textMuted,textAlign:"center"}}>No matches for "{query}"</div>
            :filtered.map((car,i)=>{
              const t=RATE_TIERS.find(r=>r.id===car.rateTier);
              const sel=value?.id===car.id; const hi=hiIdx===i;
              return <button key={car.id} className={`search-row${hi?" active":""}`}
                onMouseEnter={()=>setHiIdx(i)} onClick={()=>select(car)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:sel?"rgba(217,119,6,0.08)":hi?"rgba(255,255,255,0.04)":"transparent",border:"none",borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.04)`:"none",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:18,flexShrink:0}}>{car.emoji}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:T.sm,fontWeight:500,color:sel?T.textPrimary:T.textSecondary}}>{highlightMatch(car.name,query)}</div>
                  <div style={{fontSize:T.xs,color:T.textMuted,marginTop:2}}>{car.type} · {car.coe} · {car.loanCap}% loan cap{car.top5?<span style={{marginLeft:6,color:T.gold,fontWeight:600}}>#{car.rank} best-seller</span>:null}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                  <span style={{fontSize:T.sm,fontFamily:"'DM Mono',monospace",fontWeight:600,color:sel?T.goldLight:T.textSecondary}}>{SGD(car.price)}</span>
                  <div style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(0,0,0,0.2)",border:`1px solid ${t.color}33`,borderRadius:3,padding:"1px 5px"}}>
                    <span style={{fontSize:9}}>{t.icon}</span>
                    <span style={{fontSize:T.xs,fontFamily:"'DM Mono',monospace",color:t.color}}>{t.display}</span>
                  </div>
                </div>
                {sel&&<span style={{color:T.gold,fontSize:13,flexShrink:0}}>✓</span>}
              </button>;
            })}
          {filtered.length>0&&<div style={{padding:"8px 14px",borderTop:`1px solid ${T.border}`,fontSize:T.xs,color:T.textDim}}>{filtered.length} result{filtered.length!==1?"s":""} · ↑↓ navigate · Enter select</div>}
        </div>}
      </div>
    </div>

    {/* SELECTED SUMMARY */}
    {value&&<div style={{marginTop:12,padding:"12px 14px",background:T.goldFaint,border:`1px solid rgba(217,119,6,0.18)`,borderRadius:T.r,animation:"fadeUp 0.25s ease forwards"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <span style={{fontSize:22}}>{value.emoji}</span>
        <div>
          <div style={{fontSize:T.sm,fontWeight:600,color:T.textPrimary}}>{value.name}</div>
          <div style={{fontSize:T.xs,color:T.textMuted}}>{value.type} · {value.coe}</div>
        </div>
        {value.top5&&<span style={{marginLeft:"auto",fontSize:T.xs,fontWeight:700,color:T.gold,background:"rgba(217,119,6,0.15)",border:"1px solid rgba(217,119,6,0.3)",borderRadius:4,padding:"2px 8px"}}>#{value.rank} in SG</span>}
      </div>
      {value.desc&&<p style={{fontSize:T.sm,color:T.textSecondary,lineHeight:1.6,marginBottom:8}}>{value.desc}</p>}
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <span style={{fontSize:T.xs,color:T.textMuted}}>Max loan: <strong style={{color:T.gold}}>{value.loanCap}%</strong></span>
        <span style={{fontSize:T.xs,color:T.textMuted}}>Min. downpayment: <strong style={{color:T.gold}}>{SGD(value.price*(1-value.loanCap/100))}</strong></span>
        <span style={{fontSize:T.xs,color:T.textMuted}}>OMV: <strong style={{color:T.gold}}>{SGD(value.omv)}</strong></span>
      </div>
    </div>}
  </div>;
}

// ─── RESULT PANEL ────────────────────────────────────────────────────────────
function ResultPanel({r, tenure, visible, slim=false}){
  const [phase,setPhase]=useState(0);
  useEffect(()=>{
    if(!visible||!r){setPhase(0);return;}
    setPhase(0);
    const t1=setTimeout(()=>setPhase(1),40);
    const t2=setTimeout(()=>setPhase(2),380);
    const t3=setTimeout(()=>setPhase(3),620);
    const t4=setTimeout(()=>setPhase(4),820);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearTimeout(t4);};
  },[visible,r?.verdict,r?.car?.id,tenure]);

  if(!r) return <div style={{flex:1,background:"rgba(255,255,255,0.01)",border:`2px dashed ${T.border}`,borderRadius:T.rL,display:"flex",alignItems:"center",justifyContent:"center",minHeight:220}}>
    <div style={{textAlign:"center"}}><div style={{fontSize:28,marginBottom:10,opacity:0.15}}>◻</div><div style={{fontSize:T.sm,color:T.textDim,fontWeight:500}}>Select a car to see results</div></div>
  </div>;

  const {vc,vbg,vborder,car,tier,verdict,ratio,monthly,loan,maxLoan,interest,repay,
         takeHome,maxInst,reqDown,canDown,shortfall,extraDown,saving,coo,totalCoo,lcPct,deprAtTenure}=r;
  const glowing=phase>=2; const contentIn=phase>=3; const metricsIn=phase>=4;
  const verdictIcon=verdict==="Affordable"?"✦":verdict==="Stretch"?"◈":"✕";
  const verdictTextColor=verdict==="Affordable"?"#15803d":verdict==="Stretch"?"#92400e":"#991b1b";
  const verdictBgColor=verdict==="Affordable"?"#dcfce7":verdict==="Stretch"?"#fef3c7":"#fee2e2";
  const loanReduced = canDown && extraDown > 0;

  return <div style={{flex:1,background:T.surface,border:`1px solid ${phase>=1?vborder:T.border}`,borderRadius:T.rL,overflow:"hidden",opacity:phase>=1?1:0,transform:phase>=1?"translateY(0) scale(1)":"translateY(20px) scale(0.98)",transition:"opacity 0.45s cubic-bezier(0.16,1,0.3,1),transform 0.45s cubic-bezier(0.16,1,0.3,1),border-color 0.4s,box-shadow 0.6s",boxShadow:glowing?`0 0 0 1px rgba(0,0,0,0.8),0 24px 60px rgba(0,0,0,0.5),0 0 50px ${vc}10`:"0 0 0 1px rgba(0,0,0,0.8),0 24px 60px rgba(0,0,0,0.5)"}}>

    <div style={{height:3,background:`linear-gradient(90deg,transparent,${vc},transparent)`,transformOrigin:"center",animation:phase>=1?"barGrow 0.55s cubic-bezier(0.16,1,0.3,1) forwards":"none"}}/>
    <div style={{position:"absolute",top:0,left:0,right:0,height:140,background:`radial-gradient(ellipse at 50% 0%,${vc}0c 0%,transparent 70%)`,opacity:glowing?1:0,transition:"opacity 0.8s",pointerEvents:"none"}}/>

    {/* VERDICT HERO */}
    <div style={{padding:slim?"18px 20px 16px":"24px 26px 20px",borderBottom:`1px solid ${T.border}`,background:vbg,position:"relative",overflow:"hidden"}}>
      {phase>=2&&<div style={{position:"absolute",top:40,left:"50%",transform:"translateX(-50%)",width:50,height:50,border:`2px solid ${vc}`,borderRadius:"50%",animation:"ringOut 0.7s ease-out forwards",pointerEvents:"none"}}/>}

      {/* Pills */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,opacity:contentIn?1:0,transition:"opacity 0.4s 0.1s"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,0,0,0.3)",border:`1px solid ${T.borderMed}`,borderRadius:20,padding:"5px 12px 5px 8px"}}>
          <span style={{fontSize:14}}>{car.emoji}</span>
          <span style={{fontSize:T.sm,fontWeight:500,color:T.textSecondary}}>{car.name}</span>
          <span style={{color:T.textDim}}>·</span>
          <span style={{fontSize:T.sm,fontFamily:"'DM Mono',monospace",fontWeight:600,color:T.gold}}>{SGD(car.price)}</span>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${tier.color}12`,border:`1px solid ${tier.color}44`,borderRadius:20,padding:"5px 12px"}}>
          <span style={{fontSize:11}}>{tier.icon}</span>
          <span style={{fontSize:T.xs,fontWeight:600,color:tier.color}}>{tier.label}</span>
          <span style={{fontSize:T.sm,fontFamily:"'DM Mono',monospace",fontWeight:700,color:tier.color}}>{tier.display}</span>
        </div>
      </div>

      {/* Verdict row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:`radial-gradient(circle,${vc}22 0%,${vc}08 100%)`,border:`2px solid ${vc}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:glowing?`0 0 18px ${vc}45`:"none",transition:"box-shadow 0.6s"}}>
            <span style={{fontSize:19,color:vc,animation:phase>=2?"spinIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards":undefined}}>{verdictIcon}</span>
          </div>
          <div>
            <div style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,opacity:contentIn?1:0}}>Your verdict</div>
            <div style={{opacity:contentIn?1:0,animation:phase>=3?"stamp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards":undefined}}>
              <span style={{display:"inline-block",fontSize:slim?19:25,fontWeight:700,fontStyle:"italic",color:verdictTextColor,background:verdictBgColor,borderRadius:8,padding:"4px 14px",border:`1.5px solid ${vc}44`,lineHeight:1.3,letterSpacing:"-0.01em"}}>{verdict}</span>
            </div>
          </div>
        </div>
        <div style={{textAlign:"right",opacity:contentIn?1:0,transition:"opacity 0.4s 0.3s"}}>
          <div style={{fontSize:T.xs,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Instalment burden</div>
          <div style={{fontSize:32,fontFamily:"'DM Mono',monospace",fontWeight:500,color:vc,lineHeight:1}}>{(ratio*100).toFixed(1)}<span style={{fontSize:14}}>%</span></div>
          <div style={{fontSize:T.xs,color:T.textMuted,marginTop:3}}>of take-home pay</div>
        </div>
      </div>

      <p style={{marginTop:14,fontSize:T.sm,color:T.textSecondary,lineHeight:1.75,opacity:contentIn?1:0,transition:"opacity 0.5s 0.35s"}}>
        {!canDown
          ? <>Min. downpayment is <strong style={{color:T.goldLight}}>{SGD(reqDown)}</strong> ({100-car.loanCap}% of price). You're short by <strong style={{color:T.red}}>{SGD(shortfall)}</strong>.</>
          : verdict==="Affordable"
          ? <>{SGD(monthly)}/mo is {(ratio*100).toFixed(1)}% of take-home — comfortably within the 30% safe threshold. You're in good shape.</>
          : verdict==="Stretch"
          ? <>{SGD(monthly)}/mo is {(ratio*100).toFixed(1)}% of take-home. Manageable, but limited savings buffer each month.</>
          : <>{SGD(monthly)}/mo is {(ratio*100).toFixed(1)}% of take-home — above the 45% danger limit. Consider a longer tenure or a less expensive car.</>}
      </p>
    </div>

    {/* DETAILS */}
    <div style={{padding:slim?"14px 20px 22px":"18px 26px 28px"}}>
      {canDown&&<GaugeBar ratio={ratio} visible={metricsIn}/>}

      {/* Downpayment shortfall */}
      {!canDown&&<div style={{background:T.redFaint,border:"1px solid rgba(248,113,113,0.25)",borderRadius:T.r,padding:"14px 16px",marginBottom:16,opacity:metricsIn?1:0,transition:"opacity 0.5s"}}>
        <div style={{fontSize:T.xs,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>⚠ Downpayment Shortfall</div>
        <p style={{fontSize:T.sm,color:T.textSecondary,lineHeight:1.65}}>You need <strong style={{color:T.goldLight}}>{SGD(reqDown)}</strong> minimum. Save <strong style={{color:T.red}}>{SGD(shortfall)}</strong> more to qualify.</p>
      </div>}

      {/* Extra downpayment savings banner */}
      {loanReduced&&<div style={{background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:T.r,padding:"12px 16px",marginBottom:14,opacity:metricsIn?1:0,transition:"opacity 0.5s 0.1s"}}>
        <div style={{fontSize:T.xs,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>✓ Reduced Loan</div>
        <p style={{fontSize:T.sm,color:T.textSecondary,lineHeight:1.65}}>
          You're putting in <strong style={{color:T.green}}>{SGD(extraDown)}</strong> above the minimum, so your loan is reduced to <strong style={{color:T.green}}>{SGD(loan)}</strong> instead of the maximum <strong style={{color:T.textSecondary}}>{SGD(maxLoan)}</strong>. This saves you <strong style={{color:T.green}}>{SGD((maxLoan - loan) * tier.rate * tenure)}</strong> in interest.
        </p>
      </div>}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <StatBox label="Monthly instalment" value={`S$${Math.round(monthly)}`}  sub={`${tenure} yr at ${tier.display}`}      accent delay={0}   visible={metricsIn}/>
        <StatBox label="Actual loan"         value={`S$${Math.round(loan)}`}     sub={loanReduced?`Reduced from max ${SGD(maxLoan)}`:`${car.loanCap}% of price`} delay={80}  visible={metricsIn}/>
        <StatBox label="Total interest"      value={`S$${Math.round(interest)}`} sub={`Total repayable: ${SGD(repay)}`}        accent delay={160} visible={metricsIn}/>
        <StatBox label="Your take-home"      value={`S$${Math.round(takeHome)}`} sub={`30% limit: ${SGD(maxInst)}/mo`}               delay={240} visible={metricsIn}/>
      </div>

      <COOTimeline coo={coo} totalCoo={totalCoo} tenure={tenure} visible={metricsIn}/>
      <DepreciationCard r={r} tenure={tenure} visible={metricsIn}/>

      {/* Green savings */}
      {tier.id!=="ice"&&saving>0&&<div style={{display:"flex",alignItems:"flex-start",gap:12,background:`${tier.color}0d`,border:`1px solid ${tier.color}30`,borderRadius:T.r,padding:"12px 16px",marginBottom:14,opacity:metricsIn?1:0,transition:"opacity 0.5s 0.45s"}}>
        <span style={{fontSize:20,flexShrink:0}}>💰</span>
        <div>
          <div style={{fontSize:T.xs,fontWeight:700,color:tier.color,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Green rate savings vs ICE</div>
          <p style={{fontSize:T.sm,color:T.textSecondary,lineHeight:1.65}}>Save <strong style={{color:tier.color}}>{SGD(saving)}</strong> total — <strong style={{color:tier.color}}>{SGD(saving/(tenure*12))}/mo</strong> less than a petrol loan.</p>
        </div>
      </div>}

      {!slim&&<RateTable car={car} tenure={tenure} loan={loan} visible={metricsIn}/>}

      {/* Suggestion */}
      {verdict!=="Affordable"&&<div style={{background:T.goldFaint,border:`1px solid rgba(217,119,6,0.18)`,borderRadius:T.r,padding:"13px 16px",opacity:metricsIn?1:0,transition:"opacity 0.5s 0.9s"}}>
        <div style={{fontSize:T.xs,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>💡 What you could do</div>
        <p style={{fontSize:T.sm,color:T.textSecondary,lineHeight:1.75}}>
          {!canDown
            ? <>Save <strong style={{color:T.goldLight}}>{SGD(shortfall)}</strong> more. The Honda Freed or Toyota Sienta have lower minimums (~{SGD(163888*0.30)}).</>
            : verdict==="Stretch"
            ? <>Extending to 7 years lowers monthly to ~<strong style={{color:T.goldLight}}>{SGD(loan*(1+tier.rate*7)/84)}</strong>. Putting in more cash upfront also reduces your loan size.</>
            : <>Your comfortable budget is ~<strong style={{color:T.goldLight}}>{SGD(takeHome*0.30*tenure*12/(1+tier.rate*tenure)/lcPct)}</strong>. Consider the Corolla Altis, Sienta, or BYD Dolphin.</>}
        </p>
      </div>}
    </div>
    <div style={{height:1,background:`linear-gradient(90deg,transparent,rgba(217,119,6,0.15),transparent)`}}/>
  </div>;
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

  const dSalary=useDebounce(parseInt(salaryRaw||"0",10),120);
  const dDown=useDebounce(parseInt(downRaw||"0",10),120);
  const dTenure=useDebounce(tenure,80);

  const rA=(calculated&&carA)?calc(dSalary,dDown,dTenure,carA):null;
  const rB=(calculated&&carB&&mode==="compare")?calc(dSalary,dDown,dTenure,carB):null;

  const handleSalary=e=>{const r=e.target.value.replace(/\D/g,"");setSalaryRaw(r);setSalary(r?Number(r).toLocaleString("en-SG"):"");};
  const handleDown=e=>{const r=e.target.value.replace(/\D/g,"");setDownRaw(r);setDown(r?Number(r).toLocaleString("en-SG"):"");};
  const isReady=salaryRaw&&downRaw&&carA&&(mode==="single"||carB);
  const handleCalc=()=>{ setCalculated(true); setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),120); };
  const trackBg=`linear-gradient(90deg,${T.gold} ${(tenure-1)/6*100}%,rgba(255,255,255,0.1) ${(tenure-1)/6*100}%)`;

  return <>
    <style>{STYLES}</style>
    <div className="zz-root" style={{minHeight:"100vh",background:T.bg,backgroundImage:`radial-gradient(ellipse at 20% 50%,rgba(217,119,6,0.05) 0%,transparent 50%),radial-gradient(ellipse at 80% 10%,rgba(180,83,9,0.04) 0%,transparent 40%)`,display:"flex",justifyContent:"center",padding:"40px 16px 80px"}}>
      <div style={{width:"100%",maxWidth:mode==="compare"?1120:640,transition:"max-width 0.4s ease"}}>

        {/* INPUT CARD */}
        <div style={{background:T.surface,border:`1px solid rgba(217,119,6,0.2)`,borderRadius:T.rL,boxShadow:"0 0 0 1px rgba(0,0,0,0.6),0 32px 80px rgba(0,0,0,0.4)",overflow:"hidden",marginBottom:16}}>
          <div style={{height:3,background:`linear-gradient(90deg,transparent,${T.gold},${T.goldLight},${T.gold},transparent)`}}/>

          <div style={{padding:"26px 30px 22px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:6,height:6,background:T.gold,borderRadius:"50%",boxShadow:`0 0 8px ${T.gold}`}}/>
                  <span style={{fontSize:T.xs,fontFamily:"'DM Mono',monospace",fontWeight:500,color:T.textMuted,letterSpacing:"0.15em",textTransform:"uppercase"}}>Car Loan Calculator · Singapore</span>
                </div>
                <h1 style={{fontSize:T.xxl,fontWeight:600,color:T.textPrimary,lineHeight:1.15}}>My Zoom Zoom <span style={{color:T.gold,fontStyle:"italic",fontWeight:400}}>Plan</span></h1>
              </div>
              <div style={{display:"flex",background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:T.r,padding:3,alignSelf:"flex-start"}}>
                {["single","compare"].map(m=><button key={m} onClick={()=>{setMode(m);setCalculated(false);}} style={{padding:"8px 18px",fontSize:T.xs,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",borderRadius:4,border:"none",fontFamily:"'DM Sans',sans-serif",background:mode===m?`linear-gradient(135deg,${T.gold},#b45309)`:"transparent",color:mode===m?T.textPrimary:T.textMuted,transition:"all 0.2s",boxShadow:mode===m?"0 2px 8px rgba(217,119,6,0.3)":"none"}}>{m==="single"?"Single Car":"Compare Two"}</button>)}
              </div>
            </div>
          </div>

          <div style={{padding:"22px 30px 26px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:4}}>
              <MoneyInput label="Monthly Gross Salary" value={salary} onChange={handleSalary}
                hint={salaryRaw&&parseInt(salaryRaw)>0
                  ?`Take-home after CPF: S$${Math.floor(parseInt(salaryRaw)*0.8).toLocaleString("en-SG")}/mo  ·  30% limit: S$${Math.floor(parseInt(salaryRaw)*0.8*0.3).toLocaleString("en-SG")}/mo`
                  :"Gross income before CPF deductions"}/>
              <MoneyInput label="Cash Downpayment" value={down} onChange={handleDown}
                hint="Any amount above the minimum reduces your loan and saves interest"/>
            </div>

            <Divider label="Choose your car"/>
            <div style={{display:"grid",gridTemplateColumns:mode==="compare"?"1fr 1fr":"1fr",gap:28,marginBottom:4}}>
              <CarPicker value={carA} onChange={c=>{setCarA(c);setCalculated(false);}} slot="A"/>
              {mode==="compare"&&<CarPicker value={carB} onChange={c=>{setCarB(c);setCalculated(false);}} slot="B"/>}
            </div>

            <Divider label="Loan tenure"/>
            <div style={{marginBottom:26}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontSize:T.sm,fontWeight:600,color:T.textSecondary}}>How many years to repay?</div>
                  {calculated&&<div style={{fontSize:T.xs,color:T.textMuted,marginTop:2}}>Drag to update results live ↕</div>}
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontSize:T.hero,fontFamily:"'DM Mono',monospace",fontWeight:500,color:T.goldLight,lineHeight:1}}>{tenure}</span>
                  <span style={{fontSize:T.sm,color:T.textMuted}}>year{tenure>1?"s":""}</span>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,padding:"0 10px"}}>
                {[1,2,3,4,5,6,7].map(y=><div key={y} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}} onClick={()=>setTenure(y)}>
                  <div style={{width:1,height:6,background:tenure===y?T.gold:T.border}}/>
                  <span style={{fontSize:T.xs,fontFamily:"'DM Mono',monospace",color:tenure===y?T.gold:T.textMuted,fontWeight:tenure===y?600:400}}>{y}</span>
                </div>)}
              </div>
              <input type="range" className="zz-slider" min={1} max={7} step={1} value={tenure}
                onChange={e=>setTenure(Number(e.target.value))}
                style={{background:"transparent"}}
                ref={el=>{if(el){const s=document.getElementById("zz-track-style")||document.createElement("style");s.id="zz-track-style";s.textContent=`.zz-slider::-webkit-slider-runnable-track{background:${trackBg}}`;if(!s.parentNode)document.head.appendChild(s);}}}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                <span style={{fontSize:T.xs,color:T.textMuted}}>↑ Less total interest</span>
                <span style={{fontSize:T.xs,color:T.textMuted}}>Lower monthly payment ↓</span>
              </div>
            </div>

            <button onClick={handleCalc} disabled={!isReady} style={{width:"100%",padding:"15px 20px",background:isReady?`linear-gradient(135deg,${T.gold},#b45309,#92400e)`:"rgba(255,255,255,0.04)",border:isReady?`1px solid rgba(217,119,6,0.35)`:`1px solid ${T.border}`,borderRadius:T.r,color:isReady?T.textPrimary:T.textDim,fontSize:T.base,fontWeight:600,letterSpacing:"0.04em",cursor:isReady?"pointer":"not-allowed",transition:"all 0.2s",boxShadow:isReady?"0 6px 28px rgba(217,119,6,0.22)":"none"}}>
              {isReady?calculated?`↻  Recalculate${mode==="compare"?" comparison":""}`:mode==="compare"?`Compare ${carA?.short??carA?.name} vs ${carB?.short??carB?.name}  →`:`Check if I can afford the ${carA?.short??carA?.name}  →`:"Fill in all fields above to continue"}
            </button>
            {calculated&&<p style={{marginTop:8,textAlign:"center",fontSize:T.xs,color:T.textMuted}}>Results update live as you drag the tenure slider</p>}
            <p style={{marginTop:6,textAlign:"center",fontSize:T.xs,color:T.textDim}}>Prices indicative incl. COE · MAS regulations · PARF per Budget 2026 · For reference only</p>
          </div>
          <div style={{height:1,background:`linear-gradient(90deg,transparent,rgba(217,119,6,0.15),transparent)`}}/>
        </div>

        {/* RESULTS */}
        <div ref={resultsRef}>
          {mode==="single"?<ResultPanel r={rA} tenure={dTenure} visible={!!rA}/>:
          <div>
            {(rA||rB)&&<div style={{marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <span style={{fontSize:T.sm,fontWeight:600,color:T.textSecondary}}>Side-by-side comparison</span>
              {rA&&rB&&rA.monthly&&rB.monthly&&<div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:20,padding:"6px 14px"}}>
                <span style={{fontSize:T.xs,color:T.textMuted}}>Monthly diff:</span>
                <span style={{fontSize:T.sm,fontFamily:"'DM Mono',monospace",fontWeight:700,color:T.amber}}>{SGD(Math.abs(rA.monthly-rB.monthly))}/mo</span>
                <span style={{fontSize:T.xs,color:T.green,fontWeight:500}}>({rA.monthly<rB.monthly?`${rA.car.short} cheaper`:`${rB.car.short} cheaper`})</span>
              </div>}
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,alignItems:"start"}}>
              <ResultPanel r={rA} tenure={dTenure} visible={!!rA} slim/>
              <ResultPanel r={rB} tenure={dTenure} visible={!!rB} slim/>
            </div>
            {rA&&rB&&rA.canDown&&rB.canDown&&<div style={{marginTop:12,background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.rL,padding:"20px 24px"}}>
              <div style={{fontSize:T.base,fontWeight:600,color:T.textPrimary,marginBottom:4}}>Total cost comparison over {dTenure} years</div>
              <p style={{fontSize:T.sm,color:T.textMuted,marginBottom:18}}>Downpayment + all monthly instalments</p>
              {[{r:rA,slot:"A",color:T.gold},{r:rB,slot:"B",color:"#22d3ee"}].map(({r,slot,color})=>{
                const maxTco=Math.max(rA.totalCoo,rB.totalCoo);
                const pct=(r.totalCoo/maxTco)*100;
                const cheaper=r.totalCoo<=Math.min(rA.totalCoo,rB.totalCoo);
                return <div key={slot} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{background:color,color:"#000",fontSize:T.xs,fontWeight:700,borderRadius:3,padding:"2px 7px",fontFamily:"'DM Mono',monospace"}}>{slot}</span>
                      <span style={{fontSize:T.sm,fontWeight:500,color:T.textSecondary}}>{r.car.name}</span>
                      {cheaper&&<span style={{fontSize:T.xs,fontWeight:600,color:T.green,background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:4,padding:"1px 7px"}}>CHEAPER</span>}
                    </div>
                    <span style={{fontSize:T.lg,fontFamily:"'DM Mono',monospace",fontWeight:600,color}}>{SGD(r.totalCoo)}</span>
                  </div>
                  <div style={{height:8,background:"rgba(255,255,255,0.05)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:4,transition:"width 1s cubic-bezier(0.16,1,0.3,1) 0.3s"}}/>
                  </div>
                </div>;
              })}
              <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:T.sm,fontWeight:500,color:T.textSecondary}}>You save choosing {rA.totalCoo<=rB.totalCoo?rA.car.short:rB.car.short}</div>
                  <div style={{fontSize:T.xs,color:T.textMuted,marginTop:2}}>over the full {dTenure}-year period</div>
                </div>
                <span style={{fontSize:T.xxl,fontFamily:"'DM Mono',monospace",fontWeight:600,color:T.green}}>{SGD(Math.abs(rA.totalCoo-rB.totalCoo))}</span>
              </div>
            </div>}
          </div>}
        </div>
      </div>
    </div>
  </>;
}