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
            setHistory(prev => [{ id: taskId, name: file.name, date: new Date().toLocaleTimeString(), url
