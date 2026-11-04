import fs from "node:fs";
import path from "node:path";

const imgDir = path.join(process.cwd(), "public", "img");

const images = {
  "iphone-16-pro-max.svg": `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="desertTitanium" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C5A880"/>
          <stop offset="50%" stop-color="#A88B65"/>
          <stop offset="100%" stop-color="#8C7350"/>
        </linearGradient>
        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1c1917"/>
          <stop offset="100%" stop-color="#0c0a09"/>
        </linearGradient>
        <radialGradient id="lens" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="40%" stop-color="#1d4ed8"/>
          <stop offset="100%" stop-color="#020617"/>
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.35"/>
        </filter>
      </defs>
      
      <!-- Ambient Glow -->
      <circle cx="200" cy="200" r="140" fill="#A3E635" opacity="0.08" filter="blur(30px)"/>
      
      <!-- Phone Body -->
      <g filter="url(#shadow)">
        <rect x="110" y="40" width="180" height="320" rx="36" fill="url(#desertTitanium)" stroke="#DFD0BD" stroke-width="3"/>
        <rect x="116" y="46" width="168" height="308" rx="30" fill="url(#screenGrad)"/>
        
        <!-- Screen Content (Subtle tech wallpaper) -->
        <circle cx="200" cy="180" r="60" fill="#C5A880" opacity="0.15" filter="blur(20px)"/>
        <circle cx="210" cy="240" r="45" fill="#3b82f6" opacity="0.12" filter="blur(25px)"/>
        
        <!-- Dynamic Island -->
        <rect x="175" y="58" width="50" height="15" rx="7.5" fill="#000000"/>
        <circle cx="213" cy="65.5" r="3.5" fill="#0f172a"/>
        
        <!-- Home Indicator Bar -->
        <rect x="165" y="342" width="70" height="4" rx="2" fill="#ffffff" opacity="0.6"/>
        
        <!-- Camera Island Highlight (Rear outline perspective) -->
        <rect x="122" y="56" width="60" height="60" rx="16" fill="#A88B65" opacity="0.25"/>
      </g>
    </svg>
  `,
  "samsung-s24-ultra.svg": `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="titaniumGray" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4B5563"/>
          <stop offset="50%" stop-color="#374151"/>
          <stop offset="100%" stop-color="#1F2937"/>
        </linearGradient>
        <linearGradient id="s24Screen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.35"/>
        </filter>
      </defs>
      
      <circle cx="200" cy="200" r="140" fill="#38BDF8" opacity="0.08" filter="blur(30px)"/>
      
      <!-- Phone Body (Boxy Sharp Corners) -->
      <g filter="url(#shadow)">
        <rect x="105" y="42" width="190" height="316" rx="8" fill="url(#titaniumGray)" stroke="#9CA3AF" stroke-width="2"/>
        <rect x="110" y="47" width="180" height="306" rx="4" fill="url(#s24Screen)"/>
        
        <!-- Punch Hole Camera -->
        <circle cx="200" cy="62" r="4.5" fill="#000000" stroke="#334155" stroke-width="1"/>
        
        <!-- AI Geometric Accent on Screen -->
        <polygon points="200,160 230,190 200,220 170,190" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.6"/>
        <polygon points="200,172 218,190 200,208 182,190" fill="#38BDF8" opacity="0.15"/>
        <text x="200" y="250" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="2">GALAXY AI</text>
        
        <!-- S-Pen Hint at Bottom -->
        <rect x="116" y="348" width="12" height="3" rx="1.5" fill="#9CA3AF"/>
      </g>
    </svg>
  `,
  "ipad-pro-m4.svg": `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="spaceBlack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#262626"/>
          <stop offset="100%" stop-color="#0a0a0a"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.35"/>
        </filter>
      </defs>
      
      <circle cx="200" cy="200" r="140" fill="#A3E635" opacity="0.06" filter="blur(30px)"/>
      
      <g filter="url(#shadow)">
        <rect x="70" y="60" width="260" height="280" rx="28" fill="url(#spaceBlack)" stroke="#404040" stroke-width="2.5"/>
        <rect x="80" y="70" width="240" height="260" rx="20" fill="#000000"/>
        
        <!-- Wallpaper Waves -->
        <path d="M 80,260 Q 150,150 200,220 T 320,180 L 320,330 L 80,330 Z" fill="#84cc16" opacity="0.15"/>
        <path d="M 80,280 Q 170,180 230,240 T 320,200 L 320,330 L 80,330 Z" fill="#3b82f6" opacity="0.2"/>
        
        <!-- Front Camera in landscape edge -->
        <circle cx="200" cy="75" r="3" fill="#1e293b"/>
        
        <!-- M4 Chip Symbol in center -->
        <rect x="180" y="180" width="40" height="40" rx="8" fill="#171717" stroke="#A3E635" stroke-width="1.5"/>
        <text x="200" y="205" text-anchor="middle" fill="#A3E635" font-family="sans-serif" font-size="14" font-weight="900">M4</text>
      </g>
    </svg>
  `,
  "airpods-pro-2.svg": `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="whiteGloss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="85%" stop-color="#f1f5f9"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.25"/>
        </filter>
      </defs>
      
      <circle cx="200" cy="200" r="140" fill="#A3E635" opacity="0.08" filter="blur(30px)"/>
      
      <!-- Charging Case -->
      <g filter="url(#shadow)">
        <rect x="110" y="110" width="180" height="150" rx="45" fill="url(#whiteGloss)" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Lid Line -->
        <line x1="111" y1="160" x2="289" y2="160" stroke="#cbd5e1" stroke-width="1"/>
        
        <!-- Status LED -->
        <circle cx="200" cy="180" r="3.5" fill="#22c55e"/>
        
        <!-- Earbuds Stems sticking out subtly or beside -->
        <!-- Right Earbud -->
        <path d="M 285,100 C 285,80 310,75 320,95 C 330,115 315,130 305,140 L 310,190 C 310,195 300,195 300,190 Z" fill="url(#whiteGloss)" stroke="#cbd5e1" stroke-width="1"/>
        <!-- Silicone Tip -->
        <ellipse cx="280" cy="100" rx="12" ry="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        
        <!-- Left Earbud -->
        <path d="M 115,100 C 115,80 90,75 80,95 C 70,115 85,130 95,140 L 90,190 C 90,195 100,195 100,190 Z" fill="url(#whiteGloss)" stroke="#cbd5e1" stroke-width="1"/>
        <!-- Silicone Tip -->
        <ellipse cx="120" cy="100" rx="12" ry="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        
        <!-- USB-C Port Base -->
        <rect x="185" y="258" width="30" height="4" rx="2" fill="#94a3b8"/>
      </g>
    </svg>
  `,
  "sony-wh1000xm5.svg": `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="headband" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#27272a"/>
          <stop offset="100%" stop-color="#18181b"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.35"/>
        </filter>
      </defs>
      
      <circle cx="200" cy="200" r="140" fill="#A3E635" opacity="0.08" filter="blur(30px)"/>
      
      <g filter="url(#shadow)">
        <!-- Headband Arc -->
        <path d="M 120,220 C 110,90 290,90 280,220" fill="none" stroke="url(#headband)" stroke-width="18" stroke-linecap="round"/>
        <path d="M 140,180 C 135,110 265,110 260,180" fill="none" stroke="#3f3f46" stroke-width="6" stroke-linecap="round"/>
        
        <!-- Left Earcup -->
        <g transform="translate(90, 190) rotate(10)">
          <ellipse cx="25" cy="40" rx="30" ry="46" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
          <ellipse cx="25" cy="40" rx="22" ry="36" fill="#27272a"/>
          <circle cx="35" cy="40" r="2.5" fill="#A3E635"/> <!-- Mic -->
        </g>
        
        <!-- Right Earcup -->
        <g transform="translate(260, 190) rotate(-10)">
          <ellipse cx="25" cy="40" rx="30" ry="46" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
          <ellipse cx="25" cy="40" rx="22" ry="36" fill="#27272a"/>
          <circle cx="15" cy="40" r="2.5" fill="#A3E635"/> <!-- Mic -->
        </g>
        
        <text x="200" y="290" text-anchor="middle" fill="#A3E635" font-family="sans-serif" font-size="12" font-weight="bold" letter-spacing="1">Hi-Res Audio · ANC</text>
      </g>
    </svg>
  `,
  "apple-watch-ultra-2.svg": `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="ultraTitanium" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E5E7EB"/>
          <stop offset="50%" stop-color="#D1D5DB"/>
          <stop offset="100%" stop-color="#9CA3AF"/>
        </linearGradient>
        <linearGradient id="oceanBand" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F97316"/>
          <stop offset="100%" stop-color="#EA580C"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.35"/>
        </filter>
      </defs>
      
      <circle cx="200" cy="200" r="140" fill="#F97316" opacity="0.08" filter="blur(30px)"/>
      
      <!-- Top Strap -->
      <path d="M 155,40 L 245,40 L 240,110 L 160,110 Z" fill="url(#oceanBand)"/>
      <!-- Bottom Strap -->
      <path d="M 160,290 L 240,290 L 245,360 L 155,360 Z" fill="url(#oceanBand)"/>
      
      <!-- Watch Case -->
      <g filter="url(#shadow)">
        <!-- Titanium Body (49mm Cushion Shape) -->
        <rect x="135" y="105" width="130" height="190" rx="36" fill="url(#ultraTitanium)" stroke="#FFFFFF" stroke-width="2"/>
        
        <!-- Screen Bezel -->
        <rect x="145" y="115" width="110" height="170" rx="26" fill="#000000"/>
        
        <!-- Digital Crown (Right) -->
        <rect x="264" y="145" width="12" height="40" rx="4" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1"/>
        <rect x="266" y="150" width="8" height="30" rx="2" fill="#F97316"/>
        
        <!-- Orange Action Button (Left) -->
        <rect x="125" y="155" width="11" height="45" rx="3" fill="#F97316" stroke="#C2410C" stroke-width="1"/>
        
        <!-- Wayfinder Watch Face -->
        <circle cx="200" cy="200" r="50" fill="none" stroke="#F97316" stroke-width="2"/>
        <text x="200" y="185" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="900">10:09</text>
        <text x="200" y="205" text-anchor="middle" fill="#A3E635" font-family="sans-serif" font-size="10" font-weight="bold">3000 NITS</text>
        <text x="200" y="225" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="10" font-weight="bold">DEPTH 40M</text>
      </g>
    </svg>
  `,
  "anker-charger.svg": `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="chargerBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272a"/>
          <stop offset="100%" stop-color="#09090b"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <circle cx="200" cy="200" r="140" fill="#A3E635" opacity="0.08" filter="blur(30px)"/>
      
      <!-- Charger Block -->
      <g filter="url(#shadow)">
        <rect x="120" y="90" width="160" height="220" rx="24" fill="url(#chargerBody)" stroke="#3f3f46" stroke-width="2"/>
        
        <!-- Brand -->
        <text x="200" y="135" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="900" letter-spacing="1">ANKER</text>
        <text x="200" y="152" text-anchor="middle" fill="#A3E635" font-family="sans-serif" font-size="10" font-weight="bold">PRIME · 65W GaN</text>
        
        <!-- Port 1 (USB-C 1) -->
        <rect x="160" y="175" width="80" height="22" rx="11" fill="#18181b" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="200" y="190" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="9" font-weight="bold">IQ3 · 65W</text>
        
        <!-- Port 2 (USB-C 2) -->
        <rect x="160" y="210" width="80" height="22" rx="11" fill="#18181b" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="200" y="225" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="9" font-weight="bold">IQ3 · 65W</text>
        
        <!-- Port 3 (USB-A) -->
        <rect x="165" y="245" width="70" height="24" rx="4" fill="#18181b" stroke="#A3E635" stroke-width="1.5"/>
        <rect x="175" y="253" width="50" height="6" fill="#A3E635"/>
      </g>
    </svg>
  `,
  "magsafe-case.svg": `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="clearCase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#f8fafc" stop-opacity="0.1"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.2"/>
        </filter>
      </defs>
      
      <circle cx="200" cy="200" r="140" fill="#A3E635" opacity="0.08" filter="blur(30px)"/>
      
      <g filter="url(#shadow)">
        <!-- Case Outer Rim -->
        <rect x="115" y="45" width="170" height="310" rx="34" fill="url(#clearCase)" stroke="#cbd5e1" stroke-width="4"/>
        
        <!-- Camera Bumper -->
        <rect x="125" y="55" width="65" height="65" rx="16" fill="#ffffff" fill-opacity="0.5" stroke="#94a3b8" stroke-width="2"/>
        
        <!-- MagSafe Magnetic Ring -->
        <circle cx="200" cy="200" r="45" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="10 3" opacity="0.9"/>
        <circle cx="200" cy="200" r="44" fill="none" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="200" y1="248" x2="200" y2="275" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        
        <text x="200" y="204" text-anchor="middle" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="extrabold">MagSafe</text>
      </g>
    </svg>
  `
};

for (const [name, content] of Object.entries(images)) {
  const filePath = path.join(imgDir, name);
  fs.writeFileSync(filePath, content.trim(), "utf8");
  // Also write .png copy so any .png path also succeeds
  const pngPath = path.join(imgDir, name.replace(".svg", ".png"));
  fs.writeFileSync(pngPath, content.trim(), "utf8");
}

console.log("Generated SVG and PNG assets successfully!");
