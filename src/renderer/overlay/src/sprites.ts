export const SPRITES: Record<string, string> = {
  airplane: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
    <rect x="15" y="22" width="72" height="16" rx="8" fill="#5B9BD5"/>
    <ellipse cx="91" cy="30" rx="14" ry="8" fill="#87CEEB"/>
    <polygon points="48,30 28,6 72,20" fill="#3D7DC8"/>
    <polygon points="48,30 28,54 72,40" fill="#3D7DC8"/>
    <polygon points="14,30 4,14 22,24" fill="#2D6AB5"/>
    <polygon points="14,28 4,18 20,24" fill="#2D6AB5"/>
    <polygon points="14,32 4,42 20,36" fill="#2D6AB5"/>
    <circle cx="60" cy="27" r="4" fill="white" opacity="0.85"/>
    <circle cx="72" cy="27" r="4" fill="white" opacity="0.85"/>
    <circle cx="48" cy="27" r="4" fill="white" opacity="0.85"/>
  </svg>`,

  rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
    <rect x="22" y="17" width="55" height="16" rx="8" fill="#E74C3C"/>
    <ellipse cx="80" cy="25" rx="14" ry="8" fill="#C0392B"/>
    <polygon points="22,25 8,37 26,31" fill="#C0392B"/>
    <polygon points="22,25 8,13 26,19" fill="#C0392B"/>
    <circle cx="52" cy="25" r="7" fill="white" opacity="0.9"/>
    <circle cx="52" cy="25" r="5" fill="#85C1E9"/>
    <ellipse cx="14" cy="25" rx="12" ry="6" fill="#F39C12" opacity="0.9"/>
    <ellipse cx="8" cy="25" rx="8" ry="4" fill="#E74C3C" opacity="0.8"/>
    <ellipse cx="4" cy="25" rx="5" ry="3" fill="#FFEAA7" opacity="0.7"/>
  </svg>`,

  bird: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 50">
    <ellipse cx="50" cy="28" rx="22" ry="11" fill="#2C3E50"/>
    <circle cx="70" cy="22" r="11" fill="#2C3E50"/>
    <polygon points="80,21 94,24 80,27" fill="#E67E22"/>
    <circle cx="74" cy="19" r="3.5" fill="white"/>
    <circle cx="75" cy="19" r="2" fill="#1A252F"/>
    <path d="M 50 26 Q 32 4 8 12 Q 24 18 50 26" fill="#34495E"/>
    <path d="M 50 30 Q 32 50 8 38 Q 24 32 50 30" fill="#34495E" opacity="0.55"/>
    <path d="M 28 28 L 8 22 L 16 28 L 8 34 Z" fill="#2C3E50"/>
  </svg>`,

  ufo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 55">
    <ellipse cx="50" cy="36" rx="42" ry="13" fill="#7F8C8D"/>
    <ellipse cx="50" cy="28" rx="24" ry="16" fill="#85C1E9"/>
    <ellipse cx="44" cy="23" rx="9" ry="5" fill="white" opacity="0.3"/>
    <circle cx="22" cy="39" r="3.5" fill="#F1C40F"/>
    <circle cx="35" cy="43" r="3.5" fill="#E74C3C"/>
    <circle cx="50" cy="44" r="3.5" fill="#2ECC71"/>
    <circle cx="65" cy="43" r="3.5" fill="#9B59B6"/>
    <circle cx="78" cy="39" r="3.5" fill="#F1C40F"/>
    <polygon points="36,49 64,49 70,55 30,55" fill="#F1C40F" opacity="0.12"/>
  </svg>`
}

/**
 * Resolves the <img> src for a sprite. Custom paths already arrive as a data: URL
 * (converted in the main process) — kept as a real <img> src rather than drawn to a
 * canvas so animated GIF/APNG/WEBP sprites keep playing their native animation.
 */
export function resolveSpriteSrc(sprite: string, customPath: string): string {
  if (sprite === 'custom' && customPath) return customPath
  const svgStr = SPRITES[sprite] ?? SPRITES.airplane
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`
}
