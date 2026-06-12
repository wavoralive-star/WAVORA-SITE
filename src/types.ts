/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  popular: boolean;
  features: string[];
  ctaText: string;
  accent: string;
}

export interface FeatureComparison {
  featureName: string;
  basic: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
  category: string;
}

export interface WellnessResource {
  title: string;
  description: string;
  category: "Mental Health" | "Work-Life Balance" | "Physical Wellness" | "Community";
  readTime: string;
  externalLink: string;
}

export interface MasteringPreset {
  id: string;
  name: string;
  description: string;
  eqFocus: string;
  loudnessTarget: string;
}
