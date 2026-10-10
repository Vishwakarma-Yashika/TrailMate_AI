"use client";

import { useState } from "react";
import { Award, Bird, BookOpen, Check, ChevronRight, Compass, Footprints, Leaf, MapPin, Menu, Mountain, Sparkles, Sprout, Sun, TreePine, Trophy, Zap } from "lucide-react";

const startingQuests = [
  { id: 1, type: "OBSERVE", title: "Find 3 leaf shapes", detail: "Notice the tiny details hiding in plain sight.", xp: 50, time: "10 min", Icon: Leaf, color: "bg-[#e9f0df] text-[#55734b]" },
  { id: 2, type: "LISTEN", title: "Pause for bird song", detail: "Stand still for two minutes and tune in.", xp: 75, time: "5 min", Icon: Bird, color: "bg-[#f9efd3] text-[#9b7931]" },
  { id: 3, type: "EXPLORE", title: "Find a tiny wild thing", detail: "Spot moss, an insect, or a little sprout.", xp: 100, time: "15 min", Icon: Sprout, color: "bg-[#f8e7d9] text-[#ad704c]" }
];

const nav = [
  { label: "Explore", Icon: Compass, id: "top" },
  { label: "Nature quests", Icon: Footprints, id: "quests" },
  { label: "AI nature guide", Icon: Sparkles, id: "guide" },
  { label: "My journal", Icon: BookOpen, id: "journal" }
];

function Brand() {
  return <div className="flex items-center gap-3">
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d7f36b] text-[#173f35]"><TreePine size={23}/></div>
    <div><div className="text-[17px] font-black tracking-tight text-white">trailmate<span className="text-[#d7f36b]">.</span></div><div className="text-[9px] font-bold uppercase tracking-[.22em] text-white/50">Find your outside</div></div>
  </div>;
}

export default function Home() {
  const [quests, setQuests] = useState(startingQuests);
  const [active, setActive] = useState("Explore");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guideError, setGuideError] = useState("");

  const completed = quests.filter(q => q.done).length;
  const xp = 120 + quests.filter(q => q.done).reduce((total, q) => total + q.xp, 0);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function goTo(item) {
    setActive(item.label);
    setMobileOpen(false);
    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function finishQuest(id) {
    const quest = quests.find(q => q.id === id);
    if (quest.done) return;
    setQuests(old => old.map(q => q.id === id ? { ...q, done: true } : q));
    notify("Quest complete! +" + quest.xp + " XP earned 🌿");
  }

  function saveEntry(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setEntries(old => [{ id: Date.now(), note: note.trim(), date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }) }, ...old]);
    setNote("");
    notify("Discovery saved to your journal.");
  }

  

