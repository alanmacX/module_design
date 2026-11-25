(function (global) {
  'use strict';

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const CURATED_WAVE1 = [
    {
      id: 'flux-clock',
      name: '潮汐反色字 · Flux',
      capability: 'clock · 时钟',
      swatches: [
        { name: '电光钴蓝', color: '#2E5BFF', bg: '#0A0D14', tide: '#2E5BFF', invert: '#FFFFFF' },
        { name: '荧光酸柠', color: '#C4FF2E', bg: '#0B0E0A', tide: '#C4FF2E', invert: '#0B0E0A' },
        { name: '熔岩烈橙', color: '#FF4824', bg: '#130B0A', tide: '#FF4824', invert: '#FFFFFF' }
      ],
      createState: () => ({ step: 0, levels: [38, 18, 66], times: [['09', '41'], ['09', '42'], ['10', '08']] }),
      interact(st) { st.step = (st.step + 1) % 3; },
      render(st, sw) {
        const tideTop = st.levels[st.step];
        const [hh, mm] = st.times[st.step];
        return `
          <div class="tw-face tw-flux" style="--flux-bg:${sw.bg};--flux-tide:${sw.tide};--flux-invert:${sw.invert};--tide-top:${tideTop}%">
            <div class="tw-flux-layer tw-flux-base">
              <span class="tw-flux-num top">${hh}</span>
              <span class="tw-flux-num bot">${mm}</span>
            </div>
            <div class="tw-flux-layer tw-flux-fill">
              <span class="tw-flux-num top">${hh}</span>
              <span class="tw-flux-num bot">${mm}</span>
            </div>
            <div class="tw-flux-meniscus"></div>
            <button type="button" class="tw-hit" data-id="flux-clock" aria-label="切换潮汐水位"></button>
          </div>`;
      }
    },
    {
      id: 'timeblock-agenda',
      name: '时间胶囊栈 · Timeblock',
      capability: 'agenda · 日程',
      swatches: [
        { name: '长春花蓝', color: '#5B5BD6', bg: '#F3F4F8', card: '#5B5BD6', subBg: '#FFFFFF', subInk: '#161822' },
        { name: '珊瑚西柚', color: '#F43F5E', bg: '#FFF5F6', card: '#F43F5E', subBg: '#FFFFFF', subInk: '#241217' },
        { name: '暗夜钴蓝', color: '#2563EB', bg: '#0E1016', card: '#2563EB', subBg: '#191D28', subInk: '#F1F5F9' }
      ],
      createState: () => ({
        idx: 0,
        list: [
          { time: '15:00', title: '产品视觉设计走查', prog: 64, nextTime: '17:30', nextTitle: '羽毛球双打' },
          { time: '17:30', title: '羽毛球馆双打约局', prog: 35, nextTime: '20:00', nextTitle: '精酿小聚' },
          { time: '20:00', title: '周末歌单黑胶试听', prog: 82, nextTime: '09:30', nextTitle: '晨间咖啡' }
        ]
      }),
      interact(st) { st.idx = (st.idx + 1) % st.list.length; },
      render(st, sw) {
        const cur = st.list[st.idx];
        return `
          <div class="tw-face tw-amie" style="--amie-bg:${sw.bg};--amie-card:${sw.card};--amie-sub-bg:${sw.subBg};--amie-sub-ink:${sw.subInk};--amie-prog:${cur.prog}%">
            <div class="tw-amie-active">
              <div class="tw-amie-fill"></div>
              <div class="tw-amie-row-top">
                <span>${cur.time}</span>
                <span>●</span>
              </div>
              <div class="tw-amie-title">${esc(cur.title)}</div>
            </div>
            <div class="tw-amie-next">
              <span class="tw-amie-next-name">${esc(cur.nextTitle)}</span>
              <span class="tw-amie-next-time">${cur.nextTime}</span>
            </div>
            <button type="button" class="tw-hit" data-id="timeblock-agenda" aria-label="推进日程时间块"></button>
          </div>`;
      }
    },
    {
      id: 'zine-anniversary',
      name: '画报景深刊头 · Zine',
      capability: 'anniversary · 纪念日',
      swatches: [
        { name: '克莱因蓝', color: '#1D4ED8', bg: '#1D4ED8', num: '#FFFFFF' },
        { name: '奶油柠檬', color: '#FDE047', bg: '#FDE68A', num: '#111827' },
        { name: '薄荷冰绿', color: '#6EE7B7', bg: '#A7F3D0', num: '#064E3B' }
      ],
      createState: () => ({
        idx: 0,
        items: [
          { days: '389', label: '皮皮到家', img: 'assets/cat-pipi.webp' },
          { days: '520', label: '在一起', img: 'assets/cat-pipi.webp' },
          { days: '108', label: '橘猫安家', img: 'assets/cat-tabby.webp' }
        ]
      }),
      interact(st) { st.idx = (st.idx + 1) % 3; },
      render(st, sw) {
        const cur = st.items[st.idx];
        return `
          <div class="tw-face tw-zine" style="--zn-bg:${sw.bg};--zn-num:${sw.num}">
            <div class="tw-zine-num">${cur.days}</div>
            <img class="tw-zine-subject" src="${cur.img}" alt="前景主体抠像"/>
            <div class="tw-zine-pill">${esc(cur.label)}</div>
            <button type="button" class="tw-hit" data-id="zine-anniversary" aria-label="切换纪念日卡片"></button>
          </div>`;
      }
    }
  ];

  global.CuratedWave1 = CURATED_WAVE1;
})(window);
