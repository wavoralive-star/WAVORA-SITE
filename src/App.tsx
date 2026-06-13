/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import DistributionPricing from "./components/DistributionPricing";
import Footer from "./components/Footer";
import ApplicationModal from "./components/ApplicationModal";
import AdminPanel from "./components/AdminPanel";
import SmartLinkCreator from "./components/SmartLinkCreator";
import SmartLinkViewer from "./components/SmartLinkViewer";
import SingleTrackDistributor from "./components/SingleTrackDistributor";
import { syncOffersFromSupabase } from "./lib/pricing";

// Helper to extract and clean smart link ID from pathname or hash
const getCleanedSmartLinkId = (pathStr: string, hashStr: string): string => {
  let raw = "";
  if (pathStr.startsWith("/s/")) {
    raw = pathStr.substring(3);
  } else if (hashStr.startsWith("#/s/")) {
    raw = hashStr.substring(4);
  } else if (hashStr.startsWith("#s/")) {
    raw = hashStr.substring(3);
  }
  
  if (!raw) return "";
  
  // Clean: discard query params & extra hashes, strip trailing slashes, and lowercase
  const withoutQuery = raw.split("?")[0].split("#")[0];
  return withoutQuery.replace(/\/+$/, "").trim().toLowerCase();
};

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("pro");
  const [isAnnualPlan, setIsAnnualPlan] = useState(true);
  const [selectedSingleTrackPlan, setSelectedSingleTrackPlan] = useState<"basic" | "pro" | "elite">("pro");

  // Client-side Router State (Instant synchronous resolution on initial mount)
  const [currentRoute, setCurrentRoute] = useState<"home" | "admin" | "view-smart-link" | "single-track-distribute">(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    if (path === "/admin" || path.startsWith("/admin") || hash === "#admin" || hash === "#/admin") {
      return "admin";
    }
    if (path === "/distribute-single" || hash === "#distribute-single") {
      return "single-track-distribute";
    }
    if (path.startsWith("/s/") || hash.startsWith("#/s/") || hash.startsWith("#s/")) {
      return "view-smart-link";
    }
    return "home";
  });

  const [activeSmartLinkId, setActiveSmartLinkId] = useState<string>(() => {
    return getCleanedSmartLinkId(window.location.pathname, window.location.hash);
  });

  // Sync promotional pricing offers from Supabase database globally on launch
  useEffect(() => {
    syncOffersFromSupabase();
  }, []);

  // Sync state transitions on window popstate/hashchange
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/admin" || path.startsWith("/admin") || hash === "#admin" || hash === "#/admin") {
        setCurrentRoute("admin");
      } else if (path.startsWith("/s/") || hash.startsWith("#/s/") || hash.startsWith("#s/")) {
        const id = getCleanedSmartLinkId(path, hash);
        setActiveSmartLinkId(id);
        setCurrentRoute("view-smart-link");
      } else {
        setCurrentRoute("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  // Intercept any relative clicks smoothly
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href === "/admin") {
          e.preventDefault();
          setCurrentRoute("admin");
          window.history.pushState({}, "", "/admin");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (href === "/") {
          e.preventDefault();
          setCurrentRoute("home");
          window.history.pushState({}, "", "/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };
    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, []);

  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ planId?: string; isAnnual?: boolean }>;
      const planId = customEvent.detail?.planId || "pro";
      const isAnnual = customEvent.detail?.isAnnual !== undefined ? customEvent.detail.isAnnual : true;
      setSelectedPlanId(planId);
      setIsAnnualPlan(isAnnual);
      setModalOpen(true);
    };

    const handleOpenSingleTrack = (e: Event) => {
      const customEvent = e as CustomEvent<{ planId?: "basic" | "pro" | "elite" }>;
      const planId = customEvent.detail?.planId || "pro";
      setSelectedSingleTrackPlan(planId);
      setCurrentRoute("single-track-distribute");
      window.history.pushState({}, "", "/distribute-single");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleOpenAdminSecret = () => {
      setCurrentRoute("admin");
      window.history.pushState({}, "", "/admin");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.shiftKey && e.altKey && e.key.toLowerCase() === "a") || (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a")) {
        e.preventDefault();
        handleOpenAdminSecret();
      }
    };

    window.addEventListener("open-apply-modal", handleOpenModal);
    window.addEventListener("open-single-track-distribute", handleOpenSingleTrack);
    window.addEventListener("open-admin-portal-secret", handleOpenAdminSecret);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("open-apply-modal", handleOpenModal);
      window.removeEventListener("open-single-track-distribute", handleOpenSingleTrack);
      window.removeEventListener("open-admin-portal-secret", handleOpenAdminSecret);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navigateTo = (route: "home" | "admin" | "view-smart-link" | "single-track-distribute", smartLinkId?: string) => {
    setCurrentRoute(route);
    let newPath = "/";
    if (route === "admin") {
      newPath = "/admin";
    } else if (route === "single-track-distribute") {
      newPath = "/distribute-single";
    } else if (route === "view-smart-link" && smartLinkId) {
      newPath = `/s/${smartLinkId}`;
      setActiveSmartLinkId(smartLinkId);
    }
    window.history.pushState({}, "", newPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (currentRoute === "admin") {
    return <AdminPanel onBackToMain={() => navigateTo("home")} />;
  }

  if (currentRoute === "view-smart-link" && activeSmartLinkId) {
    return <SmartLinkViewer id={activeSmartLinkId} onBackToMain={() => navigateTo("home")} />;
  }

  if (currentRoute === "single-track-distribute") {
    return (
      <div className="min-h-screen bg-[#07070A] text-white flex flex-col relative font-sans">
        <Navbar />
        <main className="flex-grow">
          <SingleTrackDistributor 
            selectedPlanId={selectedSingleTrackPlan} 
            onBackToMain={() => navigateTo("home")} 
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col relative font-sans" id="wavora-app-root">
      {/* Decorative Global Backdrop Matrix lines */}
      <div className="absolute inset-x-0 -top-40 h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(139,92,246,0.07),transparent)] pointer-events-none" id="decorative-bg-light" />

      {/* Floating Header */}
      <Navbar />

      {/* Main Single Page sections */}
      <main className="flex-grow flex flex-col" id="wavora-sections-container">
        {/* Section 1: Hero Cover page */}
        <Hero />

        {/* Section 2: About Value Deck */}
        <About />

        {/* Section 3: Music Distribution Plans */}
        <DistributionPricing />
      </main>

      {/* Premium Footer section */}
      <Footer />

      {/* Floating Active WhatsApp Support Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-1.5 group" id="whatsapp-floating-support">
        {/* Playful Expandable Hover Tooltip */}
        <div className="bg-[#0B0B0F]/90 text-white font-sans text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none flex items-center gap-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Chat on WhatsApp</span>
        </div>
        
        <a
          href="https://wa.me/919452470331"
          target="_blank"
          rel="noreferrer"
          className="relative h-14 w-14 bg-[#25D366] hover:bg-[#25D366]/95 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.6)] cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Direct WhatsApp Contact"
        >
          {/* Pulsing Outer Glow Wave Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/20 animate-ping pointer-events-none duration-1000" />
          
          <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
            <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.764.46 3.42 1.268 4.884L2 22l5.244-1.212c1.41.764 3.012 1.216 4.76 1.216 5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm5.196 13.916c-.22.616-1.28 1.128-1.76 1.164-.48.036-.96.2-3.08-.636-2.54-1.008-4.14-3.596-4.26-3.764-.12-.168-1.012-1.348-1.012-2.568 0-1.22.64-1.82.864-2.064.224-.244.492-.304.656-.304s.328.008.472.016c.152.008.356-.056.556.424.2.484.696 1.696.756 1.824.06.12.1.264.016.428-.08.168-.124.256-.244.396-.12.14-.26.312-.372.42-.124.12-.256.252-.108.508.148.252.656 1.084 1.408 1.756.968.864 1.78 1.132 2.036 1.26.256.128.404.108.556-.068.148-.176.64-.744.812-.996.176-.252.348-.208.588-.12.24.088 1.52.716 1.784.848.264.132.44.196.504.304.064.112.064.644-.156 1.26z" />
          </svg>
        </a>
      </div>

      {/* Premium Application Form Wizard Modal */}
      <ApplicationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialPlanId={selectedPlanId} 
        initialIsAnnual={isAnnualPlan}
      />
    </div>
  );
}
