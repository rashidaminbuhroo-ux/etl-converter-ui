import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Upload, FileCode, Download, 
  Activity, Zap, History, User
} from 'lucide-react';

const API_BASE_URL = 'https://secluding-dropout-passion.ngrok-free.dev';

export default function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [history, setHistory] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    if (selected?.name.endsWith('.etl')) {
      setFile(selected); setDownloadUrl(''); setProgress(0); setStatus('idle');
      toast.success('ETL Data Stream Verified');
    } else {
      toast.error('Format Error: Please provide a .ETL trace');
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
      // 🎯 FIXED: Added timeout: 0 and headers for large file stability
      const res = await axios.post(`${API_BASE_URL}/api/convert`, formData, {
        headers: { 
          "ngrok-skip-browser-warning": "69420",
          "Content-Type": "multipart/form-data"
        },
        timeout: 0 // Wait indefinitely for big files
      });
      
      const taskId = res.data.taskId;
      setStatus('converting');

      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API_BASE_URL}/api/status/${taskId}`, {
            headers: { "ngrok-skip-browser-warning": "69420" }
          });
          if (statusRes.data.progress > progress) setProgress(statusRes.data.progress);
          if (statusRes.data.status === 'completed') {
            clearInterval(interval);
            const fullUrl = `${API_BASE_URL}${statusRes.data.downloadUrl}`;
            setDownloadUrl(fullUrl); setStatus('completed');
            setHistory(prev => [{ id: taskId, name: file.name, size: (file.size / 1024 / 1024).toFixed(2), url: fullUrl }, ...prev]);
            toast.success('Conversion Successful');
          }
        } catch (e) { clearInterval(interval); setStatus('idle'); }
      }, 2000); // Polling every 2 seconds for server stability
    } catch (err) { setStatus('idle'); toast.error('VDI Engine Offline or Timeout'); }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-0 m-0 font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" />
      
      <nav className="border-b border-white/5 bg-[#0d1117] p-6 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight uppercase">
                NS-GATEWAY <span className="text-blue-400 text-xs font-mono ml-2 border border-blue-400/30 px-1 rounded">V4.0 PRO</span>
              </h1>
              {/* 🎯 Subtitle removed for a cleaner look */}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 mb-1 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> VDI ONLINE
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                <User size={12} className="text-blue-500" /> Designed by: Sahil Amin
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#161b22] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="text-blue-500 w-5 h-5" /> PCAP Reconstruction
            </h2>
            <div {...getRootProps()} className={`group border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-blue-500/40 hover:bg-white/[0.01]'}`}>
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
              <p className="text-slate-300 text-lg">Drop ETL trace or <span className="text-blue-500 font-semibold">browse files</span></p>
              <p className="text-xs text-slate-500 mt-2 font-mono italic uppercase tracking-tighter">Native Binary Reconstruction Engine</p>
            </div>

            <AnimatePresence>
              {file && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                  <div className="bg-black/30 p-5 rounded-2xl flex justify-between items-center border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl"><FileCode className="text-blue-400 w-5 h-5" /></div>
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[250px]">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB • Integrity Verified</p>
                      </div>
                    </div>
                    {status === 'idle' ? (
                      <button onClick={handleConvert} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                        INITIATE CONVERSION
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-sm tracking-widest uppercase italic">
                        <Activity className="w-4 h-4 animate-spin" /> {status}...
                      </div>
                    )}
                  </div>
                  {status !== 'idle' && (
                    <div className="mt-6 px-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                        <span>Optimizing Packet Headers</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {status === 'completed' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3 text-green-500">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center font-bold text-lg">!</div>
                  <div>
                    <p className="font-bold text-sm">Processing Complete</p>
                    <p className="text-[10px] opacity-70 text-slate-300 italic font-mono uppercase">Output Format: Standard PCAPNG</p>
                  </div>
                </div>
                <a href={downloadUrl} download className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-green-600/20 active:scale-95">
                  DOWNLOAD PCAP
                </a>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 shadow-xl h-full">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-5 flex items-center gap-2 tracking-[0.2em]"><History size={14} className="text-blue-500"/> Recent Sessions</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-[8px]">PCAP</div>
                    <span className="text-[11px] font-bold text-slate-300 truncate">{h.name}</span>
                  </div>
                  <a href={h.url} download className="text-slate-500 hover:text-blue-400 transition-colors"><Download size={14}/></a>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 opacity-30">
                   <History size={32} className="mb-2 text-slate-600" />
                   <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">No Active Sessions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 mt-auto bg-[#0d1117]/50">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600">
          <p>© 2026 NS-GATEWAY PROJECT</p>
          <div className="flex items-center gap-4">
              <span className="text-slate-500 italic">Designed by:</span>
              <span className="text-blue-500 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 tracking-widest">SAHIL AMIN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
