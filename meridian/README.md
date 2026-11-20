# 制作记录 · 暮线

- 稳定作品 ID / revision：`meridian` / 1；不是内置模板注册 ID。
- capability：原生 clock。辅助数据角色：无。第一眼读数：当前时间。
- 设计方向：比较过全数字雕塑、模拟仪表、铜色轨道三种方向；选择轨道，以单一读数和低亮度线条营造安静、有层次的盘面。
- 参考：[Apple StandBy 的远距离阅读](https://support.apple.com/en-gb/guide/iphone/iph878d77632/ios)、[Apple Modular 的主读数层级](https://developer.apple.com/documentation/clockkit/modular-large)。只借鉴层级和阅读方式；无 Apple 图像、字体、商标或表盘描摹。
- background / ink / accent：`#101719` / `#F1E5D3` / 铜色 `#D2A579`。动态时间采用宿主字体；无嵌入第三方字体。
- 方形设计坐标 300×300；横向独立 300×150。落地卡片 320×320 / 320×160，在 344 单位画布居中，避免普通卡片宽度被读取器从 344 改写为 320。
- 方形读数 capBox：(.055,.28,.89,.44)；横向：(.035,.18,.71,.65)。署名独立可编辑。边角/厚度由宿主负责。
- 用户定制：整卡位置/大小/旋转、署名、能力设置。色彩与轨道曲线通过 `scripts/build.cjs` 重编译；没有伪装成 App 内置调色功能。
- 边界：时钟无私人绑定、空数据或长标题；测试午夜、窄数字、最大晚间时间。每个包只有一种能力，不制造假日期/电量。
- 原创资产：代码生成椭圆线条和渐变，不使用 AI 位图或外部照片；没有额外第三方素材授权需求。
- 生产改动：无。复用官方 v2 包、原生 clock 和共享预览，不新增 CardTemplate/CompositionCatalog/CompositionScene。
- 视觉检查：方形 180/300/420px、横向 300/420px，实际 SVG 适配器输出已人工查看；宽版首次轨道过于裁切，改为更紧的椭圆，保持读数为主角。
- 自动检查：见 `qa.json` 和 `templates-check.txt`。浏览器导入、原生与 Form 均未验收。
