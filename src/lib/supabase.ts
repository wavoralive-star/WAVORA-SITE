/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";

// Fetch from Vite's import.meta.env with fallback values provided by the user
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://mspjqvbusrflhaagcvsr.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "sb_publishable_ZuAK6HaKnR_D0LJTNvZ0MQ_aFqc6768";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
