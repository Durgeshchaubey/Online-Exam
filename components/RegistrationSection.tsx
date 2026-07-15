'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, PenTool, Trash2, ArrowRight } from 'lucide-react';
import { StudentProfile, ExamCenter } from '../lib/db-store';

interface RegistrationSectionProps {
  profile: StudentProfile;
  centers: ExamCenter[];
  onRegister: (profile: StudentProfile) => void;
}

export default function RegistrationSection({ profile, centers, onRegister }: RegistrationSectionProps) {
  const [formData, setFormData] = useState<StudentProfile>({ ...profile });
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>(profile.photoUrl || '');
  const [signaturePreview, setSignaturePreview] = useState<string>(profile.signatureUrl || '');
  const [isDrawing, setIsDrawing] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Signature Canvas context
  useEffect(() => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#818cf8'; // Neon indigo
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }, [signaturePreview]);

  // Handle webcam stream start
  const startWebcam = async () => {
    setUseRealWebcam(true);
    setWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 225 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam stream failed. Falling back to high-fidelity mock stream.', err);
      setUseRealWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setWebcamActive(false);
  };

  const capturePhoto = () => {
    if (useRealWebcam && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 300, 225);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoPreview(dataUrl);
        setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
        stopWebcam();
      }
    } else {
      // High-quality mock selfie generator (simulating a real JEE photo with blue background)
      const mockPics = [
        'https://picsum.photos/seed/candidate1/300/225',
        'https://picsum.photos/seed/candidate2/300/225',
        'https://picsum.photos/seed/candidate3/300/225',
        'https://picsum.photos/seed/candidate4/300/225'
      ];
      const randomPic = mockPics[Math.floor(Math.random() * mockPics.length)];
      setPhotoPreview(randomPic);
      setFormData(prev => ({ ...prev, photoUrl: randomPic }));
    }
  };

  // Drawing signature logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignaturePreview(dataUrl);
      setFormData(prev => ({ ...prev, signatureUrl: dataUrl }));
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignaturePreview('');
        setFormData(prev => ({ ...prev, signatureUrl: '' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreview) {
      alert('Please capture/upload your Photo before proceeding.');
      return;
    }
    if (!signaturePreview) {
      alert('Please draw your Signature before proceeding.');
      return;
    }
    onRegister({
      ...formData,
      photoUrl: photoPreview,
      signatureUrl: signaturePreview,
      hasRegistered: true
    });
  };

  return (
    <div id="registration_container" className="max-w-4xl mx-auto bg-[#15181E] rounded-lg border border-[#2D3139] overflow-hidden shadow-2xl">
      <div className="bg-[#1A1D23] border-b border-[#2D3139] px-8 py-6 text-white text-center sm:text-left">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 id="reg_title" className="text-lg font-bold tracking-wider text-indigo-400 uppercase">JEE/NIET Candidate Self-Registration</h2>
            <p id="reg_subtitle" className="text-gray-400 text-[11px] font-mono mt-1">Ensure all credentials match your Government identity records exactly.</p>
          </div>
          <span className="bg-indigo-950/50 text-indigo-300 border border-indigo-800/50 text-xs px-3 py-1.5 rounded font-mono font-medium">
            System ID: {formData.id}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Personal details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-[#2D3139] pb-2">Candidate Details</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Full Name (as in Aadhaar)</label>
              <input
                type="text"
                required
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Date of Birth</label>
                <input
                  type="date"
                  required
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  value={formData.dob}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Reservation Category</label>
                <select
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <option value="General">General (GEN)</option>
                  <option value="OBC-NCL">OBC-NCL</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Course Selection</label>
              <select
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                value={formData.course}
                onChange={e => setFormData({ ...formData, course: e.target.value as any })}
              >
                <option value="B.Tech / JEE-Style">B.Tech / JEE-Style Examination</option>
                <option value="B.Arch / NIET-Style">B.Arch / NIET-Style Examination</option>
                <option value="Integrated Dual Degree">Integrated Dual Degree (B.Tech + M.Tech)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Assigned Examination Center</label>
              <select
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                value={formData.assignedCenterId}
                onChange={e => setFormData({ ...formData, assignedCenterId: e.target.value })}
              >
                {centers.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name} ({center.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Aadhaar/Government ID Number</label>
              <input
                type="text"
                required
                placeholder="XXXX XXXX XXXX"
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                value={formData.aadhaar}
                onChange={e => setFormData({ ...formData, aadhaar: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Mobile Number</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Biometric uploads */}
          <div className="space-y-6">
            {/* Live Camera Capture */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-[#2D3139] pb-2">Biometric Verification Profile</h3>
              
              <div className="border border-[#2D3139] rounded overflow-hidden bg-[#0F1115] relative h-52 flex flex-col items-center justify-center">
                {webcamActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Selfie Snapshot"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="h-8 w-8 text-indigo-400 mx-auto stroke-[1.5] animate-pulse" />
                    <p className="text-xs text-[#E0E2E7] mt-2 font-bold">Biometric Camera System</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">Requires frontal lighting, direct gaze, no sunglasses</p>
                  </div>
                )}

                {/* Secret canvas for capturing web photo */}
                <canvas ref={canvasRef} width="300" height="225" className="hidden" />
              </div>

              <div className="flex gap-2">
                {!webcamActive ? (
                  <button
                    type="button"
                    onClick={startWebcam}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Camera className="h-4 w-4" /> Start Biometric Camera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-all animate-pulse cursor-pointer"
                  >
                    Capture Biometric Profile
                  </button>
                )}

                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('');
                      setFormData(prev => ({ ...prev, photoUrl: '' }));
                    }}
                    className="bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/30 p-2 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                {/* Simulate direct file generation */}
                {!webcamActive && (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="border border-[#2D3139] hover:bg-[#1A1D23] text-gray-300 text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Fast Demo Photo
                  </button>
                )}
              </div>
            </div>

            {/* Signature Drawing Pad */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block font-mono">Digital Signature Pad</label>
                {signaturePreview && (
                  <span className="text-[10px] bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 font-mono px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Signature Saved
                  </span>
                )}
              </div>

              <div className="border border-[#2D3139] rounded overflow-hidden bg-[#0F1115] relative h-32 flex flex-col items-center justify-center">
                {signaturePreview ? (
                  <img
                    src={signaturePreview}
                    alt="Digital Signature"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <canvas
                    ref={sigCanvasRef}
                    width="380"
                    height="128"
                    className="w-full h-full cursor-crosshair bg-[#0F1115]"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                )}
                {!signaturePreview && (
                  <div className="absolute pointer-events-none text-center opacity-30">
                    <PenTool className="h-6 w-6 mx-auto stroke-[1.5] text-indigo-400" />
                    <p className="text-[10px] mt-1 font-bold">Draw signature with mouse or touch</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-red-400 hover:bg-red-900/10 px-3 py-1.5 rounded font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Prepopulate a gorgeous cursive mock signature with neon indigo stroke
                    const canvas = sigCanvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.beginPath();
                        ctx.strokeStyle = '#818cf8';
                        ctx.lineWidth = 3;
                        // Write "Aravind Swamy" cursively
                        ctx.moveTo(30, 80);
                        ctx.bezierCurveTo(45, 10, 70, 10, 85, 80);
                        ctx.bezierCurveTo(95, 40, 110, 45, 125, 75);
                        ctx.bezierCurveTo(140, 50, 150, 55, 165, 80);
                        ctx.moveTo(150, 72);
                        ctx.lineTo(170, 72);
                        ctx.stroke();
                        const dataUrl = canvas.toDataURL('image/png');
                        setSignaturePreview(dataUrl);
                        setFormData(prev => ({ ...prev, signatureUrl: dataUrl }));
                      }
                    }
                  }}
                  className="text-xs text-indigo-400 hover:bg-[#1A1D23] border border-[#2D3139] px-3 py-1.5 rounded font-mono font-bold transition-all cursor-pointer"
                >
                  Auto Sign Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#2D3139] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 font-mono max-w-lg text-center sm:text-left leading-relaxed">
            By proceeding, you authorize this platform to access your webcam stream for face verification, collect network parameters, and log proctoring indicators during the examination.
          </p>
          <button
            id="register_submit_btn"
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition-all text-xs uppercase tracking-wider cursor-pointer"
          >
            Complete Registration & Verify <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
