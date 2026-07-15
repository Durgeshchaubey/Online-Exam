'use client';

import React, { useState } from 'react';
import { 
  Users, Layers, Award, FileText, Plus, Search, Filter, 
  MapPin, ShieldAlert, Cpu, Video, CheckCircle, RefreshCw, 
  PlusCircle, BookOpen, AlertCircle, TrendingUp, Sliders, Settings 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  StudentProfile, Question, ExamCenter, PaperSet, 
  ProctoringAlert, ExamSession, CutoffConfig, ExamResult 
} from '../lib/db-store';

interface AdminDashboardProps {
  profile: StudentProfile;
  questions: Question[];
  centers: ExamCenter[];
  papers: PaperSet[];
  sessions: Record<string, ExamSession>;
  alerts: ProctoringAlert[];
  cutoff: CutoffConfig;
  results: Record<string, ExamResult>;
  onAddQuestion: (q: Question) => void;
  onGeneratePapers: (rules: { subjectWeightage: number, totalQuestions: number, seedCount: number }) => void;
  onPublishResults: (overall: number, categories: Record<string, number>) => void;
  onResetData: () => void;
}

export default function AdminDashboard({
  profile,
  questions,
  centers,
  papers,
  sessions,
  alerts,
  cutoff,
  results,
  onAddQuestion,
  onGeneratePapers,
  onPublishResults,
  onResetData
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'live' | 'questions' | 'papers' | 'centers' | 'cutoff' | 'cctv'>('live');

  // --- QUESTIONS STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [newQ, setNewQ] = useState<Partial<Question>>({
    subject: 'Physics',
    chapter: '',
    difficulty: 'Medium',
    type: 'Single Correct MCQ',
    questionText: '',
    correctAnswer: '',
    explanation: '',
    marks: 4,
    negativeMarks: -1,
    tags: []
  });

  // --- PAPER GEN STATE ---
  const [paperSeedsCount, setPaperSeedsCount] = useState(500);

  // --- CUTOFF FORM STATE ---
  const [overallCut, setOverallCut] = useState(cutoff.overallMinMarks);
  const [catCuts, setCatCuts] = useState<Record<string, number>>({ ...cutoff.categoryCutoffs });

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  // CCTV Active Feed Index
  const [activeCctvFeed, setActiveCctvFeed] = useState<number>(0);

  // Recharts Mock Analytics Data
  const alertStatsData = [
    { name: '10:00', alerts: 2 },
    { name: '10:15', alerts: 5 },
    { name: '10:30', alerts: 14 },
    { name: '10:45', alerts: 8 },
    { name: '11:00', alerts: 22 },
    { name: '11:15', alerts: 12 },
    { name: '11:30', alerts: alerts.length || 1 }
  ];

  const centerSeatingData = centers.map(c => ({
    name: c.id,
    capacity: c.deviceCapacity,
    allocated: Math.floor(c.deviceCapacity * 0.85)
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.questionText || !newQ.correctAnswer) {
      alert('Provide question body and standard correct key answer.');
      return;
    }
    const fullQ: Question = {
      id: `${newQ.subject?.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(8)}`,
      subject: newQ.subject as any,
      chapter: newQ.chapter || 'General',
      difficulty: newQ.difficulty as any,
      type: newQ.type as any,
      questionText: newQ.questionText,
      options: newQ.type?.includes('MCQ') || newQ.type?.includes('Assertion')
        ? [
            `a) ${newQ.options?.[0] || 'Option A'}`,
            `b) ${newQ.options?.[1] || 'Option B'}`,
            `c) ${newQ.options?.[2] || 'Option C'}`,
            `d) ${newQ.options?.[3] || 'Option D'}`
          ]
        : undefined,
      correctAnswer: newQ.correctAnswer,
      explanation: newQ.explanation || 'Evaluated standard reasoning applies.',
      marks: Number(newQ.marks) || 4,
      negativeMarks: Number(newQ.negativeMarks) || -1,
      estimatedTimeSec: 120,
      tags: newQ.tags || ['Inorganic', 'JEE']
    };
    onAddQuestion(fullQ);
    alert('Question added successfully to database repository.');
    setNewQ({
      subject: 'Physics',
      chapter: '',
      difficulty: 'Medium',
      type: 'Single Correct MCQ',
      questionText: '',
      correctAnswer: '',
      explanation: '',
      marks: 4,
      negativeMarks: -1,
      tags: []
    });
  };

  return (
    <div id="admin_dashboard_container" className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      
      {/* LEFT RAIL NAVIGATION (3 cols) */}
      <aside className="lg:col-span-3 bg-[#1A1D23] text-white rounded border border-[#2D3139] p-5 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-[#2D3139]">
          <div className="h-9 w-9 bg-indigo-500/5 text-indigo-400 rounded border border-indigo-500/20 flex items-center justify-center">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight uppercase font-mono">ExamSentinel Control</h2>
            <span className="text-[10px] text-gray-400 font-mono">JEE/NIET Administrator v1.2</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-xs">
          {[
            { id: 'live', label: 'Live Audit Monitor', icon: ShieldAlert },
            { id: 'cctv', label: 'CCTV Command Center', icon: Video },
            { id: 'questions', label: 'Question Bank Manager', icon: BookOpen },
            { id: 'papers', label: 'Paper Generation Engine', icon: Layers },
            { id: 'centers', label: 'Exam Center Directory', icon: MapPin },
            { id: 'cutoff', label: 'Cut-off & Result Center', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded font-mono uppercase tracking-wider transition-all text-left cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-[#15181E]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" /> {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Diagnostic Actions */}
        <div className="pt-6 border-t border-[#2D3139] space-y-3">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Sandbox Systems</span>
          <button
            onClick={() => {
              if (confirm('Warning: This will clear all localStorage, results, sessions, custom papersets, and return all seed data to pristine states.')) {
                onResetData();
                window.location.reload();
              }
            }}
            className="w-full text-left text-[11px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider font-mono flex items-center gap-2 px-4 py-2.5 hover:bg-red-950/10 border border-red-950/20 rounded transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Wipe & Reset Simulator
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN WINDOW (9 cols) */}
      <main className="lg:col-span-9 bg-[#15181E] rounded border border-[#2D3139] shadow-2xl p-6 space-y-6">
        
        {/* TAB 1: LIVE MONITOR */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider">Live Examination Monitoring Ticker</h3>
                <p className="text-xs text-gray-400 mt-0.5">Real-time supervision of active exam centers, student phases, and proctoring logs.</p>
              </div>
              <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" title="System Status Live" />
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
              <div className="bg-[#0F1115] border border-[#2D3139] p-4 rounded space-y-1">
                <span className="text-[9px] text-gray-500 font-bold block uppercase">Total Questions</span>
                <p className="text-lg font-bold text-white">100,000+</p>
              </div>
              <div className="bg-[#0F1115] border border-[#2D3139] p-4 rounded space-y-1">
                <span className="text-[9px] text-gray-500 font-bold block uppercase">Exam Center Nodes</span>
                <p className="text-lg font-bold text-white">{centers.length} Active</p>
              </div>
              <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded space-y-1">
                <span className="text-[9px] text-indigo-400 font-bold block uppercase">Active Candidates</span>
                <p className="text-lg font-bold text-indigo-400">142,429</p>
              </div>
              <div className="bg-red-950/20 border border-red-900/40 p-4 rounded space-y-1">
                <span className="text-[9px] text-red-400 font-bold block uppercase">Proctor Flags Tally</span>
                <p className="text-lg font-bold text-red-400">{alerts.length}</p>
              </div>
            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono">
              {/* Line chart: Alert Frequency */}
              <div className="border border-[#2D3139] rounded p-4 space-y-3 bg-[#1A1D23]">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Proctor Violations Timeline</span>
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={alertStatsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3139" />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} stroke="#71717a" />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#71717a" />
                      <Tooltip contentStyle={{ backgroundColor: '#0F1115', borderColor: '#2D3139', color: '#fff' }} />
                      <Line type="monotone" dataKey="alerts" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar chart: Center seating capacities */}
              <div className="border border-[#2D3139] rounded p-4 space-y-3 bg-[#1A1D23]">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Exam Center Node Capacity</span>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={centerSeatingData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3139" />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} stroke="#71717a" />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#71717a" />
                      <Tooltip contentStyle={{ backgroundColor: '#0F1115', borderColor: '#2D3139', color: '#fff' }} />
                      <Bar dataKey="capacity" fill="#2D3139" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="allocated" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Proctor Alert Logs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">AI Proctoring Flags Real-time Ticker</h4>
              <div className="border border-[#2D3139] rounded divide-y divide-[#2D3139]/40 max-h-[300px] overflow-y-auto pr-1 bg-[#0F1115]/25">
                {alerts.length === 0 ? (
                  <p className="text-xs text-gray-500 p-8 text-center font-medium font-mono">No live security violations flagged by the AI telemetry engine.</p>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className="p-3.5 flex justify-between items-start gap-4 hover:bg-[#1A1D23]/30 transition text-xs">
                      <div className="flex gap-3">
                        <div className={`p-1.5 rounded border mt-0.5 shrink-0 ${
                          alert.severity === 'High' 
                            ? 'bg-red-950/20 border-red-900/40 text-red-400' 
                            : 'bg-amber-950/20 border-amber-900/40 text-amber-400'
                        }`}>
                          <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 font-mono">
                          <p className="font-bold text-white">{alert.studentName} ({alert.studentId})</p>
                          <p className="text-gray-300 leading-normal text-[11px]">{alert.description}</p>
                          <span className="text-[9px] text-gray-500 block">Log Hash: {alert.id}</span>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0 space-y-1 font-mono">
                        <span className="text-[9px] text-gray-500 block">{alert.timestamp}</span>
                        <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded ${
                          alert.severity === 'High' ? 'bg-red-950/40 border border-red-900/40 text-red-400' : 'bg-amber-950/40 border border-amber-900/40 text-amber-400'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CCTV FEED */}
        {activeTab === 'cctv' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider">Continuous Classroom CCTV Feeds</h3>
              <p className="text-xs text-gray-400 mt-0.5">Simulated real-time feeds synchronized with student registration logs and terminal placements.</p>
            </div>

            {/* Video Grids */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'CCTV Feed 1: Noida Main - Classroom 10A', status: 'Live feed' },
                { name: 'CCTV Feed 2: Noida Main - Classroom 12B', status: 'Live feed' },
                { name: 'CCTV Feed 3: Delhi Digital - Main Lab', status: 'Recording' },
                { name: 'CCTV Feed 4: Gurugram Hub - Terminal B', status: 'Recording' }
              ].map((feed, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCctvFeed(idx)}
                  className={`border rounded p-3 text-left space-y-2.5 transition-all overflow-hidden cursor-pointer ${
                    activeCctvFeed === idx 
                      ? 'border-indigo-600 bg-[#1A1D23] text-white' 
                      : 'border-[#2D3139] hover:border-gray-600 bg-[#0F1115]/30 text-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-[9px] font-bold tracking-widest uppercase block">{feed.status}</span>
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  </div>

                  {/* CCTV Noise Canvas */}
                  <div className="h-32 bg-black rounded relative flex items-center justify-center text-gray-500 border border-[#2D3139]/40">
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px]" />
                    <span className="text-[9px] font-mono text-center block max-w-xs leading-normal">
                      [STREAMING VIDEO FEED NODE] <br /> GATE_BSSID: {centers[idx % centers.length]?.wifiMac}
                    </span>
                    
                    {/* Timestamp overlay */}
                    <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white bg-black/80 px-1.5 py-0.5 rounded border border-[#2D3139]">
                      2026-07-15 {new Date().toLocaleTimeString()}
                    </div>
                  </div>

                  <p className="text-xs font-bold font-mono uppercase text-white leading-none">{feed.name}</p>
                </button>
              ))}
            </div>

            {/* Classroom seating map for selected active CCTV feed */}
            <div className="bg-[#1A1D23] p-5 rounded border border-[#2D3139] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">Classroom Terminal Seating Layout</span>
                <span className="text-[10px] bg-[#0F1115] border border-[#2D3139] text-gray-300 px-2.5 py-0.5 rounded font-mono font-bold">Capacity Matched: 45 Seated</span>
              </div>

              {/* Seating Grid */}
              <div className="grid grid-cols-10 gap-2 font-mono text-[10px] font-bold text-center">
                {Array.from({ length: 40 }).map((_, idx) => {
                  const seatNo = idx + 1;
                  const isSuspicious = seatNo === 12 || seatNo === 27; // Highlight simulated seats
                  const isCandidateSeat = seatNo === 15; // Represents current demo user
                  
                  return (
                    <div
                      key={idx}
                      className={`py-2 rounded border text-xs flex flex-col justify-center items-center cursor-pointer transition-all ${
                        isSuspicious 
                          ? 'bg-red-600 border-red-700 text-white ring-2 ring-red-500/50 animate-pulse' 
                          : isCandidateSeat 
                            ? 'bg-indigo-600 border-indigo-700 text-white font-black scale-105'
                            : 'bg-[#0F1115] border-[#2D3139] text-gray-400 hover:border-gray-600'
                      }`}
                      title={isSuspicious ? 'Telemetry warning on Seat' : isCandidateSeat ? 'Logged to Aravind Swamy' : 'Clean seat'}
                    >
                      S-{seatNo}
                      {isSuspicious && <span className="text-[7px] font-mono block tracking-none mt-0.5">ALERT</span>}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 font-mono font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 bg-[#0F1115] rounded border border-[#2D3139]" />
                  <span>Authorized / Idle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 bg-indigo-600 rounded border border-indigo-700" />
                  <span>Your Seat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 bg-red-600 rounded border border-red-700" />
                  <span>AI Alert Flag</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUESTION BANK */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider">Centralized Question Bank</h3>
                <p className="text-xs text-gray-400 mt-0.5">Add, search, and manage questions supporting LaTeX formatting.</p>
              </div>

              {/* Filters */}
              <div className="flex gap-2 w-full sm:w-auto font-mono">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search chapters..."
                    className="pl-9 pr-3 py-1.5 bg-[#0F1115] border border-[#2D3139] rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="bg-[#0F1115] border border-[#2D3139] rounded text-xs px-2.5 py-1.5 text-gray-300 font-bold cursor-pointer"
                  value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}
                >
                  <option value="All">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
            </div>

            {/* Question Creator Form */}
            <form onSubmit={handleCreateQuestion} className="bg-[#1A1D23] p-5 rounded border border-[#2D3139] space-y-4 font-mono">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Add New Question Node</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Subject</label>
                  <select
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                    value={newQ.subject}
                    onChange={e => setNewQ({ ...newQ, subject: e.target.value as any })}
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Chapter</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kinematics"
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    value={newQ.chapter}
                    onChange={e => setNewQ({ ...newQ, chapter: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Type</label>
                  <select
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                    value={newQ.type}
                    onChange={e => setNewQ({ ...newQ, type: e.target.value as any })}
                  >
                    <option value="Single Correct MCQ">Single Correct MCQ</option>
                    <option value="Multiple Correct">Multiple Correct</option>
                    <option value="Integer Type">Integer Type</option>
                    <option value="Numerical Answer">Numerical Answer</option>
                    <option value="Assertion & Reason">Assertion & Reason</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Difficulty</label>
                  <select
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                    value={newQ.difficulty}
                    onChange={e => setNewQ({ ...newQ, difficulty: e.target.value as any })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Question Text (Supports Math / Unicode Symbols)</label>
                <textarea
                  required
                  placeholder="e.g. Evaluate potential at node: ∫ (2x + √5) dx ..."
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newQ.questionText}
                  onChange={e => setNewQ({ ...newQ, questionText: e.target.value })}
                />
              </div>

              {(newQ.type?.includes('MCQ') || newQ.type?.includes('Assertion')) && (
                <div className="grid grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map((char, index) => (
                    <div key={char} className="space-y-0.5">
                      <label className="text-[9px] font-bold text-gray-500">Choice {char}</label>
                      <input
                        type="text"
                        required
                        placeholder={`Provide text for option ${char}`}
                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        value={newQ.options?.[index] || ''}
                        onChange={e => {
                           const opts = newQ.options ? [...newQ.options] : ['', '', '', ''];
                           opts[index] = e.target.value;
                           setNewQ({ ...newQ, options: opts });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Correct Answer Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. a or 5 or 2.5"
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                    value={newQ.correctAnswer}
                    onChange={e => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Marks</label>
                  <input
                    type="number"
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    value={newQ.marks}
                    onChange={e => setNewQ({ ...newQ, marks: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Negative Marks</label>
                  <input
                    type="number"
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    value={newQ.negativeMarks}
                    onChange={e => setNewQ({ ...newQ, negativeMarks: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded flex items-center gap-1.5 shadow-xl transition-all cursor-pointer uppercase tracking-wider"
                >
                  <PlusCircle className="h-4 w-4" /> Save Question to Bank
                </button>
              </div>
            </form>

            {/* Questions List */}
            <div className="space-y-3 font-mono">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Repository List ({filteredQuestions.length} Questions)</span>
              <div className="border border-[#2D3139] divide-y divide-[#2D3139]/40 rounded max-h-[300px] overflow-y-auto pr-1 bg-[#0F1115]/25">
                {filteredQuestions.map(q => (
                  <div key={q.id} className="p-4 hover:bg-[#1A1D23]/30 text-xs flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-[9px]">{q.id}</span>
                        <span className="text-white font-bold">{q.subject} - {q.chapter}</span>
                        <span className="text-[9px] bg-[#1A1D23] text-gray-400 border border-[#2D3139]/65 px-2 py-0.5 rounded uppercase">{q.type}</span>
                      </div>
                      <p className="text-gray-300 font-medium leading-normal">{q.questionText}</p>
                      <p className="text-[10px] text-gray-500">Correct Key Answer: <strong className="font-mono text-emerald-400">{q.correctAnswer}</strong></p>
                    </div>

                    <span className="text-[9px] text-gray-400 shrink-0 font-bold uppercase border border-[#2D3139] px-1.5 py-0.5 rounded bg-[#0F1115]">{q.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PAPER GENERATION */}
        {activeTab === 'papers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider">Automated Multi-Set Paper Generation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Generate 500+ shuffled, parallel question paper sets containing different layouts but identical syllabus bounds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono">
              {/* Generator Configuration Card */}
              <div className="bg-[#1A1D23] p-5 rounded border border-[#2D3139] space-y-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Generation Parameters</span>
                
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase block">Seed Multi-Sets Count</label>
                    <input
                      type="number"
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-xs text-white"
                      value={paperSeedsCount}
                      onChange={e => setPaperSeedsCount(Number(e.target.value))}
                    />
                    <p className="text-[9px] text-gray-500 leading-normal mt-1">Generates n unique matched paper sets with shuffled choices & ordering indices.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase block">Subject weightage ratios</label>
                    <div className="p-3 bg-[#0F1115] border border-[#2D3139] rounded font-mono text-[11px] text-gray-400 space-y-1">
                      <p className="flex justify-between"><span>Physics:</span> <strong>33.3%</strong></p>
                      <p className="flex justify-between"><span>Chemistry:</span> <strong>33.3%</strong></p>
                      <p className="flex justify-between"><span>Mathematics:</span> <strong>33.3%</strong></p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onGeneratePapers({
                      subjectWeightage: 33,
                      totalQuestions: 12,
                      seedCount: paperSeedsCount
                    });
                    alert(`Paper Generation Complete! Generated ${paperSeedsCount} parallel matched, shuffled sets successfully.`);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-1.5 shadow-xl transition uppercase tracking-wider text-xs cursor-pointer"
                >
                  <Layers className="h-4 w-4" /> Execute Automated Generation ({paperSeedsCount} Sets)
                </button>
              </div>

              {/* Status details */}
              <div className="space-y-4">
                <div className="p-4.5 bg-indigo-950/20 border border-indigo-900/40 rounded text-indigo-300 space-y-2 text-xs">
                  <span className="font-bold block uppercase tracking-wider text-[11px]">Current Paper sets database:</span>
                  <p className="font-semibold text-sm">{papers.length} Shuffled Sets Registered</p>
                  <p className="text-[9px] leading-relaxed text-gray-400 font-mono">
                    All sets possess identical syllabus distribution (Physics, Chemistry, Maths), identical negative/positive marking rules, and identical total marks. Shuffling prevents collusion.
                  </p>
                </div>

                {/* Listing of some sets */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Generated paper sets samples</span>
                  <div className="border border-[#2D3139] rounded divide-y divide-[#2D3139]/40 text-xs font-mono bg-[#0F1115] text-gray-300">
                    {papers.slice(0, 4).map(p => (
                      <div key={p.id} className="p-2.5 flex justify-between">
                        <span>{p.id} - {p.paperName}</span>
                        <strong className="text-indigo-400">{p.questions.length} Qs / {p.totalMarks} Marks</strong>
                      </div>
                    ))}
                    {papers.length > 4 && (
                      <div className="p-2 text-center text-[10px] text-gray-500 border-t border-[#2D3139]/40">
                        + {papers.length - 4} other parallel generated sets in directory...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CENTERS DIRECTORY */}
        {activeTab === 'centers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider">Certified Examination Centers Directory</h3>
              <p className="text-xs text-gray-400 mt-0.5">Physical campuses authorized to host digital entrance exams under geo-fence and router audits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {centers.map(c => (
                <div key={c.id} className="border border-[#2D3139] rounded p-4.5 space-y-3.5 bg-[#1A1D23] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#0F1115] border border-[#2D3139] text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">{c.id}</span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Online
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white leading-normal uppercase">{c.name}</h4>
                    <p className="text-[10px] text-gray-400 leading-normal">{c.address}</p>
                  </div>

                  <div className="border-t border-[#2D3139] pt-2.5 space-y-1.5 font-mono text-[10px] text-gray-400">
                    <p className="flex justify-between"><span>Wifi SSID:</span> <strong className="text-white">{c.wifiSsid}</strong></p>
                    <p className="flex justify-between"><span>Router MAC:</span> <strong className="text-white">{c.wifiMac}</strong></p>
                    <p className="flex justify-between"><span>Geo radius:</span> <strong className="text-white">{c.allowedRadiusMeters}m</strong></p>
                    <p className="flex justify-between"><span>Coordinates:</span> <strong className="text-indigo-400">{c.latitude}, {c.longitude}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CUTOFF & GRADUATION */}
        {activeTab === 'cutoff' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider">Grading Evaluation & Cut-off Management</h3>
              <p className="text-xs text-gray-400 mt-0.5">Configure Reservation Cutoffs and execute global grading scripts across the student directory database.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono">
              {/* Cutoff Setting Form */}
              <div className="bg-[#1A1D23] p-5 rounded border border-[#2D3139] space-y-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Cut-off Configuration</span>
                
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase block">General (GEN) Overall Cutoff Marks</label>
                    <input
                      type="number"
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-xs text-white"
                      value={overallCut}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setOverallCut(val);
                        setCatCuts(prev => ({ ...prev, 'General': val }));
                      }}
                    />
                  </div>

                  {/* Categorical cutoff inputs */}
                  {['OBC-NCL', 'SC', 'ST', 'EWS'].map(cat => (
                    <div key={cat} className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase block">{cat} Cutoff Marks</label>
                      <input
                        type="number"
                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-xs text-white"
                        value={catCuts[cat] || 0}
                        onChange={e => setCatCuts(prev => ({ ...prev, [cat]: Number(e.target.value) }))}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onPublishResults(overallCut, catCuts);
                    alert('Cutoffs committed successfully. Evaluated grading ranks and published results scoreboard.');
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded flex items-center justify-center gap-1.5 shadow-xl transition uppercase tracking-wider text-xs cursor-pointer"
                >
                  <Award className="h-4 w-4" /> Publish Results & Commit Cutoffs
                </button>
              </div>

              {/* Publication Status Detail */}
              <div className="space-y-4">
                <div className={`p-4.5 rounded text-xs space-y-2 border ${
                  cutoff.isPublished 
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' 
                    : 'bg-[#1A1D23] border-[#2D3139] text-gray-400'
                }`}>
                  <span className={`font-bold block flex items-center gap-1.5 uppercase tracking-wider text-[11px] ${cutoff.isPublished ? 'text-emerald-400' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" /> Result Publication Status
                  </span>
                  <p className="font-bold text-sm">
                    {cutoff.isPublished ? 'Graded & Published' : 'Scores Locked (Evaluation Pending)'}
                  </p>
                  {cutoff.isPublished && (
                    <p className="text-[9px] font-mono text-emerald-400">Committed time: {cutoff.publishTime}</p>
                  )}
                  <p className="text-[10px] leading-relaxed text-gray-400 font-mono">
                    Once published, students can instantly view their total scores, subject-wise scores, and All India Percentile Ranks. Ranks are evaluated based on total marks obtained.
                  </p>
                </div>

                {/* Evaluated results list in sandbox */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Graded Sandbox Candidates</span>
                  <div className="border border-[#2D3139] rounded divide-y divide-[#2D3139]/40 text-xs bg-[#0F1115] text-gray-300 max-h-[220px] overflow-y-auto">
                    {Object.keys(results).length === 0 ? (
                      <p className="text-[10px] text-gray-500 p-4 text-center font-medium font-mono">No candidate submissions graded yet.</p>
                    ) : (
                      Object.values(results).map(res => (
                        <div key={res.studentId} className="p-3 flex justify-between items-center hover:bg-[#1A1D23]/30 transition">
                          <div>
                            <p className="font-bold text-white">{res.studentName} ({res.studentId})</p>
                            <p className="text-[10px] text-gray-400 font-mono">Score: {res.scoreObtained}/{res.totalMarks} | Percentile: {res.percentile}%ile</p>
                          </div>
                          
                          <span className={`text-[10px] font-bold uppercase ${res.isQualified ? 'text-emerald-400' : 'text-red-400'}`}>
                            {res.isQualified ? 'Qualified' : 'Failed'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
