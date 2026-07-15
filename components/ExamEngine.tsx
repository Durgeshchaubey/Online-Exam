'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, Calculator, BookOpen, Bookmark, Edit3, HelpCircle, 
  Send, AlertCircle, Wifi, WifiOff, Camera, UserX, AlertTriangle, 
  CheckCircle, Globe, ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import { StudentProfile, Question, PaperSet, ExamSession, ProctoringAlert } from '../lib/db-store';

interface ExamEngineProps {
  profile: StudentProfile;
  paperSet: PaperSet;
  session: ExamSession;
  alerts: ProctoringAlert[];
  onAnswer: (qId: string, answer: string) => void;
  onToggleReview: (qId: string) => void;
  onUpdateRoughDraft: (draft: string) => void;
  onAddProctoringAlert: (type: ProctoringAlert['type'], severity: ProctoringAlert['severity'], description: string) => void;
  onSubmit: () => void;
}

export default function ExamEngine({
  profile,
  paperSet,
  session,
  alerts,
  onAnswer,
  onToggleReview,
  onUpdateRoughDraft,
  onAddProctoringAlert,
  onSubmit
}: ExamEngineProps) {
  const [currentSubject, setCurrentSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  
  // Floating Tools State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [showRoughSheet, setShowRoughSheet] = useState(false);
  const [roughSheetText, setRoughSheetText] = useState(session.roughSheetDraft || '');

  // Timers State (45 minutes = 2700 seconds for testing)
  const [timeLeft, setTimeLeft] = useState(2700);
  const [isInternetOnline, setIsInternetOnline] = useState(true);

  // Proctoring Simulation State
  const [webcamStreamActive, setWebcamStreamActive] = useState(false);
  const proctorVideoRef = useRef<HTMLVideoElement>(null);
  const [proctorStatusMsg, setProctorStatusMsg] = useState('Face Detected & Verified');

  // Filter questions by subject
  const subjectQuestions = paperSet.questions.filter(q => q.subject === currentSubject);
  const activeQuestion: Question = subjectQuestions[currentQuestionIndex] || subjectQuestions[0];

  // Map total question index to subject-relative index
  const getGlobalIndex = (localIndex: number) => {
    let passed = 0;
    const subjects: ('Physics' | 'Chemistry' | 'Mathematics')[] = ['Physics', 'Chemistry', 'Mathematics'];
    for (const subj of subjects) {
      if (subj === currentSubject) {
        return passed + localIndex;
      }
      passed += paperSet.questions.filter(q => q.subject === subj).length;
    }
    return localIndex;
  };

  // Auto-Save notification ticks
  const [autoSavedNotice, setAutoSavedNotice] = useState(false);

  // Focus loss & tab switching tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onAddProctoringAlert('Tab Switch', 'High', 'Candidate switched tabs or minimized the browser window.');
        alert('SECURITY WARNING: Window focus lost. Tab switches are logged automatically by the examination authorities.');
      }
    };

    const handleWindowBlur = () => {
      onAddProctoringAlert('Tab Switch', 'Medium', 'Candidate window lost focus. Multi-monitor or split screen suspected.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sync auto-save trigger visual every 8 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      setAutoSavedNotice(true);
      setTimeout(() => setAutoSavedNotice(false), 2000);
    }, 8000);
    return () => clearInterval(autoSaveInterval);
  }, []);

  // Initialize webcam stream for proctoring camera
  useEffect(() => {
    const initProctorCam = async () => {
      setWebcamStreamActive(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 120, height: 90 } });
        if (proctorVideoRef.current) {
          proctorVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Proctor webcam not available. Simulating stream feed.');
        setWebcamStreamActive(false);
      }
    };

    initProctorCam();
    return () => {
      if (proctorVideoRef.current && proctorVideoRef.current.srcObject) {
        const stream = proctorVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Calculate Cheat Risk based on Proctor alerts
  const myAlerts = alerts.filter(a => a.studentId === profile.id);
  let cheatRisk = 0;
  myAlerts.forEach(a => {
    if (a.severity === 'High') cheatRisk += 25;
    else if (a.severity === 'Medium') cheatRisk += 12;
    else cheatRisk += 5;
  });
  cheatRisk = Math.min(100, cheatRisk);

  // Formats remaining time
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remSecs = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // Handle calculator keys
  const handleCalcClick = (val: string) => {
    if (val === 'C') setCalcInput('');
    else if (val === '=') {
      try {
        // Safe evaluation
        const sanitized = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
        const res = new Function(`return ${sanitized}`)();
        setCalcInput(Number(res).toFixed(4).replace(/\.?0+$/, ''));
      } catch (e) {
        setCalcInput('Error');
      }
    } else {
      setCalcInput(prev => prev + val);
    }
  };

  // Mock proctoring alert triggers
  const triggerMockProctorWarning = (type: 'No Face Detected' | 'Looking Away' | 'Noise Detected' | 'Multiple Faces') => {
    if (type === 'No Face Detected') {
      setProctorStatusMsg('WARNING: NO FACE VISIBLE');
      onAddProctoringAlert('No Face Detected', 'High', 'AI engine flag: Candidate moved completely out of camera bounds.');
    } else if (type === 'Looking Away') {
      setProctorStatusMsg('WARNING: LOOKING AWAY');
      onAddProctoringAlert('Looking Away', 'Medium', 'AI eye-track: Gaze directed away from exam window frequently.');
    } else if (type === 'Noise Detected') {
      setProctorStatusMsg('WARNING: NOISE DETECTED');
      onAddProctoringAlert('Noise Detected', 'Medium', 'Microphone audit: Ambient talking or voice cues detected.');
    } else if (type === 'Multiple Faces') {
      setProctorStatusMsg('CRITICAL: MULTIPLE FACES');
      onAddProctoringAlert('Multiple Faces', 'High', 'AI vision: Secondary unauthorized person detected in camera quadrant.');
    }

    setTimeout(() => {
      setProctorStatusMsg('Face Detected & Verified');
    }, 4000);
  };

  // Language translated questions simulator
  const getTranslatedQuestionText = (text: string) => {
    if (language === 'EN') return text;
    // Mock Hindi translation generator for testing
    const hindiMap: Record<string, string> = {
      'Two point charges': 'दो बिंदु आवेश q₁ = +2 µC और q₂ = -8 µC 12 सेमी की दूरी पर स्थित हैं...',
      'A projectile is thrown': 'एक प्रक्षेप्य को 20 मीटर/सेकंड के प्रारंभिक वेग u के साथ 30° के कोण पर फेंका जाता है...',
      'In a photoelectric effect': 'एक प्रकाश-विद्युत प्रभाव प्रयोग में, जब 300 एनएम तरंगदैर्घ्य का प्रकाश धातु पर आपतित होता है...',
      'Identify the molecule': 'निम्नलिखित विकल्पों में से उस अणु की पहचान करें जिसका द्विध्रुव आघूर्ण शून्य है...',
      'Evaluate the limit': 'सीमा का मूल्यांकन करें: L = lim_{x → 0} (cos(x) - 1 + x²/2) / x⁴...',
      'An unbiased die': 'एक निष्पक्ष पासे को दो बार फेंका जाता है। प्राप्त संख्याओं का योग अभाज्य होने की प्रायिकता...',
    };
    const key = Object.keys(hindiMap).find(k => text.startsWith(k));
    return key ? `${hindiMap[key]} [Hindi Translation Mode]\n\n(Original: ${text})` : `[हिंदी अनुवाद]: ${text}`;
  };

  return (
    <div id="exam_engine_container" className="max-w-[1440px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 p-4">
      
      {/* LEFT COLUMN: Main exam area (9 cols) */}
      <main className="xl:col-span-9 space-y-4">
        {/* Exam Title & Subject Switcher & Timers */}
        <header className="bg-[#1A1D23] text-white rounded border border-[#2D3139] p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <div>
              <h1 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">JEE Mock CBT Assessment Set</h1>
              <span className="text-[10px] text-gray-400 font-mono">Assigned Terminal: T-24 | Candidate: {profile.name}</span>
            </div>
          </div>

          {/* Core countdown timer */}
          <div className="flex items-center gap-4 bg-[#0F1115] px-4 py-2 rounded border border-[#2D3139]">
            <Timer className="h-4 w-4 text-red-400 shrink-0" />
            <div className="text-right">
              <span className="text-gray-500 text-[9px] uppercase font-bold font-mono block">Remaining Time</span>
              <span id="countdown_clock" className="font-mono text-sm font-bold text-red-400">{formatTime(timeLeft)}</span>
            </div>
            {/* Speed test button */}
            <button 
              onClick={() => setTimeLeft(prev => Math.max(10, prev - 300))} 
              className="text-[9px] bg-[#1A1D23] text-gray-400 hover:text-white px-1.5 py-0.5 rounded font-mono border border-[#2D3139] transition cursor-pointer"
              title="Fast forward 5 minutes for demonstration"
            >
              -5m
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-indigo-400" />
            <select
              className="bg-[#0F1115] border border-[#2D3139] rounded text-xs px-2 py-1 focus:ring-1 focus:ring-indigo-500 font-medium font-mono text-gray-300"
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
            >
              <option value="EN">English</option>
              <option value="HI">हिन्दी (Hindi)</option>
            </select>
          </div>
        </header>

        {/* Subjects Tabs */}
        <div className="flex bg-[#1A1D23] rounded border border-[#2D3139] overflow-hidden shadow-2xl font-mono">
          {(['Physics', 'Chemistry', 'Mathematics'] as const).map(subj => (
            <button
              key={subj}
              onClick={() => {
                setCurrentSubject(subj);
                setCurrentQuestionIndex(0);
              }}
              className={`flex-1 text-center py-3 text-xs font-bold transition-all border-b-2 cursor-pointer uppercase ${
                currentSubject === subj 
                  ? 'border-indigo-500 bg-[#15181E] text-indigo-400' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-[#15181E]/50'
              }`}
            >
              {subj} ({paperSet.questions.filter(q => q.subject === subj).length})
            </button>
          ))}
        </div>

        {/* Current Active Question Sheet */}
        <section className="bg-[#15181E] rounded border border-[#2D3139] shadow-2xl p-6 space-y-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Q header details */}
            <div className="flex justify-between items-center border-b border-[#2D3139] pb-3">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-[#0F1115] border border-[#2D3139] px-2.5 py-1 rounded">
                Question {currentQuestionIndex + 1} of {subjectQuestions.length}
              </span>
              
              <div className="flex gap-2 text-[10px] font-semibold text-gray-400 font-mono">
                <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded">Marks: +{activeQuestion.marks}</span>
                {activeQuestion.negativeMarks < 0 && (
                  <span className="bg-red-950/20 text-red-400 border border-red-900/40 px-2 py-0.5 rounded">Negative: {activeQuestion.negativeMarks}</span>
                )}
                <span className="bg-[#0F1115] border border-[#2D3139] px-2 py-0.5 rounded uppercase">{activeQuestion.type}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2 leading-relaxed">
              <p id="question_text" className="text-white font-medium text-sm md:text-base whitespace-pre-wrap">
                {getTranslatedQuestionText(activeQuestion.questionText)}
              </p>
            </div>

            {/* Answer Selector Inputs based on Question Type */}
            <div className="pt-4 space-y-3">
              {activeQuestion.type === 'Single Correct MCQ' || activeQuestion.type === 'Assertion & Reason' ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {activeQuestion.options?.map((option, index) => {
                    const char = option.charAt(0).toLowerCase(); // 'a', 'b', 'c', 'd'
                    const isSelected = session.answers[activeQuestion.id] === char;
                    return (
                      <button
                        key={index}
                        onClick={() => onAnswer(activeQuestion.id, char)}
                        className={`w-full text-left p-3.5 rounded border text-xs md:text-sm transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-950/20 text-white font-semibold shadow-xl' 
                            : 'border-[#2D3139] hover:border-indigo-500 text-gray-300 bg-[#0F1115] hover:bg-[#1A1D23]'
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 font-mono ${
                          isSelected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-[#2D3139] bg-[#1A1D23] text-gray-400'
                        }`}>
                          <span className="text-[10px] font-bold uppercase">{char}</span>
                        </div>
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : activeQuestion.type === 'Multiple Correct' ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider mb-2">Select all correct options (Separate by comma)</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {activeQuestion.options?.map((option, index) => {
                      const char = option.charAt(0).toLowerCase();
                      const currentAnswers = session.answers[activeQuestion.id]?.split(',') || [];
                      const isSelected = currentAnswers.includes(char);
                      
                      const handleMultiClick = () => {
                        let newAnswers = [...currentAnswers];
                        if (isSelected) {
                          newAnswers = newAnswers.filter(a => a !== char);
                        } else {
                          newAnswers.push(char);
                        }
                        // Sort so matches correct answers perfectly
                        newAnswers.sort();
                        onAnswer(activeQuestion.id, newAnswers.join(','));
                      };

                      return (
                        <button
                          key={index}
                          onClick={handleMultiClick}
                          className={`w-full text-left p-3.5 rounded border text-xs md:text-sm transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-950/20 text-white font-semibold shadow-xl' 
                              : 'border-[#2D3139] hover:border-indigo-500 text-gray-300 bg-[#0F1115] hover:bg-[#1A1D23]'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 font-mono ${
                            isSelected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-[#2D3139] bg-[#1A1D23] text-gray-400'
                          }`}>
                            {isSelected && <span className="text-[9px] font-bold">✓</span>}
                          </div>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : activeQuestion.type === 'Integer Type' ? (
                <div className="max-w-xs space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">Enter Integer Answer</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Enter absolute integer"
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    value={session.answers[activeQuestion.id] || ''}
                    onChange={e => onAnswer(activeQuestion.id, e.target.value)}
                  />
                </div>
              ) : (
                /* Numerical Answer */
                <div className="max-w-xs space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">Enter Numerical Answer (up to 2 decimal places)</label>
                  <input
                    type="text"
                    placeholder="e.g. -0.79 or 1.41"
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    value={session.answers[activeQuestion.id] || ''}
                    onChange={e => onAnswer(activeQuestion.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Question bottom controls (Save/Next, Mark for Review, Clear) */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-[#2D3139] mt-8 font-mono uppercase text-xs">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => onToggleReview(activeQuestion.id)}
                className={`flex-1 sm:flex-none border text-xs font-bold py-2.5 px-4 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  session.markedForReview.includes(activeQuestion.id)
                    ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700'
                    : 'border-[#2D3139] text-gray-300 bg-[#0F1115] hover:bg-[#1A1D23]'
                }`}
              >
                <Bookmark className="h-4 w-4" /> 
                {session.markedForReview.includes(activeQuestion.id) ? 'Reviewing' : 'Review'}
              </button>
              
              <button
                onClick={() => onAnswer(activeQuestion.id, '')}
                className="border border-[#2D3139] bg-[#0F1115] text-gray-400 hover:text-white text-xs font-bold py-2.5 px-4 rounded transition-all cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="flex-1 sm:flex-none border border-[#2D3139] bg-[#0F1115] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white text-xs font-bold py-2.5 px-4 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              
              <button
                onClick={() => {
                  if (currentQuestionIndex < subjectQuestions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                  } else {
                    // wrap or subject change
                    const subjects: ('Physics' | 'Chemistry' | 'Mathematics')[] = ['Physics', 'Chemistry', 'Mathematics'];
                    const nextSubjIdx = (subjects.indexOf(currentSubject) + 1) % 3;
                    setCurrentSubject(subjects[nextSubjIdx]);
                    setCurrentQuestionIndex(0);
                  }
                }}
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-5 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Save & Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Network status and drafting alerts bar */}
        <footer className="flex justify-between items-center bg-[#1A1D23] rounded border border-[#2D3139] px-4 py-2.5 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            {isInternetOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
                <Wifi className="h-3.5 w-3.5" /> SECURE CONGESTION GATEWAY: ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-red-400 font-semibold font-mono animate-pulse">
                <WifiOff className="h-3.5 w-3.5" /> GATEWAY CONNECTION DROPPED
              </span>
            )}
            <button
              onClick={() => setIsInternetOnline(prev => !prev)}
              className="text-[9px] underline text-gray-500 hover:text-gray-300 ml-1 font-mono cursor-pointer"
              title="Test offline behavior resilience"
            >
              (Toggle Conn)
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            {autoSavedNotice ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Auto-Saved responses to secure database
              </span>
            ) : (
              <span className="opacity-60 text-gray-500">Synchronized and secure</span>
            )}
          </div>
        </footer>
      </main>

      {/* RIGHT COLUMN: Camera proctoring, Q Grid, Submission buttons (3 cols) */}
      <aside className="xl:col-span-3 space-y-4">
        
        {/* SECURE BIOMETRIC AI PROCTOR HUD */}
        <section className="bg-[#15181E] rounded border border-[#2D3139] shadow-2xl p-4 space-y-4 relative">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-rose-500" />
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">AI PROCTOR HUD</h2>
          </div>

          {/* Simulated Webcam */}
          <div className="h-28 bg-[#0F1115] rounded overflow-hidden relative border border-[#2D3139] flex flex-col items-center justify-center">
            {webcamStreamActive ? (
              <video
                ref={proctorVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1] opacity-90"
              />
            ) : (
              <img
                src={profile.photoUrl}
                alt="Proctor Webcam"
                className="w-full h-full object-cover opacity-50"
              />
            )}
            {/* Laser scanning crosshairs */}
            <div className="absolute inset-4 border border-indigo-500/10 rounded pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-red-500/20 animate-pulse pointer-events-none" />

            <div className="absolute bottom-2 inset-x-2 bg-[#0F1115]/90 border border-[#2D3139] px-2 py-0.5 rounded text-[9px] text-center font-mono text-emerald-400 font-bold">
              {proctorStatusMsg}
            </div>
          </div>

          {/* Cheat Risk Score */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Security Risk:</span>
              <strong className={cheatRisk > 40 ? 'text-red-400' : cheatRisk > 15 ? 'text-amber-400' : 'text-emerald-400'}>
                {cheatRisk}% ({cheatRisk > 40 ? 'SUSPICIOUS' : cheatRisk > 15 ? 'ELEVATED' : 'STABLE'})
              </strong>
            </div>
            <div className="h-1.5 bg-[#0F1115] rounded overflow-hidden border border-[#2D3139]">
              <div 
                className={`h-full transition-all duration-500 ${
                  cheatRisk > 40 ? 'bg-red-500' : cheatRisk > 15 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${cheatRisk}%` }}
              />
            </div>
          </div>

          {/* Simulator buttons for testing proctoring alerts */}
          <div className="bg-[#1A1D23] p-2.5 rounded border border-[#2D3139] space-y-1.5 text-center font-mono">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Simulator Alerts Injector</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => triggerMockProctorWarning('Looking Away')}
                className="bg-[#0F1115] border border-[#2D3139] text-[9px] py-1 px-1.5 rounded hover:border-indigo-500 text-gray-300 hover:text-white cursor-pointer uppercase font-bold"
              >
                Look Away
              </button>
              <button 
                onClick={() => triggerMockProctorWarning('No Face Detected')}
                className="bg-[#0F1115] border border-[#2D3139] text-[9px] py-1 px-1.5 rounded hover:border-indigo-500 text-gray-300 hover:text-white cursor-pointer uppercase font-bold"
              >
                No Face
              </button>
              <button 
                onClick={() => triggerMockProctorWarning('Noise Detected')}
                className="bg-[#0F1115] border border-[#2D3139] text-[9px] py-1 px-1.5 rounded hover:border-indigo-500 text-gray-300 hover:text-white cursor-pointer uppercase font-bold"
              >
                Voices
              </button>
              <button 
                onClick={() => triggerMockProctorWarning('Multiple Faces')}
                className="bg-[#0F1115] border border-[#2D3139] text-[9px] py-1 px-1.5 rounded hover:border-indigo-500 text-gray-300 hover:text-white cursor-pointer uppercase font-bold"
              >
                Multi-face
              </button>
            </div>
          </div>
        </section>

        {/* QUESTION PALETTE GRID */}
        <section className="bg-[#15181E] rounded border border-[#2D3139] shadow-2xl p-4 space-y-4">
          <div className="flex items-center justify-between font-mono">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Question Palette</h2>
            <span className="text-[10px] text-gray-400 font-bold">{session.markedForReview.length} Reviewing</span>
          </div>

          <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {subjectQuestions.map((q, idx) => {
              const globalIdx = getGlobalIndex(idx);
              const answer = session.answers[q.id];
              const isAnswered = answer !== undefined && answer !== '';
              const isMarkedReview = session.markedForReview.includes(q.id);
              const isVisited = session.visitedQuestions.includes(q.id);
              const isCurrent = currentQuestionIndex === idx;

              let btnBg = 'bg-[#0F1115] border-[#2D3139] text-gray-500 hover:border-gray-400';
              if (isMarkedReview) {
                btnBg = 'bg-amber-600 border-amber-700 text-white';
              } else if (isAnswered) {
                btnBg = 'bg-emerald-600 border-emerald-700 text-white';
              } else if (isVisited) {
                btnBg = 'bg-red-500 border-red-600 text-white';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-9 w-full rounded font-mono text-xs font-bold border transition-all cursor-pointer ${btnBg} ${
                    isCurrent ? 'ring-1 ring-indigo-500 scale-105 shadow-xl' : ''
                  }`}
                >
                  {(idx + 1).toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>

          {/* Palette Status Codes Legend */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-gray-400 pt-2 border-t border-[#2D3139] font-medium font-mono uppercase">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 bg-[#0F1115] rounded border border-[#2D3139]" />
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 bg-red-500 rounded border border-red-600" />
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 bg-emerald-600 rounded border border-emerald-700" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 bg-amber-500 rounded border border-amber-600" />
              <span>For Review</span>
            </div>
          </div>
        </section>

        {/* UTILITY FLOATING TOOLS (CALCULATOR & ROUGH PAD TRIGGER) */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          <button
            onClick={() => setShowCalculator(prev => !prev)}
            className={`py-2 px-3 border border-[#2D3139] text-[10px] uppercase font-bold rounded flex items-center justify-center gap-1.5 shadow-xl transition-all cursor-pointer ${
              showCalculator ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500' : 'bg-[#15181E] text-gray-400 hover:text-white hover:bg-[#1A1D23]'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" /> Calc {showCalculator ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowRoughSheet(prev => !prev)}
            className={`py-2 px-3 border border-[#2D3139] text-[10px] uppercase font-bold rounded flex items-center justify-center gap-1.5 shadow-xl transition-all cursor-pointer ${
              showRoughSheet ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500' : 'bg-[#15181E] text-gray-400 hover:text-white hover:bg-[#1A1D23]'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" /> Draft Pad
          </button>
        </div>

        {/* SCIENTIFIC CALCULATOR DRAWER */}
        {showCalculator && (
          <div className="bg-[#15181E] text-white rounded p-4 border border-[#2D3139] shadow-2xl space-y-3 relative">
            <div className="flex justify-between items-center border-b border-[#2D3139] pb-2">
              <span className="text-[10px] font-bold text-indigo-400 font-mono">SCIENTIFIC CALC v1.1</span>
              <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="bg-[#0F1115] p-2.5 rounded border border-[#2D3139] text-right font-mono text-sm min-h-[36px] overflow-x-auto text-emerald-400 font-semibold">
              {calcInput || '0'}
            </div>

            <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] uppercase">
              {['sin', 'cos', 'tan', 'C', '(', ')', '^', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', 'π', '='].map(btn => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`py-1.5 rounded font-bold transition-all cursor-pointer ${
                    btn === '=' 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 col-span-1' 
                      : btn === 'C' 
                        ? 'bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/60' 
                        : 'bg-[#0F1115] border border-[#2D3139] text-gray-300 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ROUGH SHEET WRITER DRAFT */}
        {showRoughSheet && (
          <div className="bg-[#15181E] rounded p-4 border border-[#2D3139] shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-[#2D3139] pb-2">
              <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider">Candidate Rough Notepad</span>
              <button onClick={() => setShowRoughSheet(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <textarea
              placeholder="Jot down formulas or intermediate draft calculations..."
              className="w-full h-32 border border-[#2D3139] bg-[#0F1115] rounded p-2.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
              value={roughSheetText}
              onChange={e => {
                setRoughSheetText(e.target.value);
                onUpdateRoughDraft(e.target.value);
              }}
            />
          </div>
        )}

        {/* FINAL EXAMINATION SUBMISSION BUTTON */}
        <button
          id="submit_exam_confirm_btn"
          onClick={() => {
            if (confirm('Are you absolutely certain you would like to finalize and submit your examination paper now? This action is permanent and cannot be reversed.')) {
              onSubmit();
            }
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded border border-red-500/50 flex items-center justify-center gap-2 shadow-2xl transition-all text-xs font-mono uppercase cursor-pointer"
        >
          <Send className="h-4 w-4" /> Finalize & Submit Paper
        </button>

      </aside>
    </div>
  );
}
