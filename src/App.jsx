import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UploadCloud, FileText, Download, Moon, Sun, Clock, CheckCircle, Copy } from 'lucide-react';

// ✅ UPDATED TO YOUR WINDOWS VDI NGROK LINK
const API_BASE_URL = 'https://secluding-dropout-passion.ngrok-free.dev';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    if (selected && selected.name.endsWith('.etl')) {
      setFile(selected); setDownloadUrl(''); setProgress(0);
    } else {
      toast.error('Invalid file type. Please upload a .etl file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/octet-stream': ['.etl'] }, maxFiles: 1
  });

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true); setProgress(0);
    const formData = new FormData(); formData.append('file', file);
    
    try {
      // ✅ Added Ngrok Skip Header for conversion
      const res = await axios.post(`${API_BASE_URL}/api/convert`, formData, {
        headers: { "ngrok-skip-browser-warning": "69420" }
      });
      
      const taskId = res.data.taskId;
      toast.success('File received by Windows VDI Engine.');

      const interval = setInterval(async () => {
        try {
          // ✅ Added Ngrok Skip Header for status check
          const statusRes = await axios.get(`${API_BASE_URL}/api/status/${taskId}`, {
            headers: { "ngrok-skip-browser-warning": "69420" }
          });
          
          setProgress(statusRes.data.progress);

          if (statusRes.data.status === 'error') {
            clearInterval(interval); setIsConverting(false);
            toast.error('VDI Engine Error. Check Command Prompt on VDI.');
          }

          if (statusRes.data.status === 'completed') {
            clearInterval(interval); setIsConverting(false);
            const fullUrl = `${API_BASE_URL}${statusRes.data.downloadUrl}`;
            setDownloadUrl(fullUrl);
            setHistory(prev => [{ id: taskId, name: file.name, date: new Date().toLocaleTimeString(), url: fullUrl }, ...prev]);
            toast.success('Perfect conversion complete!');
          }
        } catch (pollError) {
          clearInterval(interval); setIsConverting(false);
          toast.error('Connection lost to Windows VDI.');
        }
      }, 1500);
    } catch (err) {
      setIsConverting(false); toast.error('VDI is offline. Check Ngrok.');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Download link copied securely.');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-cyber-dark text-white' : 'bg-gray-50 text-gray-900'} cyber-bg relative overflow-hidden flex flex-col`}>
      <Toaster position="top-right" />
      <header className={`w-full p-6 flex justify-between items-center backdrop-blur-md border-b ${darkMode ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-white/50'} z-10`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-blue to-cyber-purple shadow-[0_0_15px_rgba(0,240,255,0.5)]"><Shield className="text-white w-6 h-6" /></div>
          <h1 className="text-2xl font-bold tracking-wider">NET<span className="text-cyber-blue">CONVERT</span></h1>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-white/10 transition">
          {darkMode ? <Sun className="text-cyber-blue" /> : <Moon className="text-cyber-purple" />}
        </button>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center z-10 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyber-blue to-cyber-purple">ETL to PCAP Conversion Gateway</h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Native Windows Enterprise Conversion Engine (VDI-Powered)</p>
        </div>

        <div className={`w-full p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent shadow-2xl`}>
          <div className={`w-full p-8 rounded-2xl backdrop-blur-xl ${darkMode ? 'bg-cyber-dark/80' : 'bg-white/80'} border ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-cyber-blue bg-cyber-blue/10' : darkMode ? 'border-gray-700 hover:border-cyber-purple' : 'border-gray-300 hover:border-cyber-blue'}`}>
              <input {...getInputProps()} />
              <UploadCloud className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-cyber-blue animate-bounce' : 'text-gray-400'}`} />
              <p className="text-xl font-semibold mb-2">Drag & Drop your .ETL file here</p>
            </div>

            <AnimatePresence>
              {file && !downloadUrl && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
                  <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-3"><FileText className="text-cyber-blue" /><span className="font-medium">{file.name}</span></div>
                    <button onClick={handleConvert} disabled={isConverting} className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${isConverting ? 'bg-gray-600' : 'bg-gradient-to-r from-cyber-blue to-cyber-purple hover:shadow-[0_0_20px_rgba(176,38,255,0.4)] text-white'}`}>
                      {isConverting ? 'Processing on VDI...' : 'CONVERT NOW'}
                    </button>
                  </div>
                  {isConverting && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1"><span className="text-cyber-blue">Converting via Windows Kernel...</span><span>{progress}%</span></div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <motion.div className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {downloadUrl && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`mt-6 p-6 rounded-xl border border-green-500/30 ${darkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><CheckCircle className="text-green-500 w-8 h-8" /><div><h4 className="font-bold text-lg text-green-500">Perfect Conversion</h4></div></div>
                    <div className="flex gap-3">
                      <button onClick={() => copyToClipboard(downloadUrl)} className={`p-3 rounded-lg border transition-colors ${darkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}><Copy className="w-5 h-5" /></button>
                      <a href={downloadUrl} download><button className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold bg-green-500 text-white hover:bg-green-600 transition-all"><Download className="w-5 h-5" /> DOWNLOAD .PCAP</button></a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {history.length > 0 && (
          <div className="w-full mt-12">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Clock className="text-cyber-purple" /> Local Session History</h3>
            <div className={`w-full overflow-hidden rounded-xl border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <table className="w-full text-left border-collapse">
                <thead><tr className={darkMode ? 'bg-white/5' : 'bg-gray-100'}><th className="p-4">Filename</th><th className="p-4">Timestamp</th><th className="p-4 text-right">Action</th></tr></thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx} className={`border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                      <td className="p-4 flex items-center gap-2"><FileText className="w-4 h-4 text-cyber-blue" /> {item.name}</td>
                      <td className="p-4 text-sm opacity-70">{item.date}</td>
                      <td className="p-4 text-right"><a href={item.url} download className="text-cyber-blue font-bold">Download</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className={`w-full py-6 text-center border-t backdrop-blur-sm relative z-10 ${darkMode ? 'border-white/5 bg-black/40 text-gray-400' : 'border-gray-200 bg-white/40 text-gray-600'}`}>
        <p className="text-sm font-medium">Designed by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-purple">Sahil Amin</span></p>
      </footer>
    </div>
  );
}