async function askGuide(e) {
  e.preventDefault();

  const prompt = question.trim();
  if (!prompt || isLoading) return;

  setIsLoading(true);
  setAnswer("");
  setGuideError("");

  try {
    const response = await fetch("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: prompt })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Unable to contact TrailMate.");
    }

    if (!response.body) {
      throw new Error("Streaming is not supported by this response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      setAnswer((previous) => previous + chunk);
    }

    const remaining = decoder.decode();
    if (remaining) {
      setAnswer((previous) => previous + remaining);
    }
  } catch (error) {
    setGuideError(
      error.message || "Something went wrong. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
}



  return <main id="top" className="min-h-screen bg-[#f7f7f0]">
    <div className="lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen flex-col bg-[#173f35] px-5 py-7 lg:flex">
        <Brand/>
        <p className="mb-3 mt-12 px-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-white/35">YOUR ADVENTURE</p>
        <nav className="space-y-1">{nav.map(item => <button key={item.label} onClick={() => goTo(item)} className={"flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-bold transition " + (active === item.label ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}><item.Icon size={18} className={active === item.label ? "text-[#d7f36b]" : ""}/>{item.label}{item.label === "AI nature guide" && <span className="ml-auto text-[9px] text-[#d7f36b]">BETA</span>}</button>)}</nav>
        <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="mb-2 flex items-center gap-2 text-[#d7f36b]"><Award size={17}/><span className="text-xs font-extrabold">Trail streak</span></div><div className="text-3xl font-black text-white">3 <span className="text-xs font-normal text-white/50">days exploring</span></div><div className="mt-4 flex gap-1.5">{["M","T","W","T","F","S","S"].map((d,i)=><div key={i} className={"grid h-7 flex-1 place-items-center rounded-lg text-[9px] font-bold " + (i<3 ? "bg-[#d7f36b] text-[#173f35]" : "bg-white/10 text-white/40")}>{i<3?<Check size={12}/>:d}</div>)}</div></div>
        <div className="mt-auto rounded-2xl bg-[#d7f36b] p-4 text-[#173f35]"><Sun size={18}/><p className="mt-2 text-xs font-black">A little reminder</p><p className="mt-1 text-xs leading-5">The best discovery might happen when you put your phone away.</p></div>
        <p className="mt-5 text-[10px] text-white/30">TRAILMATE AI · EARTH FIRST</p>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e8e9df] bg-[#f7f7f0]/95 px-4 backdrop-blur sm:px-7 lg:px-10">
          <div className="lg:hidden"><Brand/></div>
          <div className="hidden items-center gap-2 text-xs font-semibold text-[#798579] sm:flex"><MapPin size={14}/> Your next adventure starts nearby</div>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#e4e7db] bg-white px-3 py-2 sm:flex"><Zap size={15} className="text-[#d6a22e]"/><span className="text-xs font-extrabold">{xp} XP</span></div><button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-xl border border-[#e5e7dd] bg-white p-2 text-[#234438] lg:hidden" aria-label="Toggle navigation"><Menu size={20}/></button><div className="grid h-10 w-10 place-items-center rounded-full bg-[#dfe7d7] text-sm font-black text-[#365744]">T</div></div>
          {mobileOpen && <div className="absolute left-3 right-3 top-[64px] rounded-2xl border bg-white p-2 shadow-xl lg:hidden">{nav.map(item=><button key={item.label} onClick={()=>goTo(item)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#234438]"><item.Icon size={17}/>{item.label}</button>)}</div>}
        </header>

        <div className="mx-auto max-w-[1420px] px-4 pb-12 pt-7 sm:px-7 sm:pt-9 lg:px-10 lg:pt-10">
          <section className="relative overflow-hidden rounded-[28px] bg-[#173f35] p-6 text-white sm:p-9 lg:p-10">
            <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full border border-white/10"/><div className="absolute -right-1 -top-12 h-52 w-52 rounded-full border border-white/10"/><div className="absolute -bottom-28 right-28 h-64 w-64 rounded-full bg-[#d7f36b]/10 blur-2xl"/>
            <div className="relative z-10 max-w-[590px]"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#d7f36b]"><Compass size={13}/> YOUR OUTDOOR ERA STARTS HERE</div><h1 className="text-4xl font-black leading-[1.06] tracking-[-.045em] sm:text-5xl lg:text-[58px]">Less scrolling.<br/>More <span className="text-[#d7f36b]">wonder.</span></h1><p className="mt-4 max-w-md text-sm leading-6 text-white/65 sm:text-base">Little quests. Fresh air. Unexpected discoveries. Your next great story is waiting outside.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => goTo(nav[1])} className="inline-flex items-center gap-2 rounded-full bg-[#d7f36b] px-5 py-3 text-xs font-black text-[#173f35] hover:bg-[#e2fa8a]">Start exploring <Footprints size={16}/></button><button onClick={() => goTo(nav[2])} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-xs font-bold text-white hover:bg-white/10"><Sparkles size={15}/> Meet your AI guide</button></div></div>
            <div className="absolute bottom-0 right-0 hidden h-full w-[36%] md:block"><div className="absolute bottom-[-30px] right-[-12px] h-[280px] w-[280px] rounded-full bg-[#567654]/35"/><div className="absolute bottom-0 right-[12%] flex items-end text-[#d7f36b]/80"><TreePine size={180} strokeWidth={.7}/><TreePine size={115} strokeWidth={.7} className="-ml-16 text-[#87a47a]"/><TreePine size={145} strokeWidth={.7} className="-ml-14 text-[#b5c78d]"/></div><div className="absolute right-8 top-12 rotate-6 rounded-2xl border border-white/15 bg-white/10 p-3"><Mountain size={24} className="text-[#d7f36b]"/><p className="mt-1 text-[9px] font-extrabold uppercase tracking-widest">Go find out</p></div></div>
          </section>

          <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">{[{label:"Explorer level",value:"Trail Rookie",sub:"Your journey begins",Icon:Compass},{label:"Total experience",value:xp+" XP",sub:"Keep collecting",Icon:Zap},{label:"Quests completed",value:completed+" / "+quests.length,sub:"One step at a time",Icon:Footprints},{label:"Nature streak",value:"3 days",sub:"You're on a roll",Icon:Sun}].map(s=><div key={s.label} className="rounded-2xl border border-[#e8e9df] bg-white p-4 sm:p-5"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold text-[#7a857b] sm:text-xs">{s.label}</span><s.Icon size={16} className="text-[#718967]"/></div><div className="mt-3 text-lg font-black tracking-tight text-[#20382f] sm:text-xl">{s.value}</div><div className="mt-1 text-[10px] text-[#8a938a]">{s.sub}</div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#edf0e8]"><div className="h-full rounded-full bg-[#91a87a] transition-all" style={{width:s.label==="Quests completed" ? (completed/quests.length*100)+"%" : "35%"}}/></div></div>)}</section>

          <section className="mt-10 scroll-mt-24" id="quests"><div className="mb-4 flex items-end justify-between"><div><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#71806f]">A SMALL ADVENTURE, EVERY DAY</p><h2 className="text-xl font-black tracking-tight sm:text-2xl">Today's nature quests</h2></div><span className="text-xs font-bold text-[#526d48]">3 quests <ChevronRight size={14} className="inline"/></span></div><div className="grid gap-3 md:grid-cols-3">{quests.map(q=><article key={q.id} className={"rounded-2xl border bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg " + (q.done?"border-[#cddbbd]":"border-[#e8e9df]")}><div className="flex items-start justify-between"><div className={"grid h-12 w-12 place-items-center rounded-2xl "+q.color}><q.Icon size={23}/></div><span className="rounded-full bg-[#f3f4ed] px-2.5 py-1 text-[9px] font-extrabold tracking-widest text-[#788273]">{q.type}</span></div><h3 className="mt-5 text-base font-black">{q.title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-[#788279]">{q.detail}</p><div className="mt-5 flex items-center justify-between border-t border-[#eef0e8] pt-4"><div className="flex gap-3 text-[10px] font-bold text-[#7e897e]"><span><Sun size={13} className="mr-1 inline"/>{q.time}</span><span className="text-[#9b7931]"><Zap size={13} className="mr-1 inline"/>{q.xp} XP</span></div><button onClick={()=>finishQuest(q.id)} disabled={q.done} aria-label="Complete quest" className={"grid h-9 w-9 place-items-center rounded-full "+(q.done?"bg-[#e8f0df] text-[#53734b]":"bg-[#173f35] text-white hover:bg-[#285849]")}>{q.done?<Check size={17}/>:<ChevronRight size={18}/>}</button></div></article>)}</div></section>

          <section className="mt-10 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
            <div><div className="mb-4"><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#71806f]">YOUR NEXT WAYPOINT</p><h2 className="text-xl font-black sm:text-2xl">Adventure map</h2></div><div className="map-grid relative min-h-[290px] overflow-hidden rounded-3xl border border-[#dce2d2] p-5"><svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 340" preserveAspectRatio="xMidYMid slice"><path d="M-20 70 C100 120 120 10 220 70 S360 180 420 110 S560 60 730 130" stroke="#c5d1b8" strokeWidth="28" fill="none" strokeLinecap="round"/><path d="M-20 70 C100 120 120 10 220 70 S360 180 420 110 S560 60 730 130" stroke="#f7f7ed" strokeWidth="20" fill="none" strokeLinecap="round"/><path d="M-10 260 C120 220 180 320 280 250 S420 190 500 250 S630 300 720 230" stroke="#c5d1b8" strokeWidth="24" fill="none" strokeLinecap="round"/><path d="M110 330 C180 270 180 170 290 150 S390 90 475 115 S550 185 625 145" stroke="#7f9c68" strokeWidth="4" fill="none" strokeDasharray="7 9" strokeLinecap="round"/><g fill="#a6b99a" opacity=".5"><circle cx="90" cy="145" r="25"/><circle cx="600" cy="55" r="36"/><circle cx="570" cy="290" r="28"/></g></svg><div className="relative flex justify-between"><span className="rounded-full bg-white/90 px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#52694b]"><Compass size={13} className="mr-1 inline"/> Sample trail</span><span className="rounded-full bg-[#173f35] px-3 py-2 text-[10px] font-bold text-white">Illustrative map</span></div><div className="absolute left-[37%] top-[35%]"><div className="grid h-10 w-10 place-items-center rounded-2xl rounded-bl-sm bg-[#173f35] text-[#d7f36b] shadow-lg"><MapPin size={20}/></div><div className="ml-1 mt-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-extrabold shadow-sm">Trailhead</div></div><div className="absolute right-[16%] top-[26%] grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#d7f36b] text-[#173f35] shadow-md"><Sprout size={17}/></div><div className="absolute bottom-[24%] left-[18%] grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-white text-[#52764a] shadow-md"><Bird size={17}/></div><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 p-3"><div><p className="text-xs font-black">The Little Wander</p><p className="mt-1 text-[10px] text-[#778279]">Sample route · 20–30 min</p></div><button onClick={()=>notify("Live maps and real trail data will be added later.")} className="rounded-full bg-[#e8efdf] px-3 py-2 text-[10px] font-extrabold text-[#45633f]">View trail <ChevronRight size={13} className="ml-1 inline"/></button></div></div><p className="mt-2 text-[10px] text-[#8a938a]">Illustration only — no live location or verified trail data.</p></div>
            <div><div className="mb-4"><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#71806f]">LITTLE WINS ADD UP</p><h2 className="text-xl font-black sm:text-2xl">Trail badges</h2></div><div className="rounded-3xl border border-[#e8e9df] bg-white p-5"><div className="grid grid-cols-3 gap-3">{[{name:"Fresh Start",Icon:Sprout,earned:true},{name:"Keen Eye",Icon:Compass,earned:completed>=1},{name:"Bird Buddy",Icon:Bird,earned:completed>=2},{name:"Wanderer",Icon:Footprints,earned:completed>=3},{name:"Leaf Keeper",Icon:Leaf,earned:false},{name:"Trail Legend",Icon:Mountain,earned:false}].map(b=><div key={b.name} className={"flex flex-col items-center rounded-2xl px-1 py-3 text-center "+(b.earned?"bg-[#f1f5e9]":"bg-[#f7f7f3] opacity-45 grayscale")}><div className="grid h-11 w-11 place-items-center rounded-full bg-[#dce9ca] text-[#4d7045]"><b.Icon size={21}/></div><p className="mt-2 text-[10px] font-black">{b.name}</p></div>)}</div><div className="mt-4 rounded-2xl bg-[#173f35] p-4 text-white"><div className="flex items-center gap-2 text-[#d7f36b]"><Trophy size={17}/><span className="text-xs font-extrabold">Next milestone</span></div><p className="mt-2 text-sm font-bold">The Curious Explorer</p><p className="mt-1 text-[10px] text-white/60">Complete all 3 quests to unlock your next badge.</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#d7f36b]" style={{width:(completed/3*100)+"%"}}/></div><p className="mt-2 text-right text-[9px] text-white/60">{completed} of 3 quests</p></div></div></div>
          </section>

          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            
<div
  id="guide"
  className="scroll-mt-24 rounded-3xl bg-[#e7eddd] p-6 sm:p-7"
>
  <div className="flex items-center gap-2 text-[#5b784f]">
    <Sparkles size={18} />
    <span className="text-[10px] font-extrabold uppercase tracking-[.18em]">
      YOUR FIELD COMPANION
    </span>
  </div>

  <h2 className="mt-4 text-2xl font-black leading-tight">
    Curious about something out there?
  </h2>

  <p className="mt-2 text-xs leading-5 text-[#6d7e6b]">
    Ask me about nature, outdoor activities, wildlife, or your next adventure.
  </p>

  <form
    onSubmit={askGuide}
    className="mt-5 flex gap-2 rounded-2xl border border-[#d7dfcc] bg-white p-2"
  >
    <input
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      placeholder="Suggest 3 outdoor activities..."
      className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none"
      aria-label="Ask a nature question"
      disabled={isLoading}
    />

    <button
      type="submit"
      disabled={isLoading || !question.trim()}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#173f35] text-white disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Ask TrailMate"
    >
      {isLoading ? (
        <span className="text-xs">...</span>
      ) : (
        <ChevronRight size={18} />
      )}
    </button>
  </form>

  {isLoading && (
    <p
      className="mt-3 rounded-xl bg-white/80 p-3 text-xs text-[#4b6250]"
      role="status"
    >
      TrailMate is thinking...
    </p>
  )}

  {answer && (
    <div className="mt-3 whitespace-pre-wrap rounded-xl bg-white/80 p-4 text-xs leading-6 text-[#4b6250]">
      <p className="mb-2 font-extrabold text-[#173f35]">
        <Sparkles size={14} className="mr-1 inline" />
        TrailMate says
      </p>
      {answer}
    </div>
  )}

  {guideError && (
    <p
      className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700"
      role="alert"
    >
      {guideError}
    </p>
  )}

  <p className="mt-4 text-[10px] font-bold text-[#708269]">
    ● Powered by local Ollama AI
  </p>
</div>

            <div id="journal" className="scroll-mt-24"><div className="mb-4 flex items-end justify-between"><div><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#71806f]">COLLECT MOMENTS, NOT SCREEN TIME</p><h2 className="text-xl font-black sm:text-2xl">Nature journal</h2></div><span className="text-xs font-bold text-[#526d48]">Your discoveries</span></div><form onSubmit={saveEntry} className="rounded-2xl border border-[#e8e9df] bg-white p-4"><label htmlFor="journal" className="mb-2 block text-xs font-extrabold">What did you notice outside?</label><textarea id="journal-note" value={note} onChange={e=>setNote(e.target.value)} placeholder="A bird call, an interesting leaf, the smell after rain..." rows={3} className="w-full resize-y rounded-xl border border-[#e7e9e0] bg-[#fbfbf7] p-3 text-xs outline-none focus:border-[#9bad8b]"/><div className="mt-3 flex justify-end"><button className="rounded-full bg-[#173f35] px-4 py-2 text-xs font-bold text-white">Save discovery</button></div></form><div className="mt-3 space-y-3">{entries.map(entry=><article key={entry.id} className="flex gap-3 rounded-2xl border border-[#e8e9df] bg-white p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9efdf] text-[#5c784f]"><BookOpen size={18}/></div><div><div className="text-xs font-black">A little discovery <span className="ml-2 font-normal text-[#8b9488]">{entry.date}</span></div><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#778279]">{entry.note}</p></div></article>)}</div>{entries.length===0&&<p className="mt-3 text-xs text-[#899287]">Your saved observations will appear here.</p>}</div>
          </section>

          <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#e4e7dc] pt-6 text-center sm:flex-row sm:text-left"><Brand/><p className="text-[10px] text-[#899287]">Made for curious humans. Powered by open possibilities. 🌱</p></footer>
        </div>
      </div>
      {toast&&<div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#173f35] px-5 py-3 text-xs font-bold text-white shadow-xl">{toast}</div>}
    </div>
  </main>;
}
