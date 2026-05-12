import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Upload, FileCode, Download, 
  Activity, Zap, History, Globe, Lock, Cpu, BarChart3
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
      toast.error('Invalid Format: Please upload .ETL');
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
        headers: { "ngrok-skip-browser-warning": "69420" }
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
            setDownloadUrl(fullUrl); setStatus('completed');
            setHistory(prev => [{ id: taskId, name: file.name, size: (file.size / 1024 / 1024).toFixed(2), url: fullUrl }, ...prev]);
            toast.success('PCAP Generation Complete');
          }
        } catch (e) { clearInterval(interval); setStatus('idle'); }
      }, 1500);
    } catch (err) { setStatus('idle'); toast.error('VDI Engine Offline'); }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-0 m-0">
      <Toaster position="top-right" />
      <nav className="border-b border-white/5 bg-[#0d1117] p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20"><ShieldCheck className="text-white w-6 h-6" /></div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">NS-GATEWAY <span className="text-blue-400 text-xs font-mono ml-2">V4.0 PRO</span></h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Netskope Technical Escalations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-500"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> VDI ONLINE</div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#161b22] border border-white/5 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">PCAP Reconstruction</h2>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-blue-500/40'}`}>
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <p className="text-slate-300">Drop ETL file or <span className="text-blue-500">browse</span></p>
            </div>

            <AnimatePresence>
              {file && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                  <div className="bg-black/20 p-4 rounded-xl flex justify-between items-center border border-white/5">
                    <div className="flex items-center gap-3"><FileCode className="text-blue-400" /> <span className="text-sm truncate max-w-[200px]">{file.name}</span></div>
                    {status === 'idle' ? <button onClick={handleConvert} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm">START ANALYSIS</button> : <div className="text-blue-400 font-bold text-sm animate-pulse">{status.toUpperCase()}...</div>}
                  </div>
                  {status !== 'idle' && (
                    <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {status === 'completed' && (
              <div className="mt-6 p-6 bg-green-500/10 border border-green-500/20 rounded-xl flex justify-between items-center">
                <p className="text-green-500 font-bold">Analysis Complete</p>
                <a href={downloadUrl} download className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Download size={16}/> DOWNLOAD PCAP</a>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><BarChart3 size={14}/> Engine Telemetry</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs p-2 bg-black/20 rounded-lg"><span>Encryption</span><span className="text-blue-400">AES-256</span></div>
              <div className="flex justify-between text-xs p-2 bg-black/20 rounded-lg"><span>VDI Model</span><span className="text-blue-400">Azure-Std_B2</span></div>
            </div>
          </div>
          <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><History size={14}/> History</h3>
            {history.map((h, i) => (
              <div key={i} className="text-[11px] p-2 border-b border-white/5 flex justify-between items-center">
                <span className="truncate max-w-[100px]">{h.name}</span>
                <a href={h.url} download className="text-blue-500">Download</a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
