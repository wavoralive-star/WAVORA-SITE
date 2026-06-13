/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Music, Github, Twitter, Youtube, Instagram, ArrowUp, Mail, Phone, Lock } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSecretAdminTrigger = () => {
    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      setClickCount(0);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-admin-portal-secret"));
      }, 0);
    } else {
      setClickCount(nextCount);
    }
  };

  const footerLinks = [
    {
      title: "Services",
      links: [
        { label: "Global Distribution", href: "#pricing" },
        { label: "Wavora Live Events", href: "#about" }
      ]
    },
    {
      title: "Artist Resources",
      links: [
        { label: "Smart Link Creator", href: "#DASHBOARD_LINK_PLACEHOLDER" },
        { label: "Royalties Forecast", href: "#DASHBOARD_LINK_PLACEHOLDER" }
      ]
    },
    {
      title: "Platform",
      links: [
        { label: "Distribution Plans", href: "#pricing" },
        { label: "Security & DRM", href: "#" },
        { label: "FAQ Support Desk", href: "#" }
      ]
    }
  ];

  return (
    <footer id="main-footer" className="bg-[#0B0B0F] border-t border-white/10 pt-20 pb-10 relative overflow-hidden font-sans">
      {/* Decorative Blur Ambient Sphere */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50vw] h-[20vw] bg-purple-950/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Logo & Slogan Column */}
          <div className="lg:col-span-5 space-y-6" id="footer-branding">
            <a href="#" className="flex items-center group py-0.5" id="footer-logo">
              <Logo width={160} height={52} className="h-11 w-auto" />
            </a>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed font-normal">
              The premier ecosystem for independent record makers and modern creators. Retain absolute sovereignty of your musical masters, secure health resources on tour, and scale your audience organically.
            </p>

            {/* Contact details */}
            <div className="space-y-3 text-xs text-gray-400 py-1" id="footer-contact-info">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Mail className="h-4 w-4 text-purple-400" />
                </div>
                <a href="mailto:wavoralive@gmail.com" className="hover:text-white transition-colors font-mono font-medium tracking-wide">
                  wavoralive@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Phone className="h-4 w-4 text-cyan-400" />
                </div>
                <a href="tel:+919452470331" className="hover:text-white transition-colors font-mono font-medium tracking-wide">
                  +91 94524 70331
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/15">
                  <svg className="h-4 w-4 text-[#25D366] fill-current" viewBox="0 0 24 24">
                    <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.764.46 3.42 1.268 4.884L2 22l5.244-1.212c1.41.764 3.012 1.216 4.76 1.216 5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm5.196 13.916c-.22.616-1.28 1.128-1.76 1.164-.48.036-.96.2-3.08-.636-2.54-1.008-4.14-3.596-4.26-3.764-.12-.168-1.012-1.348-1.012-2.568 0-1.22.64-1.82.864-2.064.224-.244.492-.304.656-.304s.328.008.472.016c.152.008.356-.056.556.424.2.484.696 1.696.756 1.824.06.12.1.264.016.428-.08.168-.124.256-.244.396-.12.14-.26.312-.372.42-.124.12-.256.252-.108.508.148.252.656 1.084 1.408 1.756.968.864 1.78 1.132 2.036 1.26.256.128.404.108.556-.068.148-.176.64-.744.812-.996.176-.252.348-.208.588-.12.24.088 1.52.716 1.784.848.264.132.44.196.504.304.064.112.064.644-.156 1.26z" />
                  </svg>
                </div>
                <a href="https://wa.me/919452470331" target="_blank" rel="noreferrer" className="hover:text-[#25D366] transition-colors font-mono font-medium tracking-wide flex items-center gap-1.5 text-neutral-300">
                  <span>+91 94524 70331</span>
                  <span className="text-[9px] bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-1 py-0.5 rounded font-sans uppercase tracking-wider font-extrabold">Instant WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Newsletter Subscription Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3 max-w-sm" id="footer-newsletter">
              <label htmlFor="newsletter-email" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">
                Join our newsletter list
              </label>
              <div className="flex bg-white/5 rounded-full border border-white/10 p-1 items-center">
                <div className="pl-3 text-neutral-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your artist email..."
                  className="bg-transparent border-0 text-xs text-white focus:outline-none focus:ring-0 pl-2 pr-2 py-2 flex-grow placeholder-neutral-600 font-sans"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold transition-all cursor-pointer font-sans"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8" id="footer-link-grid">
            {footerLinks.map((column, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">{column.title}</h4>
                <ul className="space-y-2 text-xs">
                  {column.links.map((link, jIdx) => (
                    <li key={jIdx}>
                      <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Base Details */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6" id="footer-base">
          {/* Social icons */}
          <div className="flex gap-4 items-center text-neutral-400" id="footer-socials">
            {[
              { icon: Twitter, href: "https://twitter.com" },
              { icon: Youtube, href: "https://youtube.com" },
              { icon: Instagram, href: "https://instagram.com" },
              { icon: Github, href: "https://github.com" }
            ].map((social, sIdx) => {
              const SocialIcon = social.icon;
              return (
                <a
                  key={sIdx}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  aria-label="Social Link"
                >
                  <SocialIcon className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          {/* Copyright description */}
          <p className="text-[11px] text-gray-500 font-normal text-center sm:text-right font-mono flex items-center flex-wrap gap-1 items-center justify-center sm:justify-end">
            <span>&copy; {new Date().getFullYear()}</span>
            <span 
              onClick={handleSecretAdminTrigger} 
              className="hover:text-purple-400 cursor-pointer transition-colors select-none font-bold active:scale-95 px-1 rounded"
              title="System Brand ID"
            >
              WAVORA LIVE
            </span>
            <span>. All rights reserved. 100% Artist Ownership Guarantee.</span>
            <button
              type="button"
              onClick={handleSecretAdminTrigger}
              className="opacity-10 hover:opacity-100 transition-opacity ml-1.5 p-0.5 text-gray-400 hover:text-purple-400 cursor-pointer"
              title="Systems Access"
            >
              <Lock className="h-2.5 w-2.5 inline" />
            </button>
            {clickCount > 0 && (
              <span className="text-[9px] text-purple-400/80 bg-purple-500/10 px-1 rounded animate-pulse font-mono ml-1">
                ({clickCount}/5)
              </span>
            )}
          </p>

          {/* Scroller button */}
          <button
            onClick={scrollToTop}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-neutral-300 hover:text-white transition-all cursor-pointer shadow-md"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
