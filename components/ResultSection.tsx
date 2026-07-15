'use client';

import React, { useRef } from 'react';
import { 
  FileText, Award, Calendar, CheckCircle2, Eye, ShieldAlert, 
  Download, Printer, AlertTriangle, ArrowRight, BookOpen, Clock 
} from 'lucide-react';
import { StudentProfile, ExamResult, CutoffConfig } from '../lib/db-store';

interface ResultSectionProps {
  profile: StudentProfile;
  result?: ExamResult;
  cutoff: CutoffConfig;
  sessionStats?: {
    attempted: number;
    skipped: number;
    total: number;
    timeSpent: string;
  };
}

export default function ResultSection({ profile, result, cutoff, sessionStats }: ResultSectionProps) {
  const scorecardRef = useRef<HTMLDivElement>(null);

  const handlePrintScorecard = () => {
    // Elegant native print of only the scorecard card block
    const printContent = scorecardRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      // Direct high-fidelity simulated print action in iFrame
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>JEE/NIET Official Scorecard - ${profile.name}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
                .cert-container { border: 4px double #475569; padding: 30px; border-radius: 12px; }
                .flex-row { display: flex; justify-content: space-between; align-items: center; }
                .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; }
                .subject-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
                .subject-table th, .subject-table td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
                .subject-table th { bg-color: #f1f5f9; }
                .badge { padding: 6px 12px; border-radius: 9999px; font-weight: bold; }
                .success { background-color: #dcfce7; color: #15803d; }
                .failure { background-color: #fee2e2; color: #b91c1c; }
              </style>
            </head>
            <body>
              <div class="cert-container">${printContent}</div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert('Simulated Scorecard PDF download initiated! Official JEE_Score_Secure.pdf saved successfully.');
      }
    }
  };

  // State A: Exam is complete but results are NOT published (Immediate Post-Exam Summary)
  if (!cutoff.isPublished || !result) {
    const attemptedCount = sessionStats?.attempted ?? 10;
    const skippedCount = sessionStats?.skipped ?? 2;
    const totalCount = sessionStats?.total ?? 12;
    const timeTaken = sessionStats?.timeSpent ?? '00:38:14';

    return (
      <div id="post_exam_summary_container" className="max-w-2xl mx-auto bg-[#15181E] rounded border border-[#2D3139] overflow-hidden shadow-2xl">
        {/* Success header banner */}
        <div className="bg-[#1A1D23] border-b border-[#2D3139] px-8 py-10 text-white text-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          <div className="h-14 w-14 bg-[#0F1115] text-emerald-400 rounded border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="h-8 w-8 stroke-[2]" />
          </div>
          <h2 id="post_exam_title" className="text-xl font-bold uppercase tracking-wider text-emerald-400 font-mono">Examination Submission Confirmed</h2>
          <p className="text-gray-400 text-xs mt-1.5 font-medium font-mono">Your response data packages have been successfully decrypted and locked for auditing.</p>
        </div>

        {/* Exam stats and notice */}
        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider block">Candidate Terminal Logs</span>
            <p className="text-sm font-semibold text-white font-mono uppercase">Exam Session: {profile.course}</p>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 font-mono">
            <div className="bg-[#0F1115] p-4 rounded border border-[#2D3139] text-center space-y-1">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Questions</span>
              <span className="text-lg font-extrabold text-white">{totalCount}</span>
            </div>
            <div className="bg-emerald-950/20 p-4 rounded border border-emerald-900/40 text-center space-y-1">
              <span className="text-[9px] text-emerald-400 font-bold block uppercase">Attempted</span>
              <span className="text-lg font-extrabold text-emerald-400">{attemptedCount}</span>
            </div>
            <div className="bg-[#0F1115] p-4 rounded border border-[#2D3139] text-center space-y-1">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Skipped</span>
              <span className="text-lg font-extrabold text-gray-400">{skippedCount}</span>
            </div>
            <div className="bg-[#0F1115] p-4 rounded border border-[#2D3139] text-center space-y-1">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Time Spent</span>
              <span className="text-sm font-extrabold text-gray-300">{timeTaken}</span>
            </div>
          </div>

          {/* Reassuring notice strictly concealing scores */}
          <div className="bg-[#1A1D23] border border-[#2D3139] p-5 rounded flex items-start gap-4">
            <ShieldAlert className="h-6 w-6 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-gray-300">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">JEE/NIET Core Safety Policy Notice</h4>
              <p className="text-xs leading-normal text-gray-400">
                To guarantee equal grading standards and maintain examination integrity across all 500+ paper sets, **individual marks, correct answers, or qualifying outcomes are strictly concealed for exactly 24 hours**. 
              </p>
              <div className="flex items-center gap-1.5 pt-2 font-semibold text-xs text-indigo-400 font-mono uppercase">
                <span>Evaluation phase active</span> <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2D3139] text-center">
            <p className="text-[11px] text-gray-500 max-w-md mx-auto">
              You will receive an automated SMS/Email notification once the exam administrators release the qualifying percentiles and officially authorize scorecard downloads.
            </p>
            {/* Simulator Bypass Help */}
            <div className="mt-4 p-3.5 bg-indigo-950/20 border border-indigo-900/40 rounded max-w-sm mx-auto text-indigo-200 text-xs font-mono">
              <span className="font-bold block text-indigo-400 mb-1">💡 Sandbox Testing Note</span>
              To evaluate the results scorecard and qualified indicators, toggle the **&quot;Admin: Publish Results&quot;** control in the platform dashboard.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State B: Results ARE published (Display Official Scorecard)
  const categoryCutoffUsed = cutoff.categoryCutoffs[profile.category] || cutoff.overallMinMarks;

  return (
    <div id="results_published_container" className="max-w-3xl mx-auto space-y-6">
      
      {/* Overview Card */}
      <div className="bg-[#15181E] rounded border border-[#2D3139] shadow-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className={`h-12 w-12 rounded border-2 flex items-center justify-center shrink-0 ${
            result.isQualified 
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
              : 'bg-red-950/20 border-red-900/40 text-red-400'
          }`}>
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-widest block">OFFICIAL RESULT PUBLISHED</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              {result.isQualified ? 'Congratulations! You have Qualified' : 'Evaluation Completed'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Matched criteria for reservation category: {profile.category}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto font-mono">
          <button
            onClick={handlePrintScorecard}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded transition flex items-center justify-center gap-2 cursor-pointer uppercase"
          >
            <Printer className="h-4 w-4" /> Print / PDF
          </button>
          <button
            onClick={() => {
              alert('Official scorecard JSON and telemetry export compiled successfully.');
            }}
            className="flex-1 md:flex-none border border-[#2D3139] text-gray-300 hover:text-white hover:bg-[#1A1D23] font-bold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 transition cursor-pointer uppercase"
          >
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </div>

      {/* Official Scorecard Certification Block */}
      <div 
        ref={scorecardRef} 
        id="official_scorecard_certificate" 
        className="bg-[#15181E] rounded border border-[#2D3139] p-8 shadow-2xl relative overflow-hidden print:border-none print:shadow-none"
      >
        {/* Certificate borders / watermark decoration */}
        <div className="absolute inset-0 border-[16px] border-[#1A1D23] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-950/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Official Header */}
        <header className="border-b-2 border-[#2D3139] pb-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h1 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">National Testing & Assessment Authority</h1>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">JEE/NIET Joint Entrance Examination Scorecard - 2026</p>
          </div>
          <span className="bg-[#0F1115] border border-[#2D3139] text-gray-300 text-[10px] font-mono font-bold px-3 py-1.5 rounded uppercase shrink-0">
            SECURE_ID: NTA-{result.studentId}
          </span>
        </header>

        {/* Student Details Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Photos column */}
          <div className="md:col-span-1 space-y-4 text-center md:text-left shrink-0">
            <div className="relative inline-block w-28 h-36 rounded overflow-hidden border border-[#2D3139] bg-[#0F1115]">
              <img
                src={profile.photoUrl}
                alt="Student Portrait"
                className="w-full h-full object-cover"
              />
            </div>
            {profile.signatureUrl && (
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 font-mono block">VERIFIED SIGNATURE</span>
                <img
                  src={profile.signatureUrl}
                  alt="Student Signature"
                  className="h-10 object-contain mx-auto md:mx-0 p-1 bg-[#0F1115] border border-[#2D3139] rounded w-28"
                />
              </div>
            )}
          </div>

          {/* Details matrix column */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs font-mono">
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Candidate Name</span>
              <p className="font-bold text-white uppercase">{profile.name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Date of Birth</span>
              <p className="font-bold text-gray-300">{profile.dob}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Reservation Category</span>
              <p className="font-bold text-gray-300 uppercase">{profile.category}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Assigned Exam Course</span>
              <p className="font-bold text-indigo-400 uppercase">{profile.course}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Government Aadhaar ID</span>
              <p className="font-bold text-gray-300 font-mono">{profile.aadhaar}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-gray-500 font-bold block uppercase">Assigned Paper Set ID</span>
              <p className="font-bold text-gray-300 font-mono uppercase">{result.paperSetId}</p>
            </div>
          </div>
        </section>

        {/* Performance Metrics Table */}
        <section className="mt-8 font-mono">
          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Performance Evaluation Matrix</h4>
          <div className="overflow-x-auto border border-[#2D3139] rounded">
            <table className="w-full text-xs text-gray-300 border-collapse">
              <thead>
                <tr className="bg-[#1A1D23] border-b border-[#2D3139]">
                  <th className="p-3 text-left font-bold text-gray-400">Subject</th>
                  <th className="p-3 text-center font-bold text-gray-400">Attempted</th>
                  <th className="p-3 text-center font-bold text-gray-400">Correct</th>
                  <th className="p-3 text-center font-bold text-gray-400">Incorrect</th>
                  <th className="p-3 text-right font-bold text-gray-400">Score Obtained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D3139]/50">
                <tr className="bg-[#0F1115]/10">
                  <td className="p-3 font-semibold text-white">Physics</td>
                  <td className="p-3 text-center font-mono">4</td>
                  <td className="p-3 text-center font-mono">-</td>
                  <td className="p-3 text-center font-mono">-</td>
                  <td className="p-3 text-right font-mono font-bold text-white">{result.subjectScores.Physics}</td>
                </tr>
                <tr className="bg-[#0F1115]/10">
                  <td className="p-3 font-semibold text-white">Chemistry</td>
                  <td className="p-3 text-center font-mono">4</td>
                  <td className="p-3 text-center font-mono">-</td>
                  <td className="p-3 text-center font-mono">-</td>
                  <td className="p-3 text-right font-mono font-bold text-white">{result.subjectScores.Chemistry}</td>
                </tr>
                <tr className="bg-[#0F1115]/10">
                  <td className="p-3 font-semibold text-white">Mathematics</td>
                  <td className="p-3 text-center font-mono">4</td>
                  <td className="p-3 text-center font-mono">-</td>
                  <td className="p-3 text-center font-mono">-</td>
                  <td className="p-3 text-right font-mono font-bold text-white">{result.subjectScores.Mathematics}</td>
                </tr>
                <tr className="bg-[#1A1D23] font-bold border-t border-[#2D3139]">
                  <td className="p-3 font-extrabold text-white text-xs uppercase">TOTAL OVERALL</td>
                  <td className="p-3 text-center font-mono">{result.attempted}</td>
                  <td className="p-3 text-center font-mono text-emerald-400">{result.correct}</td>
                  <td className="p-3 text-center font-mono text-red-400">{result.incorrect}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-indigo-400 text-xs">{result.scoreObtained} / {result.totalMarks}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* National Percentile Rank Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-[#2D3139]">
          <div className="bg-[#0F1115] border border-[#2D3139] p-4 rounded text-center space-y-1 font-mono">
            <span className="text-[9px] text-gray-500 font-bold block uppercase">National Percentile</span>
            <span className="text-lg font-black text-indigo-400">{result.percentile} %ile</span>
          </div>
          <div className="bg-[#0F1115] border border-[#2D3139] p-4 rounded text-center space-y-1 font-mono">
            <span className="text-[9px] text-gray-500 font-bold block uppercase">All India Rank (AIR)</span>
            <span className="text-lg font-black text-white"># {result.rank}</span>
          </div>
          <div className={`p-4 rounded border text-center space-y-1 flex flex-col justify-center items-center font-mono ${
            result.isQualified 
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
              : 'bg-red-950/20 border-red-900/40 text-red-400'
          }`}>
            <span className="text-[9px] font-bold block uppercase opacity-80">Qualification Status</span>
            <span className="text-sm font-extrabold uppercase tracking-wide">
              {result.isQualified ? 'Qualified' : 'Not Qualified'}
            </span>
            <span className="text-[9px] opacity-75">Cutoff: {categoryCutoffUsed} marks</span>
          </div>
        </section>

        {/* Validation QR details */}
        <footer className="mt-8 pt-5 border-t border-[#2D3139] flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left font-mono">
          <div className="space-y-1">
            <p className="text-[9px] text-gray-500">Published: {cutoff.publishTime ? new Date(cutoff.publishTime).toLocaleDateString() : 'Pending'}</p>
            <p className="text-[9px] text-gray-500 leading-normal max-w-md">
              This scorecard is cryptographically signed and secured via National Verification Servers. All telemetry records of proctoring loops are archived and audited.
            </p>
          </div>
          <div className="h-12 w-12 bg-[#0F1115] border border-[#2D3139] text-[8px] font-mono p-1 opacity-50 flex items-center justify-center text-center text-gray-400 uppercase">
            QR SIGNED
          </div>
        </footer>
      </div>
    </div>
  );
}
