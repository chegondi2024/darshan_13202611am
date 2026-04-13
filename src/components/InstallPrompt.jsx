import React, { useState, useEffect } from 'react';
import { Download, X, Zap, Shield, Smartphone } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 right-8 z-[9999] animate-bounce-subtle">
      <div className="bg-slate-950/90 backdrop-blur-2xl border border-yellow-500/50 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(234,179,8,0.3)] max-w-xs flex flex-col gap-4 relative overflow-hidden group">
        
        {/* Decorative background */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
           <Smartphone size={80} className="text-yellow-500" />
        </div>

        <button 
           onClick={() => setIsVisible(false)}
           className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
           <X size={16} />
        </button>

        <div className="flex flex-col gap-1 relative z-10">
           <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-500" />
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">System Upgrade</span>
           </div>
           <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">Install Mission HUD</h3>
           <p className="text-[10px] font-medium text-slate-400 leading-relaxed mt-1">
              Deploy Darshanam AI as a native application for high-speed tactical access and offline intelligence.
           </p>
        </div>

        <button 
           onClick={handleInstallClick}
           className="w-full py-3 bg-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
        >
           <Download size={14} />
           Initiate Deployment
        </button>

        <div className="flex items-center justify-center gap-2">
           <Shield size={10} className="text-emerald-500" />
           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none text-center">Neural Link Verified</span>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
