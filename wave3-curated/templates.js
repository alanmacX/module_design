(function (global) {
  'use strict';

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  const CURATED_WAVE3 = [
    {
      id: 'date-vignelli',
      originNo: '01',
      name: '撕页巨字历 · Vignelli',
      capability: 'date · 日期',
      swatches: [
        { name: '朱红白纸', color: '#E11D48', headBg: '#E11D48', headInk: '#FFFFFF', bodyBg: '#F6F5F0', bodyInk: '#111318' },
        { name: '墨黑瓷白', color: '#111318', headBg: '#111318', headInk: '#FFFFFF', bodyBg: '#F6F5F0', bodyInk: '#111318' },
        { name: '电光钴蓝', color: '#2E5BFF', headBg: '#0B0D14', headInk: '#FFFFFF', bodyBg: '#2E5BFF', bodyInk: '#FFFFFF' }
      ],
      createState: () => ({
        idx: 0,
        days: [
          { month: '11月', wday: '周四', num: '26' },
          { month: '11月', wday: '周六', num: '28' },
          { month: '12月', wday: '周二', num: '01' }
        ]
      }),
      interact(st) { st.idx = (st.idx + 1) % st.days.length; },
      render(st, sw, wide) {
        const d = st.days[st.idx];
        if (wide) {
          return `
            <div class="w3-face" style="display:flex;background:${sw.bodyBg}">
              <div style="width:calc(138 * var(--u));background:${sw.headBg};color:${sw.headInk};display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:900;font-size:calc(116 * var(--u));line-height:0.84">${d.num}</div>
              <div style="flex:1;padding:calc(22 * var(--u));color:${sw.bodyInk};display:flex;flex-direction:column;justify-content:space-between">
                <span style="font-size:calc(32 * var(--u));font-weight:900">${d.month}</span>
                <span style="font-size:calc(23 * var(--u));font-weight:800">${d.wday}</span>
              </div>
              <button type="button" class="w3-hit" data-id="date-vignelli" aria-label="切换日期"></button>
            </div>`;
        }
        return `
          <div class="w3-face" style="background:${sw.bodyBg}">
            <div class="w3-date-head" style="background:${sw.headBg};color:${sw.headInk}">
              <span>${d.month}</span>
              <span>${d.wday}</span>
            </div>
            <div class="w3-date-body" style="color:${sw.bodyInk}">${d.num}</div>
            <button type="button" class="w3-hit" data-id="date-vignelli" aria-label="切换日期"></button>
          </div>`;
      }
    },
    {
      id: 'day-curtain',
      originNo: '04',
      name: '昼光推移幕 · Curtain',
      capability: 'dayprogress · 今日进度',
      swatches: [
        { name: '晨曦金黑', color: '#FACC15', baseBg: '#101218', baseInk: '#FACC15', fillBg: '#FACC15', fillInk: '#101218' },
        { name: '电光蓝白', color: '#2E5BFF', baseBg: '#F4F5F8', baseInk: '#2E5BFF', fillBg: '#2E5BFF', fillInk: '#FFFFFF' },
        { name: '绯红暖白', color: '#E11D48', baseBg: '#F7F4EF', baseInk: '#E11D48', fillBg: '#E11D48', fillInk: '#FFFFFF' }
      ],
      createState: () => ({ idx: 0, vals: [68, 42, 86] }),
      interact(st) { st.idx = (st.idx + 1) % st.vals.length; },
      render(st, sw, wide) {
        const pct = st.vals[st.idx];
        const sizeStyle = wide ? 'font-size:calc(104 * var(--u))' : '';
        return `
          <div class="w3-face" style="background:${sw.baseBg};--curtain-x:${pct}%">
            <div class="w3-curtain-layer" style="color:${sw.baseInk}">
              <span class="w3-curtain-val" style="${sizeStyle}">${pct}<small>%</small></span>
            </div>
            <div class="w3-curtain-layer w3-curtain-fill" style="background:${sw.fillBg};color:${sw.fillInk}">
              <span class="w3-curtain-val" style="${sizeStyle}">${pct}<small>%</small></span>
            </div>
            <button type="button" class="w3-hit" data-id="day-curtain" aria-label="切换今日进度"></button>
          </div>`;
      }
    },
    {
      id: 'course-bento',
      originNo: '06',
      name: '课表双拼栈 · Course Bento',
      capability: 'timetable · 课程表',
      swatches: [
        { name: '克莱因蓝', color: '#2563EB', bg: '#F2F3F8', timeBg: '#FFFFFF', timeInk: '#14161F', roomBg: '#2563EB', roomInk: '#FFFFFF', mainBg: '#14161F', mainInk: '#FFFFFF', pillBg: 'rgba(255,255,255,0.16)' },
        { name: '珊瑚西柚', color: '#F43F5E', bg: '#FFF5F6', timeBg: '#FFFFFF', timeInk: '#241217', roomBg: '#F43F5E', roomInk: '#FFFFFF', mainBg: '#F43F5E', mainInk: '#FFFFFF', pillBg: 'rgba(255,255,255,0.22)' },
        { name: '翡翠白卡', color: '#059669', bg: '#ECFDF5', timeBg: '#064E3B', timeInk: '#FFFFFF', roomBg: '#10B981', roomInk: '#064E3B', mainBg: '#FFFFFF', mainInk: '#064E3B', pillBg: '#D1FAE5' }
      ],
      createState: () => ({
        idx: 0,
        lessons: [
          { time: '14:00', room: 'A302', day: '周四', name: '交互设计工作坊' },
          { time: '16:00', room: 'B108', day: '周四', name: '动态图形着色器' },
          { time: '09:30', room: 'C405', day: '周五', name: '产品原型实训课' }
        ]
      }),
      interact(st) { st.idx = (st.idx + 1) % st.lessons.length; },
      render(st, sw, wide) {
        const les = st.lessons[st.idx];
        if (wide) {
          return `
            <div class="w3-face" style="background:${sw.bg};padding:calc(12 * var(--u));display:flex;gap:calc(10 * var(--u))">
              <div style="width:calc(94 * var(--u));flex-shrink:0;display:flex;flex-direction:column;gap:calc(8 * var(--u))">
                <div style="flex:1;border-radius:calc(20 * var(--u));background:${sw.timeBg};color:${sw.timeInk};display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:900;font-size:calc(36 * var(--u))">${les.time}</div>
                <div style="height:calc(46 * var(--u));border-radius:calc(18 * var(--u));background:${sw.roomBg};color:${sw.roomInk};display:flex;align-items:center;justify-content:center;font-size:calc(20 * var(--u));font-weight:900">${les.room}</div>
              </div>
              <div style="flex:1;min-width:0;border-radius:calc(22 * var(--u));background:${sw.mainBg};color:${sw.mainInk};padding:calc(14 * var(--u));display:flex;flex-direction:column;justify-content:space-between">
                <span class="w3-tt-day" style="background:${sw.pillBg}">${les.day}</span>
                <div class="w3-tt-name" style="font-size:calc(20 * var(--u))">${esc(les.name)}</div>
              </div>
              <button type="button" class="w3-hit" data-id="course-bento" aria-label="切换课程"></button>
            </div>`;
        }
        return `
          <div class="w3-face w3-tt" style="background:${sw.bg}">
            <div class="w3-tt-top">
              <div class="w3-tt-timebox" style="background:${sw.timeBg};color:${sw.timeInk}">${les.time}</div>
              <div class="w3-tt-roombox" style="background:${sw.roomBg};color:${sw.roomInk}">${les.room}</div>
            </div>
            <div class="w3-tt-main" style="background:${sw.mainBg};color:${sw.mainInk}">
              <span class="w3-tt-day" style="background:${sw.pillBg}">${les.day}</span>
              <div class="w3-tt-name">${esc(les.name)}</div>
            </div>
            <button type="button" class="w3-hit" data-id="course-bento" aria-label="切换课程"></button>
          </div>`;
      }
    }
  ];

  global.CuratedWave3 = CURATED_WAVE3;
})(window);
