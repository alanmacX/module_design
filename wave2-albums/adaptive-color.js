/* ==========================================================================
   Perceptual Cover-Driven Adaptive Color Engine (Zero Hardcoded Swatches)
   Extracts hue clusters, optical blur canvas, light/dark surfaces, high-chroma
   editorial poster fields, and WCAG contrast-safe ink colors from any 1:1 cover.
   ========================================================================== */
(function (global) {
  'use strict';

  function srgbToLin(c) {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function relLum(r, g, b) {
    return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
  }

  function contrastRatio(l1, l2) {
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  function toHex(r, g, b) {
    return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  }

  function hslHex(h, s, l) {
    const [r, g, b] = hslToRgb(h, s, l);
    return toHex(r, g, b);
  }

  function bestInk(hex, darkInk, lightInk) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const bgL = relLum(r, g, b);
    const cWhite = contrastRatio(bgL, 1.0);
    const cDark = contrastRatio(bgL, 0.014);
    return cWhite >= cDark ? (lightInk || '#FFFFFF') : (darkInk || '#111318');
  }

  function ensureReadableAccentOnLight(h, s) {
    // Guarantee >= 4.5:1 on near-white (#FFFFFF) card
    let l = 0.40;
    while (l > 0.22) {
      const [r, g, b] = hslToRgb(h, s, l);
      if (contrastRatio(relLum(r, g, b), 0.96) >= 4.5) return toHex(r, g, b);
      l -= 0.03;
    }
    return hslHex(h, s, 0.28);
  }

  function ensureReadableAccentOnDark(h, s) {
    let l = 0.66;
    while (l < 0.84) {
      const [r, g, b] = hslToRgb(h, s, l);
      if (contrastRatio(relLum(r, g, b), 0.025) >= 4.8) return toHex(r, g, b);
      l += 0.03;
    }
    return hslHex(h, s, 0.76);
  }

  function extractFromImage(img) {
    const N = 40;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, N, N);
    const data = ctx.getImageData(0, 0, N, N).data;

    // 1. Optical blurred color-wash data URL (100% derived from cover pixels)
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = blurCanvas.height = 128;
    const bctx = blurCanvas.getContext('2d');
    bctx.filter = 'blur(24px) saturate(128%)';
    bctx.drawImage(img, -22, -22, 172, 172);
    const blurDataUrl = blurCanvas.toDataURL('image/png');

    // 2. 18-bin Hue histogram weighted by perceptual chroma + overall luminance
    const bins = Array.from({ length: 18 }, () => ({ weight: 0, hSin: 0, hCos: 0, sSum: 0, lSum: 0, count: 0 }));
    let lumSum = 0;
    let bottomLumSum = 0, bottomCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const pxIdx = i / 4;
      const py = Math.floor(pxIdx / N);
      const lum = relLum(r, g, b);
      lumSum += lum;
      if (py >= N * 0.62) {
        bottomLumSum += lum;
        bottomCount++;
      }

      const [h, s, l] = rgbToHsl(r, g, b);
      // Ignore near-neutral paper/backdrop tint (e.g. warm cream paper s < 0.24 or l > 0.84)
      // so vivid focal subjects (like crimson apple #C8281E) always win over off-white backgrounds!
      if (s < 0.22 || l < 0.07 || l > 0.85) continue;
      const chromaBoost = Math.pow(s, 2.8) * Math.pow(Math.max(0, 1 - Math.abs(l - 0.46) * 1.45), 1.6);
      if (chromaBoost <= 0.005) continue;

      const binIdx = Math.floor(h / 20) % 18;
      const rad = (h * Math.PI) / 180;
      const bucket = bins[binIdx];
      bucket.weight += chromaBoost;
      bucket.hSin += Math.sin(rad) * chromaBoost;
      bucket.hCos += Math.cos(rad) * chromaBoost;
      bucket.sSum += s * chromaBoost;
      bucket.lSum += l * chromaBoost;
      bucket.count++;
    }

    const avgLum = lumSum / (N * N);
    const bottomLum = bottomCount ? bottomLumSum / bottomCount : avgLum;

    // Sort hue buckets by chromatic weight
    const ranked = bins
      .map((b, idx) => {
        if (b.weight <= 0) return null;
        let meanH = (Math.atan2(b.hSin, b.hCos) * 180) / Math.PI;
        if (meanH < 0) meanH += 360;
        return {
          idx,
          weight: b.weight,
          h: meanH,
          s: b.sSum / b.weight,
          l: b.lSum / b.weight
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.weight - a.weight);

    const primary = ranked[0] || { h: 220, s: 0.55, l: 0.42 };
    // Secondary hue at least 35 deg apart if available
    const secondary = ranked.find((x) => {
      const diff = Math.abs(x.h - primary.h);
      return Math.min(diff, 360 - diff) > 35 && x.weight > primary.weight * 0.18;
    }) || primary;

    const pH = primary.h;
    const pS = Math.max(0.54, Math.min(0.84, primary.s * 1.12));
    // Avoid muddy olive zone (48..72 deg at low lightness): keep warm amber crisp or bright
    const posterL = (pH >= 42 && pH <= 76) ? 0.44 : Math.max(0.32, Math.min(0.46, primary.l));
    const posterBg = hslHex(pH, pS, posterL);
    const posterInk = bestInk(posterBg, '#111318', '#FFFFFF');

    const sH = secondary.h;
    const sS = Math.max(0.58, Math.min(0.86, secondary.s * 1.15));
    const accentBg = hslHex(sH, sS, (sH >= 46 && sH <= 85) ? 0.52 : 0.44);
    const accentInk = bestInk(accentBg, '#111318', '#FFFFFF');

    // Light & Dark adaptive surfaces tinted subtly with the cover's primary hue
    const lightSurface = hslHex(pH, Math.min(0.24, pS * 0.32), 0.945);
    const lightCard = '#FFFFFF';
    const lightInk = hslHex(pH, 0.22, 0.10);
    const lightSubInk = hslHex(pH, 0.16, 0.28);
    const lightTag = ensureReadableAccentOnLight(pH, pS);

    const darkSurface = hslHex(pH, Math.min(0.30, pS * 0.42), 0.095);
    const darkCard = hslHex(pH, Math.min(0.26, pS * 0.36), 0.155);
    const darkInk = '#F8FAFC';
    const darkSubInk = hslHex(pH, 0.22, 0.82);
    const darkTag = ensureReadableAccentOnDark(sH, sS);

    // Mat adaptive scrim & ink based on actual cover wash brightness
    const isLightCover = avgLum > 0.52 && bottomLum > 0.48;
    const matScrim = isLightCover
      ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,252,245,0.52) 100%)'
      : 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.44) 100%)';
    const matInk = isLightCover ? lightInk : '#FFFFFF';
    const matSub = isLightCover ? lightTag : 'rgba(255,255,255,0.90)';

    // Translucent frosted pill tinted by cover's deep or light tone
    const [pr, pg, pb] = hslToRgb(pH, Math.min(0.55, pS), 0.14);
    const frostedDarkPill = `rgba(${pr}, ${pg}, ${pb}, 0.72)`;
    const [lr, lg, lb] = hslToRgb(pH, Math.min(0.30, pS * 0.4), 0.95);
    const frostedLightPill = `rgba(${lr}, ${lg}, ${lb}, 0.86)`;

    return {
      blurDataUrl,
      avgLum: Number(avgLum.toFixed(3)),
      isLightCover,
      posterBg,
      posterInk,
      accentBg,
      accentInk,
      lightSurface,
      lightCard,
      lightInk,
      lightSubInk,
      lightTag,
      darkSurface,
      darkCard,
      darkInk,
      darkSubInk,
      darkTag,
      matScrim,
      matInk,
      matSub,
      frostedDarkPill,
      frostedLightPill
    };
  }

  global.AdaptiveAlbumColor = { extractFromImage, bestInk };
})(window);
