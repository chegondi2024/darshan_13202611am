import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { X, Camera, Shield, Users, Activity, Zap, AlertTriangle } from 'lucide-react';

const GeoVisionScanner = ({ onClose, onDensityUpdate, sector = 'global' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [pilgrimCount, setPilgrimCount] = useState(0);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastLogTime, setLastLogTime] = useState(null);

  // Load the AI model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        // Wait for TFJS to be ready
        await tf.ready();
        const loadedModel = await cocoSsd.load({
           base: 'mobilenet_v2' // Faster for standard hardware
        });
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (err) {
        console.error("TFJS Model Load Error:", err);
        setError("AI Neural Link Failed: Models could not be synchronized.");
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  // Setup Webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Webcam Access Error:", err);
      setError("Webcam Access Required. Please enable camera permissions.");
    }
  };

  useEffect(() => {
     startCamera();
     return () => {
        if (videoRef.current && videoRef.current.srcObject) {
           videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
     };
  }, []);

  // 🏛️ DB AUTO-LOGGING (V7.0)
  // Automatically persists pilgrim count to PostgreSQL every 10 seconds
  useEffect(() => {
    if (!isCameraActive || isModelLoading) return;

    const logToDb = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await fetch(`${baseUrl}/api/vision-log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sector, pilgrim_count: pilgrimCount })
        });
        setLastLogTime(new Date().toLocaleTimeString());
      } catch (e) {
        console.error("Vision Logging Failed:", e);
      }
    };

    const interval = setInterval(logToDb, 10000); // 10s Tactical Pulse
    return () => clearInterval(interval);
  }, [isCameraActive, isModelLoading, pilgrimCount, sector]);

  // Detection Loop
  useEffect(() => {
    let animationId;
    
    const detectFrame = async () => {
      if (model && videoRef.current && videoRef.current.readyState === 4) {
        const predictions = await model.detect(videoRef.current);
        
        // Filter for "person" class only
        const persons = predictions.filter(p => p.class === 'person');
        setPilgrimCount(persons.length);
        if (onDensityUpdate) onDensityUpdate(persons.length);

        // Draw bounding boxes
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        persons.forEach(prediction => {
          const [x, y, width, height] = prediction.bbox;
          
          // Draw tactical box
          ctx.strokeStyle = '#eab308'; // yellow-500
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          // Draw label background
          ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
          ctx.fillRect(x, y - 20, 100, 20);

          // Draw label text
          ctx.fillStyle = 'black';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(`PILGRIM: ${Math.round(prediction.score * 100)}%`, x + 5, y - 7);
        });
      }
      animationId = requestAnimationFrame(detectFrame);
    };

    if (model && isCameraActive) {
      detectFrame();
    }

    return () => cancelAnimationFrame(animationId);
  }, [model, isCameraActive, onDensityUpdate]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-8 animate-fade-in">
       <div className="bg-slate-900 w-full max-w-4xl rounded-[3rem] border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col">
          
          {/* Header */}
          <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center">
                   <Activity size={24} className="text-red-600 animate-pulse" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">GeoVision Neural Scanner</h2>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Live AI Crowd Analysis Matrix</div>
                </div>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-all text-slate-400 hover:text-white">
                <X size={24} />
             </button>
          </div>

          <div className="flex-1 grid grid-cols-12">
             {/* Feed View */}
             <div className="col-span-8 bg-black relative flex items-center justify-center p-4">
                {isModelLoading && (
                   <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 gap-4">
                      <Zap size={40} className="text-yellow-500 animate-bounce" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">Synchronizing AI Neural Hub...</span>
                   </div>
                )}
                
                {error ? (
                   <div className="flex flex-col items-center gap-4 text-center p-10">
                      <AlertTriangle size={60} className="text-red-500" />
                      <p className="text-white text-lg font-bold">{error}</p>
                   </div>
                ) : (
                   <div className="relative rounded-2xl overflow-hidden border border-slate-800 w-full aspect-video shadow-2xl">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                      <canvas 
                        ref={canvasRef} 
                        width={640} 
                        height={480} 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                      
                      {/* Scanning Line Effect */}
                      <div className="absolute inset-x-0 h-1 bg-yellow-500/30 animate-scan-y z-30 pointer-events-none shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                   </div>
                )}
             </div>

             {/* Tactical Metadata */}
             <div className="col-span-4 p-8 bg-slate-950 border-l border-slate-800 flex flex-col gap-6">
                
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-2">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Identification</div>
                   <div className="flex items-end gap-2">
                      <span className="text-6xl font-black text-yellow-500 leading-none">{pilgrimCount}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilgrims</span>
                   </div>
                </div>

                <div className="flex flex-col gap-4">
                   <TacticalStat icon={<Users size={16} />} label="Density Status" value={pilgrimCount === 0 ? "EMPTY" : pilgrimCount < 3 ? "OPTIMAL" : "CONGESTED"} color={pilgrimCount < 3 ? "text-emerald-500" : "text-red-500"} />
                   <TacticalStat icon={<Shield size={16} />} label="Neural Conf." value="98.2%" color="text-yellow-500" />
                   <TacticalStat icon={<Activity size={16} />} label="AI Latency" value="12ms" color="text-slate-400" />
                   {lastLogTime && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                         <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Neural Log Active: {lastLogTime}</span>
                      </div>
                   )}
                </div>

                <div className="mt-auto p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                   <Users size={18} className="text-yellow-500 shrink-0" />
                   <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                      "Real-time object detection active. Detecting class 'person' with MobileNet-SSD. Sector density data synchronized with Master Ticker."
                   </p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const TacticalStat = ({ icon, label, value, color }) => (
  <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
     <div className="flex items-center gap-3">
        <div className="text-slate-500">{icon}</div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     </div>
     <span className={`text-[11px] font-black uppercase tracking-widest ${color}`}>{value}</span>
  </div>
);

export default GeoVisionScanner;
