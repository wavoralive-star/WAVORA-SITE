/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, HeartHandshake, Zap, Calendar, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

export default function About() {
  const pillars = [
    {
      title: "Global Distribution",
      description: "Deliver your tracks to Spotify, Apple Music, TikTok, Amazon Music, and 150+ digital stores globally. Hold onto 100% of your masters and keep your full streaming revenue.",
      icon: ShieldCheck,
      colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/15",
      accent: "purple",
    },
    {
      title: "Artist Wellness & Care",
      description: "We view independent artists as human beings first. Access mental wellness guides, counselor counseling support, and physical safety resources designed for life on the road.",
      icon: HeartHandshake,
      colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/15",
      accent: "rose",
    },
    {
      title: "Smart Social Promotion",
      description: "Pitch to verified playlists, automate strategic newsletter loops, deploy high-impact TikTok audio campaigns, and extract powerful real-time fanbase telemetry.",
      icon: Zap,
      colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/15",
      accent: "cyan",
    },
    {
      title: "Exclusive Live Events",
      description: "Bridge the digital gap and step onto physical stages. From Wavora Showcase Nights to regional intimate gigs, get booked directly via our elite network.",
      icon: Calendar,
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/15",
      accent: "amber",
    },
  ];

  return (
    <section id="about" className="py-24 relative bg-transparent">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute right-0 top-1/2 w-[35vw] h-[35vw] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute left-10 bottom-0 w-[30vw] h-[30vw] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Text */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20" id="about-header">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            About Wavora Live
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans" id="about-heading">
            The Complete Craft Platform <br className="sm:inline" />
            Built for <span className="text-gradient-purple-cyan font-sans font-bold">Modern Independent Artists</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 px-2 font-normal">
            Most distributors collect their royalty share and disappear. Wavora Live changes the rules. We offer a high-fidelity distribution hub equipped with wellness networks, social acceleration tools, and real stage access.
          </p>
        </div>

        {/* Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" id="about-pillars-grid">
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative rounded-2xl p-8 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Radial Glow on hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-violet-500/0 group-hover:bg-${pillar.accent}-500/5 blur-2xl rounded-full transition-colors duration-500 pointer-events-none`} />

                <div>
                  {/* Icon Block */}
                  <div className={`inline-flex p-3.5 rounded-xl border ${pillar.colorClass} mb-6 transition-transform group-hover:scale-105 duration-300`}>
                    <IconComponent className="h-6 w-6" />
                  </div>

                  {/* Copy */}
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-neutral-100 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">
                    {pillar.description}
                  </p>
                </div>

                {/* Micro Action link */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-white transition-colors pt-2 border-t border-white/5">
                  <span>Explore Core Ecosystem</span>
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Integrated Core Philosophy Statement Card */}
        <div className="mt-16 bg-gradient-to-r from-purple-950/20 to-cyan-950/10 rounded-2xl border border-white/10 p-8 sm:p-10 relative overflow-hidden" id="about-editorial-card">
          <div className="absolute inset-0 bg-[radial-gradient(#1c1a2f_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Our Non-Negotiable Contract: You Own 100% of Your Masters
              </h4>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Many platforms bind independent musicians with strict exclusive rights or collect perpetual percentages of digital streaming income. We believe in absolute creative sovereignty. When you distribute with Wavora Live, you retain complete copyright control, absolute royalty access, and the freedom to leave whenever you wish.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <a
                href="#pricing"
                className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                Inspect Pricing Plans
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
