/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, X, Music, Disc, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Toggle navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about", hash: "about", icon: Disc, external: false },
    { name: "Distribution & Pricing", href: "#pricing", hash: "pricing", icon: Music, external: false },
    { name: "Smart Links", href: "https://home.wavora.live", hash: "", icon: Globe, external: true },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    if (link.external) {
      // Let it open naturally in a new tab
      return;
    }
    if (link.hash) {
      const path = window.location.pathname;
      if (path !== "/") {
        // If not on homepage, let the link naturally direct to /#hash and popstate will handle it or page load will handle it
        return;
      }
      e.preventDefault();
      const element = document.getElementById(link.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <header
      id="navbar-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isOpen 
          ? "bg-[#0B0B0F]/75 backdrop-blur-xl border-b border-white/10 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_10px_30px_rgba(0,0,0,0.7)]" 
          : "bg-[#0B0B0F]/20 backdrop-blur-sm py-5 border-b border-white/5 shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center group py-1" id="nav-brand-logo">
            <Logo width={140} height={46} className="h-10 w-auto" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" id="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors relative py-1 group flex items-center gap-1.5"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-purple-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block shrink-0" id="desktop-cta-container">
            {/* LINK: Dashboard Link Placeholder --> */}
            <button
              id="nav-apply-btn"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("open-apply-modal", { detail: { planId: "pro" } }));
              }}
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 transition-all duration-300 cursor-pointer animate-pulse"
            >
              Apply for Distribution
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center" id="mobile-menu-btn-container">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors cursor-pointer select-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#0B0B0F]/80 backdrop-blur-xl border-b border-white/10 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.6)]"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    setIsOpen(false);
                    if (link.external) {
                      return;
                    }
                    if (link.hash) {
                      const path = window.location.pathname;
                      if (path !== "/") {
                        return; // Let standard link navigation work
                      }
                      e.preventDefault();
                      setTimeout(() => {
                        const element = document.getElementById(link.hash);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <link.icon className="h-5 w-5 text-purple-400" />
                  {link.name}
                </a>
              ))}
              <div className="pt-4 px-4 border-t border-white/5">
                {/* LINK: Dashboard Link Placeholder --> */}
                <button
                  key="mobile-cta"
                  onClick={() => {
                    setIsOpen(false);
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent("open-apply-modal", { detail: { planId: "pro" } }));
                    }, 100);
                  }}
                  className="block w-full text-center px-4 py-3 rounded-full text-sm font-semibold bg-gradient-purple-cyan text-white hover:opacity-90 shadow-md transition-all cursor-pointer"
                >
                  Apply for Distribution
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
