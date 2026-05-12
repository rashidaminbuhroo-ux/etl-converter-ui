import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Upload, FileCode, Download, 
  Activity, Zap, History, Globe, Lock, Cpu,
  ExternalLink, ChevronRight, BarChart3
} from 'lucide-react';

const API_BASE_URL = 'https://secluding-dropout-passion.ngrok-free.dev';

export default function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [history, setHistory] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    if (selected?.name.endsWith('.etl')) {
      setFile(selected); setDownloadUrl(''); setProgress(0); setStatus('idle');
      toast.success('ETL Source Verified');
    } else {
      toast.error('Invalid Format: Please provide a standard .ETL trace');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/octet-stream': ['.etl'] }, maxFiles: 1
  });

  const handleConvert = async () => {
    if (!file) return;
    setStatus('uploading'); setProgress(15);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/convert`, formData, {
        headers: { "ngrok-skip-browser-warning": "69420" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if(percentCompleted < 90) setProgress(percentCompleted / 2); // Map upload to first 50%
        }
      });
      
      const taskId = res.data.taskId;
      setStatus('processing');

      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API_BASE_URL}/api/status/${taskId}`, {
            headers: { "ngrok-skip-browser-warning": "69420" }
          });
          
          if (statusRes.data.progress > progress) setProgress(statusRes.data.progress);

          if (statusRes.data.status === 'completed') {
            clearInterval(interval);
            const fullUrl = `${API_BASE_URL}${statusRes.data.downloadUrl}`;
            setDownloadUrl(fullUrl);
            setStatus('completed');
            setHistory(prev => [{ id: taskId, name: file.name, size: (file.size / 1024 / 1024).toFixed(2), url: fullUrl }, ...prev]);
            toast.success('PCAP Reconstruction Complete');
          }
        } catch (e) { clearInterval(interval); setStatus('idle'); }
      }, 1500);
    } catch (err) { setStatus('idle'); toast.error('VDI Engine Unreachable'); }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans selection:bg-blue-500/30">
      <Toaster shadow-xl />
      
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <nav className="relative z-20 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">NS-GATEWAY <span className="text-blue-500 text-xs font-mono border border-blue-500/30 px-1.5 py-0.5 rounded ml-2">V4.0 PRO</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Netskope Technical Escalations</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> VDI Engine: Online</div>
            <a href="https://docs.netskope.com" className="hover:text-white transition">Documentation</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Conversion Area */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#161b22] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">PCAP Reconstruction</h2>
                <p className="text-slate-400 text-sm">Upload ETL trace for Microsoft-native protocol conversion.</p>
              </div>

              <div {...getRootProps()} className={`relative group border-2 border-dashed rounded-2xl p-12 transition-all duration-500 ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-blue-500/50 hover:bg-white/[0.02]'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <p className="text-lg font-medium text-slate-200 mb-1">Drop file here or <span className="text-blue-500">browse</span></p>
                  <p className="text-xs text-slate-500 font-mono italic">Supported: Netskope Packet Capture (.ETL)</p>
                </div>
              </div>

              <AnimatePresence>
                {file && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 space-y-4">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl"><FileCode className="text-blue-400" /></div>
                        <div>
                          <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">{(file.size / 1024).toFixed(1)} KB • Source Validated</p>
                        </div>
                      </div>
                      
                      {status === 'idle' ? (
                        <button onClick={handleConvert} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                          START ANALYSIS
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 text-blue-400 text-sm font-bold italic">
                          <Activity className="w-4 h-4 animate-spin" /> {status.toUpperCase()}...
                        </div>
                      )}
                    </div>

                    {status !== 'idle' && status !== 'completed' && (
                      <div className="px-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 tracking-widest uppercase">
                          <span>VDI Processing Pipeline</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-blue-600 to-indigo-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {status === 'completed' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"><Zap className="text-green-500" /></div>
                      <div>
                        <h4 className="text-white font-bold">Analysis Ready</h4>
                        <p className="text-xs text-slate-400">PCAPNG successfully generated on Windows VDI</p>
                      </div>
                    </div>
                    <a href={downloadUrl} download className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-green-600/20 transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" /> DOWNLOAD PCAP
                    </a>
                  </div>
                </motion.div>
              )}
            </section>
          </div>

          {/* Right Column: Metadata & History */}
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-tighter"><BarChart3 className="w-4 h-4 text-blue-500" /> Engine Telemetry</h3>
              <div className="space-y-4">
                <TelemetryItem icon={<Lock className="w-3 h-3"/>} label="Encryption" value="AES-256" />
                <TelemetryItem icon={<Cpu className="w-3 h-3"/>} label="VDI Instance" value="Azure-Standard_B2s" />
                <TelemetryItem icon={<Globe className="w-3 h-3"/>} label="Latency" value="12ms" />
              </div>
            </div>

            <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-tighter"><History className="w-4 h-4 text-blue-500" /> Session History</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length > 0 ? history.map((item, i) => (
                  <div key={i} className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 text-blue-500 font-bold text-[10px]">PCAP</div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold text-slate-200 truncate">{item.name}</p>
                        <p className="text-[9px] text-slate-500">{item.size} MB</p>
                      </div>
                    </div>
                    <a href={item.url} download className="p-2 text-slate-500 hover:text-blue-400 transition"><Download className="w-4 h-4" /></a>
                  </div>
                )) : (
                  <div className="text-center py-8 opacity-20">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No active history</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-12 text-center">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
          <span className="w-12 h-px bg-slate-800" /> Powered by Netskope Cloud VDI <span className="w-12 h-px bg-slate-800" />
        </p>
      </footer>
    </div>
  );
}

function TelemetryItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/[0.03]">
      <div className="flex items-center gap-3">
        <div className="text-blue-500">{icon}</div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-[11px] font-mono text-slate-300">{value}</span>
    </div>
  );
}
