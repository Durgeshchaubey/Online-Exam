'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, User, Shield, RefreshCw, CheckCircle, HelpCircle 
} from 'lucide-react';
import { useAppDb } from '../lib/db-store';
import RegistrationSection from '../components/RegistrationSection';
import VerificationSection from '../components/VerificationSection';
import ExamEngine from '../components/ExamEngine';
import ResultSection from '../components/ResultSection';
import AdminDashboard from '../components/AdminDashboard';

export default function Home() {
  const [activeRole, setActiveRole] = useState<'student' | 'admin'>('student');

  // Load state database
  const db = useAppDb();

  // Find active student session
  const activeSession = db.sessions[db.profile.id];

  // Calculate quick metrics for the post-exam summary screen
  const getCompletedSessionStats = () => {
    if (!activeSession) return { attempted: 0, skipped: 12, total: 12, timeSpent: '00:00:00' };
    const paper = db.papers.find(p => p.id === activeSession.paperSetId) || db.papers[0];
    const total = paper?.questions.length || 12;
    let attempted = 0;
    
    paper?.questions.forEach(q => {
      if (activeSession.answers[q.id]) attempted++;
    });

    return {
      attempted,
      skipped: total - attempted,
      total,
      timeSpent: '00:36:18' // mock completed elapsed duration
    };
  };

  return (
    <div id="app_root" className="min-h-screen bg-[#0F1115] flex flex-col font-sans text-[#E0E2E7] antialiased">
      
      {/* GLOBAL SANDBOX NAVIGATION HEADER */}
      <header className="bg-[#1A1D23] border-b border-[#2D3139] sticky top-0 z-40 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
              <Shield className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-indigo-400">National Assessment Authority</h1>
              <p className="text-[10px] text-gray-500 font-mono">v4.8.0-STABLE // JEE-NIET-COMPLIANT</p>
            </div>
          </div>

          {/* Sandbox Role Switcher Controller */}
          <div className="flex items-center bg-[#15181E] rounded-lg p-1 border border-[#2D3139]">
            <button
              onClick={() => setActiveRole('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'student' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" /> Student Portal
            </button>
            <button
              id="admin_portal_btn"
              onClick={() => setActiveRole('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'admin' 
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30 font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Admin Console
            </button>
          </div>

        </div>
      </header>

      {/* CORE APPLICATION VIEWPORT */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start">
        
        {/* STUDENT PORTAL WORKFLOW */}
        {activeRole === 'student' && (
          <div className="w-full space-y-6">
            
            {/* Step 1: Self-Registration form */}
            {!db.profile.hasRegistered && (
              <RegistrationSection
                profile={db.profile}
                centers={db.centers}
                onRegister={db.registerStudent}
              />
            )}

            {/* Step 2: Location, WiFi & Biometrics Verification Steps */}
            {db.profile.hasRegistered && db.profile.status === 'Registered' && (
              <VerificationSection
                profile={db.profile}
                centers={db.centers}
                onComplete={(paperId) => db.createExamSession(db.profile.id, paperId)}
                onBack={() => db.setProfile(prev => ({ ...prev, hasRegistered: false }))}
              />
            )}

            {/* Step 3: Locked down examination screen */}
            {db.profile.hasRegistered && (db.profile.status === 'Exam Ongoing' || db.profile.status === 'Verified') && activeSession && (
              <ExamEngine
                profile={db.profile}
                paperSet={db.papers.find(p => p.id === activeSession.paperSetId) || db.papers[0]}
                session={activeSession}
                alerts={db.alerts}
                onAnswer={(qId, ans) => db.updateAnswers(db.profile.id, qId, ans)}
                onToggleReview={(qId) => db.toggleMarkForReview(db.profile.id, qId)}
                onUpdateRoughDraft={(draft) => db.updateRoughDraft(db.profile.id, draft)}
                onAddProctoringAlert={db.addProctoringAlert}
                onSubmit={() => db.submitExam(db.profile.id)}
              />
            )}

            {/* Step 4: Submission summary or Official scorecard release */}
            {db.profile.hasRegistered && db.profile.status === 'Exam Completed' && (
              <ResultSection
                profile={db.profile}
                result={db.results[db.profile.id]}
                cutoff={db.cutoff}
                sessionStats={getCompletedSessionStats()}
              />
            )}

          </div>
        )}

        {/* ADMINISTRATOR CONSOLE PORTAL */}
        {activeRole === 'admin' && (
          <div className="w-full">
            <AdminDashboard
              profile={db.profile}
              questions={db.questions}
              centers={db.centers}
              papers={db.papers}
              sessions={db.sessions}
              alerts={db.alerts}
              cutoff={db.cutoff}
              results={db.results}
              onAddQuestion={db.setQuestions as any}
              onGeneratePapers={db.generatePaperSets}
              onPublishResults={db.publishResultsNow}
              onResetData={db.resetAllData}
            />
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="bg-[#1A1D23] border-t border-[#2D3139] py-4 px-6 text-center text-[10px] text-gray-500 font-mono font-medium mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 National Assessment Agency. Cryptographic Secure CBT Node.</p>
          <div className="flex gap-4">
            <span className="text-emerald-400 flex items-center gap-1">● GATEWAY SECURE</span>
            <span>AUDIT SHA_256 APPROVED // IP: 192.168.1.144</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
