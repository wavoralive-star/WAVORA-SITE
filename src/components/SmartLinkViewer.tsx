/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Music, ArrowLeft, Headphones, Radio, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { incrementSmartLinkVisitsInSupabase, getSmartLinks, SmartLink } from "../lib/smartlinks";

interface SmartLinkViewerProps {
  id: string;
  onBackToMain?: () => void;
}

export default function SmartLinkViewer({ id, onBackToMain }: SmartLinkViewerProps) {
  const [track, setTrack] = useState<SmartLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load state and increment visitor count
  useEffect(() => {
    setLoading(true);
    let active = true;

    const loadTrackData = async () => {
      // Slight pause for premium entrance feel
      await new Promise(resolve => setTimeout(resolve, 450));
      if (!active) return;

      try {
        const activeTrack = await incrementSmartLinkVisitsInSupabase(id);
        if (activeTrack && active) {
          setTrack(activeTrack);
        } else if (active) {
          const all = getSmartLinks();
          const found = all.find(l => l.id === id);
          if (found) setTrack(found);
        }
      } catch (err) {
        console.warn("Error running track increment:", err);
        if (active) {
          const all = getSmartLinks();
          const found = all.find(l => l.id === id);
          if (found) setTrack(found);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTrackData();

    return () => {
      active = false;
    };
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-b-2 border-cyan-400 animate-spin duration-1000" />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse font-mono">
            Optimizing Audio Stream...
          </p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4 font-sans text-center">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/5 bg-[#0B0B0F]/90 backdrop-blur-xl relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Radio className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider font-mono">Track Not Active</h2>
          <p className="text-sm text-gray-400 mt-2 mb-6 leading-relaxed">
            This Wavoras smart link hasn't been configured yet, or is no longer broadcasting live. Check spelling or create your own!
          </p>
          <div className="flex flex-col gap-2.5">
            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all font-sans text-xs uppercase tracking-wider cursor-pointer"
              >
                Go to Wavora Live
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-16 px-4 overflow-hidden font-sans bg-[#050507]">
      {/* 1. Cinematic Background Blurred Cover Poster */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-110 pointer-events-none opacity-35 filter blur-[60px] md:blur-[100px] transition-all duration-700"
        style={{ backgroundImage: `url(${track.artworkUrl})` }}
      />
      
      {/* 2. Global Dark Overlay */}
      <div className="absolute inset-0 bg-black/55 z-0 pointer-events-none" />

      {/* Decorative Wave lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#11111d_1px,transparent_1px)] [background-size:24px_24px] opacity-30 select-none pointer-events-none" />

      {/* 3. Central Landing Glassmorphic Module */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-sm sm:max-w-[420px] w-full bg-[#0F0F16]/75 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col items-center text-center"
        id={`smart-link-landing-${track.id}`}
      >
        {/* Floating return indicator */}
        {onBackToMain && (
          <button
            onClick={onBackToMain}
            className="absolute top-4 left-4 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            title="Return to Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/15 text-[9px] font-bold text-purple-400 font-mono tracking-wider uppercase">
          <Headphones className="h-3 w-3 animate-pulse" /> Live Broadcast
        </div>

        {/* Large Album Artwork PNG rendering */}
        <div className="relative aspect-square w-[240px] sm:w-[280px] rounded-xl overflow-hidden mt-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/10 select-none group">
          <img 
            src={track.artworkUrl} 
            alt="Track Cover Image" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Subtle audio waves on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Radio className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>

        {/* Info text */}
        <div className="mt-6 mb-7 w-full">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight line-clamp-2 leading-tight">
            {track.title}
          </h1>
          <p className="text-sm font-bold text-purple-400 tracking-wider uppercase mt-1">
            {track.artist}
          </p>
          {track.description && (
            <p className="text-xs text-gray-400 mt-2.5 max-w-xs mx-auto leading-relaxed line-clamp-2 font-medium">
              {track.description}
            </p>
          )}
        </div>

        {/* Platform Direct Connect Selector directory */}
        <div className="w-full space-y-3.5 mb-6" id="music-platforms-directory">
          {/* 1. SPOTIFY */}
          <a
            href={track.spotifyUrl || "https://spotify.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/10 hover:border-emerald-500/25 bg-black/30 hover:bg-emerald-500/10 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center">
                <svg className="h-4.5 w-4.5 text-[#1DB954] fill-current" viewBox="0 0 24 24">
                  <path d="M12.004 2c-5.525.004-10 4.48-10 10.005s4.475 10.003 10 10.003c5.524 0 10.001-4.477 10.001-10.003s-4.477-10.005-10.001-10.005zm4.582 14.429c-.197.324-.623.428-.948.232-2.617-1.597-5.912-1.957-9.791-1.071-.37.085-.736-.153-.822-.524-.085-.369.153-.736.522-.822 4.24-.967 7.893-.559 10.807 1.22.324.195.429.621.232.945zm1.222-2.72c-.248.404-.775.539-1.18.291-2.996-1.84-7.563-2.378-10.748-1.411-.455.138-.934-.117-1.071-.571-.138-.456.117-.935.572-1.073 3.69-1.12 8.718-.517 12.136 1.583.407.247.54.776.291 1.181zm.106-2.82c-3.593-2.133-9.513-2.329-12.923-1.293-.55.166-1.124-.15-1.29-.7s.152-1.125.7-1.291c3.921-1.191 10.457-.96 14.593 1.493.498.295.66.938.364 1.436-.296.498-.937.662-1.444.355z"/>
                </svg>
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-wider font-sans group-hover:text-emerald-400">
                Spotify Live
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-extrabold tracking-widest uppercase font-mono group-hover:text-emerald-400">
              Listen <ExternalLink className="h-3 w-3 inline ml-0.5 text-gray-600 group-hover:text-emerald-500 transition-colors" />
            </div>
          </a>

          {/* 2. APPLE MUSIC */}
          <a
            href={track.appleMusicUrl || "https://music.apple.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl border border-red-500/10 hover:border-red-500/25 bg-black/30 hover:bg-red-500/10 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#fc3c44]/10 border border-[#fc3c44]/20 flex items-center justify-center">
                <svg className="h-4.5 w-4.5 text-[#fc3c44] fill-current" viewBox="0 0 24 24">
                  <path d="M22.062 10.662c-.104-.083-.756-.632-1.921-.632-1.579 0-2.392 1.01-2.454 1.09s-.021.135-.021.208c0 .031.021.115.062.146.125.073.834.469 1.46.72.636.25 1.543.834 1.543 1.95 0 1.251-.626 2.376-1.543 3.033-.918.657-1.876.813-2.335.813-.24 0-.427.021-.49.031-.104.021-.167.094-.167.198v.636c0 .104.062.188.167.208 3.565.657 5.755-1.928 5.755-4.837.001-2.924-.766-3.21-1.091-3.327zM2.5 12.004C2.5 6.755 6.752 2.5 12.004 2.5s9.504 4.255 9.504 9.504-4.252 9.504-9.504 9.504S2.5 17.253 2.5 12.004zm11.956-4.521v5.776c0 1.95-1.396 2.92-2.793 2.92-1.397 0-2.314-.97-2.314-2.126 0-1.282.917-2.096 2.314-2.096.344 0 .584.052.793.104V7.483l-3.326.699v5.776c0 1.95-1.396 2.92-2.793 2.92-1.397 0-2.314-.97-2.314-2.126 0-1.282.917-2.096 2.314-2.096.344 0 .584.052.793.104V5.783z"/>
                </svg>
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-wider font-sans group-hover:text-red-400">
                Apple Music
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-extrabold tracking-widest uppercase font-mono group-hover:text-red-400">
              Listen <ExternalLink className="h-3 w-3 inline ml-0.5 text-gray-600 group-hover:text-red-500 transition-colors" />
            </div>
          </a>

          {/* 3. JIO SAAVN */}
          <a
            href={track.jioSaavnUrl || "https://jiosaavn.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl border border-cyan-500/10 hover:border-cyan-500/25 bg-black/30 hover:bg-cyan-500/10 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00D2C4]/10 border border-[#00D2C4]/20 flex items-center justify-center">
                <svg className="h-4.5 w-4.5 text-[#00D2C4] fill-current" viewBox="0 0 24 24">
                  <path d="M12.001 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm2.752 14.542V16.7c0 .5-.45.92-.951.92S12.85 17.2 12.85 16.7v-4.148c0-.501-.45-.918-.951-.918S10.95 12.051 10.95 12.552v4.148c0 .5-.45.92-.95.92-.501 0-.952-.422-.952-.92v-5.467c0-.501.451-.919.952-.919.5 0 .95.418.95.919v.216c.3-.391.801-.617 1.352-.617.551 0 1.052.226 1.352.617v-1.925h2.153v6.12c0 .5-.451.92-.952.92z"/>
                </svg>
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-wider font-sans group-hover:text-cyan-400">
                JioSaavn
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-extrabold tracking-widest uppercase font-mono group-hover:text-cyan-400">
              Play <ExternalLink className="h-3 w-3 inline ml-0.5 text-gray-600 group-hover:text-cyan-500 transition-colors" />
            </div>
          </a>

          {/* 4. YOUTUBE MUSIC (Optional check) */}
          {track.youtubeUrl && (
            <a
              href={track.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl border border-red-600/10 hover:border-red-600/25 bg-black/30 hover:bg-red-600/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center">
                  <svg className="h-4.5 w-4.5 text-[#FF0000] fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.001 3.001 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.001 3.001 0 0 0 2.11-2.11c.502-1.87.502-5.837.502-5.837s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="text-white text-xs font-bold uppercase tracking-wider font-sans group-hover:text-red-500">
                  YouTube Video
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-extrabold tracking-widest uppercase font-mono group-hover:text-red-500">
                Watch <ExternalLink className="h-3 w-3 inline ml-0.5 text-gray-600 group-hover:text-red-500 transition-colors" />
              </div>
            </a>
          )}
        </div>

        {/* 4. Action Bar (Copy Link & Brand) */}
        <div className="w-full pt-4 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between gap-2.5">
            <button
              onClick={handleCopyLink}
              id="copy-to-clipboard-landing"
              className="flex-grow py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 text-gray-300 font-mono text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied Live Address</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Share Smart Link</span>
                </>
              )}
            </button>
          </div>

          {/* Humble watermark brand footer */}
          <div className="text-[9px] font-mono tracking-widest text-gray-500 uppercase flex items-center justify-center gap-1 select-none">
            <span>Powering Music Distribution via</span>
            <span className="text-purple-400/80 font-black tracking-tight cursor-default hover:text-purple-400 transition-colors">Wavora Live</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
