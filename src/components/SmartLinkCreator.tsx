/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, Music, Sparkles, AlertCircle, Copy, Check, Trash2, Globe, 
  Upload, Image as ImageIcon, Smartphone, ArrowRight, Radio, ExternalLink, 
  HelpCircle, CheckCircle, Flame, BarChart3, ChevronRight 
} from "lucide-react";
import { motion } from "motion/react";
import { 
  getSmartLinks, 
  PRESET_ARTWORKS, 
  SmartLink, 
  getSmartLinksFromSupabase, 
  createSmartLinkInSupabase, 
  deleteSmartLinkFromSupabase 
} from "../lib/smartlinks";

interface SmartLinkCreatorProps {
  onBackToMain?: () => void;
  onOpenViewer?: (id: string) => void;
}

export default function SmartLinkCreator({ onBackToMain, onOpenViewer }: SmartLinkCreatorProps) {
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    artist: "",
    artworkUrl: PRESET_ARTWORKS[0],
    description: "",
    spotifyUrl: "",
    appleMusicUrl: "",
    jioSaavnUrl: "",
    youtubeUrl: ""
  });

  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load previous lists
  useEffect(() => {
    // Initial lightning-fast local cache render
    setLinks(getSmartLinks());
    
    // Remote fetch in background to sync globally
    getSmartLinksFromSupabase().then(latest => {
      setLinks(latest);
    });
    
    const handleUpdated = () => {
      setLinks(getSmartLinks());
    };
    window.addEventListener("wavora_smart_links_updated", handleUpdated);
    return () => window.removeEventListener("wavora_smart_links_updated", handleUpdated);
  }, []);

  // Sync sample placeholder names based on actual input
  const liveTitle = formData.title || "My Track Release";
  const liveArtist = formData.artist || "Independent Artist";
  const liveDescription = formData.description || "Fresh master launch available on all audio stores.";

  // Handle Drag & Drop PNG File Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const fileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate image format
    if (!file.type.match("image/png") && !file.type.match("image/jpeg")) {
      setErrors(prev => ({ ...prev, artworkUrl: "Only high-quality PNG or JPG files are supported." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData(prev => ({ ...prev, artworkUrl: e.target!.result as string }));
        setErrors(prev => {
          const res = { ...prev };
          delete res.artworkUrl;
          return res;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Validate the creator inputs
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) {
      newErrors.id = "URL handle identifier is required.";
    } else if (!/^[a-z0-9-_]+$/i.test(formData.id)) {
      newErrors.id = "Can only contain lowercase letters, numbers, dashes, and underscores.";
    }
    
    if (!formData.title.trim()) {
      newErrors.title = "Track Title is required.";
    }
    if (!formData.artist.trim()) {
      newErrors.artist = "Artist Name is required.";
    }

    // Link URL formats validator helper
    const checkUrl = (url: string, platform: string) => {
      if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        newErrors[platform] = `Invalid link. Must start with http:// or https://`;
      }
    };

    checkUrl(formData.spotifyUrl, "spotifyUrl");
    checkUrl(formData.appleMusicUrl, "appleMusicUrl");
    checkUrl(formData.jioSaavnUrl, "jioSaavnUrl");
    if (formData.youtubeUrl) checkUrl(formData.youtubeUrl, "youtubeUrl");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await createSmartLinkInSupabase({
      id: formData.id.toLowerCase().trim(),
      title: formData.title.trim(),
      artist: formData.artist.trim(),
      artworkUrl: formData.artworkUrl,
      description: formData.description.trim(),
      spotifyUrl: formData.spotifyUrl.trim() || "https://spotify.com",
      appleMusicUrl: formData.appleMusicUrl.trim() || "https://music.apple.com",
      jioSaavnUrl: formData.jioSaavnUrl.trim() || "https://jiosaavn.com",
      youtubeUrl: formData.youtubeUrl.trim() || undefined
    });

    if (result.success) {
      setSuccessMsg("Hurrah! Music Smart Link compiled live successfully!");
      setFormData({
        id: "",
        title: "",
        artist: "",
        artworkUrl: PRESET_ARTWORKS[0],
        description: "",
        spotifyUrl: "",
        appleMusicUrl: "",
        jioSaavnUrl: "",
        youtubeUrl: ""
      });
      setErrors({});
      // Instantly load fresh records from database state
      getSmartLinksFromSupabase().then(latest => {
        setLinks(latest);
      });
      // Clear message
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrors({ id: result.error || "Slug taken." });
    }
  };

  const handleCopyLink = (item: SmartLink) => {
    // Detect preview or sandbox dev domain to allow local testing
    const isSandbox = window.location.host.includes(".run.app") || window.location.host.includes("localhost");
    const fullUrl = isSandbox 
      ? `${window.location.protocol}//${window.location.host}/s/${item.id}`
      : `https://home.wavora.live/s/${item.id}`;
    
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this smart link campaign? This action is irreversible.")) {
      await deleteSmartLinkFromSupabase(id);
      getSmartLinksFromSupabase().then(latest => {
        setLinks(latest);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans" id="smart-link-creator-workbench">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Module Header Title design */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Sparkles className="h-4.5 w-4.5" />
              Dynamic Fan Connect Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-mono">
              Artist Smart Links
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mt-1 font-medium leading-relaxed">
              Design and launch responsive glassmorphic smart directory pages. Instantly redirect fans from Instagram, YouTube, and TikTok to your actual releases on Spotify, Apple Music, and JioSaavn.
            </p>
          </div>
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="py-2.5 px-5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer select-none"
            >
              ← Front Platform
            </button>
          )}
        </div>

        {/* Double Column Creator Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: CONFIGURATION FORM (SPAN 7) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-[#0f0f16]/60 border border-white/10 rounded-2xl p-5 sm:p-7 shadow-[0_15px_30px_rgba(0,0,0,0.6)] space-y-6">
              
              <h2 className="text-sm font-black text-white uppercase tracking-widest font-mono border-b border-white/5 pb-3">
                1. Campaign Identity Set-up
              </h2>

              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-3 animate-bounce">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              {/* Dynamic URL Link Path Handle */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono block">
                  Custom link path identifier <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center">
                  <div className="bg-[#050507] border border-white/10 border-r-0 rounded-l-xl px-3 py-2.5 text-xs text-neutral-500 font-mono select-none">
                    home.wavora.live/s/
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={32}
                    placeholder="my-latest-anthem"
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value.replace(/\s+/g, "-") }))}
                    className="flex-grow bg-[#09090D] border border-white/10 rounded-r-xl px-3 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
                {errors.id ? (
                  <p className="text-[10px] text-red-400 font-bold tracking-wide flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.id}
                  </p>
                ) : (
                  <p className="text-[9px] text-gray-500">Your live workspace path: absolute access address.</p>
                )}
              </div>

              {/* Track Title & Artist Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono block">
                    Track Release Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blue Lagoon (Remix)"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  {errors.title && <p className="text-[10px] text-red-400 font-mono">{errors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono block">
                    Artist / Band Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sitar Odyssey"
                    value={formData.artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  {errors.artist && <p className="text-[10px] text-red-400 font-mono">{errors.artist}</p>}
                </div>
              </div>

              {/* Description bio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono block">
                  Campaign Description Tagline (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={120}
                  placeholder="e.g. My new Indian classical lo-fi fusion track is now out on all major digital streaming channels!"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#050507] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none transition-all"
                />
              </div>

              {/* Album Art PNG upload & choose presets row */}
              <div className="space-y-3.5">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono block">
                  Track Cover Artwork (High Definition PNG / JPEG)
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Drag-Drop Zone (6 cols) */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`md:col-span-7 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-300 ${
                      dragActive 
                        ? "border-purple-500 bg-purple-500/10 scale-[0.99]" 
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={fileSelected}
                      className="hidden"
                    />
                    <Upload className="h-7 w-7 text-purple-400 mb-2 animate-bounce" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">Drag & Drop Cover Image</span>
                    <span className="text-[9px] text-gray-500 mt-1">High resolution Square PNG or JPG assets only</span>
                  </div>

                  {/* Preset Library (5 cols) */}
                  <div className="md:col-span-5 space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block">Or Choose Abstract Preset:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_ARTWORKS.map((art, idx) => (
                        <div
                          key={idx}
                          onClick={() => setFormData(prev => ({ ...prev, artworkUrl: art }))}
                          className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 active:scale-95 ${
                            formData.artworkUrl === art ? "border-purple-500 scale-[1.03]" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={art} alt={`Preset cover ${idx+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {errors.artworkUrl && <p className="text-[10px] text-red-400 font-bold block">{errors.artworkUrl}</p>}
              </div>

              {/* SECTION 2: STREAMING NETWORKS */}
              <div className="pt-2 border-t border-white/5 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                  2. Streaming Platforms Landing Destinations
                </h3>

                <div className="space-y-3">
                  {/* SPOTIFY LINK */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                      <label className="text-[9px] font-bold text-[#1DB954] uppercase tracking-widest font-mono">Spotify Address</label>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://open.spotify.com/track/..."
                      value={formData.spotifyUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, spotifyUrl: e.target.value }))}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                    {errors.spotifyUrl && <p className="text-[10px] text-red-400">{errors.spotifyUrl}</p>}
                  </div>

                  {/* APPLE MUSIC LINK */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fc3c44]" />
                      <label className="text-[9px] font-bold text-[#fc3c44] uppercase tracking-widest font-mono">Apple Music Address</label>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://music.apple.com/us/album/..."
                      value={formData.appleMusicUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, appleMusicUrl: e.target.value }))}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                    {errors.appleMusicUrl && <p className="text-[10px] text-red-400">{errors.appleMusicUrl}</p>}
                  </div>

                  {/* JIO SAAVN LINK */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2C4]" />
                      <label className="text-[9px] font-bold text-[#00D2C4] uppercase tracking-widest font-mono">JioSaavn Address</label>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://www.jiosaavn.com/song/..."
                      value={formData.jioSaavnUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, jioSaavnUrl: e.target.value }))}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                    {errors.jioSaavnUrl && <p className="text-[10px] text-red-400">{errors.jioSaavnUrl}</p>}
                  </div>

                  {/* YOUTUBE LINK */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                      <label className="text-[9px] font-bold text-[#FF0000] uppercase tracking-widest font-mono">YouTube Music / Video Address (Optional)</label>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                      className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                    {errors.youtubeUrl && <p className="text-[10px] text-red-400">{errors.youtubeUrl}</p>}
                  </div>
                </div>
              </div>

              {/* Submit launcher button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-black tracking-widest text-[#050507] bg-white transition-all duration-300 shadow-[0_10px_25px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 text-xs uppercase cursor-pointer"
              >
                COMPILE SMART LINK NOW
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* COLUMN 2: REAL-TIME MOBILE SIMULATOR PREVIEW (SPAN 5) */}
          <div className="lg:col-span-5 sticky top-28 flex flex-col items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-1.5 font-mono">
              <Smartphone className="h-3.5 w-3.5" />
              Instantly Synced Fan Mobile View
            </span>

            {/* Smart Frame mimicking smartphone border */}
            <div className="w-[310px] sm:w-[340px] aspect-[9/18.5] bg-[#020202] rounded-[44px] p-3 border-[6px] border-[#1f1f23] shadow-inner relative flex flex-col overflow-hidden leading-tight">
              {/* Dynamic wallpaper backing matching uploaded art blur */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 filter blur-[35px] transition-all duration-700 pointer-events-none select-none"
                style={{ backgroundImage: `url(${formData.artworkUrl})` }}
              />
              {/* Camera Notch placeholder */}
              <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-50">
                <div className="w-28 h-4 rounded-b-xl bg-[#1f1f23]" />
              </div>

              {/* Inside Page Content */}
              <div className="flex-grow flex flex-col justify-between items-center px-4 pt-8 pb-3 relative z-10 w-full overflow-y-auto no-scrollbar text-center">
                
                {/* Simulated header */}
                <span className="block mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[7px] font-black tracking-widest uppercase text-purple-300 font-mono animate-pulse">
                  Broadcast active
                </span>

                {/* Cover Image rendering */}
                <div className="relative aspect-square w-[160px] rounded-lg overflow-hidden shadow-2xl border border-white/5 mt-4">
                  <img src={formData.artworkUrl} alt="Track artwork preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                {/* Track Info text preview */}
                <div className="mt-4 w-full">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate px-1">
                    {liveTitle}
                  </h3>
                  <p className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest mt-0.5 truncate">
                    {liveArtist}
                  </p>
                  <p className="text-[9px] text-gray-500 mt-1 line-clamp-1 truncate max-w-[200px] mx-auto">
                    {liveDescription}
                  </p>
                </div>

                {/* Simulated dynamic buttons list */}
                <div className="w-full space-y-2 mt-4 flex-grow max-h-[160px] overflow-y-auto pr-0.5">
                  <div className="p-2 border border-emerald-500/10 bg-black/40 rounded-lg flex items-center justify-between">
                    <span className="text-[8px] font-bold text-white tracking-wide flex items-center gap-1.5 uppercase">
                      <span className="w-1 h-1 rounded-full bg-[#1DB954]" /> Spotify
                    </span>
                    <span className="text-[7.5px] text-emerald-450 font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Listen Live</span>
                  </div>
                  <div className="p-2 border border-red-500/10 bg-black/40 rounded-lg flex items-center justify-between">
                    <span className="text-[8px] font-bold text-white tracking-wide flex items-center gap-1.5 uppercase">
                      <span className="w-1 h-1 rounded-full bg-[#fc3c44]" /> Apple Music
                    </span>
                    <span className="text-[7.5px] text-red-400 font-black uppercase tracking-wider bg-red-400/10 border border-red-400/25 px-1.5 py-0.5 rounded">Launch</span>
                  </div>
                  <div className="p-2 border border-cyan-500/10 bg-black/40 rounded-lg flex items-center justify-between">
                    <span className="text-[8px] font-bold text-white tracking-wide flex items-center gap-1.5 uppercase">
                      <span className="w-1 h-1 rounded-full bg-[#00D2C4]" /> JioSaavn
                    </span>
                    <span className="text-[7.5px] text-cyan-400 font-black uppercase tracking-wider bg-cyan-400/10 border border-cyan-400/25 px-1.5 py-0.5 rounded">Play Track</span>
                  </div>
                </div>

                {/* Watermark branding footer inside mock iPhone */}
                <span className="text-[7.5px] font-mono tracking-widest text-[#555] uppercase block mt-1">
                  Powered by WAVORA LIVE
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM DASHBOARD: SMART LINK MANAGING INBOX / ANALYTICS */}
        <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="smartlink-analytics-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-purple-400" />
                Live Campaigns & Real-time Analytics
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-medium select-none">
                Monitor live campaigns, track custom visitor click actions, retrieve final publishing addresses, and audit previous submissions.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                ACTIVE CHANNELS: <strong className="text-white font-black">{links.length}</strong>
              </span>
            </div>
          </div>

          {links.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/5 bg-white/2 rounded-xl">
              <Radio className="h-9 w-9 text-gray-600 mx-auto mb-3 animate-pulse" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider font-mono">No Active Links Created</p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">Fill in the Dynamic Creator Form above to spawn your first smart tracking landing directories!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {links.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0f0f16] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/25 transition-all duration-300 relative group"
                  id={`campaign-card-${item.id}`}
                >
                  <div className="space-y-4">
                    {/* Header: Cover + Info */}
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                        <img src={item.artworkUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="text-xs font-bold text-white uppercase truncate tracking-tight">{item.title}</h4>
                        <p className="text-[10px] font-bold text-purple-400 uppercase truncate mt-0.5 font-mono">{item.artist}</p>
                        <span className="inline-block mt-1 text-[8px] font-mono text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Analytics Track visits metrics */}
                    <div className="p-3 bg-[#050507] rounded-lg border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider font-bold">Total Fans Connected</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-black text-white">{item.visits}</span>
                        <span className="text-[8px] text-gray-500 font-mono block">Clicks</span>
                      </div>
                    </div>

                    {/* Live Absolute Address field */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest font-mono block">Absolute Launch Address</span>
                      <div className="flex items-center p-1.5 bg-black/40 rounded border border-white/5 text-[9px] font-mono text-gray-400 select-all truncate">
                        <span>home.wavora.live/s/{item.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-3.5 mt-4 border-t border-white/5">
                    {/* Direct View Trigger */}
                    {onOpenViewer && (
                      <button
                        onClick={() => onOpenViewer(item.id)}
                        className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-[9px] font-extrabold uppercase tracking-widest text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3 text-cyan-400" /> Live View
                      </button>
                    )}

                    {/* Direct Copy link */}
                    <button
                      onClick={() => handleCopyLink(item)}
                      className="py-1.5 px-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-[9px] font-extrabold uppercase tracking-widest text-[#050507] bg-white transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-purple-400" /> Copy Landing Address
                        </>
                      )}
                    </button>

                    {/* Delete action */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/20 text-red-450 hover:text-red-400 transition-all cursor-pointer flex items-center justify-center"
                      title="Delete Campaign Campaign"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
