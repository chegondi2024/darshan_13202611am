import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Ticket, Award, History, X, ChevronRight, CheckCircle, Zap, User, Loader2 } from 'lucide-react';

const PilgrimPassport = ({ onClose }) => {
   const [history, setHistory] = useState([]);
   const [savedTickets, setSavedTickets] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   // ==========================================
   // 🏛️ POSTGRESQL DATA FETCH (Phase 6)
   // ==========================================
   useEffect(() => {
      const fetchData = async () => {
         try {
            setIsLoading(true);
            
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            // Parallel fetch for speed
            const [historyRes, ticketsRes] = await Promise.all([
               fetch(`${baseUrl}/api/history`),
               fetch(`${baseUrl}/api/tickets`)
            ]);

            if (historyRes.ok && ticketsRes.ok) {
               const historyData = await historyRes.json();
               const ticketsData = await ticketsRes.json();
               
               // Formatting dates for display
               const formattedHistory = historyData.map(h => ({
                  ...h,
                  date: new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
               }));

               const formattedTickets = ticketsData.map(t => ({
                  ...t,
                  date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
               }));

               setHistory(formattedHistory);
               setSavedTickets(formattedTickets);
            } else {
               throw new Error("Sacred Grid Link Unstable");
            }
         } catch (e) {
            console.error("Database Fetch Failed:", e);
            // Fallback to local storage if DB is down (Hybrid Resilience)
            const localHistory = JSON.parse(localStorage.getItem('darshanam_history')) || [];
            const localTickets = JSON.parse(localStorage.getItem('darshanam_tickets')) || [];
            setHistory(localHistory);
            setSavedTickets(localTickets);
         } finally {
            setIsLoading(false);
         }
      };
      fetchData();
   }, []);

   return (
      <div className="absolute inset-0 bg-slate-50 z-[10000] animate-fade-in overflow-hidden font-sans text-slate-900">
         {/* Background */}
         <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <img src="/temple_bg.png" className="w-full h-full object-cover blur-3xl scale-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-slate-100/90" />
         </div>

         {/* Header */}
         <div className="relative z-10 flex items-center justify-between px-12 py-8 bg-white/80 backdrop-blur-xl border-b border-slate-200">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center shadow-2xl border border-slate-800">
                  <Shield size={28} className="text-yellow-500" />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Digital ID</span>
                  <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase leading-none">Pilgrim Passport</h1>
               </div>
            </div>
            <div className="flex gap-4 items-center">
               {isLoading && <Loader2 className="animate-spin text-slate-400" size={20} />}
               <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors border border-slate-200">
                  <X size={24} className="text-slate-500" />
               </button>
            </div>
         </div>

         {/* Layout */}
         <div className="relative z-10 max-w-7xl mx-auto p-12 grid grid-cols-12 gap-10 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
            
            {/* Left Column - ID Card */}
            <div className="col-span-4 flex flex-col gap-6">
               <div className="bg-slate-950 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <Shield size={120} />
                  </div>
                  <div className="relative z-10">
                     <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/5 mb-6 flex items-center justify-center shadow-inner">
                        <User size={40} className="text-white" />
                     </div>
                     <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Pilgrim Identity</div>
                     <div className="text-3xl font-black tracking-tighter uppercase mb-8">Sacred Explorer</div>
                     
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                           <span className="text-xs font-black uppercase tracking-widest text-slate-400">Clearance</span>
                           <span className="text-sm font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                             <ShieldCheck size={14}/> DB VERIFIED
                           </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                           <span className="text-xs font-black uppercase tracking-widest text-slate-400">Unique Hubs</span>
                           <span className="text-sm font-black uppercase tracking-widest">{history.length} / 6</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Digital Badges */}
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                     <Award size={20} className="text-yellow-600" />
                     <h3 className="text-lg font-black uppercase tracking-widest text-slate-900">Sacred Badges</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                     {history.map(item => (
                        <div key={item.id} className="aspect-square bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2 group hover:border-yellow-500 transition-all cursor-crosshair">
                           <Shield size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                           <span className="text-[8px] font-black uppercase tracking-wider text-center">{item.temple.split(' ')[0]}</span>
                        </div>
                     ))}
                     <div className="aspect-square bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locked</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column - Tickets & History */}
            <div className="col-span-8 flex flex-col gap-10">
               
               {/* Active Tickets */}
               <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Ticket size={24} className="text-slate-900" />
                        <h2 className="text-2xl font-black tracking-tighter uppercase">Active Permits</h2>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     {savedTickets.map(ticket => (
                        <div key={ticket.id} className="bg-white p-6 rounded-[2rem] border border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.1)] flex flex-col relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer">
                           <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                           
                           <div className="flex items-center justify-between mb-6">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-xl">Verified Entry</span>
                              <span className="text-xs font-black text-slate-400">{ticket.id}</span>
                           </div>
                           <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-1">{ticket.temple}</h4>
                           <p className="text-sm font-bold text-slate-500 mb-6">{ticket.type}</p>
                           
                           <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</span>
                                 <span className="text-sm font-black text-slate-900">{ticket.date}</span>
                              </div>
                              <div className="flex flex-col text-right">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Boarding</span>
                                 <span className="text-sm font-black text-slate-900">{ticket.time}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Visit History */}
               <div className="flex flex-col gap-6 pb-20">
                  <div className="flex items-center gap-3">
                     <History size={24} className="text-slate-900" />
                     <h2 className="text-2xl font-black tracking-tighter uppercase">Pilgrimage History</h2>
                  </div>
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                     {history.map((item, i) => (
                        <div key={item.id} className={`p-6 flex items-center justify-between ${i !== history.length -1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-sm ${item.aura === 'gold' ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                                 <MapPin size={20} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-base font-black uppercase tracking-tight text-slate-900">{item.temple}</span>
                                 <span className="text-xs font-bold text-slate-400">{item.date}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600 border border-slate-200">
                              <CheckCircle size={14} className="text-emerald-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Completed</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

// Help helper
const ShieldCheck = ({ size }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default PilgrimPassport;
