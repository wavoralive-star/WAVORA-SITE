/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Heart, ShieldCheck, Milestone, Activity, Sparkles, Compass, MessageSquare, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ArtistCare() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breatheState, setBreatheState] = useState<"In" | "Hold" | "Out">("In");
  const [timerCount, setTimerCount] = useState(4);

  // Simple Breathing cycle simulation for busy artists
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBreathing) {
      interval = setInterval(() => {
        setTimerCount((prev) => {
          if (prev <= 1) {
            // cycle state
            setBreatheState((current) => {
              if (current === "In") {
                setTimerCount(4);
                return "Hold";
              } else if (current === "Hold") {
                setTimerCount(4);
                return "Out";
              } else {
                setTimerCount(4);
                return "In";
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreatheState("In");
      setTimerCount(4);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing, breatheState]);

  const resources = [
    {
      title: "Mental Performance Coaching",
      topic: "Overcome stage anxiety, career stagnation, and songwriter block.",
      icon: Compass,
      tag: "Mindset"
    },
    {
      title: "Sustainable Touring Guild",
      topic: "Practical guidelines to fight physical fatigue, sleep deprivation, and nutrition depletion on the road.",
      icon: Milestone,
      tag: "Road Life"
    },
    {
      title: "Peer Circle Networks",
      topic: "Secure, confidential industry circle chats connecting independent musicians experiencing shared paths.",
      icon: MessageSquare,
      tag: "Community"
    },
    {
      title: "Holistic Health Support",
      topic: "Access directly vetted mental safety experts, physical therapy networks, and crisis lines.",
      icon: Activity,
      tag: "Safety"
    }
  ];

  return (
    <section id="artist-care" className="py-24 relative overflow-hidden bg-transparent">
      {/* Decorative Warm Red/Rose glow which conveys empathy and heartbeat */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-10 w-[45vw] h-[45vw] bg-rose-950/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-12 right-20 w-[35vw] h-[35vw] bg-violet-950/15 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Empathetic copy block */}
          <div className="lg:col-span-6 space-y-8" id="care-copy-container">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider">
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/30" /> Artist Human First
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                Empathic Artist Care <br />
                &amp; Collective Wellness
              </h2>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
                Independent music creation is a psychological marathon. Pressure to produce, maintain marketing hype, tour constantly, and manage unstable schedules leads to widespread burnout.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
                At Wavora Live, structural wellness is a core pillar of our system. Our specialized wellness portal matches you with guides, mental resilience toolkits, and private support networks.
              </p>
            </div>

            {/* Structured Resource Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="care-pillars">
              {resources.map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/15 transition-all duration-300">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-black/40 rounded-lg border border-white/10 text-rose-400">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{item.tag}</span>
                      <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-normal font-normal">{item.topic}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Portal Placeholder Link Button */}
            {/* LINK: Artist Care Link Placeholder --> */}
            <div className="pt-2">
              <a
                id="care-portal-cta"
                href="#ARTIST_CARE_LINK_PLACEHOLDER"
                className="inline-flex items-center gap-3.5 px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 shadow-xl transition-all duration-300 group"
              >
                Access Collective Wellness Portal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Interactive Mindfulness / Deep Breath Tool Block */}
          <div className="lg:col-span-6" id="care-interactive-block">
            <div className="glassmorphism-card rounded-2xl p-8 relative border border-white/10 overflow-hidden shadow-2xl flex flex-col items-center">
              {/* Outer blurred halo */}
              <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(244,114,182,0.05)_0%,transparent_60%) pointer-events-none" />
              
              <div className="text-center space-y-2 mb-8">
                <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase font-semibold">Artist Mental Oasis</span>
                <h3 className="text-lg font-bold text-white tracking-tight">Need a Creative Recharge?</h3>
                <p className="text-xs text-neutral-500 max-w-sm">
                  Take a 1-minute conscious breathing break to reset your focus and reduce physical stress patterns.
                </p>
              </div>

              {/* Dynamic Breathing Bubble Visualizer */}
              <div className="relative w-56 h-56 flex items-center justify-center mb-8">
                <AnimatePresence mode="popLayout">
                  {/* Outer breathing ring */}
                  <motion.div
                    key="breathing-circle"
                    className="absolute rounded-full border border-rose-500/20"
                    animate={{
                      scale: isBreathing 
                        ? (breatheState === "In" ? 1.4 : breatheState === "Hold" ? 1.4 : 1.0)
                        : 1.0,
                    }}
                    transition={{ duration: isBreathing ? 4 : 1, ease: "easeInOut" }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </AnimatePresence>

                {/* Secondary wave ring */}
                {isBreathing && (
                  <motion.div
                    className="absolute rounded-full bg-rose-500/10 pointer-events-none"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0, 0.6]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: "80%", height: "80%" }}
                  />
                )}

                {/* Central Circle */}
                <motion.div
                  className="w-36 h-36 rounded-full bg-gradient-to-tr from-rose-950 to-purple-900 border border-rose-500/30 flex flex-col items-center justify-center shadow-lg relative z-10"
                  animate={{
                    scale: isBreathing 
                      ? (breatheState === "In" ? 1.2 : breatheState === "Hold" ? 1.2 : 0.9)
                      : 1.0,
                  }}
                  transition={{ duration: isBreathing ? 4 : 1, ease: "easeInOut" }}
                >
                  {isBreathing ? (
                    <div className="text-center">
                      <p className="text-xs font-mono uppercase text-rose-300 tracking-widest">{breatheState}</p>
                      <p className="text-3xl font-extrabold font-mono mt-1 text-white">{timerCount}</p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Compass className="h-8 w-8 text-rose-400 mx-auto animate-pulse mb-1" />
                      <p className="text-[10px] font-mono uppercase tracking-wider text-rose-300">Ready</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Action trigger button */}
              <button
                id="breathing-reset-btn"
                onClick={() => setIsBreathing(!isBreathing)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  isBreathing
                    ? "bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20"
                    : "bg-white text-black hover:bg-neutral-200"
                }`}
              >
                {isBreathing ? "Pause Exercise" : "Begin Breathing Cycle"}
              </button>

              <div className="mt-6 flex gap-4 text-[10px] font-mono text-neutral-500">
                <span className="flex items-center gap-1">⏱️ 4-4-4 Cycle</span>
                <span className="flex items-center gap-1">🧘 Offline Focus</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
