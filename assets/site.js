/* Orbit 主页脚本：多语言、主题、轨道系统、模块网格、截图切换、星空背景 */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  var darkMQ = matchMedia('(prefers-color-scheme: dark)');

  // ---------- 图标（简化的线性图标，对应 App 内各模块的 SF Symbol） ----------
  var GLYPH = {
    launcher: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="M15 15l5 5"/>',
    window: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 5v14"/>',
    clipboard: '<rect x="5.5" y="4.5" width="13" height="16" rx="2.5"/><path d="M9 3.5h6v3H9zM9 12h6M9 16h4"/>',
    menubar: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 8.5h18M14 6.2h.5M17 6.2h.5"/>',
    monitor: '<path d="M4.5 16.5a7.5 7.5 0 1 1 15 0"/><path d="M12 16.5l3.6-4.6"/><circle cx="12" cy="16.5" r="1"/>',
    screenshot: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><circle cx="12" cy="12" r="3"/>',
    gif: '<circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="12" r="5.4"/><circle cx="12" cy="12" r="8.6" stroke-dasharray="1.4 2.4"/>',
    recorder: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/>',
    finder: '<path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/><circle cx="15.5" cy="13.5" r="2"/>',
    filesearch: '<path d="M12.5 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h4.5"/><path d="M12.5 3.5l5 5V11"/><circle cx="16" cy="16" r="3"/><path d="M18.2 18.2l2.3 2.3"/>',
    disk: '<circle cx="12" cy="12" r="8"/><path d="M12 4v8h8"/>',
    login: '<path d="M12 4v7"/><path d="M7.1 7.3a7 7 0 1 0 9.8 0"/>',
    uninstaller: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/><path d="M10 11l4 4M14 11l-4 4"/>',
    cleaner: '<path d="M10 3l1.6 4.9 4.9 1.6-4.9 1.6L10 16l-1.6-4.9-4.9-1.6 4.9-1.6z"/><path d="M18 14l.8 2.2 2.2.8-2.2.8L18 20l-.8-2.2-2.2-.8 2.2-.8z"/>',
    privacy: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A5.5 5.5 0 0 1 5 18l-2-3.5a1.4 1.4 0 0 1 2.4-1.4L8 16"/>',
    maintenance: '<path d="M15 4a5 5 0 0 0-4.6 6.9L4 17.3a1.9 1.9 0 0 0 2.7 2.7l6.4-6.4A5 5 0 0 0 20 9l-3 1-2-2 1-3z"/>',
    tweaks: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'
  };
  function glyph(id) {
    return '<svg class="g" viewBox="0 0 24 24" aria-hidden="true">' + GLYPH[id] + '</svg>';
  }

  // ---------- 分类（轨道），由内到外 ----------
  var CATS = [
    { id: 'productivity', zh: '效率', en: 'Productivity', tw: '效率' },
    { id: 'capture', zh: '截图与录制', en: 'Capture', tw: '截圖與錄製' },
    { id: 'files', zh: '文件', en: 'Files', tw: '檔案' },
    { id: 'system', zh: '系统', en: 'System', tw: '系統' }
  ];

  // ---------- 模块：名称与简介取自 App 内三语字符串，要点取自 README ----------
  var MODULES = [
    { id: 'launcher', cat: 0, c: 'purple', key: '⌥Space', alt: 'Sol / Alfred',
      t: ['启动器', 'Launcher', '啟動器'],
      s: ['快速启动应用、计算、搜索网页与文件、执行系统命令。', 'Launch apps, calculate, search the web and files, and run system commands.', '快速啟動應用、計算、搜尋網頁與檔案、執行系統命令。'],
      p: [['拼音与首字母搜索应用', '计算器、网页与文件搜索', '脚本命令（兼容 Sol）', '任意命令绑定快捷键'],
          ['Pinyin & initials app search', 'Calculator, web & file search', 'Script commands (Sol-compatible)', 'Hotkeys for any command'],
          ['拼音與首字母搜尋應用', '計算機、網頁與檔案搜尋', '腳本命令（相容 Sol）', '任意命令綁定快速鍵']] },
    { id: 'window', cat: 0, c: 'blue', key: '⌃⌥ + ←→↑↓', alt: 'Rectangle / Magnet',
      t: ['窗口管理', 'Window Manager', '視窗管理'],
      s: ['用快捷键或拖到屏幕边缘来排列窗口。', 'Arrange windows with shortcuts or by dragging them to screen edges.', '用快速鍵或拖到螢幕邊緣來排列視窗。'],
      p: [['26 个排列动作', '重复按键循环尺寸', '拖到屏幕边缘吸附', '跨显示器移动', '窗口间距'],
          ['26 window actions', 'Repeat to cycle sizes', 'Snap at screen edges', 'Move across displays', 'Window gaps'],
          ['26 個排列動作', '重複按鍵循環尺寸', '拖到螢幕邊緣吸附', '跨顯示器移動', '視窗間距']] },
    { id: 'clipboard', cat: 0, c: 'orange', key: '⇧⌘V', alt: 'Paste / Maccy',
      t: ['剪贴板', 'Clipboard', '剪貼簿'],
      s: ['记录复制历史，随时搜索并粘贴。', 'Keep a history of everything you copy and paste it again at any time.', '記錄複製歷史，隨時搜尋並貼上。'],
      p: [['文本、图片、文件、链接、颜色', '搜索、筛选、收藏夹、固定', '粘贴为纯文本', '忽略密码管理器'],
          ['Text, images, files, links, colors', 'Search, filters, favorites, pins', 'Paste as plain text', 'Ignores password managers'],
          ['文字、圖片、檔案、連結、顏色', '搜尋、篩選、收藏夾、固定', '貼上為純文字', '忽略密碼管理器']] },
    { id: 'menubar', cat: 0, c: 'gray', key: '', ck: true, alt: 'Bartender / Ice',
      t: ['菜单栏', 'Menu Bar', '選單列'],
      s: ['隐藏不常用的菜单栏图标，让菜单栏保持整洁。', 'Hide menu bar icons you rarely use and keep the menu bar tidy.', '隱藏不常用的選單列圖示，讓選單列保持整潔。'],
      p: [['始终显示 / 隐藏 / 始终隐藏', '自动重新隐藏', '悬停或点击展开', 'macOS 27 使用系统原生隐藏'],
          ['Shown / hidden / always hidden', 'Auto re-hide', 'Reveal on hover or click', 'Native hiding on macOS 27'],
          ['始終顯示 / 隱藏 / 始終隱藏', '自動重新隱藏', '懸停或點按展開', 'macOS 27 使用系統原生隱藏']] },
    { id: 'monitor', cat: 0, c: 'red', key: '', alt: 'iStat Menus / Stats',
      t: ['资源监控', 'System Monitor', '資源監控'],
      s: ['在菜单栏显示 CPU、内存、网速与磁盘状态，释放内存。', 'Show CPU, memory, network and disk stats in the menu bar and free up memory.', '在選單列顯示 CPU、記憶體、網速與磁碟狀態，釋放記憶體。'],
      p: [['CPU、内存、网速、磁盘、电池', '趋势图与进程排行', '一键释放内存'],
          ['CPU, memory, network, disk, battery', 'Trend charts & top processes', 'One-click memory release'],
          ['CPU、記憶體、網速、磁碟、電池', '趨勢圖與行程排行', '一鍵釋放記憶體']] },
    { id: 'screenshot', cat: 1, c: 'pink', key: '⌃⇧A', alt: 'iShot',
      t: ['截图', 'Screenshot', '截圖'],
      s: ['区域与窗口截图、标注、贴图与文字识别。', 'Capture regions and windows, annotate, pin to screen and recognize text.', '區域與視窗截圖、標註、貼圖與文字識別。'],
      p: [['区域 / 窗口 / 全屏 / 延时', '放大镜取色', '箭头、马赛克、序号等标注', '贴图与文字识别'],
          ['Region, window, full screen, delayed', 'Magnifier color picker', 'Arrows, mosaic, numbered steps', 'Pin to screen & OCR'],
          ['區域 / 視窗 / 全螢幕 / 延時', '放大鏡取色', '箭頭、馬賽克、序號等標註', '貼圖與文字識別']] },
    { id: 'gif', cat: 1, c: 'mint', key: '⌃⇧G', alt: 'LiceCap',
      t: ['GIF 录制', 'GIF Recorder', 'GIF 錄製'],
      s: ['把屏幕区域录制成 GIF 动图。', 'Record a screen region as an animated GIF.', '把螢幕區域錄製成 GIF 動圖。'],
      p: [['选择区域录制', '帧率与缩放可调'],
          ['Record any region', 'Adjustable frame rate & scale'],
          ['選擇區域錄製', '影格率與縮放可調']] },
    { id: 'recorder', cat: 1, c: 'red', key: '⌃⇧R', alt: '',
      t: ['录屏', 'Screen Recorder', '錄屏'],
      s: ['录制屏幕、窗口或区域为视频，可同时录制系统声音和麦克风。', 'Record the screen, a window or a region to video, with system audio and microphone.', '錄製螢幕、視窗或區域為影片，可同時錄製系統聲音和麥克風。'],
      p: [['MP4 或 MOV', '系统声音与麦克风', '显示鼠标点击'],
          ['MP4 or MOV', 'System audio & microphone', 'Shows mouse clicks'],
          ['MP4 或 MOV', '系統聲音與麥克風', '顯示滑鼠點按']] },
    { id: 'finder', cat: 2, c: 'cyan', key: '', ck: true, alt: 'iRightMouse / OpenInTerminal',
      t: ['访达增强', 'Finder Tools', 'Finder 增強'],
      s: ['访达右键菜单、在终端或编辑器中打开、拷贝路径、新建文件。', 'Finder context menu, open in Terminal or editor, copy paths and create new files.', 'Finder 右鍵選單、在終端機或編輯器中開啟、複製路徑、新建檔案。'],
      p: [['新建文件（含 Office 模板）', '剪切粘贴、计算哈希、压缩', '图片格式转换', 'OpenIn 小程序可拖到访达工具栏'],
          ['New files (Office templates)', 'Cut & paste, hashes, compress', 'Image format conversion', 'OpenIn applets for the Finder toolbar'],
          ['新建檔案（含 Office 範本）', '剪下貼上、計算雜湊、壓縮', '圖片格式轉換', 'OpenIn 小程式可拖到 Finder 工具列']] },
    { id: 'filesearch', cat: 2, c: 'green', key: '', ck: true, alt: 'Find Any File',
      t: ['文件查找', 'File Search', '檔案查詢'],
      s: ['不依赖索引，按名称、内容、日期等条件实时查找文件。', 'Find files in real time by name, content, date and more without an index.', '不依賴索引，按名稱、內容、日期等條件即時查詢檔案。'],
      p: [['组合条件', '内容搜索', '卷目录搜索', '列表 / 树形 / 网格结果'],
          ['Combined criteria', 'Content search', 'Volume catalog search', 'List, tree or grid results'],
          ['組合條件', '內容搜尋', '卷目錄搜尋', '列表 / 樹狀 / 網格結果']] },
    { id: 'disk', cat: 2, c: 'purple', key: '', alt: 'DaisyDisk',
      t: ['磁盘分析', 'Disk Analyzer', '磁碟分析'],
      s: ['可视化查看磁盘空间占用，查找重复文件。', 'Visualize disk usage and find duplicate files.', '視覺化檢視磁碟空間佔用，查詢重複檔案。'],
      p: [['矩形树图与旭日图', '逐层下钻', '重复文件查找'],
          ['Treemap & sunburst', 'Drill down level by level', 'Duplicate finder'],
          ['矩形樹狀圖與旭日圖', '逐層下鑽', '重複檔案查詢']] },
    { id: 'login', cat: 3, c: 'indigo', key: '', alt: '',
      t: ['启动项', 'Login Items', '啟動項'],
      s: ['管理登录项、LaunchAgents 与 LaunchDaemons。', 'Manage login items, LaunchAgents and LaunchDaemons.', '管理登入項目、LaunchAgents 與 LaunchDaemons。'],
      p: [['按应用聚合查看', '包含后台项目', '启停、删除', '清理失效项'],
          ['Grouped by app', 'Includes background items', 'Enable, disable, remove', 'Clean up broken items'],
          ['按應用聚合檢視', '包含背景項目', '啟停、刪除', '清理失效項']] },
    { id: 'uninstaller', cat: 3, c: 'brown', key: '', alt: 'AppCleaner',
      t: ['应用卸载', 'Uninstaller', '應用解除安裝'],
      s: ['彻底卸载应用及其残留文件。', 'Remove apps completely together with their leftover files.', '徹底解除安裝應用及其殘留檔案。'],
      p: [['按 bundle id / 开发者匹配残留', '个人数据默认保留', '批量卸载', '孤立残留扫描', '拖入即卸载'],
          ['Leftovers matched by bundle ID & developer', 'Personal data kept by default', 'Batch uninstall', 'Orphan scan', 'Drop to uninstall'],
          ['按 bundle id / 開發者比對殘留', '個人資料預設保留', '批次解除安裝', '孤立殘留掃描', '拖入即解除安裝']] },
    { id: 'cleaner', cat: 3, c: 'teal', key: '', alt: 'CleanMyMac',
      t: ['垃圾清理', 'Cleaner', '垃圾清理'],
      s: ['扫描并清理缓存、日志与开发工具残留等无用文件。', 'Scan and remove caches, logs, developer tool leftovers and other junk.', '掃描並清理快取、日誌與開發工具殘留等無用檔案。'],
      p: [['120 条规则', '风险分级与推荐选择', 'Xcode、浏览器、本地 AI 模型', '旧安装包与大文件'],
          ['120 rules', 'Risk levels & recommended picks', 'Xcode, browsers, local AI models', 'Old installers & large files'],
          ['120 條規則', '風險分級與推薦選擇', 'Xcode、瀏覽器、本機 AI 模型', '舊安裝包與大檔案']] },
    { id: 'privacy', cat: 3, c: 'blue', key: '', alt: '',
      t: ['隐私清理', 'Privacy', '隱私清理'],
      s: ['清除浏览器历史、Cookie、最近使用记录等隐私痕迹。', 'Clear browsing history, cookies, recent items and other traces.', '清除瀏覽器歷史、Cookie、最近使用記錄等隱私痕跡。'],
      p: [['Safari、Chromium 系、Firefox', '历史、下载、Cookie、站点数据', '最近使用项目与剪贴板'],
          ['Safari, Chromium browsers, Firefox', 'History, downloads, cookies, site data', 'Recent items & clipboard'],
          ['Safari、Chromium 系、Firefox', '歷史、下載、Cookie、網站資料', '最近使用項目與剪貼簿']] },
    { id: 'maintenance', cat: 3, c: 'orange', key: '', alt: '',
      t: ['系统维护', 'Maintenance', '系統維護'],
      s: ['重建索引、重置缓存、刷新 DNS 等一键维护。', 'Rebuild indexes, reset caches, flush DNS and other one-click fixes.', '重建索引、重置快取、重新整理 DNS 等一鍵維護。'],
      p: [['刷新 DNS', '重建 Spotlight 与 LaunchServices', '重置 Quick Look 与图标缓存', '校验启动卷'],
          ['Flush DNS', 'Rebuild Spotlight & LaunchServices', 'Reset Quick Look & icon caches', 'Verify the startup volume'],
          ['重新整理 DNS', '重建 Spotlight 與 LaunchServices', '重置 Quick Look 與圖示快取', '驗證啟動卷']] },
    { id: 'tweaks', cat: 3, c: 'green', key: '', alt: '',
      t: ['系统微调', 'Tweaks', '系統微調'],
      s: ['调整访达、程序坞等隐藏的系统偏好设置。', 'Adjust hidden system preferences for Finder, the Dock and more.', '調整 Finder、Dock 等隱藏的系統設定。'],
      p: [['54 项隐藏设置', '访达、程序坞、截屏、键盘', '修改后回读确认', '可恢复默认'],
          ['54 hidden settings', 'Finder, Dock, screenshots, keyboard', 'Read back after each change', 'Restore defaults'],
          ['54 項隱藏設定', 'Finder、Dock、截圖、鍵盤', '修改後回讀確認', '可恢復預設']] }
  ];

  // 控制中心卡片（三语）
  var HUB = [
    { t: '控制中心', s: '模块之外的全局页面：切换语言与外观、检查更新，统一修改快捷键、查看授权状态、回看破坏性操作的结果。', p: ['通用', '快捷键', '权限', '操作记录', '关于'] },
    { t: 'Control Center', s: 'Global pages beyond the modules: switch language and appearance, check for updates, change shortcuts, review permissions and the results of destructive actions.', p: ['General', 'Shortcuts', 'Permissions', 'History', 'About'] },
    { t: '控制中心', s: '模組之外的全域頁面：切換語言與外觀、檢查更新，統一修改快速鍵、檢視授權狀態、回看破壞性操作的結果。', p: ['通用', '快速鍵', '權限', '操作記錄', '關於'] }
  ];

  // ---------- 界面文案：简体中文直接取自 HTML，这里只写英文与繁体 ----------
  var META = {
    'zh-Hans': {
      title: 'Orbit — 常驻菜单栏的 macOS 效率工具合集',
      desc: 'Orbit 是常驻菜单栏的 macOS 效率工具合集：用一个轻量进程替代启动器、窗口管理、剪贴板、菜单栏整理、截图录屏、访达增强、文件查找、应用卸载与垃圾清理等十几款软件。'
    },
    en: {
      title: 'Orbit — An all-in-one menu bar toolkit for macOS',
      desc: 'Orbit lives in the macOS menu bar and replaces a dozen utilities with one lightweight process: launcher, window manager, clipboard history, menu bar organizer, screenshots and recording, Finder tools, file search, uninstaller and cleaner.'
    },
    'zh-Hant': {
      title: 'Orbit — 常駐選單列的 macOS 效率工具合集',
      desc: 'Orbit 是常駐選單列的 macOS 效率工具合集：用一個輕量行程取代啟動器、視窗管理、剪貼簿、選單列整理、截圖錄屏、Finder 增強、檔案查詢、應用解除安裝與垃圾清理等十幾款軟體。'
    }
  };
  var DICT = {
    en: {
      skip: 'Skip to content', navLabel: 'Page navigation', navModules: 'Modules', navViews: 'Screenshots', navDownload: 'Download',
      langLabel: 'Language', themeLabel: 'Theme', themeLight: 'Light', themeDark: 'Dark', themeSystem: 'Match system', ghLabel: 'GitHub repository',
      eyebrow: 'Menu bar toolkit for macOS · control center online',
      heroTitle: 'One process.<br><em>Seventeen modules</em> in orbit.',
      heroLead: 'Launcher, window manager, clipboard history, menu bar organizer, screenshots and recording, Finder tools, file search, login items, uninstaller and cleaner — all inside one lightweight menu bar process, with every module switched on or off on its own.',
      dlArm: 'Download for Apple silicon', dlIntel: 'Intel', req: 'macOS 13.0 or later · notarized by Apple', verPrefix: 'Latest',
      stat1: 'modules', stat2: 'window actions', stat3: 'cleanup rules', stat4: 'system tweaks',
      orbitLabel: 'Orbit module map', iconAlt: 'Orbit app icon', roLabel: 'Telemetry · module', roHint: 'Hover or tap a satellite',
      modKicker: '01 / Module bay', modTitle: 'Every satellite is a tool you can switch on or off',
      modLead: 'A disabled module registers no shortcuts and runs no background work. Switch orbits to see what each module does.',
      catLabel: 'Module categories', all: 'All', altLabel: 'Replaces', keyLabel: 'Shortcut', keyCustom: 'Customizable',
      viewKicker: '02 / Cabin view', viewTitle: 'Every module, in one control center',
      viewLead: 'The sidebar groups modules into Productivity, Capture, Files and System; each module has its own settings page with an on/off switch at the top. Screenshots show the Simplified Chinese interface.',
      viewLabel: 'Screenshots',
      v1t: 'Launcher', v1d: 'Opens with ⌥Space; turn pinyin search, the calculator, web search and script commands on or off here.',
      v2t: 'Clipboard', v2d: 'Opens history with ⇧⌘V; polling interval, how many items and how long to keep, how to paste.',
      v3t: 'System Monitor', v3d: 'Choose which stats appear in the menu bar, as a chart or a number, and how often to sample.',
      v4t: 'Cleaner', v4d: 'Scan results come with risk levels and recommended picks; caches are deleted, user files go to the Trash.',
      v1alt: 'Launcher settings in the Orbit control center', v2alt: 'Clipboard settings in the Orbit control center',
      v3alt: 'System Monitor settings in the Orbit control center', v4alt: 'The Cleaner page in the Orbit control center',
      ruleKicker: '03 / Flight rules', ruleTitle: 'A dozen tools, one set of rules',
      r1t: 'On only when needed', r1d: 'A disabled module registers no shortcuts and runs no background tasks.',
      r2t: 'Your shortcuts', r2d: 'Change every shortcut on the Shortcuts page of the control center; any launcher command can get a global hotkey too.',
      r3t: 'Everything on record', r3d: 'Results of cleanups, uninstalls, login item changes and other destructive actions are kept on the History page.',
      r4t: 'Settings travel with you', r4d: 'Export your settings to an <code>.orbitconfig</code> file and double-click it on another Mac to restore them.',
      r5t: 'Three languages, three looks', r5d: 'Switch between Simplified Chinese, Traditional Chinese and English without restarting; choose light, dark or match system.',
      r6t: 'Updates per chip', r6d: 'Built-in Sparkle updates check once a day by default and only download the build for your Mac’s chip.',
      permKicker: '04 / Clearances', permTitle: 'Permissions are requested only for the features you use',
      permLead: 'Orbit asks for access the first time a feature needs it. The Permissions page of the control center shows them all in one place.',
      p1t: 'Accessibility', p1d: 'Window management, direct paste from the clipboard, menu bar icon management',
      p2t: 'Screen Recording', p2d: 'Screenshots, GIF recording, screen recording',
      p3t: 'Full Disk Access', p3d: 'File search, leftover scans for uninstalls, cleanup',
      p4t: 'Automation: Finder / System Events', p4d: 'Open in Terminal or editor, read the Finder selection, manage login items',
      p5t: 'Privileged helper (optional)', p5d: 'Search restricted folders as root, delete root-owned files, manage LaunchDaemons, run allow-listed maintenance tasks',
      permNote: 'To use the Finder context menu, enable Orbit Finder in System Settings › General › Login Items & Extensions › Finder Extensions. The Finder Tools settings page has a shortcut button.',
      dlKicker: '05 / Launch window', dlTitle: 'Pick the build that matches your Mac',
      dlLead: 'Not sure which chip you have? Open Apple menu › About This Mac and look at Chip or Processor. Open the DMG, drag Orbit into Applications, then open it from there.',
      verPrefix2: 'Latest version', notes: 'Release notes', history: 'All releases',
      padArmT: 'Apple silicon', padArmD: 'Macs with M1 or later', padIntelT: 'Intel', padIntelD: 'Macs with an Intel processor',
      faqKicker: '06 / FAQ',
      q1: 'macOS says it cannot verify the developer?', a1: 'The installer is notarized by Apple, so this should not happen. If you got the installer elsewhere, download it again from this page.',
      q2: 'A feature still doesn’t work after granting access?', a2: 'Permissions such as Screen Recording take effect after you reopen Orbit. Make sure only one copy of Orbit is running and that it is in the Applications folder.',
      q3: 'How do I uninstall Orbit?', a3: 'Remove the privileged helper under Control Center › Permissions first (if installed), quit Orbit, then move it to the Trash.',
      credits: 'Parts of Orbit are ported from or inspired by these open-source projects:',
      footLabel: 'Footer links', more: 'More by VanJay', feedback: 'Feedback'
    },
    'zh-Hant': {
      skip: '跳到正文', navLabel: '頁面導覽', navModules: '模組', navViews: '截圖', navDownload: '下載',
      langLabel: '語言', themeLabel: '主題', themeLight: '淺色', themeDark: '深色', themeSystem: '跟隨系統', ghLabel: 'GitHub 儲存庫',
      eyebrow: 'macOS 選單列效率工具合集 · 控制中心上線',
      heroTitle: '一個行程，<br><em>十七個模組</em>在軌運行',
      heroLead: '啟動器、視窗管理、剪貼簿、選單列整理、截圖錄屏、Finder 增強、檔案查詢、啟動項管理、應用解除安裝與垃圾清理——全部收進一個常駐選單列的輕量行程，每個模組都能單獨啟停。',
      dlArm: '下載 Apple 晶片版', dlIntel: 'Intel 版', req: 'macOS 13.0 以上 · 已經過 Apple 公證', verPrefix: '最新版本',
      stat1: '功能模組', stat2: '視窗排列動作', stat3: '垃圾清理規則', stat4: '項系統微調',
      orbitLabel: 'Orbit 模組軌道圖', iconAlt: 'Orbit 應用圖示', roLabel: '遙測 · 目前模組', roHint: '懸停或點按衛星',
      modKicker: '01 / 模組艙', modTitle: '每顆衛星，都是一款可以單獨啟停的工具',
      modLead: '停用的模組不註冊快速鍵，也不執行任何背景任務。切換軌道，看看每個模組能做什麼。',
      catLabel: '模組分類', all: '全部', altLabel: '可取代', keyLabel: '快速鍵', keyCustom: '可自訂',
      viewKicker: '02 / 艙內視圖', viewTitle: '所有模組，收在同一個控制中心裡',
      viewLead: '側邊欄按效率、截圖與錄製、檔案、系統四組排列；每個模組一頁設定，頂部開關隨時啟停。截圖為簡體中文介面。',
      viewLabel: '截圖',
      v1t: '啟動器', v1d: '⌥Space 呼出；拼音搜尋、計算機、網頁搜尋、腳本命令都在這裡開關。',
      v2t: '剪貼簿', v2d: '⇧⌘V 開啟歷史；檢查間隔、保留筆數與時間、直接貼上方式。',
      v3t: '資源監控', v3d: '選擇在選單列顯示哪些指標、用折線圖還是數值、多久取樣一次。',
      v4t: '垃圾清理', v4d: '掃描後按風險分級給出推薦選擇；快取直接刪除，使用者檔案移到垃圾桶。',
      v1alt: 'Orbit 控制中心的啟動器設定頁', v2alt: 'Orbit 控制中心的剪貼簿設定頁', v3alt: 'Orbit 控制中心的資源監控設定頁', v4alt: 'Orbit 控制中心的垃圾清理頁',
      ruleKicker: '03 / 飛行守則', ruleTitle: '十幾款工具合在一起，規矩只有一套',
      r1t: '按需啟停', r1d: '停用的模組不註冊快速鍵，也不執行任何背景任務。',
      r2t: '快速鍵隨你改', r2d: '所有快速鍵都在控制中心的「快速鍵」頁統一修改；啟動器裡的任意命令也能綁定全域快速鍵。',
      r3t: '操作留痕', r3d: '清理、解除安裝、啟動項等破壞性操作的結果，統一記錄在「操作記錄」頁。',
      r4t: '設定隨身帶', r4d: '設定可以匯出為 <code>.orbitconfig</code> 檔案，在另一台 Mac 上按兩下即可還原。',
      r5t: '三種語言，三種外觀', r5d: '簡體中文、繁體中文、English 隨時切換，無需重新啟動；外觀可選淺色、深色或跟隨系統。',
      r6t: '按晶片自動更新', r6d: '內建 Sparkle 自動更新，預設每天檢查一次，只下載與本機晶片相符的版本。',
      permKicker: '04 / 授權清單', permTitle: '用到哪個功能，才請求哪項權限',
      permLead: '首次使用相關功能時 Orbit 會提示授權，也可以在控制中心的「權限」頁統一檢視。',
      p1t: '輔助使用', p1d: '視窗管理、剪貼簿直接貼上、選單列圖示管理',
      p2t: '螢幕錄製', p2d: '截圖、GIF 錄製、錄屏',
      p3t: '完整磁碟取用權限', p3d: '檔案查詢、解除安裝殘留掃描、垃圾清理',
      p4t: '自動化：Finder / 系統事件', p4d: '在終端機或編輯器中開啟、讀取 Finder 選取項目、登入項目管理',
      p5t: '特權輔助程式（選用）', p5d: '以 root 搜尋受限目錄、刪除 root 擁有的檔案、管理 LaunchDaemons、執行白名單內的系統維護任務',
      permNote: 'Finder 右鍵選單需要在「系統設定 › 一般 › 登入項目與延伸功能 › Finder 延伸功能」中啟用 Orbit Finder，Finder 增強設定頁有直達按鈕。',
      dlKicker: '05 / 發射窗口', dlTitle: '選擇與你的 Mac 相符的安裝包',
      dlLead: '不確定是哪種晶片時，開啟「蘋果選單 › 關於這台 Mac」，看「晶片」或「處理器」一欄。開啟 DMG，把 Orbit 拖進「應用程式」檔案夾，再從「應用程式」中開啟即可。',
      verPrefix2: '最新版本', notes: '更新說明', history: '歷史版本',
      padArmT: 'Apple 晶片', padArmD: 'M1 及更新的 Mac', padIntelT: 'Intel 晶片', padIntelD: '搭載 Intel 處理器的 Mac',
      faqKicker: '06 / 常見問題',
      q1: '開啟時提示「無法驗證開發者」？', a1: '安裝包已經過 Apple 公證，正常不會出現。如果從其他管道取得安裝包，請到本頁重新下載。',
      q2: '授權後功能仍無法使用？', a2: '螢幕錄製等權限授權後需要重新開啟 Orbit。請確認只執行了一份 Orbit，並且它位於「應用程式」檔案夾中。',
      q3: '如何解除安裝 Orbit？', a3: '先在「控制中心 › 權限」中解除安裝特權輔助程式（如已安裝），結束 Orbit 後把它移到垃圾桶即可。',
      credits: '部分實作移植或參考了這些開源專案：',
      footLabel: '頁尾連結', more: 'VanJay 的更多作品', feedback: '意見回饋'
    }
  };
  // 简体中文模块网格用到的少量文案（HTML 中不存在对应元素）
  var ZH_EXTRA = { all: '全部', altLabel: '可替代', keyLabel: '快捷键', keyCustom: '可自定义' };

  // 从 HTML 读取简体中文原文
  var ZH = {};
  var i18nEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var attrEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-attr]'));
  i18nEls.forEach(function (el) {
    ZH[el.getAttribute('data-i18n')] = el.innerHTML;
  });
  attrEls.forEach(function (el) {
    el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
      var kv = pair.split(':');
      if (!(kv[1] in ZH)) {
        ZH[kv[1]] = el.getAttribute(kv[0]) || '';
      }
    });
  });
  Object.keys(ZH_EXTRA).forEach(function (k) {
    ZH[k] = ZH_EXTRA[k];
  });

  var LANGS = ['zh-Hans', 'en', 'zh-Hant'];
  var lang = 'zh-Hans';
  // 语言下标：0 简体，1 英文，2 繁体
  function li() {
    return LANGS.indexOf(lang);
  }
  function tr(key) {
    if (lang === 'zh-Hans') {
      return ZH[key];
    }
    var d = DICT[lang];
    return (d && key in d) ? d[key] : ZH[key];
  }

  function normalizeLang(v) {
    if (!v) {
      return null;
    }
    v = String(v).toLowerCase();
    if (/^zh[-_](tw|hk|mo|hant)/.test(v) || v === 'tw' || v === 'zh-hant') {
      return 'zh-Hant';
    }
    if (v.indexOf('zh') === 0 || v === 'cn') {
      return 'zh-Hans';
    }
    if (v.indexOf('en') === 0) {
      return 'en';
    }
    return null;
  }
  function detectLang() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (var i = 0; i < list.length; i++) {
      var l = String(list[i]).toLowerCase();
      if (l.indexOf('zh') === 0) {
        return normalizeLang(l) === 'zh-Hant' ? 'zh-Hant' : 'zh-Hans';
      }
      if (l.indexOf('en') === 0) {
        return 'en';
      }
    }
    return 'en';
  }

  var params = new URLSearchParams(location.search);
  function store(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  }
  function load(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }

  function applyLang(next, save) {
    lang = next;
    if (save) {
      store('orbit.lang', next);
    }
    doc.setAttribute('lang', next);
    i18nEls.forEach(function (el) {
      el.innerHTML = tr(el.getAttribute('data-i18n'));
    });
    attrEls.forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var kv = pair.split(':');
        el.setAttribute(kv[0], tr(kv[1]));
      });
    });
    document.title = META[next].title;
    setMeta('meta[name="description"]', META[next].desc);
    setMeta('meta[property="og:title"]', META[next].title);
    setMeta('meta[property="og:description"]', META[next].desc);
    document.querySelectorAll('#langSeg button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === next));
    });
    renderTabs();
    renderGrid(false);
    relabelSats();
    drawRingLabels();
    showModule(current, false);
    renderVersionDate();
  }
  function setMeta(sel, v) {
    var m = document.querySelector(sel);
    if (m) {
      m.setAttribute('content', v);
    }
  }

  // ---------- 主题 ----------
  function applyTheme(pref, save) {
    var dark = pref === 'dark' || (pref === 'system' && darkMQ.matches);
    doc.setAttribute('data-theme', dark ? 'dark' : 'light');
    doc.setAttribute('data-theme-pref', pref);
    setMeta('meta[name="theme-color"]', dark ? '#050713' : '#f2eee4');
    if (save) {
      store('orbit.theme', pref);
    }
    document.querySelectorAll('#themeSeg button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-btn') === pref));
    });
    stars.sync();
  }
  function onSystemThemeChange() {
    if (doc.getAttribute('data-theme-pref') === 'system') {
      applyTheme('system', false);
    }
  }
  if (darkMQ.addEventListener) {
    darkMQ.addEventListener('change', onSystemThemeChange);
  } else if (darkMQ.addListener) {
    darkMQ.addListener(onSystemThemeChange);
  }

  // ---------- 星空背景（仅深色主题绘制） ----------
  var stars = (function () {
    var cv = document.getElementById('stars');
    var ctx = cv.getContext('2d');
    var pts = [];
    var raf = 0;
    var last = 0;
    var w = 0;
    var h = 0;
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(260, Math.round(w * h / 5200));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.1 + .25, a: Math.random() * .6 + .2, s: Math.random() * 1.6 + .4, p: Math.random() * 6.28 });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var q = pts[i];
        var tw = reduceMQ.matches ? 1 : (.65 + .35 * Math.sin(t / 1000 * q.s + q.p));
        ctx.globalAlpha = q.a * tw;
        ctx.fillStyle = i % 9 === 0 ? '#b9b4ff' : (i % 13 === 0 ? '#9fefff' : '#ffffff');
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) {
      raf = requestAnimationFrame(loop);
      // 闪烁只需约 20fps，降低开销
      if (t - last < 50) {
        return;
      }
      last = t;
      draw(t);
    }
    function active() {
      return doc.getAttribute('data-theme') === 'dark' && !document.hidden;
    }
    function sync() {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!active()) {
        return;
      }
      if (!pts.length) {
        resize();
      }
      if (reduceMQ.matches) {
        draw(0);
      } else {
        raf = requestAnimationFrame(loop);
      }
    }
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        resize();
        sync();
      }, 150);
    });
    return { sync: sync };
  })();

  // ---------- 轨道系统 ----------
  var orbitEl = document.getElementById('orbit');
  var ringsEl = document.getElementById('rings');
  var satsEl = document.getElementById('sats');
  var RADII = [0.34, 0.53, 0.72, 0.92];            // 各轨道半径（占半宽比例）
  var PERIOD = [70, -95, 120, -160];                 // 公转周期（秒），负数为逆时针
  var OFFSET = [-0.6, 0.9, 2.2, 0.3];               // 各轨道初始相位
  var SVGNS = 'http://www.w3.org/2000/svg';
  var ringGroups = [];
  var satEls = [];
  var current = 0;
  var pinned = false;
  var hovering = false;

  function buildOrbit() {
    // 中轴虚线
    var axis = document.createElementNS(SVGNS, 'line');
    axis.setAttribute('class', 'axis');
    axis.setAttribute('x1', '0');
    axis.setAttribute('y1', '-492');
    axis.setAttribute('x2', '0');
    axis.setAttribute('y2', '492');
    ringsEl.appendChild(axis);
    RADII.forEach(function (f, i) {
      var r = f * 460 + 20 * (1 - f);
      var g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('data-ring', String(i));
      var c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('class', 'ring');
      c.setAttribute('r', String(r));
      // 刻度：沿轨道的短刻线
      var t = document.createElementNS(SVGNS, 'circle');
      t.setAttribute('class', 'tick');
      t.setAttribute('r', String(r));
      var circ = 2 * Math.PI * r;
      var n = 24 + i * 12;
      t.setAttribute('stroke-dasharray', '1.2 ' + (circ / n - 1.2).toFixed(2));
      var bg = document.createElementNS(SVGNS, 'rect');
      bg.setAttribute('class', 'lbl-bg');
      var tx = document.createElementNS(SVGNS, 'text');
      tx.setAttribute('class', 'lbl');
      tx.setAttribute('x', '8');
      tx.setAttribute('y', String(-r + 5));
      g.appendChild(c);
      g.appendChild(t);
      g.appendChild(bg);
      g.appendChild(tx);
      ringsEl.appendChild(g);
      ringGroups.push({ g: g, text: tx, bg: bg, r: r });
    });
    MODULES.forEach(function (m, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sat';
      b.style.setProperty('--c', 'var(--c-' + m.c + ')');
      b.innerHTML = '<span class="sat-i">' + glyph(m.id) + '</span><span class="sat-l"></span>';
      b.addEventListener('mouseenter', function () {
        hovering = true;
        showModule(idx, true);
      });
      b.addEventListener('mouseleave', function () {
        hovering = false;
      });
      b.addEventListener('focus', function () {
        showModule(idx, true);
      });
      b.addEventListener('click', function () {
        pinned = true;
        showModule(idx, true);
      });
      satsEl.appendChild(b);
      satEls.push(b);
    });
    // 每条轨道上的卫星均匀分布
    var counts = [0, 0, 0, 0];
    var seen = [0, 0, 0, 0];
    MODULES.forEach(function (m) {
      counts[m.cat]++;
    });
    MODULES.forEach(function (m, idx) {
      satEls[idx]._ring = m.cat;
      satEls[idx]._phase = OFFSET[m.cat] + (seen[m.cat]++ / counts[m.cat]) * Math.PI * 2;
    });
  }

  function drawRingLabels() {
    ringGroups.forEach(function (rg, i) {
      rg.text.textContent = '0' + (i + 1) + ' ' + CATS[i][['zh', 'en', 'tw'][li()]].toUpperCase();
      try {
        var bb = rg.text.getBBox();
        rg.bg.setAttribute('x', String(bb.x - 4));
        rg.bg.setAttribute('y', String(bb.y - 1));
        rg.bg.setAttribute('width', String(bb.width + 8));
        rg.bg.setAttribute('height', String(bb.height + 2));
      } catch (e) {}
    });
  }
  function relabelSats() {
    satEls.forEach(function (b, idx) {
      var m = MODULES[idx];
      b.querySelector('.sat-l').textContent = m.t[li()];
      b.setAttribute('aria-label', m.t[li()]);
    });
  }

  var roEl = document.getElementById('readout');
  function showModule(idx, animate) {
    var changed = idx !== current;
    current = idx;
    var m = MODULES[idx];
    var L = li();
    satEls.forEach(function (b, i) {
      b.classList.toggle('on', i === idx);
      b.setAttribute('aria-pressed', String(i === idx));
    });
    orbitEl.classList.add('has-on');
    ringGroups.forEach(function (rg, i) {
      rg.g.classList.toggle('on', i === m.cat);
    });
    roEl.style.setProperty('--c', 'var(--c-' + m.c + ')');
    document.getElementById('roGlyph').innerHTML = glyph(m.id);
    document.getElementById('roCat').textContent = 'ORBIT 0' + (m.cat + 1) + ' · ' + CATS[m.cat][['zh', 'en', 'tw'][L]];
    document.getElementById('roTitle').textContent = m.t[L];
    document.getElementById('roKey').textContent = m.key;
    document.getElementById('roSum').textContent = m.s[L];
    if (animate && changed && !reduceMQ.matches) {
      roEl.classList.remove('swap');
      void roEl.offsetWidth;
      roEl.classList.add('swap');
    }
  }

  // 动画循环：悬停时减速直至停下；离开视口或页面隐藏时暂停
  var size = 0;
  var angle = 0;          // 累计时间（秒）
  var speed = 1;          // 当前速度倍率
  var lastT = 0;
  var orbitRaf = 0;
  var orbitVisible = true;
  function measure() {
    size = orbitEl.clientWidth;
  }
  function place() {
    var half = size / 2;
    for (var i = 0; i < satEls.length; i++) {
      var b = satEls[i];
      var ring = b._ring;
      var r = (RADII[ring] * 460 + 20 * (1 - RADII[ring])) / 500 * half;
      var a = b._phase + angle * (Math.PI * 2 / PERIOD[ring]);
      var x = Math.cos(a) * r;
      var y = Math.sin(a) * r;
      b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%)';
    }
  }
  function orbitLoop(t) {
    orbitRaf = requestAnimationFrame(orbitLoop);
    var dt = lastT ? Math.min((t - lastT) / 1000, .05) : 0;
    lastT = t;
    var target = (hovering || pinned) ? 0 : 1;
    speed += (target - speed) * Math.min(1, dt * 3);
    angle += dt * speed;
    place();
  }
  function orbitSync() {
    cancelAnimationFrame(orbitRaf);
    orbitRaf = 0;
    lastT = 0;
    if (reduceMQ.matches || document.hidden || !orbitVisible) {
      place();
      return;
    }
    orbitRaf = requestAnimationFrame(orbitLoop);
  }
  // 点击轨道空白处取消固定
  orbitEl.addEventListener('click', function (e) {
    if (!e.target.closest('.sat')) {
      pinned = false;
    }
  });

  // 无人操作时自动巡航到下一颗卫星
  var cruise = 0;
  function startCruise() {
    clearInterval(cruise);
    if (reduceMQ.matches) {
      return;
    }
    cruise = setInterval(function () {
      if (hovering || pinned || document.hidden || !orbitVisible) {
        return;
      }
      showModule((current + 1) % MODULES.length, true);
    }, 3800);
  }

  // ---------- 模块网格与分类切换 ----------
  var tabsEl = document.getElementById('catTabs');
  var gridEl = document.getElementById('grid');
  var activeCat = -1;
  function ringIcon(i) {
    // 分类图标：同心圆中高亮第 i 条轨道
    var s = '<svg viewBox="0 0 20 20" aria-hidden="true">';
    for (var k = 0; k < 3; k++) {
      s += '<circle cx="10" cy="10" r="' + (3.5 + k * 3) + '" opacity="' + (i < 0 || k === Math.min(i, 2) ? 1 : .35) + '"/>';
    }
    var rr = i < 0 ? 3.5 : 3.5 + Math.min(i, 2) * 3;
    s += '<circle class="cur" cx="' + (10 + rr * .7071).toFixed(2) + '" cy="' + (10 - rr * .7071).toFixed(2) + '" r="1.8"/></svg>';
    return s;
  }
  function renderTabs() {
    var L = li();
    var html = '<button type="button" role="tab" class="tab" data-cat="-1" aria-selected="' + (activeCat === -1) + '">' + ringIcon(-1) + tr('all') + ' <small>' + MODULES.length + '</small></button>';
    CATS.forEach(function (c, i) {
      var n = MODULES.filter(function (m) {
        return m.cat === i;
      }).length;
      html += '<button type="button" role="tab" class="tab" data-cat="' + i + '" aria-selected="' + (activeCat === i) + '">' + ringIcon(i) + c[['zh', 'en', 'tw'][L]] + ' <small>' + n + '</small></button>';
    });
    tabsEl.innerHTML = html;
  }
  tabsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.tab');
    if (!b) {
      return;
    }
    activeCat = parseInt(b.getAttribute('data-cat'), 10);
    tabsEl.querySelectorAll('.tab').forEach(function (t) {
      t.setAttribute('aria-selected', String(t === b));
    });
    renderGrid(true);
  });
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }
  function renderGrid(animate) {
    var L = li();
    var k = 0;
    var html = '';
    MODULES.forEach(function (m) {
      var show = activeCat < 0 || m.cat === activeCat;
      var cls = 'card' + (show ? '' : ' hide') + (show && animate && !reduceMQ.matches ? ' enter' : '');
      var delay = show ? (k++ * 0.04).toFixed(2) : 0;
      var foot = '<span>' + (m.alt ? esc(tr('altLabel')) + ' ' + esc(m.alt) : 'ORBIT 0' + (m.cat + 1)) + '</span>';
      // 有默认快捷键的显示按键；默认未设快捷键但支持自定义的显示“可自定义”
      if (m.key || m.ck) {
        foot += '<kbd title="' + esc(tr('keyLabel')) + '">' + esc(m.key || tr('keyCustom')) + '</kbd>';
      }
      html += '<article class="' + cls + '" style="--c:var(--c-' + m.c + ');--d:' + delay + 's">' +
        '<div class="card-h"><span class="card-g">' + glyph(m.id) + '</span><div><span class="cat">ORBIT 0' + (m.cat + 1) + ' · ' + esc(CATS[m.cat][['zh', 'en', 'tw'][L]]) + '</span><h3>' + esc(m.t[L]) + '</h3></div></div>' +
        '<p>' + esc(m.s[L]) + '</p><ul>' + m.p[L].map(function (x) {
          return '<li>' + esc(x) + '</li>';
        }).join('') + '</ul><div class="card-f">' + foot + '</div></article>';
    });
    // “全部”视图末尾补一张控制中心卡片：侧边栏底部的全局设置页
    if (activeCat < 0) {
      var hub = HUB[L];
      html += '<article class="card hub' + (animate && !reduceMQ.matches ? ' enter' : '') + '" style="--c:var(--accent);--d:' + (k * 0.04).toFixed(2) + 's">' +
        '<div class="card-h"><span class="card-g"><svg class="g" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/></svg></span><div><span class="cat">CONTROL CENTER</span><h3>' + esc(hub.t) + '</h3></div></div>' +
        '<p>' + esc(hub.s) + '</p><ul>' + hub.p.map(function (x) {
          return '<li>' + esc(x) + '</li>';
        }).join('') + '</ul></article>';
    }
    gridEl.innerHTML = html;
  }

  // ---------- 截图切换 ----------
  var viewTabs = document.getElementById('viewTabs');
  var viewImgs = Array.prototype.slice.call(document.querySelectorAll('#win img'));
  viewTabs.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) {
      return;
    }
    var i = parseInt(b.getAttribute('data-view'), 10);
    viewTabs.querySelectorAll('button').forEach(function (t) {
      t.setAttribute('aria-selected', String(t === b));
    });
    viewImgs.forEach(function (img, k) {
      img.classList.toggle('is-on', k === i);
    });
  });

  // ---------- 版本信息：读取同目录的 releases.json ----------
  var release = null;
  function renderVersionDate() {
    if (!release) {
      return;
    }
    var d = new Date(release.pubDate);
    var txt = '';
    if (!isNaN(d)) {
      txt = ' · ' + d.toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'zh-Hant' ? 'zh-TW' : 'zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    document.querySelectorAll('.ver-date').forEach(function (el) {
      el.textContent = txt;
    });
  }
  function loadRelease() {
    if (!window.fetch) {
      return;
    }
    fetch('releases.json', { cache: 'no-cache' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (list) {
      if (!list || !list[0] || !list[0].version) {
        return;
      }
      release = list[0];
      document.querySelectorAll('.ver-num').forEach(function (el) {
        el.textContent = release.version;
      });
      document.querySelectorAll('.ver-notes').forEach(function (el) {
        el.href = 'https://github.com/wangwanjie/Orbit/releases/tag/v' + release.version;
      });
      renderVersionDate();
    }).catch(function () {});
  }

  // ---------- 滚动渐入 ----------
  function setupReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMQ.matches) {
      els.forEach(function (el) {
        el.classList.add('in');
      });
      return;
    }
    // 同一父元素下依次错开
    els.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (x) {
        return x.classList.contains('reveal');
      });
      el.style.setProperty('--d', (sibs.indexOf(el) * 0.07).toFixed(2) + 's');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  // ---------- 初始化 ----------
  buildOrbit();
  measure();
  place();
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      measure();
      place();
    }).observe(orbitEl);
  } else {
    window.addEventListener('resize', function () {
      measure();
      place();
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      orbitVisible = entries[0].isIntersecting;
      orbitSync();
    }).observe(orbitEl);
  }
  document.addEventListener('visibilitychange', function () {
    orbitSync();
    stars.sync();
  });
  function onMotionChange() {
    orbitSync();
    stars.sync();
    startCruise();
  }
  if (reduceMQ.addEventListener) {
    reduceMQ.addEventListener('change', onMotionChange);
  }

  document.getElementById('langSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) {
      applyLang(b.getAttribute('data-lang'), true);
    }
  });
  document.getElementById('themeSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) {
      applyTheme(b.getAttribute('data-theme-btn'), true);
    }
  });

  var qTheme = params.get('theme');
  var themePref = (qTheme === 'light' || qTheme === 'dark' || qTheme === 'system') ? qTheme : (load('orbit.theme') || 'system');
  if (themePref !== 'light' && themePref !== 'dark') {
    themePref = 'system';
  }
  applyTheme(themePref, false);

  var startLang = normalizeLang(params.get('lang')) || normalizeLang(load('orbit.lang')) || detectLang();
  applyLang(startLang, false);

  orbitSync();
  startCruise();
  setupReveal();
  loadRelease();
})();
