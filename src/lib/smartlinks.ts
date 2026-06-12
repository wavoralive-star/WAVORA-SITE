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

export function incrementSmartLinkVisits(id: string): SmartLink | null {
  const links = getSmartLinks();
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return null;
  
  links[index].visits += 1;
  saveSmartLinks(links);
  return links[index];
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

export function deleteSmartLink(id: string) {
  const links = getSmartLinks();
  const filtered = links.filter(l => l.id !== id);
  saveSmartLinks(filtered);
}
