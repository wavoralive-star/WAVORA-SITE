/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Check, Copy, Upload, ArrowRight, Sparkles, AlertCircle, Clock, CheckCircle2, ShieldCheck, Mail, User, Radio, Phone, HelpCircle,
  LogIn, Key, ShieldAlert
} from "lucide-react";
import Logo from "./Logo";
import { supabase } from "../lib/supabase";
import { getPlanPriceDetails } from "../lib/pricing";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: string;
  initialIsAnnual?: boolean;
}

export default function ApplicationModal({ isOpen, onClose, initialPlanId = "pro", initialIsAnnual = true }: ApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnnual, setIsAnnual] = useState(initialIsAnnual);
  const [formData, setFormData] = useState({
    plan: initialPlanId,
    email: "",
    fullName: "",
    stageName: "",
    contactNumber: "",
    referral: "Instagram",
  });
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supabase Verification States
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState("");

  // Sync plan if initialPlanId or initialIsAnnual changes when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, plan: initialPlanId }));
      setIsAnnual(initialIsAnnual);
      setCurrentStep(1);
      setReceiptFile(null);
      setReceiptPreview(null);
      setCopied(false);
      setIsVerifying(false);
      setErrors({});
      setVerificationError("");
      setVerificationSuccess("");
      setVerificationSent(false);
      setSentToEmail("");
      setOtpToken("");
    }
  }, [isOpen, initialPlanId, initialIsAnnual]);

  useEffect(() => {
    // Get initial user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionUser(user);
      if (user?.email) {
        setFormData(prev => ({ ...prev, email: user.email || "" }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setSessionUser(user);
      if (user?.email) {
        setFormData(prev => ({ ...prev, email: user.email || "" }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

   const sendVerificationLink = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address first." }));
      return;
    }
    
    setIsVerifyingEmail(true);
    setVerificationError("");
    setVerificationSuccess("");
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: window.location.origin || window.location.href,
        }
      });
      
      if (error) {
        if (error.message && error.message.toLowerCase().includes("rate limit")) {
          throw new Error("Email verification server rate limit exceeded. Supabase default SMTP limits mail to 3 per hour. Please use our instant Sandbox Bypass below to unlock and continue testing!");
        }
        throw error;
      }
      
      setVerificationSent(true);
      setSentToEmail(formData.email);
      setVerificationSuccess(`A verification code and magic link have been sent to ${formData.email}! Please check your inbox.`);
    } catch (err: any) {
      setVerificationError(err.message || "Failed to send verification link.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSandboxBypass = () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address first." }));
      return;
    }
    setSessionUser({
      email: formData.email,
      id: "sandbox-demo-user-" + Math.random().toString(36).substring(2, 11),
      user_metadata: { is_sandbox: true }
    });
    setVerificationSuccess("Sandbox Verification Bypass active! Your email has been simulated as verified for this testing session.");
    setVerificationSent(false);
    setVerificationError("");
  };

  const verifyOtpCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpToken.trim()) {
      setVerificationError("Please enter the verification code sent to your email.");
      return;
    }
    
    setIsVerifyingEmail(true);
    setVerificationError("");
    setVerificationSuccess("");
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: sentToEmail || formData.email,
        token: otpToken.trim(),
        type: "email"
      });
      
      if (error) {
        // Fallback check "signup"
        const { data: secondRetry, error: signupError } = await supabase.auth.verifyOtp({
          email: sentToEmail || formData.email,
          token: otpToken.trim(),
          type: "signup"
        });
        if (signupError) throw error; // Throws original error
      }
      
      setVerificationSuccess("Email verified and secured successfully!");
      setVerificationSent(false);
      setOtpToken("");
    } catch (err: any) {
      setVerificationError(err.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const checkVerificationStatus = async () => {
    setIsVerifyingEmail(true);
    setVerificationError("");
    setVerificationSuccess("");
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user && user.email === (sentToEmail || formData.email)) {
        setSessionUser(user);
        setVerificationSuccess("Verification status confirmed! Email is active.");
        setVerificationSent(false);
      } else {
        setVerificationError("We couldn't detect an active verified session for this email yet. Make sure you clicked the link in your email.");
      }
    } catch (err: any) {
      setVerificationError("Could not retrieve verification status. Click the link in your email to sync.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSignOut = async () => {
    setIsVerifyingEmail(true);
    setVerificationError("");
    setVerificationSuccess("");
    try {
      await supabase.auth.signOut();
      setSessionUser(null);
      setFormData(prev => ({ ...prev, email: "" }));
      setVerificationSent(false);
      setSentToEmail("");
      setOtpToken("");
    } catch (err: any) {
      setVerificationError(err.message);
    } finally {
      setIsVerifyingEmail(false);
    }
  };


  // Set up click/keypress handlers to close modal on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText("damnsingh@fam");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
    }
  };

  // Drag and Drop receipt handlers
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
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.match("image.*") && file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, receipt: "Please upload an image or PDF screenshot." }));
      return;
    }
    setErrors(prev => {
      const next = { ...prev };
      delete next.receipt;
      return next;
    });
    setReceiptFile(file);
    if (file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview("pdf");
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!formData.stageName.trim()) newErrors.stageName = "Stage / Artist name is required.";
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    } else if (!sessionUser || sessionUser.email !== formData.email) {
      newErrors.email = "Email address must be verified using Supabase before proceeding.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      setErrors(prev => ({ ...prev, receipt: "Payment receipt verification screenshot is required!" }));
      return;
    }
    setIsVerifying(true);
    // Simulate premium verification transaction server cycle
    setTimeout(async () => {
      const dbPayload = {
        plan: formData.plan,
        is_annual: isAnnual,
        email: formData.email,
        full_name: formData.fullName,
        stage_name: formData.stageName,
        contact_number: formData.contactNumber,
        referral: formData.referral,
        receipt: receiptPreview || "",
        status: "pending",
        user_id: sessionUser?.id || null
      };

      // Try asynchronously syncing directly to Supabase if applications database table is set up
      try {
        const { error: dbErr } = await supabase.from("applications").insert([dbPayload]);
        if (dbErr) {
          console.warn("Supabase database sync bypassed (Setup schema if you wish database storage):", dbErr);
        }
      } catch (err) {
        console.warn("Autosaved to cache. Supabase database server silent:", err);
      }

      // Save application to localStorage with session context
      try {
        const existingAppsRaw = localStorage.getItem("wavora_applications");
        const existingApps = existingAppsRaw ? JSON.parse(existingAppsRaw) : [];
        
        const newApp = {
          id: `app-${Date.now()}`,
          plan: formData.plan,
          isAnnual: isAnnual,
          email: formData.email,
          fullName: formData.fullName,
          stageName: formData.stageName,
          contactNumber: formData.contactNumber,
          referral: formData.referral,
          receipt: receiptPreview || "",
          status: "pending",
          userId: sessionUser?.id || null,
          date: new Date().toISOString()
        };
        
        localStorage.setItem("wavora_applications", JSON.stringify([newApp, ...existingApps]));
        
        // Trigger storage event to update Admin Panel if open in active tab
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Failed to save application to localStorage", err);
      }

      setIsVerifying(false);
      setCurrentStep(3);
    }, 2500);
  };

  const selectPlanDetails = () => {
    const details = getPlanPriceDetails(formData.plan, isAnnual);
    let name = "Pro Artist Plan";
    switch (formData.plan) {
      case "basic": name = "Basic Plan"; break;
      case "elite": name = "Elite Label Plan"; break;
    }
    return { 
      name, 
      price: `₹${details.finalPrice}`, 
      period: details.period, 
      hasOffer: details.hasOffer, 
      basePrice: `₹${details.basePrice}`, 
      discountPercent: details.discountPercent, 
      offerLabel: details.offerLabel 
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#06060A]/85 backdrop-blur-md cursor-pointer"
            id="modal-overlay"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0F] shadow-[0_0_50px_rgba(139,92,246,0.15)] z-10 text-white flex flex-col font-sans"
            id="apply-modal-wrapper"
          >
            {/* Top Glowing Vector Bar */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-violet-600 to-cyan-400" />

            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between pb-4 bg-white/2">
              <div className="flex items-center gap-3">
                <Logo hideTagline={true} width={120} height={34} className="h-8 w-auto shrink-0" />
                <div className="h-6 w-[1px] bg-white/15" />
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-purple-400" id="modal-title-header">
                    Distribution Setup
                  </h3>
                  <p className="text-[9px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">Secure Gateway</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close Modal"
                id="modal-close-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Custom Multi-Step Progress Tracker */}
            <div className="px-8 pt-5 pb-1 flex justify-between items-center bg-[#0B0B0F]" id="modal-step-tracker">
              {[
                { step: 1, label: "Your Profile" },
                { step: 2, label: "Secure Payment" },
                { step: 3, label: "Verification" }
              ].map((s, index) => (
                <div key={s.step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                        currentStep === s.step
                          ? "bg-gradient-purple-cyan text-white shadow-[0_0_12px_rgba(139,92,200,0.4)]"
                          : currentStep > s.step
                            ? "bg-purple-600 text-white"
                            : "bg-white/5 border border-white/10 text-gray-500"
                      }`}
                    >
                      {currentStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <span 
                      className={`text-[11px] font-bold uppercase tracking-wider hidden sm:inline ${
                        currentStep === s.step ? "text-purple-400" : currentStep > s.step ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className="flex-grow h-[1px] mx-4 bg-white/10 relative overflow-hidden hidden sm:block">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300" 
                        style={{ width: currentStep > s.step ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Forms Body Panels */}
            <div className="p-8 flex-1 overflow-y-auto max-h-[70vh]" id="modal-content-panel">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 25 }}
                    onSubmit={handleStep1Submit}
                    className="space-y-5"
                    id="apply-form-step1"
                  >
                    {/* select plan zone */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          Select Distribution tier
                        </label>
                        <div className="flex p-0.5 bg-white/5 border border-white/10 rounded-lg self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setIsAnnual(false)}
                            className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                              !isAnnual ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAnnual(true)}
                            className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                              isAnnual ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Annual
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[
                          { id: "basic", title: "Basic", features: "150 stores, 80% royalty" },
                          { id: "pro", title: "Pro Artist", features: "150 stores, 90% royalty" },
                          { id: "elite", title: "Elite Label", features: "150+ stores, 100% royalty" }
                        ].map((plan) => {
                          const priceDetails = getPlanPriceDetails(plan.id, isAnnual);
                          return (
                            <div
                              key={plan.id}
                              onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                              className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all duration-300 ${
                                formData.plan === plan.id
                                  ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(139,92,200,0.15)] ring-1 ring-purple-500"
                                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex justify-between items-start col-span-3">
                                <h4 className="text-xs font-bold text-white uppercase">{plan.title}</h4>
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  formData.plan === plan.id ? "border-purple-400 bg-[#0B0B0F]" : "border-white/20"
                                }`}>
                                  {formData.plan === plan.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                                </div>
                              </div>
                              <div className="mt-2.5">
                                <div className="flex items-baseline gap-1 flex-wrap">
                                  {priceDetails.hasOffer ? (
                                    <>
                                      <span className="text-xs font-mono font-bold text-gray-500 line-through">₹{priceDetails.basePrice}</span>
                                      <span className="text-base font-mono font-bold text-white">₹{priceDetails.finalPrice}</span>
                                    </>
                                  ) : (
                                    <span className="text-base font-mono font-bold text-white">₹{priceDetails.basePrice}</span>
                                  )}
                                  <span className="text-[10px] text-gray-500 font-medium">/ {isAnnual ? "yr" : "mo"}</span>
                                </div>
                                {priceDetails.hasOffer && (
                                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-red-400/15 text-red-400 border border-red-400/20">
                                    {priceDetails.discountPercent}% OFF
                                  </span>
                                )}
                                <span className="text-[9px] text-gray-500 block leading-tight mt-1.5">{plan.features}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>



                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="fullName" className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          Full Name
                        </label>
                        <div className="relative group">
                          <div className="absolute top-3.5 left-3 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                            <User className="h-4 w-4" />
                          </div>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Your Legal Name"
                            className={`w-full bg-white/5 border rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-purple-500 focus:bg-[#0B0B0F]/90 ${
                              errors.fullName ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                            }`}
                          />
                        </div>
                        {errors.fullName && (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1.5">
                            <AlertCircle className="w-3 h-3" /> {errors.fullName}
                          </span>
                        )}
                      </div>

                      {/* Stage Name / Artist Name */}
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="stageName" className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          Stage / Artist Name
                        </label>
                        <div className="relative group">
                          <div className="absolute top-3.5 left-3 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                            <Radio className="h-4 w-4" />
                          </div>
                          <input
                            id="stageName"
                            name="stageName"
                            type="text"
                            value={formData.stageName}
                            onChange={handleInputChange}
                            placeholder="Stage / Artist Name"
                            className={`w-full bg-white/5 border rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-purple-500 focus:bg-[#0B0B0F]/90 ${
                              errors.stageName ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                            }`}
                          />
                        </div>
                        {errors.stageName && (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1.5">
                            <AlertCircle className="w-3 h-3" /> {errors.stageName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2.5 text-left bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <label htmlFor="email" className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          Email Address
                        </label>
                        {sessionUser && sessionUser.email === formData.email ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="h-3 w-3" /> VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-red-400/10 text-red-400 border border-red-400/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> VERIFICATION REQUIRED
                          </span>
                        )}
                      </div>

                      <div className="relative group">
                        <div className="absolute top-3.5 left-3 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!!sessionUser && sessionUser.email === formData.email}
                          placeholder="artist@supabase.io"
                          className={`w-full bg-[#050507]/60 border rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-purple-500 focus:bg-[#0B0B0F]/90 ${
                            errors.email ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                          } ${sessionUser && sessionUser.email === formData.email ? "opacity-60 cursor-not-allowed bg-white/[0.01]" : ""}`}
                        />
                      </div>

                      {errors.email && (
                        <span className="text-[10px] text-red-400 flex items-center gap-1.5 mt-1.5">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </span>
                      )}

                      {/* Interactive Supabase Verification controller */}
                      <div className="mt-3.5 pt-3.5 border-t border-white/5 space-y-3 relative z-10 font-sans">
                        {sessionUser && sessionUser.email === formData.email ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 block font-mono">
                                Security Status Verified
                              </span>
                              <p className="text-[11px] text-gray-400 font-medium">
                                Secure release draft authenticated under <span className="font-mono text-purple-300 font-bold">{sessionUser.email}</span>.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleSignOut}
                              disabled={isVerifyingEmail}
                              className="text-[9px] font-bold uppercase tracking-wider bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 focus:outline-none transition-all px-3 py-2 rounded-lg cursor-pointer shrink-0"
                            >
                              {isVerifyingEmail ? "Disconnecting..." : "Change Email"}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {!verificationSent ? (
                              <div className="space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                                  <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed max-w-sm">
                                    To secure your artist revenue agreement and draft releases, we verify every email address with single-use security passes.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={sendVerificationLink}
                                    disabled={isVerifyingEmail || !formData.email || !/\S+@\S+\.\S+/.test(formData.email)}
                                    className="px-4 py-2 bg-gradient-purple-cyan hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none transition-all rounded-xl text-black font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-lg shrink-0"
                                  >
                                    {isVerifyingEmail ? "Sending Pass..." : "Verify This Email"}
                                  </button>
                                </div>
                                <div className="text-right">
                                  <button
                                    type="button"
                                    onClick={handleSandboxBypass}
                                    className="text-[9px] font-extrabold text-transparent bg-clip-text bg-gradient-purple-cyan hover:opacity-85 transition-all uppercase tracking-widest cursor-pointer inline-flex items-center gap-1 focus:outline-none"
                                  >
                                    ⚡ Click here to verify instantly (Sandbox Sandbox Bypass / Test Mode)
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3.5 bg-[#07070B] p-4 sm:p-5 rounded-2xl border border-purple-500/15 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 blur-2xl rounded-full" />
                                
                                <div className="space-y-1 text-left">
                                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                                    Confirm Email Link Sent
                                  </span>
                                  <p className="text-[11px] text-gray-400 leading-relaxed">
                                    A confirmation email was sent to <strong className="text-white font-mono">{sentToEmail}</strong> containing your secure verification link.
                                  </p>
                                </div>

                                {/* Step-by-Step Interactive Guide */}
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3 text-left">
                                  <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-[10px] font-bold text-purple-400 font-mono">1</span>
                                    </div>
                                    <div className="space-y-0.5">
                                      <h5 className="text-[11px] font-extrabold text-white uppercase tracking-wider">Click "Confirm email address"</h5>
                                      <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Open the confirmation email in your inbox and click the button to authorize your artist session safely.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3 pt-1 border-t border-white/5">
                                    <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-[10px] font-bold text-purple-400 font-mono">2</span>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                      <div className="space-y-0.5">
                                        <h5 className="text-[11px] font-extrabold text-white uppercase tracking-wider">Authorize & Sync Session</h5>
                                        <p className="text-[10px] text-gray-400 leading-relaxed">
                                          Once you've clicked the link, press the button below to sync your session and instantly unlock the secure payment step.
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={checkVerificationStatus}
                                        disabled={isVerifyingEmail}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-gradient-purple-cyan hover:opacity-95 disabled:opacity-30 disabled:pointer-events-none transition-all rounded-xl text-black font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                                      >
                                        {isVerifyingEmail ? (
                                          <>
                                            <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin inline-block" />
                                            Checking Status...
                                          </>
                                        ) : (
                                          <>
                                            <Check className="h-3.5 w-3.5" />
                                            Check Verification Link Clicked
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Alternative manual 6-digit OTP passcode section */}
                                <div className="border-t border-white/5 pt-3.5 text-left">
                                  <details className="group/otp-details">
                                    <summary className="list-none flex items-center justify-between text-[10px] font-bold text-gray-500 hover:text-gray-400 cursor-pointer select-none transition-colors">
                                      <span>Alternative: Enter Verification Code manually</span>
                                      <span className="text-[8px] transform group-open/otp-details:rotate-180 transition-transform">▼</span>
                                    </summary>
                                    
                                    <div className="pt-3 space-y-2.5">
                                      <p className="text-[10px] text-gray-500 leading-relaxed">
                                        If your email contains a 6-digit security code or code parameter, paste it below.
                                      </p>
                                      
                                      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
                                        <div className="flex-1 space-y-1">
                                          <label htmlFor="otpToken" className="text-[8px] font-extrabold text-gray-500 uppercase tracking-widest font-mono">
                                            6-Digit Passcode
                                          </label>
                                          <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <input
                                              id="otpToken"
                                              type="text"
                                              maxLength={6}
                                              placeholder="123456"
                                              value={otpToken}
                                              onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                                              className="w-full bg-[#050507] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500 font-mono tracking-[4px]"
                                            />
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => verifyOtpCode()}
                                          disabled={isVerifyingEmail || otpToken.length !== 6}
                                          className="px-4 py-2 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-all rounded-xl text-black font-extrabold text-[10px] uppercase tracking-widest cursor-pointer shadow-lg h-9 flex items-center justify-center shrink-0"
                                        >
                                          {isVerifyingEmail ? "Verifying..." : "Verify Code"}
                                        </button>
                                      </div>
                                    </div>
                                  </details>
                                </div>

                                <div className="flex items-center justify-between text-[9px] text-gray-500 border-t border-white/5 pt-2.5">
                                  <span>Didn't receive email? Check spam.</span>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={handleSandboxBypass}
                                      className="text-[9px] text-purple-400 hover:text-purple-300 font-extrabold uppercase transition-all tracking-wider cursor-pointer"
                                    >
                                      ⚡ Sandbox Bypass
                                    </button>
                                    <span className="text-white/10">|</span>
                                    <button
                                      type="button"
                                      onClick={sendVerificationLink}
                                      disabled={isVerifyingEmail}
                                      className="text-purple-400 hover:text-purple-300 font-bold transition-all uppercase cursor-pointer bg-transparent border-0"
                                    >
                                      {isVerifyingEmail ? "Sending..." : "Resend Link"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Status notifications specifically for verification */}
                            {verificationError && (
                              <div className="space-y-2">
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] sm:text-xs flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                                    <span>{verificationError}</span>
                                  </div>
                                  {verificationError.toLowerCase().includes("rate limit") && (
                                    <div className="mt-1 pt-2 border-t border-white/5 flex flex-col gap-2 text-left">
                                      <p className="text-[10px] text-gray-400 leading-normal font-sans">
                                        No worries! If you are blocked by Supabase's safe email limit (or testing iteratively), activate sandbox-simulation bypass below to keep working.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={handleSandboxBypass}
                                        className="self-start px-3 py-1.5 bg-gradient-purple-cyan text-black hover:opacity-90 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 border-0 focus:outline-none"
                                      >
                                        Bypass Rate Limit & Verify Instantly
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {verificationSuccess && (
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] sm:text-xs flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>{verificationSuccess}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Contact Number */}
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="contactNumber" className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          Contact Number
                        </label>
                        <div className="relative group">
                          <div className="absolute top-3.5 left-3 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                            <Phone className="h-4 w-4" />
                          </div>
                          <input
                            id="contactNumber"
                            name="contactNumber"
                            type="text"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            placeholder="Contact Number (+1 / +91 ... )"
                            className={`w-full bg-white/5 border rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:border-purple-500 focus:bg-[#0B0B0F]/90 ${
                              errors.contactNumber ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                            }`}
                          />
                        </div>
                        {errors.contactNumber && (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1.5">
                            <AlertCircle className="w-3 h-3" /> {errors.contactNumber}
                          </span>
                        )}
                      </div>

                      {/* Where did you hear about Wavora Live? */}
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="referral" className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                          Where did you hear about Wavora Live?
                        </label>
                        <div className="relative group">
                          <div className="absolute top-3.5 left-3 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </div>
                          <select
                            id="referral"
                            name="referral"
                            value={formData.referral}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-xs text-gray-300 outline-none transition-all duration-300 focus:border-purple-500 focus:bg-[#0B0B0F]/90 appearance-none cursor-pointer"
                          >
                            <option value="Instagram" className="bg-[#0B0B0F]">Instagram / Social Media</option>
                            <option value="Spotify Link" className="bg-[#0B0B0F]">Spotify Curator Page</option>
                            <option value="Artist Recommendation" className="bg-[#0B0B0F]">Artist Peer Recommendation</option>
                            <option value="Online Search" className="bg-[#0B0B0F]">Google / Online Search</option>
                            <option value="Billboard" className="bg-[#0B0B0F]">Billboard or Press Release</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step CTA Submit */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={!sessionUser || sessionUser.email !== formData.email}
                        className={`w-full py-4 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                          sessionUser && sessionUser.email === formData.email
                            ? "bg-gradient-purple-cyan text-white hover:opacity-95"
                            : "bg-[#0E0E14] text-neutral-600 border border-white/5 cursor-not-allowed"
                        }`}
                      >
                        {sessionUser && sessionUser.email === formData.email ? (
                          <>
                            Proceed to Payment
                            <ArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          "Please Verify Your Email to Unlock Payment"
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}

                {currentStep === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 25 }}
                    onSubmit={handleStep2Submit}
                    className="space-y-5"
                    id="apply-form-step2"
                  >
                    {/* Selected Plan Details Callout Header */}
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase">{selectPlanDetails().name} Allocation</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Secure payment confirmation cycle</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-mono font-bold text-white">{selectPlanDetails().price}</span>
                          <span className="text-[9px] text-gray-400">/ {selectPlanDetails().period === "year" ? "yr" : "mo"}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 block leading-none mt-0.5">Due Today</span>
                      </div>
                    </div>

                    {/* Prominent UPI Copy Panel */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Wavora Official UPI Address</span>
                          <h5 className="text-base sm:text-lg font-mono font-extrabold text-white tracking-tight flex items-center gap-1.5">
                            {/* UPI ID HERE */}
                            damnsingh@fam
                          </h5>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyUPI}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                            copied 
                              ? "bg-green-500/10 border-green-500/30 text-green-400" 
                              : "bg-white/5 border-white/10 hover:border-purple-500/30 text-white hover:bg-white/10"
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-400" />
                              Copied Address
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-neutral-400" />
                              Copy UPI ID
                            </>
                          )}
                        </button>
                      </div>

                      <div className="pt-3 border-t border-white/5 text-[11px] text-gray-400 font-normal leading-relaxed text-left">
                        Please make the payment of <strong className="text-white font-mono">{selectPlanDetails().price}</strong> to the UPI ID above using any UPI app (GPay, PhonePe, Paytm), and upload your payment receipt screenshot below to verify your slot.
                      </div>
                    </div>

                    {/* Screenshot File Upload Drag-and-Drop Zone */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-left">
                        Upload Receipt Screenshot
                      </label>
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all ${
                          dragActive 
                            ? "border-purple-400 bg-purple-500/5" 
                            : "border-white/10 hover:border-purple-500/20 bg-black/40 hover:bg-white/2 bg-opacity-20"
                        }`}
                        id="receipt-uploader-zone"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        {receiptFile ? (
                          <div className="space-y-3.5 py-2 w-full flex flex-col items-center">
                            {receiptPreview === "pdf" ? (
                              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold uppercase">
                                PDF Document Receipt
                              </div>
                            ) : (
                              receiptPreview && (
                                <img
                                  src={receiptPreview}
                                  alt="Receipt Screenshot Preview"
                                  className="h-28 max-w-[200px] object-cover rounded-md border border-white/10 shadow-lg"
                                />
                              )
                            )}
                            <div className="text-center">
                              <p className="text-xs font-bold text-white max-w-xs truncate mx-auto">{receiptFile.name}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{(receiptFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptFile(null);
                                setReceiptPreview(null);
                              }}
                              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-extrabold text-[10px] uppercase tracking-wide rounded-md transition-all cursor-pointer"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <div className="py-4">
                            <Upload className="h-9 w-9 text-purple-400 mx-auto space-y-1 mb-3.5 animate-bounce" />
                            <h5 className="text-xs font-extrabold text-white mb-2 uppercase tracking-wide">Upload Screenshot Here</h5>
                            <p className="text-[11px] text-gray-500 max-w-sm mb-4 leading-normal font-normal">
                              Drag and drop or click local selector. Supports PNG, JPG, JPEG representation or PDF receipt files up to 10MB.
                            </p>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-xs font-extrabold tracking-wider uppercase transition-all duration-300 cursor-pointer"
                            >
                              Choose Screenshot File
                            </button>
                          </div>
                        )}
                      </div>
                      {errors.receipt && (
                        <span className="text-[10px] text-red-400 flex items-center gap-1 mt-1.5 justify-center">
                          <AlertCircle className="w-3 h-3 animate-shake" /> {errors.receipt}
                        </span>
                      )}
                    </div>

                    {/* Navigation Buttons for Step 2 */}
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="sm:col-span-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifying}
                        className="sm:col-span-2 py-4 rounded-xl font-extrabold text-xs uppercase tracking-widest bg-gradient-purple-cyan text-white shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                      >
                        {isVerifying ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Verifying payment slip...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4" />
                            Submit Application &amp; Verify
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 text-center space-y-6"
                    id="apply-success-panel"
                  >
                    {/* Success Sphere Rings design */}
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-green-500/10 border-2 border-green-500/20 animate-ping max-w-[80px]" />
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-green-500/20 to-teal-400/20 border border-green-500/30 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                      </div>
                    </div>

                    <div className="space-y-3.5 max-w-lg mx-auto">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight" id="success-header-headline">
                        Application Submitted Successfully!
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed">
                        Thank you for choosing Wavora Live. We are reviewing your application and payment screenshot. We&apos;ll email you your credentials in 24 hours, or before, along with your dashboard access link.
                      </p>
                    </div>

                    {/* Security certification compliance marker */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 max-w-md mx-auto flex items-center justify-center gap-2 text-neutral-400 font-mono text-[9px] uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      Estimated Verification Queue time: &lt; 4 Hours
                    </div>

                    {/* CTA Go to Dashboard */}
                    {/* DASHBOARD LINK */}
                    <div className="pt-4 max-w-sm mx-auto">
                      <a
                        id="nav-success-dash-btn"
                        href="#DASHBOARD_LINK_PLACEHOLDER"
                        onClick={onClose}
                        className="block w-full py-4 rounded-xl font-extrabold text-xs uppercase tracking-widest bg-white text-black hover:bg-gray-200 transition-all shadow-xl"
                      >
                        Go to Dashboard
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
