'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  KeyRound, MapPin, Wifi, ShieldCheck, Check, Camera, 
  UserCheck, AlertTriangle, Play, HelpCircle, Loader2, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { StudentProfile, ExamCenter } from '../lib/db-store';

interface VerificationSectionProps {
  profile: StudentProfile;
  centers: ExamCenter[];
  onComplete: (paperSetId: string) => void;
  onBack: () => void;
}

export default function VerificationSection({ profile, centers, onComplete, onBack }: VerificationSectionProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Find student's assigned center
  const center = centers.find(c => c.id === profile.assignedCenterId) || centers[0];

  // STEP 1 State: OTP / Login
  const [studentIdInput, setStudentIdInput] = useState(profile.id || 'STD-10024');
  const [otpInput, setOtpInput] = useState('482910'); // prefilled secure OTP for testing

  // STEP 2 State: GPS Location
  const [gpsSimulatedInside, setGpsSimulatedInside] = useState<boolean | null>(null);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);

  // STEP 3 State: Wi-Fi router
  const [wifiSimulatedOk, setWifiSimulatedOk] = useState<boolean | null>(null);
  const [currentSsid, setCurrentSsid] = useState<string>('Unknown Network');
  const [currentMac, setCurrentMac] = useState<string>('00:00:00:00:00:00');

  // STEP 4 State: Biometric Face Liveness
  const [faceVerified, setFaceVerified] = useState(false);
  const [livenessTask, setLivenessTask] = useState<'blink' | 'left' | 'nod' | 'done'>('blink');
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [streamActive, setStreamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedVerifyPhoto, setCapturedVerifyPhoto] = useState<string>('');

  // Handle step completion
  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (studentIdInput !== profile.id) {
        setErrorMessage('Student ID does not match registered profile records.');
        return;
      }
      if (otpInput.length < 6) {
        setErrorMessage('Invalid OTP. Please enter the 6-digit confirmation code.');
        return;
      }
      setCurrentStep(2);
    } 
    else if (currentStep === 2) {
      if (gpsSimulatedInside === null) {
        setErrorMessage('Please execute Geofence GPS verification first.');
        return;
      }
      if (!gpsSimulatedInside) {
        setErrorMessage('Security Alert: Outside authorized geofenced perimeter. Check center assignment.');
        return;
      }
      setCurrentStep(3);
    } 
    else if (currentStep === 3) {
      if (wifiSimulatedOk === null) {
        setErrorMessage('Please trigger Wi-Fi network routing audits.');
        return;
      }
      if (!wifiSimulatedOk) {
        setErrorMessage('Audit Failed: Connected to unauthorized router. Switch to the exam SSID.');
        return;
      }
      setCurrentStep(4);
    } 
    else if (currentStep === 4) {
      if (!faceVerified) {
        setErrorMessage('Biometric mismatch. Please complete face recognition liveness loop.');
        return;
      }
      setCurrentStep(5);
    }
  };

  // GPS Simulation Action
  const runGpsVerification = (inside: boolean) => {
    setLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setLoading(false);
      setGpsSimulatedInside(inside);
      if (inside) {
        setCurrentLat(center.latitude + 0.0002); // close enough
        setCurrentLng(center.longitude - 0.0001);
      } else {
        setCurrentLat(28.7041); // Delhi coordinates (far from Noida/Gurugram centers)
        setCurrentLng(77.1025);
      }
    }, 1200);
  };

  // Wi-Fi Simulation Action
  const runWifiVerification = (pass: boolean) => {
    setLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setLoading(false);
      setWifiSimulatedOk(pass);
      if (pass) {
        setCurrentSsid(center.wifiSsid);
        setCurrentMac(center.wifiMac);
      } else {
        setCurrentSsid('Jio_Private_Net_LTE');
        setCurrentMac('F4:D3:52:1A:66:B9');
      }
    }, 1200);
  };

  const startCamera = async () => {
    setTimeout(() => {
      setStreamActive(true);
    }, 0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 225 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam stream failed in verification section. Falling back to high-fidelity mock biometric feed.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setTimeout(() => {
      setStreamActive(false);
    }, 0);
  };

  // Face Liveness Biometric Simulation Loop
  useEffect(() => {
    if (currentStep === 4 && !faceVerified) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [currentStep]);

  // Simulate progress when doing biometric tasks
  const handleTriggerLivenessTask = () => {
    if (livenessTask === 'blink') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setLivenessProgress(33);
        setLivenessTask('left');
      }, 1500);
    } else if (livenessTask === 'left') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setLivenessProgress(66);
        setLivenessTask('nod');
      }, 1500);
    } else if (livenessTask === 'nod') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setLivenessProgress(100);
        setLivenessTask('done');
        setFaceVerified(true);
        // Take Snapshot
        setCapturedVerifyPhoto(profile.photoUrl || 'https://picsum.photos/seed/candidate/300/225');
      }, 1500);
    }
  };

  const handleLaunchExam = () => {
    // Lock screen (simulated full-screen launch)
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    // Launch exam with the default mock paperset (e.g. SET-A or Set-001)
    onComplete('SET-A');
  };

  return (
    <div id="verification_main_container" className="max-w-4xl mx-auto bg-[#15181E] rounded-lg border border-[#2D3139] overflow-hidden shadow-2xl">
      {/* Header Indicator */}
      <div className="bg-[#1A1D23] px-8 py-5 border-b border-[#2D3139] flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">JEE/NIET Core Integrity Verification</h2>
            <p className="text-[11px] text-gray-400 font-mono">Step {currentStep} of 5: Pre-exam terminal authorization</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-[#0F1115] hover:bg-[#2C3038] border border-[#2D3139] px-3 py-1.5 rounded transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
        </button>
      </div>

      {/* Progress Circles */}
      <div className="px-8 py-4 bg-[#1A1D23] border-b border-[#2D3139] flex justify-between items-center overflow-x-auto gap-4">
        {[
          { step: 1, label: 'Identity', icon: KeyRound },
          { step: 2, label: 'Geofence', icon: MapPin },
          { step: 3, label: 'Secure Net', icon: Wifi },
          { step: 4, label: 'Liveness', icon: Camera },
          { step: 5, label: 'Admit Ticket', icon: UserCheck }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <div key={item.step} className="flex items-center gap-2 shrink-0">
              <div className={`h-8 w-8 rounded flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                isDone 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : isActive 
                    ? 'bg-[#0F1115] border-indigo-500 text-indigo-400 ring-4 ring-indigo-950/40' 
                    : 'bg-[#0F1115] border-[#2D3139] text-gray-500'
              }`}>
                {isDone ? <Check className="h-4 w-4" /> : item.step}
              </div>
              <span className={`text-xs font-semibold font-mono ${isActive ? 'text-indigo-400 font-bold' : isDone ? 'text-gray-300' : 'text-gray-500'}`}>
                {item.label}
              </span>
              {item.step < 5 && <div className="h-[1px] w-6 bg-[#2D3139]" />}
            </div>
          );
        })}
      </div>

      <div className="p-8 min-h-[350px] bg-[#15181E] flex flex-col justify-between">
        {/* Step Contents */}
        <div className="space-y-6">
          {errorMessage && (
            <div id="error_panel" className="bg-red-950/20 border border-red-900/40 text-red-400 px-4 py-3 rounded flex items-start gap-3 animate-headshake font-mono text-xs">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Verification Error Detected</p>
                <p className="mt-0.5 opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* STEP 1: LOGIN CHECK */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-[#0F1115] text-indigo-400 rounded-lg flex items-center justify-center mx-auto border border-[#2D3139]">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h3 className="text-md font-bold text-indigo-400 uppercase tracking-widest font-mono">Secure Candidate Authentication</h3>
                <p className="text-xs text-gray-400">Provide your Student ID credentials alongside the high-security system OTP.</p>
              </div>

              <div className="space-y-4 bg-[#1A1D23] p-6 rounded border border-[#2D3139] mt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">Candidate Student ID</label>
                  <input
                    type="text"
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    value={studentIdInput}
                    onChange={e => setStudentIdInput(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">One-Time Examination Passcode (OTP)</label>
                    <span className="text-[9px] text-green-400 font-mono bg-green-950/30 border border-green-900/30 px-1.5 rounded">Pre-sent (482910)</span>
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 tracking-widest text-center font-mono"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GPS LOCATOR */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest font-mono">Geofencing & Physical Location Audit</h3>
                <p className="text-xs text-gray-400">Candidates must sit their examinations inside the approved geo-fenced campus radius of their assigned center.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-4">
                {/* Visual Map Simulator */}
                <div className="border border-[#2D3139] rounded bg-[#1A1D23] p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase font-mono">Campus GPS Visualizer</span>
                    <span className="text-[10px] bg-[#0F1115] text-indigo-400 border border-[#2D3139] px-2 py-0.5 rounded font-mono font-medium">Radius: {center.allowedRadiusMeters}m</span>
                  </div>
                  {/* Dynamic simulated radar map */}
                  <div className="h-44 bg-[#0F1115] rounded relative flex items-center justify-center overflow-hidden border border-[#2D3139]">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    {/* Geofence Ring */}
                    <div className="h-32 w-32 rounded-full border border-indigo-500/30 bg-indigo-500/5 animate-[ping_3s_infinite] absolute" />
                    <div className="h-32 w-32 rounded-full border-2 border-indigo-500/40 bg-indigo-500/10 absolute flex items-center justify-center">
                      <span className="text-[9px] text-indigo-300 font-semibold font-mono bg-[#1A1D23]/90 px-2 py-0.5 rounded border border-indigo-500/20">Center Geofence</span>
                    </div>

                    {/* Foci pin */}
                    <div className="h-3 w-3 bg-indigo-400 rounded-full absolute" />

                    {/* Candidate Location Indicator */}
                    {gpsSimulatedInside !== null && (
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center absolute transition-all duration-1000 ${
                        gpsSimulatedInside ? 'bg-emerald-500 text-white translate-x-3 -translate-y-4 scale-110' : 'bg-rose-500 text-white translate-x-16 translate-y-12'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit Controls */}
                <div className="space-y-4">
                  <div className="bg-[#1A1D23] p-4 rounded border border-[#2D3139] space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">Assigned Center Details</span>
                    <p className="text-xs font-semibold text-white">{center.name}</p>
                    <p className="text-[11px] text-gray-400 leading-normal">{center.address}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">Center Latitude: {center.latitude} | Longitude: {center.longitude}</p>
                  </div>

                  {gpsSimulatedInside === null ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">Select Position Simulation</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => runGpsVerification(true)}
                          className="bg-emerald-950/20 hover:bg-emerald-900/20 border border-emerald-900/50 text-emerald-400 text-xs font-bold py-2.5 px-3 rounded transition-all cursor-pointer font-mono uppercase"
                        >
                          Simulate inside center
                        </button>
                        <button
                          onClick={() => runGpsVerification(false)}
                          className="bg-red-950/20 hover:bg-red-900/20 border border-red-900/50 text-red-400 text-xs font-bold py-2.5 px-3 rounded transition-all cursor-pointer font-mono uppercase"
                        >
                          Simulate outside campus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded border flex items-start gap-3 ${
                      gpsSimulatedInside 
                        ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300' 
                        : 'bg-red-950/20 border-red-900/50 text-red-300'
                    }`}>
                      {gpsSimulatedInside ? (
                        <>
                          <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="font-mono text-xs">
                            <p className="font-bold">GPS Geofence Match Successful</p>
                            <p className="text-[11px] mt-0.5 opacity-90">Matched Lat: {currentLat?.toFixed(4)}, Lng: {currentLng?.toFixed(4)}. Candidate within allowed {center.allowedRadiusMeters}m boundary.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                          <div className="font-mono text-xs">
                            <p className="font-bold">GPS Geofence Verification FAILED</p>
                            <p className="text-[11px] mt-0.5 opacity-90">Candidate is in Delhi (Lat: {currentLat}, Lng: {currentLng}) which is outside Noida/Gurugram campus boundaries.</p>
                            <button 
                              onClick={() => setGpsSimulatedInside(null)}
                              className="text-[10px] text-indigo-400 underline font-semibold mt-2 block hover:opacity-85 cursor-pointer"
                            >
                              Reset Position Simulation
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: WI-FI AUDIT */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest font-mono">Network Topology Authorization</h3>
                <p className="text-xs text-gray-400">Only authorized Wi-Fi network routing points (SSID and Router BSSID MAC Address) are certified to conduct live examinations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-4">
                {/* Network Status HUD */}
                <div className="border border-[#2D3139] rounded bg-[#1A1D23] p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0F1115] rounded border border-[#2D3139]">
                      <Wifi className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-mono font-semibold block">NETWORK AUDITOR v2.4</span>
                      <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Connection Audit Console</p>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-xs text-gray-300 bg-[#0F1115] p-4 rounded border border-[#2D3139]">
                    <p className="flex justify-between"><span className="opacity-60">AUDITING MAC_ADR:</span> <strong>{currentMac}</strong></p>
                    <p className="flex justify-between"><span className="opacity-60">ROUTER_SSID:</span> <strong>{currentSsid}</strong></p>
                    <p className="flex justify-between"><span className="opacity-60">SEC_LEVEL_ENCR:</span> <strong>WPA3 Enterprise</strong></p>
                    <p className="flex justify-between">
                      <span className="opacity-60">AUDIT_STATUS:</span> 
                      <strong className={wifiSimulatedOk === true ? 'text-emerald-400' : wifiSimulatedOk === false ? 'text-red-400' : 'text-gray-500'}>
                        {wifiSimulatedOk === true ? 'CERTIFIED_SECURE' : wifiSimulatedOk === false ? 'ALERT_UNSAFE_NET' : 'PENDING_SCAN'}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Network controls */}
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-950/20 border border-indigo-900/50 rounded text-gray-300 text-xs leading-relaxed font-mono">
                    <span className="font-bold text-indigo-400 block mb-1">Required Wi-Fi SSID for Center:</span>
                    <p className="font-semibold text-white">{center.wifiSsid}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Authorized Gateway BSSID: {center.wifiMac}</p>
                  </div>

                  {wifiSimulatedOk === null ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">Simulate Local Campus Router</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => runWifiVerification(true)}
                          className="bg-emerald-950/20 hover:bg-emerald-900/20 border border-emerald-900/50 text-emerald-400 text-xs font-bold py-2.5 px-3 rounded transition-all cursor-pointer font-mono uppercase"
                        >
                          Connect to Exam Wi-Fi
                        </button>
                        <button
                          onClick={() => runWifiVerification(false)}
                          className="bg-red-950/20 hover:bg-red-900/20 border border-red-900/50 text-red-400 text-xs font-bold py-2.5 px-3 rounded transition-all cursor-pointer font-mono uppercase"
                        >
                          Connect to Private LTE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded border flex items-start gap-3 ${
                      wifiSimulatedOk 
                        ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300' 
                        : 'bg-red-950/20 border-red-900/50 text-red-300'
                    }`}>
                      {wifiSimulatedOk ? (
                        <>
                          <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="font-mono text-xs">
                            <p className="font-bold">Wi-Fi Security Access Granted</p>
                            <p className="text-[11px] mt-0.5 opacity-90">SSID {center.wifiSsid} verified under authorization criteria. Router fingerprint matches Center ID records.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                          <div className="font-mono text-xs">
                            <p className="font-bold">Uncertified Network Connection</p>
                            <p className="text-[11px] mt-0.5 opacity-90">LTE hotspots are blacklisted during examination schedules. Transition to authorized center Wi-Fi.</p>
                            <button 
                              onClick={() => setWifiSimulatedOk(null)}
                              className="text-[10px] text-indigo-400 underline font-semibold mt-2 block hover:opacity-85 cursor-pointer"
                            >
                              Audit Alternative Network
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AI BIOMETRIC LIVENESS */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest font-mono">AI-Powered Biometric Liveness Scan</h3>
                <p className="text-xs text-gray-400">Continuous 3D liveness audit. Promptly execute the randomized motor cues in front of your camera to certify identity authenticity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
                {/* Webcam Box */}
                <div className="border border-[#2D3139] rounded overflow-hidden bg-[#0F1115] relative h-60 flex flex-col items-center justify-center">
                  {streamActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : capturedVerifyPhoto ? (
                    <img
                      src={capturedVerifyPhoto}
                      alt="Verified Face"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="h-10 w-10 text-indigo-400 mx-auto animate-pulse" />
                      <p className="text-xs text-gray-500 font-mono mt-2">Biometric interface loading...</p>
                    </div>
                  )}

                  {/* AI Scan Overlay */}
                  <div className="absolute inset-x-0 top-4 text-center">
                    <span className="bg-[#0F1115]/90 text-indigo-400 font-mono text-[9px] px-2.5 py-1 rounded border border-[#2D3139]">
                      MATCHING COMPILATION RATE: {livenessProgress}%
                    </span>
                  </div>

                  {/* Laser Scan Animation */}
                  {!faceVerified && (
                    <div className="absolute w-full h-1.5 bg-indigo-500/80 top-0 left-0 shadow-[0_0_15px_#6366f1] animate-[bounce_3s_infinite]" />
                  )}

                  {/* Verified badge */}
                  {faceVerified && (
                    <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center gap-2 p-6 text-center text-white font-mono">
                      <div className="h-12 w-12 bg-emerald-500 text-white rounded flex items-center justify-center border-4 border-emerald-500/25 animate-bounce">
                        <Check className="h-6 w-6 stroke-[3]" />
                      </div>
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Identity Confirmed</p>
                      <p className="text-[10px] text-gray-300 leading-relaxed">Facial geometry matches registered candidate database with 99.78% certainty.</p>
                    </div>
                  )}
                </div>

                {/* Instructions & Tasks */}
                <div className="space-y-4 font-mono">
                  {!faceVerified ? (
                    <div className="bg-[#1A1D23] p-6 rounded border border-[#2D3139] space-y-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Biometric Task Dashboard</span>
                      
                      {livenessTask === 'blink' && (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-indigo-400">Task 1 of 3: Micro-Blink Detection</p>
                          <p className="text-[11px] text-gray-400">Blink twice looking directly into the camera frame.</p>
                        </div>
                      )}
                      {livenessTask === 'left' && (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-indigo-400">Task 2 of 3: Rotational Head Track</p>
                          <p className="text-[11px] text-gray-400">Slowly look left to register 3D facial contours.</p>
                        </div>
                      )}
                      {livenessTask === 'nod' && (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-indigo-400">Task 3 of 3: Vertical Angle Node</p>
                          <p className="text-[11px] text-gray-400">Nod your head slightly downward once.</p>
                        </div>
                      )}

                      <button
                        onClick={handleTriggerLivenessTask}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying Biometric Cues...
                          </>
                        ) : (
                          <>
                            Perform Biometric Task <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-5 rounded text-emerald-300 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider">Biometrics Auditor Verified</p>
                      <p className="text-[11px] leading-relaxed opacity-90">Facial matching verified. Eye movement and pupil dilation signals conform with live human candidate profiles.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DIGITAL ADMIT TICKET */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="h-10 w-10 bg-[#0F1115] text-indigo-400 rounded flex items-center justify-center mx-auto border border-[#2D3139]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest font-mono">Cryptographic Admit Ticket Generated</h3>
                <p className="text-xs text-gray-400">Your secure digital token is generated. Launching your terminal will initiate browser-lockdown protocols.</p>
              </div>

              {/* Secure Admit Ticket Card */}
              <div className="max-w-xl mx-auto bg-[#0F1115] rounded p-6 text-white border border-[#2D3139] shadow-2xl relative overflow-hidden font-mono">
                {/* Ticket header decorative watermarks */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  {/* Photo with scan bracket */}
                  <div className="relative shrink-0">
                    <img
                      src={profile.photoUrl}
                      alt="Registered Student"
                      className="w-24 h-32 object-cover rounded border border-[#2D3139]"
                    />
                    <div className="absolute inset-0 border border-indigo-500/30 rounded" />
                  </div>

                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                        AUTHORIZED EXAM TICKET
                      </span>
                      <h4 className="text-sm font-bold mt-1 tracking-tight text-white uppercase">{profile.name}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-gray-400">
                      <p><span className="text-gray-500">STUDENT ID:</span> {profile.id}</p>
                      <p><span className="text-gray-500">CATEGORY:</span> {profile.category}</p>
                      <p><span className="text-gray-500">COURSE:</span> {profile.course.split(' ')[0]}</p>
                      <p><span className="text-gray-500">CENTER:</span> {center.id}</p>
                    </div>

                    <div className="border-t border-[#2D3139] pt-2 text-[10px] text-gray-400 flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-emerald-400" />
                      <span>Network Secured: {center.wifiSsid}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-[#2D3139] mt-5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div className="text-[10px] text-gray-500 font-mono">
                    TOKEN_SHA: NTA_EXAM_JWT_2026_NIET_JEE_99
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                    <Check className="h-3.5 w-3.5" /> Checked & Clear
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 mt-8 border-t border-[#2D3139] flex justify-between items-center">
          {currentStep > 1 && currentStep < 5 && (
            <button
              onClick={() => setCurrentStep(prev => (prev - 1) as any)}
              className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer font-mono uppercase"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          {currentStep === 1 && <div />}

          {currentStep < 5 ? (
            <button
              id="verification_next_btn"
              onClick={handleNextStep}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-5 rounded flex items-center gap-1.5 shadow transition-all ml-auto cursor-pointer font-mono uppercase"
            >
              Verify & Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              id="begin_exam_btn"
              onClick={handleLaunchExam}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/45 transition-all text-sm cursor-pointer uppercase font-mono tracking-wider"
            >
              <Play className="h-4 w-4 fill-current" /> Begin Examination (Enters Lockdown Mode)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
