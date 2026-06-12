/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlanPrices {
  annual: number;
  monthly: number;
}

export const BASE_PRICES: Record<string, PlanPrices> = {
  basic: { annual: 399, monthly: 39 },
  pro: { annual: 1199, monthly: 119 },
  elite: { annual: 1999, monthly: 199 }
};

export interface PlanOffer {
  planId: string; // "basic" | "pro" | "elite"
  annualOfferPrice: number | null; // e.g. 299 (null means no offer override)
  monthlyOfferPrice: number | null; // e.g. 39 (null means no offer override)
  offerLabel: string; // e.g. "Early Bird Offer", "Festival Special"
}

// Load current promotional offers
export function getStoredOffers(): Record<string, PlanOffer> {
  const defaultOffers: Record<string, PlanOffer> = {
    basic: { planId: "basic", annualOfferPrice: null, monthlyOfferPrice: null, offerLabel: "" },
    pro: { planId: "pro", annualOfferPrice: null, monthlyOfferPrice: null, offerLabel: "" },
    elite: { planId: "elite", annualOfferPrice: null, monthlyOfferPrice: null, offerLabel: "" }
  };

  const stored = localStorage.getItem("wavora_plan_offers");
  if (!stored) return defaultOffers;

  try {
    const parsed = JSON.parse(stored);
    // Merge into default to maintain all IDs
    return {
      basic: { ...defaultOffers.basic, ...parsed.basic },
      pro: { ...defaultOffers.pro, ...parsed.pro },
      elite: { ...defaultOffers.elite, ...parsed.elite }
    };
  } catch (err) {
    return defaultOffers;
  }
}

// Save pricing offer configurations
export function saveStoredOffers(offers: Record<string, PlanOffer>) {
  localStorage.setItem("wavora_plan_offers", JSON.stringify(offers));
  // Dispatch globally to sync UI state instantly in a modular SPA setup
  window.dispatchEvent(new Event("wavora_offers_updated"));
}

// Compute active discounted outcomes for display and transactions
export function getPlanPriceDetails(planId: string, isAnnual: boolean) {
  const base = BASE_PRICES[planId] || BASE_PRICES["pro"];
  const basePrice = isAnnual ? base.annual : base.monthly;
  
  const offers = getStoredOffers();
  const offer = offers[planId];
  
  const offerPrice = offer 
    ? (isAnnual ? offer.annualOfferPrice : offer.monthlyOfferPrice)
    : null;
    
  const hasOffer = offerPrice !== null && offerPrice !== undefined && offerPrice > 0 && offerPrice < basePrice;
  const finalPrice = hasOffer ? Number(offerPrice) : basePrice;
  const discountPercent = hasOffer ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0;
  
  return {
    basePrice,
    finalPrice,
    hasOffer,
    offerPrice,
    discountPercent,
    offerLabel: (hasOffer && offer?.offerLabel) ? offer.offerLabel : "",
    period: isAnnual ? "year" : "month"
  };
}
