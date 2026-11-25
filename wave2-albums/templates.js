/* ==========================================================================
   Module Design · Wave 2 Curated Album Templates (7 Selected, 100% Adaptive)
   Selected from 10-template exploration: #1, #2, #3, #4, #6, #8, #10
   Every template derives its surfaces, accents, frosted pills & WCAG ink
   dynamically from the active album cover photograph!
   ========================================================================== */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function hasCjk(s) {
    return /[\u4e00-\u9fff]/.test(String(s || ''));
  }

  const ALBUM_CRATE = [
    { id: 'rol', title: 'Ray of Light', artist: 'Madonna', cover: 'assets/cover-1.jpg' },
    { id: 'post', title: '海风邮政', artist: '落日飞车', cover: 'assets/cover-6.jpg' },
    { id: 'vis', title: 'The Visitors', artist: 'ABBA', cover: 'assets/cover-3.jpg' },
    { id: 'appl', title: '林檎标本', artist: '青叶市子', cover: 'assets/cover-7.jpg' },
    { id: 'conf', title: 'Confessions', artist: 'Madonna', cover: 'assets/cover-4.jpg' },
    { id: 'mana', title: 'Manalan mailla', artist: 'Vilma Jää', cover: 'assets/cover-5.jpg' }
  ];

  // toneMode: 'auto' (default chromatic/sampled adaptive), 'light' (adaptive tinted light), 'dark' (adaptive tinted dark)
  const CURATED_ALBUMS = [
    /* #1 · HALO */
    {
      id: 'album-halo',
      originNo: '01',
      name: '采色微边 · Halo',
      tag: '自适应光晕微边',
      desc: '从当前封面实时采样弥散光晕（或切换同色系浅瓷/深曜底），以 R44 → R28 同心圆角托起零文字纯封面。',
      render(a, next, pal, toneMode, wide) {
        const bgHtml = toneMode === 'auto'
          ? `<img class="al-blur-bg" src="${pal.blurDataUrl}" alt=""/>`
          : `<div class="al-solid-bg" style="background:${toneMode === 'light' ? pal.lightSurface : pal.darkSurface}"></div>`;
        if (wide) {
          return `
            <div class="al-face">
              ${bgHtml}
              <img class="al-img-sq" src="${a.cover}" alt="${esc(a.title)}"
                style="position:absolute;left:calc(89 * var(--u));top:calc(14 * var(--u));width:calc(122 * var(--u));height:calc(122 * var(--u));border-radius:calc(20 * var(--u));box-shadow:0 calc(8 * var(--u)) calc(20 * var(--u)) rgba(0,0,0,0.26);z-index:2"/>
              <button type="button" class="al-hit" data-id="album-halo" aria-label="切换专辑"></button>
            </div>`;
        }
        return `
          <div class="al-face">
            ${bgHtml}
            <img class="al-img-sq al-halo-cover" src="${a.cover}" alt="${esc(a.title)}"/>
            <button type="button" class="al-hit" data-id="album-halo" aria-label="切换专辑"></button>
          </div>`;
      }
    },

    /* #2 · MAT */
    {
      id: 'album-mat',
      originNo: '02',
      name: '留白采色卡 · Mat',
      tag: '明度感知采色画垫',
      desc: '自动检测封面底色明度：深调封面配白字柔光遮罩，浅调封面（如《林檎标本》）自动翻转为深墨字与主色署名。',
      render(a, next, pal, toneMode, wide) {
        let bgHtml = '';
        let ink = pal.matInk, sub = pal.matSub;
        if (toneMode === 'auto') {
          bgHtml = `<img class="al-blur-bg" src="${pal.blurDataUrl}" alt=""/><div class="al-mat-scrim" style="background:${pal.matScrim}"></div>`;
        } else if (toneMode === 'light') {
          bgHtml = `<div class="al-solid-bg" style="background:${pal.lightSurface}"></div>`;
          ink = pal.lightInk;
          sub = pal.lightTag;
        } else {
          bgHtml = `<div class="al-solid-bg" style="background:${pal.darkSurface}"></div>`;
          ink = pal.darkInk;
          sub = pal.darkTag;
        }
        if (wide) {
          return `
            <div class="al-face" style="color:${ink}">
              ${bgHtml}
              <img class="al-img-sq al-wide-cover-122" src="${a.cover}" alt="${esc(a.title)}"/>
              <div class="al-wide-meta-right">
                <div class="al-mat-title" style="font-size:calc(23 * var(--u))">${esc(a.title)}</div>
                <div class="al-mat-artist" style="color:${sub}">${esc(a.artist)}</div>
              </div>
              <button type="button" class="al-hit" data-id="album-mat" aria-label="切换专辑"></button>
            </div>`;
        }
        return `
          <div class="al-face" style="color:${ink}">
            ${bgHtml}
            <img class="al-img-sq al-mat-cover" src="${a.cover}" alt="${esc(a.title)}"/>
            <div class="al-mat-meta">
              <div class="al-mat-title">${esc(a.title)}</div>
              <div class="al-mat-artist" style="color:${sub}">${esc(a.artist)}</div>
            </div>
            <button type="button" class="al-hit" data-id="album-mat" aria-label="切换专辑"></button>
          </div>`;
      }
    },

    /* #3 · FULLBLEED */
    {
      id: 'album-fullbleed',
      originNo: '03',
      name: '满幅浮岛 · Fullbleed',
      tag: '满幅原图 + 自适应染色胶囊',
      desc: '100% 零裁切铺满正方形原图，左下悬浮胶囊实时染上封面的主色玻璃态（或自适应高饱和强调色）并自动匹配黑白字。',
      render(a, next, pal, toneMode, wide) {
        let pillBg = pal.frostedDarkPill, pillInk = '#FFFFFF';
        if (toneMode === 'auto') {
          pillBg = pal.isLightCover ? pal.accentBg : pal.frostedDarkPill;
          pillInk = pal.isLightCover ? pal.accentInk : '#FFFFFF';
        } else if (toneMode === 'light') {
          pillBg = pal.frostedLightPill;
          pillInk = pal.lightInk;
        } else {
          pillBg = pal.posterBg;
          pillInk = pal.posterInk;
        }
        if (wide) {
          return `
            <div class="al-face">
              <img class="al-blur-bg" src="${pal.blurDataUrl}" alt=""/>
              <div class="al-mat-scrim" style="background:${pal.matScrim}"></div>
              <img class="al-img-sq" src="${a.cover}" alt="${esc(a.title)}"
                style="position:absolute;left:0;top:0;width:calc(150 * var(--u));height:calc(150 * var(--u));z-index:2"/>
              <div class="al-full-pill" style="left:calc(126 * var(--u));bottom:calc(16 * var(--u));max-width:calc(160 * var(--u));background:${pillBg};color:${pillInk}">${esc(a.title)}</div>
              <button type="button" class="al-hit" data-id="album-fullbleed" aria-label="切换专辑"></button>
            </div>`;
        }
        return `
          <div class="al-face">
            <img class="al-img-sq al-full-cover" src="${a.cover}" alt="${esc(a.title)}"/>
            <div class="al-full-pill" style="background:${pillBg};color:${pillInk}">${esc(a.title)}</div>
            <button type="button" class="al-hit" data-id="album-fullbleed" aria-label="切换专辑"></button>
          </div>`;
      }
    },

    /* #4 · BENTO */
    {
      id: 'album-bento',
      originNo: '04',
      name: '胶囊便当栈 · Bento',
      tag: '自适应主色序号块 + 便当拼装',
      desc: '右侧唱片槽序号胶囊与歌手名颜色直接提取自当前封面高饱和色相，彻底告别与封面打架的固定紫色。',
      render(a, next, pal, toneMode, wide) {
        const useDark = toneMode === 'dark' || (toneMode === 'auto' && !pal.isLightCover && pal.avgLum < 0.14);
        const bg = useDark ? pal.darkSurface : pal.lightSurface;
        const bar = useDark ? pal.darkCard : pal.lightCard;
        const ink = useDark ? pal.darkInk : pal.lightInk;
        const tag = useDark ? pal.darkTag : pal.lightTag;
        const accent = toneMode === 'dark' ? pal.accentBg : pal.posterBg;
        const acInk = toneMode === 'dark' ? pal.accentInk : pal.posterInk;

        if (wide) {
          return `
            <div class="al-face al-bento" style="background:${bg};padding:calc(12 * var(--u));flex-direction:row;gap:calc(10 * var(--u))">
              <img class="al-img-sq" src="${a.cover}" alt="${esc(a.title)}"
                style="width:calc(126 * var(--u));height:calc(126 * var(--u));border-radius:calc(22 * var(--u));flex-shrink:0"/>
              <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:calc(8 * var(--u))">
                <div style="height:calc(52 * var(--u));border-radius:calc(18 * var(--u));background:${accent};color:${acInk};padding:0 calc(13 * var(--u));display:flex;align-items:center;justify-content:space-between;gap:calc(8 * var(--u))">
                  <span style="font-family:var(--font-display);font-weight:900;font-size:calc(30 * var(--u));line-height:1">${a.num}</span>
                  <span style="font-size:calc(18.5 * var(--u));font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.artist)}</span>
                </div>
                <div style="flex:1;border-radius:calc(18 * var(--u));background:${bar};color:${ink};padding:0 calc(14 * var(--u));display:flex;align-items:center">
                  <span class="al-bento-title" style="font-size:calc(20.5 * var(--u))">${esc(a.title)}</span>
                </div>
              </div>
              <button type="button" class="al-hit" data-id="album-bento" aria-label="切换专辑"></button>
            </div>`;
        }
        return `
          <div class="al-face al-bento" style="background:${bg}">
            <div class="al-bento-top">
              <img class="al-img-sq al-bento-cover" src="${a.cover}" alt="${esc(a.title)}"/>
              <div class="al-bento-side" style="background:${accent};color:${acInk}">
                <span>${a.num}</span>
                <i class="al-bento-pip"></i>
              </div>
            </div>
            <div class="al-bento-bot" style="background:${bar};color:${ink}">
              <span class="al-bento-title">${esc(a.title)}</span>
              <span class="al-bento-artist" style="color:${tag}">${esc(a.artist)}</span>
            </div>
            <button type="button" class="al-hit" data-id="album-bento" aria-label="切换专辑"></button>
          </div>`;
      }
    },

    /* #6 · SWISS */
    {
      id: 'album-swiss',
      originNo: '06',
      name: '瑞士直角格 · Swiss',
      tag: '自适应海报主色 + L 型网格',
      desc: '自动提取封面的主导高彩度色相生成专属国际主义海报底色，并按 WCAG 对比度自动决策黑白大字。',
      render(a, next, pal, toneMode, wide) {
        const bg = toneMode === 'light' ? pal.lightSurface : (toneMode === 'dark' ? pal.darkSurface : pal.posterBg);
        const ink = toneMode === 'light' ? pal.lightInk : (toneMode === 'dark' ? pal.darkInk : pal.posterInk);
        const artistInk = toneMode === 'light' ? pal.lightTag : (toneMode === 'dark' ? pal.darkTag : ink);

        if (wide) {
          return `
            <div class="al-face" style="background:${bg};color:${ink}">
              <img class="al-img-sq" src="${a.cover}" alt="${esc(a.title)}"
                style="position:absolute;right:calc(14 * var(--u));top:calc(16 * var(--u));width:calc(118 * var(--u));height:calc(118 * var(--u));border-radius:calc(12 * var(--u));box-shadow:0 calc(8 * var(--u)) calc(20 * var(--u)) rgba(0,0,0,0.22);z-index:2"/>
              <div style="position:absolute;left:calc(18 * var(--u));top:calc(16 * var(--u));width:calc(142 * var(--u));font-size:calc(19 * var(--u));font-weight:800;color:${artistInk};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.artist)}</div>
              <div style="position:absolute;left:calc(18 * var(--u));bottom:calc(16 * var(--u));width:calc(142 * var(--u));font-size:calc(21.5 * var(--u));font-weight:900;line-height:1.12;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(a.title)}</div>
              <button type="button" class="al-hit" data-id="album-swiss" aria-label="切换专辑"></button>
            </div>`;
        }
        return `
          <div class="al-face" style="background:${bg};color:${ink}">
            <div class="al-swiss-artist" style="color:${artistInk}">${esc(a.artist)}</div>
            <img class="al-img-sq al-swiss-cover" src="${a.cover}" alt="${esc(a.title)}"/>
            <div class="al-swiss-title">${esc(a.title)}</div>
            <button type="button" class="al-hit" data-id="album-swiss" aria-label="切换专辑"></button>
          </div>`;
      }
    },

    /* #8 · MASTHEAD */
    {
      id: 'album-masthead',
      originNo: '08',
      name: '刊头叠印画报 · Masthead',
      tag: '自适应画报底色 + 纯刊头构图',
      desc: '杂志刊头底色与巨型标题字色随每张封面实时换装，右下压叠正方形原封面、左侧留出纯粹画报呼吸场。',
      render(a, next, pal, toneMode, wide) {
        const bg = toneMode === 'light' ? pal.lightSurface : (toneMode === 'dark' ? pal.darkSurface : pal.accentBg);
        const headInk = toneMode === 'light' ? pal.lightTag : (toneMode === 'dark' ? pal.darkTag : pal.accentInk);
        const cjk = hasCjk(a.title);
        const cjkCls = cjk ? 'is-cjk' : '';
        const sqHeadSize = cjk ? 52 : (a.title.length > 12 ? 38 : 50);

        if (wide) {
          return `
            <div class="al-face" style="background:${bg};color:${headInk}">
              <div class="al-mast-head ${cjkCls}" style="right:calc(144 * var(--u));top:calc(18 * var(--u));font-size:${cjk ? 'calc(34 * var(--u))' : 'calc(40 * var(--u))'};line-height:0.94;white-space:normal;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical">${esc(a.title)}</div>
              <img class="al-img-sq" src="${a.cover}" alt="${esc(a.title)}"
                style="position:absolute;right:calc(14 * var(--u));top:calc(14 * var(--u));width:calc(122 * var(--u));height:calc(122 * var(--u));border-radius:calc(20 * var(--u));box-shadow:0 calc(8 * var(--u)) calc(20 * var(--u)) rgba(0,0,0,0.28);z-index:3"/>
              <button type="button" class="al-hit" data-id="album-masthead" aria-label="切换专辑"></button>
            </div>`;
        }
        return `
          <div class="al-face" style="background:${bg};color:${headInk}">
            <div class="al-mast-head ${cjkCls}" style="font-size:calc(${sqHeadSize} * var(--u))">${esc(a.title)}</div>
            <img class="al-img-sq al-mast-cover" src="${a.cover}" alt="${esc(a.title)}"/>
            <button type="button" class="al-hit" data-id="album-masthead" aria-label="切换专辑"></button>
          </div>`;
      }
    },

    /* #10 · CRATE */
    {
      id: 'album-crate',
      originNo: '10',
      name: '唱片箱双叠 · Crate',
      tag: '自适应唱片箱底色 + 下张真封面',
      desc: '箱体底色与右下序号胶囊实时跟随前层专辑变色，后层倾斜 8° 探出唱片箱里的下一张真实封面。',
      render(a, next, pal, toneMode, wide) {
        const bg = toneMode === 'light' ? pal.lightSurface : pal.darkSurface;
        const ink = toneMode === 'light' ? pal.lightInk : pal.darkInk;
        const pill = toneMode === 'auto' ? pal.accentBg : pal.posterBg;
        const pillInk = toneMode === 'auto' ? pal.accentInk : pal.posterInk;

        if (wide) {
          return `
            <div class="al-face" style="background:${bg};color:${ink}">
              <img class="al-img-sq" src="${next.cover}" alt=""
                style="position:absolute;left:calc(38 * var(--u));top:calc(22 * var(--u));width:calc(104 * var(--u));height:calc(104 * var(--u));border-radius:calc(18 * var(--u));transform:rotate(8deg);z-index:1"/>
              <img class="al-img-sq" src="${a.cover}" alt="${esc(a.title)}"
                style="position:absolute;left:calc(14 * var(--u));top:calc(16 * var(--u));width:calc(118 * var(--u));height:calc(118 * var(--u));border-radius:calc(20 * var(--u));box-shadow:0 calc(10 * var(--u)) calc(24 * var(--u)) rgba(0,0,0,0.36);z-index:2"/>
              <div style="position:absolute;left:calc(158 * var(--u));right:calc(14 * var(--u));top:calc(20 * var(--u));bottom:calc(20 * var(--u));display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;z-index:3">
                <span class="al-crate-pill" style="background:${pill};color:${pillInk}">${a.num}</span>
                <div class="al-crate-title" style="width:100%;font-size:calc(20 * var(--u))">${esc(a.title)}</div>
              </div>
              <button type="button" class="al-hit" data-id="album-crate" aria-label="翻找下一张专辑"></button>
            </div>`;
        }
        return `
          <div class="al-face" style="background:${bg};color:${ink}">
            <img class="al-img-sq al-crate-back" src="${next.cover}" alt=""/>
            <img class="al-img-sq al-crate-front" src="${a.cover}" alt="${esc(a.title)}"/>
            <div class="al-crate-bar">
              <span class="al-crate-title">${esc(a.title)}</span>
              <span class="al-crate-pill" style="background:${pill};color:${pillInk}">${a.num}</span>
            </div>
            <button type="button" class="al-hit" data-id="album-crate" aria-label="翻找下一张专辑"></button>
          </div>`;
      }
    }
  ];

  global.Wave2AlbumCrate = ALBUM_CRATE;
  global.Wave2CuratedAlbums = CURATED_ALBUMS;
})(window);
