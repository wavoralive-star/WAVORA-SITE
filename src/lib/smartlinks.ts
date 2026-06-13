/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SmartLink {
  id: string; // URL slug e.g. "electro-rush"
  title: string;
  artist: string;
  artworkUrl: string; // Base64 or template URL
  description: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  jioSaavnUrl: string;
  youtubeUrl?: string;
  visits: number;
  createdAt: string;
}

// Preset modern mock artworks that look stunning (Gradient placeholders/patterns in SVG dataurls, or stunning canvas style templates)
export const PRESET_ARTWORKS = [
  "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop", // Neon Synthwave
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop", // Orange Sand Dunes
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop", // Purple Neon Concert
  "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=600&auto=format&fit=crop", // Abstract Fluid Art
];

const DEFAULT_LINKS: SmartLink[] = [
  {
    id: "electro-rush",
    title: "Electro Rush (Sunset Mix)",
    artist: "ElectroVibe",
    artworkUrl: PRESET_ARTWORKS[0],
    description: "The ultimate hyper-energetic synthwave anthem designed for high speed driving and neon-soaked nights.",
    spotifyUrl: "https://open.spotify.com/track/4PTG3Z6ehGkBF36qHkY6EG",
    appleMusicUrl: "https://music.apple.com/us/album/electro-rush-single/1234567890",
    jioSaavnUrl: "https://www.jiosaavn.com/song/electro-rush/RlteByRZXgQ",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    visits: 342,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "raga-blue",
    title: "Sitar Raga Blue (Chillout)",
    artist: "Sitar Odyssey",
    artworkUrl: PRESET_ARTWORKS[1],
    description: "An evocative fusion of traditional Indian classical Sitar paired with ambient lo-fi and deep house elements.",
    spotifyUrl: "https://open.spotify.com/album/37i9dQZF1DX8Uebhn99m0v",
    appleMusicUrl: "https://music.apple.com/us/album/raga-blue-single/987654321",
    jioSaavnUrl: "https://www.jiosaavn.com/song/raga-blue/AlFeBCRZ",
    youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    visits: 198,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  }
];

import { supabase } from "./supabase";

export function getSmartLinks(): SmartLink[] {
  const stored = localStorage.getItem("wavora_smart_links");
  if (!stored) {
    localStorage.setItem("wavora_smart_links", JSON.stringify(DEFAULT_LINKS));
    return DEFAULT_LINKS;
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    return DEFAULT_LINKS;
  }
}

export function saveSmartLinks(links: SmartLink[]) {
  localStorage.setItem("wavora_smart_links", JSON.stringify(links));
  window.dispatchEvent(new Event("wavora_smart_links_updated"));
}

// Convert DB row (snake_case) from Supabase to client SmartLink (camelCase)
export function mapDbRowToSmartLink(row: any): SmartLink {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    artworkUrl: row.artwork_url || PRESET_ARTWORKS[0],
    description: row.description || "",
    spotifyUrl: row.spotify_url || "",
    appleMusicUrl: row.apple_music_url || "",
    jioSaavnUrl: row.jio_saavn_url || "",
    youtubeUrl: row.youtube_url || "",
    visits: Number(row.visits || 0),
    createdAt: row.created_at || new Date().toISOString()
  };
}

// Convert SmartLink back to DB row format for inserting
export function mapSmartLinkToDbRow(link: SmartLink, userId?: string | null) {
  return {
    id: link.id,
    user_id: userId || null,
    title: link.title,
    artist: link.artist,
    artwork_url: link.artworkUrl,
    description: link.description || null,
    spotify_url: link.spotifyUrl || null,
    apple_music_url: link.appleMusicUrl || null,
    jio_saavn_url: link.jioSaavnUrl || null,
    youtube_url: link.youtubeUrl || null,
    visits: link.visits,
    created_at: link.createdAt
  };
}

// Fetch all dynamic links from Supabase and sync with localStorage
export async function getSmartLinksFromSupabase(): Promise<SmartLink[]> {
  try {
    const { data, error } = await supabase
      .from("smart_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error reading from Supabase smart_links, loading fallback client links:", error);
      return getSmartLinks();
    }

    if (data) {
      const mapped = data.map(mapDbRowToSmartLink);
      localStorage.setItem("wavora_smart_links", JSON.stringify(mapped));
      window.dispatchEvent(new Event("wavora_smart_links_updated"));
      return mapped;
    }
  } catch (err) {
    console.warn("Exception in getSmartLinksFromSupabase:", err);
  }
  return getSmartLinks();
}

export function incrementSmartLinkVisits(id: string): SmartLink | null {
  const links = getSmartLinks();
  const index = links.findIndex(l => l.id.toLowerCase() === id.toLowerCase().trim());
  if (index === -1) return null;
  
  links[index].visits += 1;
  saveSmartLinks(links);
  return links[index];
}

