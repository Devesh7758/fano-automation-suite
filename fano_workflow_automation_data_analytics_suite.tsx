import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Trash2, Plus, Download, FileSpreadsheet, Music, 
  Terminal, ShieldCheck, ShieldAlert, Cpu, Activity, CheckCircle2, 
  AlertTriangle, RefreshCw, Eye, Sparkles, Layers, ChevronRight, Server, HardDrive, FileText, Check, X, Info
} from 'lucide-react';

export default function App() {
  // Config & State Management
  const [taskInput, setTaskInput] = useState('https://tms-ext.szfano.cn/auto/admin/tasks/6acb08e1f6be30176e78937');
  const [authToken, setAuthToken] = useState('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2OWExNTJkOGM3NjllZTAwY2RlMmI3NmIiLCJ1c3IiOiJBZG1pbi1WUk4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3OTI2NzM1NjYsImV4cCI6MTc5Mzg4MzE2Nn0.76XKrYwmsiyBJEegm1hJ8UkmvrgLNmvyD4Ab1-ADeAo');
  const [projectName, setProjectName] = useState('2026-31week-DCP-1266-06-MexicanAccent-Conversation');
  const [executionMode, setExecutionMode] = useState('BOTH'); // 'BOTH' | 'EXCEL' | 'AUDIO'
  const [concurrencyLimit, setConcurrencyLimit] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // High-level Metrics
  const [metrics, setMetrics] = useState({
    totalProcessed: 142,
    audioExtractedMb: 854.2,
    excelRows: 18450,
    avgLatencyMs: 340
  });

  // Task Queue State
  const [queue, setQueue] = useState([
    {
      id: '6acb08e1f6be30176e78937',
      url: 'https://tms-ext.szfano.cn/auto/admin/tasks/6acb08e1f6be30176e78937',
      project: '2026-31week-DCP-1266-06-MexicanAccent',
      status: 'Completed',
      progress: 100,
      mode: 'BOTH',
      worker: 'Worker-1',
      rows: 142,
      audioSize: '12.4 MB'
    },
    {
      id: '7bdf09f2a7cf40287fe89048',
      url: 'https://tms-ext.szfano.cn/auto/admin/tasks/7bdf09f2a7cf40287fe89048',
      project: '2026-31week-DCP-1266-06-MexicanAccent',
      status: 'Completed',
      progress: 100,
      mode: 'BOTH',
      worker: 'Worker-2',
      rows: 98,
      audioSize: '8.7 MB'
    },
    {
      id: '8cee10a3b8da503980f90159',
      url: 'https://tms-ext.szfano.cn/auto/admin/tasks/8cee10a3b8da503980f90159',
      project: '2026-31week-DCP-1266-06-MexicanAccent',
      status: 'Failed (502)',
      progress: 45,
      mode: 'AUDIO',
      worker: 'Worker-3',
      rows: 0,
      audioSize: '0 MB'
    }
  ]);

  // Terminal Console Logs State
  const [logs, setLogs] = useState([
    { timestamp: '10:42:01', type: 'system', text: 'Fano Multi-threaded Processing Engine initialized (v3.4.0).' },
    { timestamp: '10:42:02', type: 'info', text: 'Loaded default Auth Bearer token. Target Sub: Admin-VRN.' },
    { timestamp: '10:42:05', type: 'success', text: 'Task 6acb08e1f6be30176e78937 ZIP archive extracted successfully (12.4 MB).' }
  ]);

  // Modal State for Previewing Output Data
  const [selectedPreviewTask, setSelectedPreviewTask] = useState(null);

  const logEndRef = useRef(null);

  // Auto-scroll logs terminal
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Helper for Token Security Indicator
  const isTokenValid = authToken && authToken.length > 30;

  // Add Log Entry Helper
  const addLog = (type, text) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { timestamp, type, text }]);
  };

  // Add Link / Bulk URLs to Queue
  const handleAddLink = () => {
    if (!taskInput.trim()) return;

    // Support single link or bulk new-line input
    const links = taskInput.split(/\r?\n/).filter(l => l.trim().length > 0);
    
    const newItems = links.map(link => {
      const matches = link.match(/tasks\/([a-f0-9]+)/);
      const extractedId = matches ? matches[1] : (link.trim().split('/').pop() || `task-${Date.now()}`);

      return {
        id: extractedId,
        url: link.trim(),
        project: projectName || 'Default-Fano-Project',
        status: 'Queued',
        progress: 0,
        mode: executionMode,
        worker: '-',
        rows: 0,
        audioSize: '0 MB'
      };
    });

    setQueue(prev => [...prev, ...newItems]);
    addLog('info', `Queued ${newItems.length} task(s) into multi-threaded pipeline [Mode: ${executionMode}].`);
    setTaskInput('');
  };

  // Simulated Thread Execution Logic
  useEffect(() => {
    let timer;
    if (isProcessing && !isPaused) {
      const pendingTask = queue.find(t => t.status === 'Queued');
      
      if (pendingTask) {
        // Assign Worker and set to Processing
        const workerId = `Worker-${Math.floor(Math.random() * concurrencyLimit) + 1}`;
        
        setQueue(prev => prev.map(t => 
          t.id === pendingTask.id ? { ...t, status: 'Processing', worker: workerId, progress: 15 } : t
        ));

        addLog('info', `[${workerId}] Initiating GET request -> tms-ext.szfano.cn/api/auto/tasks/${pendingTask.id}`);

        // Step 2: Mid-way progress
        setTimeout(() => {
          setQueue(prev => prev.map(t => 
            t.id === pendingTask.id ? { ...t, progress: 60 } : t
          ));

          if (pendingTask.mode === 'BOTH' || pendingTask.mode === 'AUDIO') {
            addLog('system', `[${workerId}] Receiving binary stream buffer (Content-Type: application/zip)...`);
          }
          if (pendingTask.mode === 'BOTH' || pendingTask.mode === 'EXCEL') {
            addLog('info', `[${workerId}] Parsing JSON transcription arrays into OpenPyXL data frame...`);
          }
        }, 1200);

        // Step 3: Complete Task
        setTimeout(() => {
          // 1 in 8 random chance of 502 error to showcase robustness feature
          const isError = pendingTask.id.includes('err') || Math.random() < 0.1;

          if (isError) {
            setQueue(prev => prev.map(t => 
              t.id === pendingTask.id ? { ...t, status: 'Failed (502)', progress: 40 } : t
            ));
            addLog('error', `[${workerId}] HTTP Status 502 Bad Gateway: Fano backend failed to archive task ${pendingTask.id}.`);
          } else {
            const rowsGenerated = Math.floor(Math.random() * 80) + 40;
            const mbGenerated = (Math.random() * 10 + 4).toFixed(1) + ' MB';

            setQueue(prev => prev.map(t => 
              t.id === pendingTask.id ? { 
                ...t, 
                status: 'Completed', 
                progress: 100, 
                rows: rowsGenerated,
                audioSize: mbGenerated 
              } : t
            ));

            addLog('success', `[${workerId}] Completed Task ${pendingTask.id}. [Audio: ${mbGenerated} | Excel: ${rowsGenerated} rows]`);

            // Update Global Metrics
            setMetrics(m => ({
              ...m,
              totalProcessed: m.totalProcessed + 1,
              excelRows: m.excelRows + rowsGenerated,
              audioExtractedMb: +(m.audioExtractedMb + parseFloat(mbGenerated)).toFixed(1)
            }));
          }
        }, 2600);

      } else {
        // No more pending tasks
        setIsProcessing(false);
        addLog('system', 'All queued tasks completed. ThreadPoolExecutor returned to idle.');
      }
    }

    return () => clearTimeout(timer);
  }, [isProcessing, isPaused, queue, concurrencyLimit]);

  // Handle Run Queue
  const handleRunQueue = () => {
    setIsProcessing(true);
    setIsPaused(false);
    addLog('system', 'ThreadPoolExecutor started. Spawning worker threads...');
  };

  // Handle Clear Queue
  const handleClearQueue = () => {
    setQueue([]);
    addLog('warn', 'Task queue cleared.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header / Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl shadow-lg shadow-cyan-500/20 text-slate-950">
            <Cpu className="w-6 h-6 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                Fano Automation & Data Suite
              </h1>
              <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded-full">
                v3.4 Production
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-threaded API Harvester & Excel Data Synthesizer</p>
          </div>
        </div>

        {/* Live Server & Security Badges */}
        <div className="hidden lg:flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Target Endpoint:</span>
            <span className="font-mono text-slate-200">tms-ext.szfano.cn</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            {isTokenValid ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-medium">JWT Authenticated</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium">Invalid / Missing Token</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* METRICS OVERVIEW CARDS (Top Row Span) */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Processed Tasks</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{metrics.totalProcessed}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Excel Rows Synthesized</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{metrics.excelRows.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-purple-950/60 border border-purple-800/50 rounded-lg text-purple-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Audio Extracted</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{metrics.audioExtractedMb} <span className="text-xs text-slate-400">MB</span></h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-blue-950/60 border border-blue-800/50 rounded-lg text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Latency</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{metrics.avgLatencyMs} <span className="text-xs text-slate-400">ms</span></h3>
            </div>
          </div>
        </div>

        {/* LEFT PANEL: CONFIG & TASK RUNNER INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Task Setup & Execution Configuration</span>
            </h2>

            <div className="space-y-4">
              {/* Task Link Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Task URL(s) / ID (Supports bulk list via newlines)
                </label>
                <textarea
                  rows={3}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="https://tms-ext.szfano.cn/auto/admin/tasks/6acb08e..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              {/* JWT Authorization Token Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Authorization Token (JWT Bearer)
                  </label>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isTokenValid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400'}`}>
                    {isTokenValid ? 'Token Active' : 'Required'}
                  </span>
                </div>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              {/* Project / Folder Name Override */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Folder / Batch Identifier (Export Destination)
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              {/* Execution Mode Dropdown Switcher */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Execution Mode
                  </label>
                  <select
                    value={executionMode}
                    onChange={(e) => setExecutionMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="BOTH">⚡ Both Excel & Audio</option>
                    <option value="EXCEL">📊 Excel Transcripts Only</option>
                    <option value="AUDIO">🎵 Audio ZIP Archive Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Parallel Worker Threads
                  </label>
                  <select
                    value={concurrencyLimit}
                    onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                  >
                    <option value={2}>2 Threads (Low load)</option>
                    <option value={4}>4 Threads (Optimal)</option>
                    <option value={8}>8 Threads (High throughput)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center space-x-3">
                <button
                  onClick={handleAddLink}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-semibold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Links to Queue</span>
                </button>
              </div>

            </div>
          </div>

          {/* Quick Info & Portfolio Note */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-medium">
              <Info className="w-4 h-4" />
              <span>Recruiter Live Demo Showcase</span>
            </div>
            <p className="leading-relaxed">
              This interactive dashboard simulates the enterprise multi-threaded Python backend. You can add tasks, toggle execution modes, run concurrent workers, and preview extracted audio and Excel outputs live.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: QUEUE TABLE & TERMINAL LOGS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* QUEUE TABLE SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Parallel Task Execution Queue</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {queue.filter(q => q.status === 'Queued').length} pending | {queue.filter(q => q.status === 'Processing').length} active threads
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearQueue}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                {!isProcessing ? (
                  <button
                    onClick={handleRunQueue}
                    disabled={queue.length === 0}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Batch Queue</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Task ID</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">Worker Thread</th>
                    <th className="py-2.5 px-3">Status / Progress</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                        Task queue is empty. Paste a task URL above to begin.
                      </td>
                    </tr>
                  ) : (
                    queue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          {item.id}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.mode === 'BOTH' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                            item.mode === 'EXCEL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-purple-950 text-purple-400 border border-purple-800'
                          }`}>
                            {item.mode}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {item.worker}
                        </td>
                        <td className="py-3 px-3 w-44">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className={
                                item.status === 'Completed' ? 'text-emerald-400 font-bold' :
                                item.status.includes('Failed') ? 'text-red-400 font-bold' :
                                item.status === 'Processing' ? 'text-cyan-400 font-bold animate-pulse' :
                                'text-slate-400'
                              }>
                                {item.status}
                              </span>
                              <span className="text-slate-400">{item.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  item.status === 'Completed' ? 'bg-emerald-400' :
                                  item.status.includes('Failed') ? 'bg-red-500' :
                                  'bg-cyan-400'
                                }`} 
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {item.status === 'Completed' && (
                            <button
                              onClick={() => setSelectedPreviewTask(item)}
                              className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded text-[11px] font-sans font-medium inline-flex items-center space-x-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIMULATED TERMINAL LOGS CONSOLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-72">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Multi-Worker Execution Log Output
                </h3>
              </div>
              <span className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>THREAD POOL ACTIVE</span>
              </span>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 bg-slate-950 rounded-xl p-3 font-mono text-[11px] overflow-y-auto space-y-1.5 border border-slate-800/80">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                  <span className={
                    log.type === 'error' ? 'text-red-400 font-semibold' :
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warn' ? 'text-amber-400' :
                    log.type === 'system' ? 'text-purple-400' :
                    'text-slate-300'
                  }>
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>

      </main>

      {/* INSPECTOR / PREVIEW MODAL */}
      {selectedPreviewTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  Extracted Dataset Preview
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1 font-mono">
                  Task: {selectedPreviewTask.id}
                </h3>
                <p className="text-xs text-slate-400">{selectedPreviewTask.project}</p>
              </div>
              <button
                onClick={() => setSelectedPreviewTask(null)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Data Stats inside Modal */}
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PARSED ROWS</span>
                <span className="text-slate-100 font-bold text-base">{selectedPreviewTask.rows}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">AUDIO ZIP SIZE</span>
                <span className="text-slate-100 font-bold text-base">{selectedPreviewTask.audioSize}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ZIP FORMAT</span>
                <span className="text-emerald-400 font-bold text-base">WAV Archive</span>
              </div>
            </div>

            {/* Mock Data Table Preview */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Extracted OpenPyXL Transcription Matrix</span>
              </h4>
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-2">Segment ID</th>
                      <th className="p-2">Speaker</th>
                      <th className="p-2">Transcript Content</th>
                      <th className="p-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300 font-sans">
                    <tr>
                      <td className="p-2 font-mono text-[11px] text-slate-400">seg_001</td>
                      <td className="p-2 font-semibold text-cyan-400">Speaker_A</td>
                      <td className="p-2">"Hola, ¿cómo estás el día de hoy con el proyecto?"</td>
                      <td className="p-2 font-mono text-slate-400">3.4s</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono text-[11px] text-slate-400">seg_002</td>
                      <td className="p-2 font-semibold text-emerald-400">Speaker_B</td>
                      <td className="p-2">"Todo bien, terminando de empacar las muestras de audio."</td>
                      <td className="p-2 font-mono text-slate-400">4.1s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPreviewTask(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}