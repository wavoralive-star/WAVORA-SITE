/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Play, Sparkles, Star, Headset, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden bg-[#0B0B0F]"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Deep Purple Radial Blur */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] rounded-full bg-purple-900/10 blur-[120px]" />
        {/* Deep Cyan Radial Blur */}
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/12 translate-y-1/12 w-[45vw] h-[45vw] rounded-full bg-cyan-950/15 blur-[140px]" />
        {/* Subtle Dots Matrix Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#11111d_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left" id="hero-copy-container">
            {/* Launchpad Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest"
              id="hero-badge"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              Empowering Independent Creators
            </motion.div>

            {/* Title / Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-black mb-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase tracking-tighter leading-[0.95]"
                id="hero-headline"
              >
                Artist Services
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-lg sm:text-xl font-bold tracking-widest uppercase text-purple-400 italic"
              >
                Distribution. Growth. Wellness.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
                id="hero-subheadline"
              >
                Welcome to <strong className="text-white font-semibold">Wavora Live</strong> — the ultimate, all-in-one launchpad for independent artists. We offer frictionless global play distribution, deep fanbase growth, and direct stage integration.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              id="hero-actions"
            >
              <a
                id="hero-primary-cta"
                href="#pricing"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-center text-sm font-bold bg-white text-black hover:bg-gray-200 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group"
              >
                Explore Plans
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              {/* LINK: Dashboard Link Placeholder --> */}
              <button
                id="hero-secondary-cta"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("open-apply-modal", { detail: { planId: "pro" } }));
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full text-center text-sm font-bold border border-white/10 text-white hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                Join Wavora Live
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center lg:text-left"
              id="hero-trust-metrics"
            >
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">100%</div>
                <div className="text-xs text-neutral-500 uppercase tracking-widest mt-0.5">Keep Royalties</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">150+</div>
                <div className="text-xs text-neutral-500 uppercase tracking-widest mt-0.5">Stores Reached</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white font-mono">24h</div>
                <div className="text-xs text-neutral-500 uppercase tracking-widest mt-0.5">Average Setup</div>
              </div>
            </motion.div>
          </div>

          {/* Premium Floating Music UI Visualizer */}
          <div className="lg:col-span-5 relative" id="hero-visual-panel">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto max-w-[380px] sm:max-w-[420px] lg:max-w-none"
            >
              {/* Outer Decorative Circle */}
              <div className="absolute -inset-4 rounded-full border border-purple-500/10 animate-[spin_40s_linear_infinite]" />
              <div className="absolute -inset-8 rounded-full border border-cyan-500/5 animate-[spin_60s_linear_infinite]" />

              {/* Glassmorphic Player Card */}
              <div className="glassmorphism-card rounded-2xl p-6 relative overflow-hidden backdrop-blur-2xl">
                {/* Vinyl Plate Effect */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center border border-white/10 group mb-6">
                  {/* Neon Radial Gradient */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35)_0%,transparent_70%)]" />
                  
                  {/* Decorative vinyl tracks */}
                  <div className="absolute w-[85%] h-[85%] rounded-full border border-neutral-800/80 flex items-center justify-center">
                    <div className="w-[70%] h-[70%] rounded-full border border-neutral-800/60 flex items-center justify-center">
                      <div className="w-[50%] h-[50%] rounded-full border border-neutral-800/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-neutral-950 flex items-center justify-center border border-white/5 shadow-inner">
                          <div className="w-4 h-4 rounded-full bg-gradient-purple-cyan animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Soundwave Bars Floating on Top */}
                  <div className="absolute bottom-6 flex items-end justify-center gap-[4px] h-12 w-full px-8">
                    {[3, 7, 5, 8, 4, 9, 6, 8, 3, 5, 8, 9, 4, 7, 5, 10, 6, 8, 4, 3].map((val, idx) => (
                      <motion.div
                        key={idx}
                        className="w-[3px] bg-purple-400 rounded-full"
                        animate={{ height: [`${val * 10}%`, `${(val + 3) % 10 * 10 + 10}%`, `${val * 10}%`] }}
                        transition={{
                          duration: 1 + (idx % 3) * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>

                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-400 border border-cyan-400/20 uppercase tracking-widest">
                    <Star className="h-2.5 w-2.5 fill-cyan-400 animate-spin" /> High Definition
                  </div>
                </div>

                {/* Simulated Metadata */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Independent Standard</h3>
                      <p className="text-xs text-neutral-400">Wavora Audio Engine v2.4</p>
                    </div>
                    <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300">
                      96KHZ FLAC
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1">
                    <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-purple-cyan"
                        animate={{ width: ["0%", "72%"] }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                      <span>02:14</span>
                      <span>03:12</span>
                    </div>
                  </div>

                  {/* Micro Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Headset className="h-4 w-4 text-purple-400" />
                      <span>Ready for Apple & Spotify</span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-300 uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
