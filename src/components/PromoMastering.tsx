/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Radio, Zap, Volume2, UploadCloud, Play, Pause, Sparkles, CheckCircle2, TrendingUp, Music, ArrowRight, Share2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MasteringPreset } from "../types";

export default function PromoMastering() {
  const [activeTab, setActiveTab] = useState<"promo" | "mastering">("mastering");
  
  // Mastering Simulator States
  const [dragActive, setDragActive] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<string>("analog");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSourceMode, setAudioSourceMode] = useState<"before" | "after">("after");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets: MasteringPreset[] = [
    {
      id: "analog",
      name: "Analog Warmth",
      description: "Applies tape saturation harmonics, vintage tube EQ modeling, and subtle stereo width.",
      eqFocus: "Warm mid-range, rich low-end",
      loudnessTarget: "-14 LUFS (Optimal for streaming)"
    },
    {
      id: "club",
      name: "Club Punch",
      description: "Boosts sub-bass transient punch, heavy multi-band compression, and high master ceiling.",
      eqFocus: "Explosive bass, crisp percussion",
      loudnessTarget: "-9 LUFS (Optimized for club rigs)"
    },
    {
      id: "streaming",
      name: "Streaming Air",
      description: "Clean brickwall limiters, transparent high-shelf EQ boost, and industry spatial imaging.",
      eqFocus: "Pristine vocals, airy stereo image",
      loudnessTarget: "-13 LUFS (High-fidelity standard)"
    }
  ];

  // Drag and drop handlers
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setupFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupFile(e.target.files[0]);
    }
  };

  const setupFile = (file: File) => {
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
    setFileUploaded(true);
    setIsCompleted(false);
    setIsPlaying(false);
  };

  const handleStartMastering = () => {
    if (!fileUploaded) return;
    setIsProcessing(true);
    setIsCompleted(false);

    const steps = [
      "Analyzing input spectrum and overall RMS headroom...",
      "Calibrating dynamic multi-band expansion parameters...",
      "Modeling tape saturation harmonics & harmonic excitation...",
      "Aligning spatial stereo imaging and phase anomalies...",
      "Maximizing gain using predictive brickwall limiters...",
      "Exporting mastered high-fidelity WAV containers..."
    ];

    let currentStep = 0;
    setProcessStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setProcessStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setIsProcessing(false);
        setIsCompleted(true);
        setAudioSourceMode("after");
      }
    }, 900);
  };

  const handleReset = () => {
    setFileUploaded(false);
    setFileName("");
    setFileSize("");
    setIsCompleted(false);
    setIsPlaying(false);
    setIsProcessing(false);
  };

  return (
    <section id="mastering-promo" className="relative overflow-hidden py-24 bg-transparent font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[40vw] h-[40vw] rounded-full bg-cyan-900/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Toggle Sections Title */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16" id="promo-m-header">
          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            Premium Audio Tech
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans text-gradient-purple-cyan" id="promo-m-heading">
            Promotions &amp; Artificial Mastering
          </h2>
          <p className="text-base sm:text-lg text-gray-400 font-normal">
            Push your ready songs into Spotify curators&apos; queues, accelerate visual brand growth campaigns, or use our elite AI engine to perfect your master levels instantly.
          </p>

          {/* Core Tab Switcher */}
          <div className="flex justify-center pt-6" id="promo-m-tabs">
            <div className="bg-white/5 p-1 rounded-full border border-white/10 flex gap-1">
              <button
                onClick={() => setActiveTab("mastering")}
                className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "mastering"
                    ? "bg-gradient-purple-cyan text-white shadow-md font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Instant AI Mastering
              </button>
              <button
                onClick={() => setActiveTab("promo")}
                className={`px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "promo"
                    ? "bg-gradient-purple-cyan text-white shadow-md font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Music Promotion Services
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Switching */}
        <AnimatePresence mode="wait">
          {activeTab === "mastering" ? (
            <motion.div
              key="mastering-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
              id="ai-mastering-section"
            >
              {/* Info Column */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-8" id="mastering-info-col">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-purple-400">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <Zap className="h-6 w-6 text-purple-400" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest font-mono">Duo EQ Modeling Engine</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                    Studio-Grade Mastering. <br />
                    Powered by Live AI.
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed font-normal">
                    Do not let unrefined audio holding back your potential. Our online artificial intelligence system models physical tube limiters, high-end SSL equalizers, and premium compressors.
                  </p>

                  <div className="space-y-4 pt-2">
                    <div className="flex gap-3.5">
                      <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Full Peak Maximizer</h4>
                        <p className="text-xs text-gray-400 font-normal leading-normal">Ensures zero digital clipping while hitting precise Spotify streaming volume targets.</p>
                      </div>
                    </div>
                    <div className="flex gap-3.5">
                      <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white font-sans">Stereo Phase Alignment</h4>
                        <p className="text-xs text-gray-400 font-normal leading-normal">Optimizes phase coherence to ensure deep monophonic sub-bass safety on club rigs.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" /> Included in Elite Plans
                  </h4>
                  <p className="text-xs text-gray-400 leading-normal font-normal">
                    Every Elite account unlocks 5 free mastered audio exports per calendar month. Standard Basic & Pro account subscribers enjoy deep discounted per-track rendering options.
                  </p>
                </div>
              </div>

              {/* GUI Interactive Simulator Column */}
              <div className="lg:col-span-7" id="mastering-demo-gui">
                <div className="glassmorphism-card rounded-2xl p-6 sm:p-8 border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between min-h-[500px]">
                  
                  {/* Phase 1: Uploader View */}
                  {!fileUploaded && (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-all ${
                        dragActive ? "border-purple-400 bg-purple-500/5" : "border-white/10 hover:border-white/25 bg-black/20"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden font-sans"
                      />
                      <UploadCloud className="h-12 w-12 text-neutral-500 mb-4 animate-bounce" />
                      <h4 className="text-base font-bold text-white mb-2 font-sans">Import your unmastered song demo</h4>
                      <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed font-sans">
                        Supports high-resolution uncompressed WAV, AIFF, or FLAC files (Up to 100MB file limit).
                      </p>

                      <div className="flex gap-4 items-center">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 bg-white text-black font-bold rounded-lg text-xs hover:bg-gray-200 transition-all cursor-pointer"
                        >
                          Select Local Track
                        </button>
                        <span className="text-xs text-neutral-500">or drag &amp; drop</span>
                      </div>
                    </div>
                  )}

                  {/* Phase 2: Processing / Interactive Settings View */}
                  {fileUploaded && (
                    <div className="flex-grow flex flex-col justify-between space-y-8 font-sans">
                      {/* Active File Banner */}
                      <div className="flex justify-between items-center bg-black/40 p-4 border border-white/10 rounded-xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-purple-500/10 rounded border border-purple-500/25 text-purple-400 shrink-0">
                            <Music className="h-5 w-5" />
                          </div>
                          <div className="text-left overflow-hidden">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{fileName}</h4>
                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{fileSize}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleReset}
                          className="text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider font-mono bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded transition"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Presets Grid Switcher */}
                      {!isProcessing && !isCompleted && (
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">
                            Configure Mastering Target Profile
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {presets.map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => setSelectedPreset(preset.id)}
                                className={`text-left p-4 rounded-xl border transition-all ${
                                  selectedPreset === preset.id
                                    ? "border-purple-500 bg-purple-500/10 shadow-md"
                                    : "border-white/10 bg-black/20 hover:border-white/20"
                                }`}
                              >
                                <h5 className="text-xs font-bold text-white flex items-center justify-between font-sans">
                                  {preset.name}
                                  {selectedPreset === preset.id && <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                                </h5>
                                <p className="text-[10px] text-gray-400 leading-normal mt-2 font-normal line-clamp-3 font-sans">
                                  {preset.description}
                                </p>
                                <div className="mt-3 pt-2 border-t border-white/10 space-y-1">
                                  <div className="text-[9px] text-neutral-500">Focus: <strong className="text-neutral-300 font-medium">{preset.eqFocus}</strong></div>
                                  <div className="text-[9px] text-neutral-500">Ceiling: <strong className="text-neutral-300 font-medium">{preset.loudnessTarget}</strong></div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mastering processing loading container */}
                      {isProcessing && (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-[#0B0B0F]/50 rounded-xl" id="dsp-processing">
                          <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                            <div className="absolute inset-0 rounded-full border-2 border-purple-500/10 border-t-purple-500 animate-spin" />
                            <Volume2 className="h-6 w-6 text-purple-400 animate-pulse" />
                          </div>
                          <h4 className="text-base font-bold text-white mb-2 uppercase tracking-wider text-gradient-purple-cyan">Mastering Signal chain</h4>
                          <p className="text-xs text-gray-400 max-w-sm font-mono leading-relaxed h-12 px-4">
                            {processStep}
                          </p>
                        </div>
                      )}

                      {/* Refined Completed Waveform Controller panel */}
                      {isCompleted && (
                        <div className="space-y-6 py-6 text-center" id="dsp-completed">
                          <div className="inline-flex p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full mb-2">
                            <CheckCircle2 className="h-6 w-6 animate-pulse" />
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold text-white tracking-tight">Audio Master Ready!</h4>
                            <p className="text-xs text-gray-400">Processed using <strong className="text-neutral-200">{presets.find(p => p.id === selectedPreset)?.name}</strong> preset profile.</p>
                          </div>

                          {/* Interactive Before vs After Audio Player Waveform Visualizer */}
                          <div className="bg-black/40 p-5 rounded-2xl border border-white/10 space-y-4">
                            
                            {/* Simple Audio play trigger */}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-3 rounded-full bg-white text-black hover:bg-gray-200 shadow-md flex items-center gap-2 text-xs font-bold transition-all"
                              >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-black" />}
                                {isPlaying ? "Pause Stream" : "Play Preview"}
                              </button>

                              {/* Toggle switch: Audio Source (Before / Mastered) */}
                              <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                                <button
                                  onClick={() => setAudioSourceMode("before")}
                                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition ${
                                    audioSourceMode === "before"
                                      ? "bg-neutral-800 text-white"
                                      : "text-neutral-500 hover:text-neutral-300"
                                  }`}
                                >
                                  Before (Raw)
                                </button>
                                <button
                                  onClick={() => setAudioSourceMode("after")}
                                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition ${
                                    audioSourceMode === "after"
                                      ? "bg-purple-500 text-white shadow-md"
                                      : "text-neutral-500 hover:text-neutral-300"
                                  }`}
                                >
                                  Mastered
                                </button>
                              </div>
                            </div>

                            {/* Simulated active audio bar graph */}
                            <div className="h-16 w-full flex items-end gap-[3px] px-2 pt-2 relative overflow-hidden">
                              {/* Dark mask if raw chosen to signify dry audio */}
                              {[4, 8, 3, 7, 5, 10, 6, 8, 4, 3, 7, 12, 15, 11, 8, 6, 4, 9, 13, 8, 5, 11, 6, 9, 3, 7, 11, 14, 9, 5, 8, 4].map((h, i) => {
                                  const finalHeight = audioSourceMode === "after" ? h * 4 : Math.max(h * 2, 8);
                                  return (
                                    <motion.div
                                      key={i}
                                      className={`w-full rounded-sm transition-all duration-300 ${
                                        audioSourceMode === "after" ? "bg-gradient-to-t from-purple-500 to-cyan-400" : "bg-neutral-700"
                                      }`}
                                      animate={isPlaying ? {
                                        height: [`${finalHeight}%`, `${Math.max(finalHeight - 20, 10)}%`, `${finalHeight}%`]
                                      } : { height: `${finalHeight}%` }}
                                      transition={{
                                        duration: 1 + (i % 4) * 0.15,
                                        repeat: Infinity,
                                        ease: "linear"
                                      }}
                                    />
                                  );
                                })}
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                              <span>Simulated Rendering</span>
                              <span className={audioSourceMode === "after" ? "text-purple-400 font-bold font-sans" : "text-neutral-400 font-sans"}>
                                {audioSourceMode === "after" ? "🔥 Mastering Active (+4.2dB RMS)" : "⚠️ Raw Unmastered (-18.4 LUFS)"}
                              </span>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Trigger Call to Act button */}
                      {!isProcessing && !isCompleted && (
                        <button
                          onClick={handleStartMastering}
                          className="w-full py-4 rounded-xl font-extrabold text-xs uppercase tracking-wider bg-gradient-purple-cyan text-white shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="h-4 w-4" /> Start Mastering Render
                        </button>
                      )}

                      {isCompleted && (
                        <div className="pt-2">
                          <a
                            id="mastering-upgrade"
                            href="#pricing"
                            className="block w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-gray-200 transition-all font-sans"
                          >
                            Explore Pricing to Get Unlimited WAV Exports
                          </a>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="promo-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans"
              id="marketing-pitch-section"
            >
              {/* Left copy deck */}
              <div className="lg:col-span-6 space-y-8" id="promo-info">
                <div className="space-y-4 font-sans">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest font-mono">Organic Fan Acceleration</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none font-sans">
                    Targeted Curation &amp; Playlists
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
                    Farming streams with mock bots is a guaranteed route to getting your Spotify artist account blacklisted. Wavora Live believes in pure organic traction. We build structural promotional systems to put your tracks in front of real ears.
                  </p>
                </div>

                {/* Grid items */}
                <div className="space-y-4" id="promo-grid">
                  {[
                    {
                      label: "Verified Spotify Playlist Pitching",
                      desc: "Submit your pending releases straight to our network of active indie curators, blog lists, and automated generic genre channels."
                    },
                    {
                      label: "High-Response TikTok Campaign Audits",
                      desc: "Tailored campaign kits to find creators ready to map your audio signals to active visual reels and challenges."
                    },
                    {
                      label: "AI-Powered Pre-Save & Bio Generators",
                      desc: "Create beautiful pre-save linkages, customized landing panels, and email subscribe forms in under 3 minutes."
                    }
                  ].map((service, index) => (
                    <div key={index} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/15 transition-all duration-300 flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight font-sans">{service.label}</h4>
                        <p className="text-xs text-gray-400 font-normal leading-normal mt-1 font-sans">{service.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right visuals marketing engine panel */}
              <div className="lg:col-span-6 flex flex-col justify-center" id="promo-visual-bento">
                <div className="relative rounded-2xl bg-white/5 p-8 border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />
                  
                  <div className="space-y-6">
                    <span className="inline-block px-3 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] uppercase font-bold tracking-widest font-mono">
                      Wavora Hub Analytics
                    </span>
                    <h4 className="text-xl font-bold text-white tracking-tight">Track Your Fanbase Expansion</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-normal">
                      Every promotional campaign logs exact streaming telemetry, listener geographical hotspots, and smart contract links conversion flow to guarantee transparency.
                    </p>

                    {/* Simulating stats graphics */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-4 font-mono">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Live Campaign: &ldquo;Neon Pulse&rdquo;</span>
                        <span className="text-cyan-400 font-bold flex items-center gap-1">🟢 Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded border border-white/10">
                          <span className="text-[10px] text-neutral-500 block">Total Reach Potential</span>
                          <span className="text-base font-extrabold text-white mt-1 block">342,840</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded border border-white/10">
                          <span className="text-[10px] text-neutral-500 block">Link Clicks (Pre-Save)</span>
                          <span className="text-base font-extrabold text-white mt-1 block">8,421</span>
                        </div>
                      </div>
                      {/* Graphics Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-500">
                          <span>Curator Pitch Completion</span>
                          <span>92%</span>
                        </div>
                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 w-[92%]" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {/* LINK: Dashboard Link Placeholder --> */}
                      <a
                        href="#DASHBOARD_LINK_PLACEHOLDER"
                        className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-cyan-400 transition"
                      >
                        Launch A Promotion Campaign On Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