// Async remote increment of visit logs in Supabase
export async function incrementSmartLinkVisitsInSupabase(id: string): Promise<SmartLink | null> {
  const slug = id.toLowerCase().trim();
  // Always trigger quick optimistic response locally
  const localResult = incrementSmartLinkVisits(slug);

  try {
    // 1. Fetch current status of smart link
    const { data: current, error: getError } = await supabase
      .from("smart_links")
      .select("*")
      .eq("id", slug)
      .maybeSingle();

    if (getError || !current) {
      console.warn("Could not find smart link to increment on Supabase. Falling back to local values.", getError);
      return localResult;
    }

    // 2. Increment remote database counter
    const nextVisits = Number(current.visits || 0) + 1;
    const { data: updated, error: updateError } = await supabase
      .from("smart_links")
      .update({ visits: nextVisits })
      .eq("id", slug)
      .select()
      .maybeSingle();

    if (updateError || !updated) {
      console.warn("Supabase visits update failed:", updateError);
      return localResult;
    }

    const mapped = mapDbRowToSmartLink(updated);
    // Sync local storage item with fresh remote value
    const localLinks = getSmartLinks();
    const idx = localLinks.findIndex(l => l.id.toLowerCase() === slug);
    if (idx !== -1) {
      localLinks[idx] = mapped;
      saveSmartLinks(localLinks);
    }
    return mapped;
  } catch (e) {
    console.warn("Exception during visits scale calculation:", e);
    return localResult;
  }
}

export function createSmartLink(link: Omit<SmartLink, "visits" | "createdAt">): { success: boolean; error?: string } {
  const links = getSmartLinks();
  
  // Validate ID format (alphanumeric, dashes, no spaces)
  const slugRegex = /^[a-z0-9-_]+$/i;
  if (!slugRegex.test(link.id)) {
    return { success: false, error: "Link identifier must contain only letters, numbers, hyphens, and underscores." };
  }
  
  // Check if slug taken (case insensitive)
  const exists = links.some(l => l.id.toLowerCase() === link.id.toLowerCase());
  if (exists) {
    return { success: false, error: "This URL handle is already taken. Try a different one!" };
  }

  const newLink: SmartLink = {
    ...link,
    visits: 0,
    createdAt: new Date().toISOString()
  };

  links.unshift(newLink);
  saveSmartLinks(links);
  return { success: true };
}

// Async insert of Smart Links to Supabase database
export async function createSmartLinkInSupabase(
  link: Omit<SmartLink, "visits" | "createdAt">
): Promise<{ success: boolean; error?: string }> {
  const slug = link.id.toLowerCase().trim();
  const slugRegex = /^[a-z0-9-_]+$/i;
  
  if (!slugRegex.test(slug)) {
    return { success: false, error: "Link identifier must contain only letters, numbers, hyphens, and underscores." };
  }

  try {
    // 1. Verify availability on Supabase first
    const { data: existing, error: checkError } = await supabase
      .from("smart_links")
      .select("id")
      .eq("id", slug)
      .maybeSingle();

    if (checkError) {
      console.warn("Supabase slug verification error:", checkError);
    }

    if (existing) {
      return { success: false, error: "This URL handle is already taken. Try a different one!" };
    }

    // 2. Fetch current verified session context
    let userId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch (_) {}

    // 3. Setup core payload
    const newLink: SmartLink = {
      ...link,
      id: slug,
      visits: 0,
      createdAt: new Date().toISOString()
    };

    const dbRow = mapSmartLinkToDbRow(newLink, userId);
    
    // 4. Save to remote table
    const { error: insertError } = await supabase.from("smart_links").insert([dbRow]);

    if (insertError) {
      console.warn("Supabase insert error. Saving to local database fallback.", insertError);
      return createSmartLink(link);
    }

    // 5. Save local state inline to match immediately
    const localLinks = getSmartLinks();
    localLinks.unshift(newLink);
    saveSmartLinks(localLinks);

    return { success: true };
  } catch (err) {
    console.warn("Exception raised during Supabase campaign setup:", err);
    return createSmartLink(link);
  }
}

export function deleteSmartLink(id: string) {
  const links = getSmartLinks();
  const filtered = links.filter(l => l.id !== id);
  saveSmartLinks(filtered);
}

// Async remote deletion of campaign on Supabase
export async function deleteSmartLinkFromSupabase(id: string) {
  deleteSmartLink(id);
  try {
    const { error } = await supabase.from("smart_links").delete().eq("id", id);
    if (error) {
      console.warn("Failed to delete record on database tier:", error);
    }
  } catch (err) {
    console.warn("Exception during remote delete task execution:", err);
  }
}
