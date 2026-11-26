(function (global) {
  "use strict";
  function renderBarcodeSvg() {
    const pattern = [
      3.2,1.8,1.4,2.2,4.2,1.6,1.6,2.8,2.4,1.5,3.8,1.8,1.4,2.0,
      3.4,1.6,2.0,2.4,1.4,1.6,4.0,1.8,1.8,2.2,3.0,1.6,1.4,2.0,
      3.6,1.6,2.2,1.8,1.5,2.2,3.2,1.6,1.6,1.8,3.4
    ];
    let x = 0, rects = "";
    pattern.forEach((w, idx) => {
      if (idx % 2 === 0) rects += `<rect x="${x.toFixed(1)}" y="0" width="${w}" height="28" rx="0.4" fill="#16181D"/>`;
      x += w;
    });
    return `<svg viewBox="0 0 ${x.toFixed(1)} 28" style="width:100%;height:calc(27 * var(--u));display:block" preserveAspectRatio="none" aria-hidden="true">${rects}</svg>`;
  }
  global.CuratedWave5 = [{
    id: "agenda-receipt",
    originNo: "04",
    name: "热敏锯齿小票 · Receipt",
    capability: "agenda · 待办日程小票",
    swatches: [
      { name: "碳黑热敏机", color: "#272A32", body: "linear-gradient(180deg,#2C303A 0%,#16181F 100%)", paper: "#FAF8F2", accent: "#D92D20" },
      { name: "复古奶油机", color: "#D6CFC2", body: "linear-gradient(180deg,#E7E1D5 0%,#C2B9AA 100%)", paper: "#FFFFFF", accent: "#2563EB" },
      { name: "小票浅粉纸", color: "#F43F5E", body: "linear-gradient(180deg,#28242B 0%,#151318 100%)", paper: "#FFF5F7", accent: "#E11D48" }
    ],
    createState: () => ({
      idx: 0,
      lists: [
        [{ t: "15:00", name: "视觉走查" }, { t: "17:30", name: "羽毛球局" }, { t: "20:00", name: "黑胶试听" }, { t: "21:30", name: "晚间阅读" }],
        [{ t: "09:30", name: "手冲咖啡" }, { t: "14:00", name: "原型评审" }, { t: "19:00", name: "超市采购" }, { t: "22:00", name: "胶片冲洗" }]
      ]
    }),
    interact(st) { st.idx = (st.idx + 1) % st.lists.length; },
    render(st, sw, wide) {
      const items = st.lists[st.idx].slice(0, wide ? 4 : 3);
      const rows = items.map((r, i) => `
        <div class="sk-rc-row">
          <span style="color:${i === 0 ? sw.accent : "#16181D"}">${r.t}</span>
          <span>${r.name}</span>
        </div>`).join("");
      return `
        <div class="sk-face sk-printer-body" style="--pr-body:${sw.body};--rc-paper:${sw.paper}">
          <i class="sk-printer-led"></i>
          <div class="sk-printer-slot"></div>
          <div class="sk-printer-blade"></div>
          <div class="sk-receipt-wrap">
            <div class="sk-receipt-paper">
              <div class="sk-paper-grain" style="background-image:url('assets/paper.webp')"></div>
              <div class="sk-receipt-top"></div>
              <div class="sk-rc-grid">${rows}</div>
              <div class="sk-rc-dash"></div>
              ${renderBarcodeSvg()}
            </div>
          </div>
          <button type="button" class="sk-hit" data-id="agenda-receipt" aria-label="切换日程小票"></button>
        </div>`;
    }
  }];
})(window);
