const ADHD_TASKS_DEFAULT = [
    "规律睡眠", "整理眼前的物品", "扫地", "记账", "洗衣服",
    "未久坐超过1h", "吃了至少两顿饭", "打理宠物", "打游戏", "洗碗",
    "自控少刷信息流", "运动15min", "断舍离", "只买必需品", "学习",
    "吃补剂", "晒太阳", "看电影", "阅读", "和人聊天",
    "更新社媒", "写日记", "喝水两杯以上", "洗头", "出门",
    "取快递", "拆快递", "扔垃圾", "洗澡", "刷牙", "学多邻国"
];

const IELTS_TASKS_DEFAULT = [
    "完成1篇阅读真题", "复习错题集", "背诵核心词汇100个", "听写一篇精听", "观看一节专业网课",
    "整理写作图表结构", "完成一套剑桥模拟", "跟读雅思听力原文", "复习口语P1话题", "口语P2串讲1题",
    "沉浸纯看外刊2小时", "复盘今天进度", "默写语法同义词", "和考搭子模考口语", "整理写作高级句型",
    "泛听BBC新闻", "看一集全英美剧", "阅读长难句拆分", "整理听力同音词", "复习口语素材",
    "写一篇大作文", "检查拼写错误", "整理阅读同意替换", "默写听力高频拼写", "复习阅读判断题型",
    "记录长难句语法", "积累高分词组", "模拟口语P3", "重做一套阅读真题", "分析做错的原因"
];

const LDR_TASKS_DEFAULT = [
    "分享今天的天空", "打个视频电话", "一起听同一首歌", "同步看一部电影", "给对方点杯奶茶",
    "寄一封手写作心信", "一起玩线上小游戏", "分享好吃的午餐照", "睡前语音互说晚安", "拍一张搞笑的自拍",
    "聊聊最近的压力", "规划下次相见行程", "给对方准备小惊喜", "互换今天行走步数", "共同存恋爱基金",
    "截图一条搞笑评论", "同步看同一本书", "连着麦安静地睡觉", "分享一件身边趣事", "给对方挑一件衣服",
    "互相监督今日早睡", "学一个新的单词", "发一条专属的动态", "抱怨一下今天不顺", "隔着屏幕碰杯干杯"
];

const BUILTIN_MODES = [
    { id: 'adhd', title: '💡 ADHD 生活', titleMatch: 'ADHD', tasks: ADHD_TASKS_DEFAULT, theme: 'adhd' },
    { id: 'ielts', title: '📚 雅思备考', titleMatch: '雅思', tasks: IELTS_TASKS_DEFAULT, theme: 'ielts' },
    { id: 'ldr', title: '💕 异地恋', titleMatch: '异地恋', tasks: LDR_TASKS_DEFAULT, theme: 'adhd' }
];

const CURRENT_VERSION = 'v1.5';
if (localStorage.getItem('adhd_bingo_version') !== CURRENT_VERSION) {
    localStorage.removeItem('adhd_bingo_pool');
    localStorage.setItem('adhd_bingo_title', 'ADHD Bingo');
    
    const todayStr = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    localStorage.removeItem(`adhd_bingo_${todayStr}`);
    
    localStorage.setItem('adhd_bingo_version', CURRENT_VERSION);
}

let userModes = JSON.parse(localStorage.getItem('adhd_bingo_user_modes')) || [];

function saveCurrentStateAsUserMode() {
    const isBuiltIn = BUILTIN_MODES.some(m => appTitle.includes(m.titleMatch));
    if (isBuiltIn) return; // 拦截污染系统模板体系
    
    let existingNode = userModes.find(m => m.title === appTitle);
    if (existingNode) {
        existingNode.tasks = [...customPool];
    } else {
        userModes.push({
            id: 'custom_' + Date.now(),
            title: appTitle,
            tasks: [...customPool],
            theme: document.body.getAttribute('data-mode') || 'adhd'
        });
    }
    localStorage.setItem('adhd_bingo_user_modes', JSON.stringify(userModes));
    renderModeDropdown();
}

function deleteUserMode(id) {
    userModes = userModes.filter(m => m.id !== id);
    localStorage.setItem('adhd_bingo_user_modes', JSON.stringify(userModes));
    renderModeDropdown();
}

function renderModeDropdown() {
    const menu = document.getElementById('custom-mode-menu');
    if (!menu) return;
    menu.innerHTML = '';
    
    BUILTIN_MODES.forEach(mode => {
        const item = document.createElement('div');
        item.className = 'dropdown-item mode-opt';
        item.textContent = mode.title;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            switchMode(mode);
        });
        menu.appendChild(item);
    });
    
    if (userModes.length > 0) {
        const divider = document.createElement('div');
        divider.style = 'border-top: 1px solid var(--ring-bg); margin: 4px 0;';
        menu.appendChild(divider);
        
        userModes.forEach(mode => {
            const item = document.createElement('div');
            item.className = 'dropdown-item mode-opt custom-mode-item';
            
            const textSpan = document.createElement('span');
            textSpan.textContent = `✨ ${mode.title}`;
            textSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                switchMode({ ...mode, isCustom: true });
            });
            
            const delBtn = document.createElement('span');
            delBtn.className = 'mode-del-btn';
            delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
            delBtn.title = '删除此模板';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteUserMode(mode.id);
            });    
            item.appendChild(textSpan);
            item.appendChild(delBtn);
            menu.appendChild(item);
        });
    }
}

function switchMode(mode) {
    customPool = [...mode.tasks];
    if (mode.isCustom) {
        appTitle = mode.title;
    } else {
        if (mode.id === 'adhd') appTitle = 'ADHD Bingo';
        if (mode.id === 'ielts') appTitle = '雅思备考 Bingo';
        if (mode.id === 'ldr') appTitle = '异地恋 Bingo';
    }
    
    document.body.setAttribute('data-mode', mode.theme || 'adhd');
    if (mainTitle) mainTitle.textContent = appTitle;
    localStorage.setItem('adhd_bingo_title', appTitle);
    
    savePool();
    renderPoolList();
    generateRandomBoard();
    
    const m = document.getElementById('custom-mode-menu');
    if(m) m.classList.remove('active');
}

const MOTIVATIONAL_MESSAGES = {
    start: ["新的一天，全情投入", "万事开头难，迈出第一步", "点下第一个格子，开启进展", "静下心来，准备今天的连线"],
    low: ["好的开始！保持住节奏", "一点一滴向目标稳步靠近", "渐入佳境，别忘了深呼吸", "干得漂亮，继续探索！"],
    mid: ["状态火热，向连线进发", "完成度过半，请稳扎稳打", "节奏满分，一切如此顺利", "别停歇，连线就在不远方"],
    high: ["就差一点点了，全力冲刺！", "胜利的曙光就在前方 💫", "距离 Bingo 仅一步之遥！", "临门一脚，绝不轻言放弃"],
    bingo: ["太棒了！达成核心连线！", "BINGO！你做到了！🎉", "难以置信的完美节奏！", "享受这该死的成就感！💯"]
};

function getRandomQuote(category) {
    const quotes = MOTIVATIONAL_MESSAGES[category];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

let customPool = JSON.parse(localStorage.getItem('adhd_bingo_pool')) || [...ADHD_TASKS_DEFAULT];
let currentTasks = [];
let completedState = [];
let isBingoAchieved = false;

// Theme, Style and Size States
let currentTheme = localStorage.getItem('adhd_bingo_theme') || 'light';
let currentStyle = localStorage.getItem('adhd_bingo_style') || 'minimal';
let appTitle = localStorage.getItem('adhd_bingo_title') || 'ADHD Bingo';
let globalGridSize = parseInt(localStorage.getItem('adhd_bingo_size')) || 5;

let currentGridSize = globalGridSize;
let currentTotalCells = currentGridSize * currentGridSize;

// DOM 元素
const mainTitle = document.getElementById('main-title');
const btnAiGen = document.getElementById('btn-ai-gen');

const gridElement = document.getElementById('bingo-grid');
const progressCircle = document.getElementById('progress-circle');
const progressText = document.getElementById('progress-text');
const linesCountEl = document.getElementById('lines-count');
const progressSubtitle = document.getElementById('progress-subtitle');
const datePicker = document.getElementById('date-picker');
const dateDisplay = document.getElementById('date-display');
const btnRandom = document.getElementById('btn-random');
const btnReset = document.getElementById('btn-reset');

// Modal Elements
const btnPool = document.getElementById('btn-pool');
const poolModal = document.getElementById('pool-modal');
const closeModalBtn = document.getElementById('close-modal');
const poolCount = document.getElementById('pool-count');
const poolWarning = document.getElementById('pool-warning');
const taskChipsContainer = document.getElementById('task-chips-container');
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');

// Theme toggles
const btnThemeToggle = document.getElementById('btn-theme-toggle');
const btnStyleToggle = document.getElementById('btn-style-toggle');
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');

// Size toggle
const btnSizeToggle = document.getElementById('btn-size-toggle');
const sizeIconText = document.getElementById('size-icon-text');

const circumference = 2 * Math.PI * 36;
let currentDate = getTodayString();

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-style', currentStyle);
    
    if (iconMoon && iconSun) {
        if (currentTheme === 'dark') {
            iconMoon.style.display = 'none';
            iconSun.style.display = 'block';
        } else {
            iconMoon.style.display = 'block';
            iconSun.style.display = 'none';
        }
    }
}

applyTheme();

function getTodayString() {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d - tzOffset).toISOString().split('T')[0];
}

function formatBeautifulDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(5, 7);
    const day = dateStr.substring(8, 10);
    const daysArr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const weekDay = daysArr[d.getDay()];
    return `${year} · ${month}/${day} · ${weekDay}`;
}

function init() {
    if (mainTitle) mainTitle.textContent = appTitle;

    if (progressCircle) {
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
    }
    
    // Theme sync
    if (appTitle.includes('雅思') || appTitle.includes('IELTS')) {
        document.body.setAttribute('data-mode', 'ielts');
    } else {
        document.body.setAttribute('data-mode', 'adhd');
    }

    // 初始化时直接将当天日期刷入 UI，修复首屏始终停留在静态 HTML 原配 03/07 的视觉 Bug
    if (dateDisplay) {
        dateDisplay.textContent = formatBeautifulDate(currentDate);
    }
    
    // 原生日历唤醒保障
    const datePicker = document.getElementById('date-picker');
    const dateContainer = document.querySelector('.date-container');
    if (datePicker) {
        datePicker.value = currentDate;
        datePicker.addEventListener('change', (e) => {
            currentDate = e.target.value;
            if (dateDisplay) dateDisplay.textContent = formatBeautifulDate(currentDate);
            loadDataForDate(currentDate);
        });

        // 强力接管容器点击直接呼出系统底层选择器
        if (dateContainer) {
            dateContainer.addEventListener('click', (e) => {
                if (e.target !== datePicker) {
                    try {
                        datePicker.showPicker();
                    } catch(err) {
                        // 兼容非常老的浏览器内核
                    }
                }
            });
        }
    }
    
    renderModeDropdown();
    bindEvents();
    loadDataForDate(currentDate);
}

function applyGridSize(size) {
    currentGridSize = size;
    currentTotalCells = size * size;
    document.documentElement.style.setProperty('--grid-size', size);
    if (sizeIconText) {
        sizeIconText.textContent = globalGridSize + 'x' + globalGridSize;
    }
}

function loadDataForDate(dateStr) {
    const savedData = localStorage.getItem(`adhd_bingo_${dateStr}`);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            completedState = data.completedState;
            currentTasks = data.tasks;
            
            // 恢复该日期当天的专属标题和主题模式
            const displayTitle = data.title || localStorage.getItem('adhd_bingo_title') || 'ADHD Bingo';
            if (mainTitle) mainTitle.textContent = displayTitle;
            
            if (data.mode) {
                document.body.setAttribute('data-mode', data.mode);
            } else {
                if (displayTitle.includes('雅思') || displayTitle.includes('IELTS')) {
                    document.body.setAttribute('data-mode', 'ielts');
                } else {
                    document.body.setAttribute('data-mode', 'adhd');
                }
            }
            
            // 兼容以前的长度判定
            if (!completedState || completedState.length === 0) throw new Error("No state");
            
            const boardSize = Math.sqrt(completedState.length);
            applyGridSize(boardSize);
            
            isBingoAchieved = false; 
            renderGrid();
            checkStatus(false, true); 
        } catch (e) {
            applyGridSize(globalGridSize);
            generateRandomBoard();
        }
    } else {
        // 如果是一个全新没有生成过记录的日期，恢复全局最新设定
        const globalTitle = localStorage.getItem('adhd_bingo_title') || 'ADHD Bingo';
        if (mainTitle) mainTitle.textContent = globalTitle;
        if (globalTitle.includes('雅思') || globalTitle.includes('IELTS')) {
            document.body.setAttribute('data-mode', 'ielts');
        } else {
            document.body.setAttribute('data-mode', 'adhd');
        }
        
        applyGridSize(globalGridSize);
        generateRandomBoard();
    }
}

function saveDataForDate(dateStr) {
    const currentDisplayTitle = mainTitle ? mainTitle.textContent.trim() : (localStorage.getItem('adhd_bingo_title') || 'ADHD Bingo');
    const currentMode = document.body.getAttribute('data-mode') || 'adhd';
    const data = { 
        tasks: currentTasks, 
        completedState: completedState,
        title: currentDisplayTitle,
        mode: currentMode
    };
    localStorage.setItem(`adhd_bingo_${dateStr}`, JSON.stringify(data));
}

function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function generateRandomBoard() {
    applyGridSize(globalGridSize);
    
    let poolToUse = [...customPool];
    while(poolToUse.length < currentTotalCells) { 
        poolToUse.push("缺省任务"); 
    }

    const shuffled = shuffleArray(poolToUse);
    currentTasks = shuffled.slice(0, currentTotalCells);
    completedState = new Array(currentTotalCells).fill(false);
    isBingoAchieved = false;
    
    renderGrid();
    checkStatus(true, true);
    saveDataForDate(currentDate);
}

function renderGrid() {
    if (!gridElement) return;
    gridElement.innerHTML = '';
    currentTasks.forEach((task, index) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        if (completedState[index]) { cell.classList.add('completed'); }
        cell.textContent = task;
        cell.addEventListener('click', () => handleCellClick(index, cell));
        gridElement.appendChild(cell);
    });
}

function handleCellClick(index, cellElement) {
    completedState[index] = !completedState[index];
    if (completedState[index]) {
        cellElement.classList.add('completed');
    } else {
        cellElement.classList.remove('completed');
    }
    checkStatus(true, false);
    saveDataForDate(currentDate);
}

function checkStatus(allowConfetti = true, forceRefreshText = false) {
    let lines = calculateLines();
    if (linesCountEl) linesCountEl.textContent = lines;

    if (lines > 0) {
        if (!isBingoAchieved) {
            if (allowConfetti) triggerConfetti();
            isBingoAchieved = true;
        }
        updateProgressBar(100);
        if (progressText) progressText.textContent = '100%';
        if (progressSubtitle) {
            if (allowConfetti || forceRefreshText) {
                progressSubtitle.textContent = getRandomQuote('bingo');
            }
            progressSubtitle.style.color = currentStyle === 'dopamine' ? '#7A9D8C' : '#10B981'; 
        }
    } else {
        isBingoAchieved = false;
        let percentage = calculateMaxLineProgress();
        updateProgressBar(percentage);
        if (progressText) progressText.textContent = `${percentage}%`;
        if (progressSubtitle) {
            if (allowConfetti || forceRefreshText) {
                let cat = percentage === 0 ? 'start' : (percentage < 40 ? 'low' : (percentage < 70 ? 'mid' : 'high'));
                progressSubtitle.textContent = getRandomQuote(cat);
            }
            progressSubtitle.style.color = 'var(--text-secondary)';
        }
    }
}

function calculateMaxLineProgress() {
    let maxInLine = 0;
    
    for (let row = 0; row < currentGridSize; row++) {
        let count = 0;
        for (let col = 0; col < currentGridSize; col++) {
            if (completedState[row * currentGridSize + col]) count++;
        }
        if (count > maxInLine) maxInLine = count;
    }
    
    for (let col = 0; col < currentGridSize; col++) {
        let count = 0;
        for (let row = 0; row < currentGridSize; row++) {
            if (completedState[row * currentGridSize + col]) count++;
        }
        if (count > maxInLine) maxInLine = count;
    }
    
    let mainDiagCount = 0;
    for (let i = 0; i < currentGridSize; i++) {
        if (completedState[i * currentGridSize + i]) mainDiagCount++;
    }
    if (mainDiagCount > maxInLine) maxInLine = mainDiagCount;
    
    let antiDiagCount = 0;
    for (let i = 0; i < currentGridSize; i++) {
        if (completedState[i * currentGridSize + (currentGridSize - 1 - i)]) antiDiagCount++;
    }
    if (antiDiagCount > maxInLine) maxInLine = antiDiagCount;
    
    return Math.floor((maxInLine / currentGridSize) * 100);
}

function calculateLines() {
    let linesCounter = 0;
    for (let row = 0; row < currentGridSize; row++) {
        let isLine = true;
        for (let col = 0; col < currentGridSize; col++) {
            if (!completedState[row * currentGridSize + col]) { isLine = false; break; }
        }
        if (isLine) linesCounter++;
    }
    for (let col = 0; col < currentGridSize; col++) {
        let isLine = true;
        for (let row = 0; row < currentGridSize; row++) {
            if (!completedState[row * currentGridSize + col]) { isLine = false; break; }
        }
        if (isLine) linesCounter++;
    }
    let isMain = true;
    for (let i = 0; i < currentGridSize; i++) {
        if (!completedState[i * currentGridSize + i]) { isMain = false; break; }
    }
    if (isMain) linesCounter++;
    
    let isAnti = true;
    for (let i = 0; i < currentGridSize; i++) {
        if (!completedState[i * currentGridSize + (currentGridSize - 1 - i)]) { isAnti = false; break; }
    }
    if (isAnti) linesCounter++;
    
    return linesCounter;
}

function updateProgressBar(percentage) {
    if (!progressCircle) return;
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function triggerConfetti() {
    if (typeof confetti === 'undefined') return;
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = currentStyle === 'dopamine' ? ['#B87D7D', '#B89372', '#AF9D6B', '#7A9D8C', '#738CA6', '#807D9E', '#9E7D96'] : undefined;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999, colors: colors };
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) { return clearInterval(interval); }
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

// ============== 手动与系统设定 ==============

function bindEvents() {
    if (btnRandom) btnRandom.addEventListener('click', () => { setTimeout(() => { generateRandomBoard(); }, 100); });
    if (btnReset) btnReset.addEventListener('click', () => {
        completedState.fill(false);
        isBingoAchieved = false;
        const cells = document.querySelectorAll('.bingo-cell');
        cells.forEach(cell => { cell.classList.remove('completed'); });
        checkStatus(true);
        saveDataForDate(currentDate);
    });

    if (btnPool) btnPool.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (addTaskBtn) addTaskBtn.addEventListener('click', handleAddTask);
    if (newTaskInput) newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAddTask(); });
    
    if (btnThemeToggle) btnThemeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('adhd_bingo_theme', currentTheme);
        applyTheme();
    });

    if (btnStyleToggle) btnStyleToggle.addEventListener('click', () => {
        currentStyle = currentStyle === 'minimal' ? 'dopamine' : 'minimal';
        localStorage.setItem('adhd_bingo_style', currentStyle);
        applyTheme();
        checkStatus(false, true); 
    });

    if (btnSizeToggle) btnSizeToggle.addEventListener('click', () => {
        if (globalGridSize === 5) {
            globalGridSize = 3;
        } else if (globalGridSize === 3) {
            globalGridSize = 4;
        } else {
            globalGridSize = 5;
        }
        localStorage.setItem('adhd_bingo_size', globalGridSize);
        generateRandomBoard();
    });

    const modeTrigger = document.getElementById('custom-mode-trigger');
    const modeMenu = document.getElementById('custom-mode-menu');
    if (modeTrigger && modeMenu) {
        modeTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            modeMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            if (modeMenu.classList.contains('active')) modeMenu.classList.remove('active');
        });
    }

    // 标题编辑事件
    if (mainTitle) {
        mainTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                mainTitle.blur();
            }
        });

        mainTitle.addEventListener('blur', () => {
            appTitle = mainTitle.textContent.trim() || '自定义Bingo';
            mainTitle.textContent = appTitle;
            localStorage.setItem('adhd_bingo_title', appTitle);
            
            if (appTitle.includes('雅思') || appTitle.includes('IELTS')) {
                document.body.setAttribute('data-mode', 'ielts');
            } else {
                document.body.setAttribute('data-mode', 'adhd');
            }
            // 保存给当前日期的记录，确保一致性
            saveDataForDate(currentDate);
            saveCurrentStateAsUserMode();
        });
    }

    // AI 生成事件
    if (btnAiGen) {
        btnAiGen.addEventListener('click', async () => {
            if (btnAiGen.classList.contains('loading')) return;
            const currentTitle = mainTitle ? mainTitle.textContent.trim() : '';
            
            btnAiGen.classList.add('loading');
            const originalHTML = btnAiGen.innerHTML;
            btnAiGen.innerHTML = '✨ 思考中...';
            
            try {
                let generatedTasks = null;
                try {
                    generatedTasks = await callTrueAI(currentTitle);
                } catch(e) {
                    // API 阻断或报错时彻底静默屏蔽警告，让用户实现无感降级到默认生成的平滑体验
                    console.warn("AI请求阻断，平滑回滚至本地引擎: ", e.message);
                }
                
                if (!generatedTasks || generatedTasks.length < 9) {
                    generatedTasks = await mockAIGenerator(currentTitle);
                }
                
                if (generatedTasks && generatedTasks.length >= 9) { 
                    customPool = generatedTasks;
                    savePool();
                    renderPoolList();
                    generateRandomBoard();
                    saveCurrentStateAsUserMode();
                    btnAiGen.innerHTML = '✅ 生成完毕';
                }
            } catch (e) {
                btnAiGen.innerHTML = '❌ 生成失败';
                console.error(e);
            }
            
            setTimeout(() => {
                btnAiGen.classList.remove('loading');
                btnAiGen.innerHTML = originalHTML;
            }, 2000);
        });
    }
}

async function mockAIGenerator(topic) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let tasks = [];
            if (/ADHD|日常|生活/.test(topic.toUpperCase())) {
                tasks = [...ADHD_TASKS_DEFAULT];
            } else if (/考研|学习|考试|复习|托福|雅思/.test(topic)) {
                tasks = [
                    "完成1篇阅读真题", "复习错题集", "背诵核心词汇100个", "听写一篇听力", "观看一节专业课视频",
                    "整理一章结构笔记", "完成一套模拟卷", "早起背书30分钟", "按时吃健康早餐", "冥想放松5分钟",
                    "断网沉浸学习2小时", "复盘今天的学习进度", "默写重点公式/句型", "和考搭子交流", "去图书馆学习",
                    "做减法不买非必需品", "保证7小时规律睡眠", "运动出汗15分钟", "远离短视频信息流", "多喝温水",
                    "给自己一个大大的鼓励", "完成大作文构思", "口语练习10分钟", "洗个热水澡助眠", "保持桌面极致整洁"
                ];
            } else if (/健身|减肥|运动|减脂/.test(topic)) {
                tasks = [
                    "热身拉伸5分钟", "有氧运动30分钟", "力量训练一组", "喝够2升温水", "吃一份高蛋白轻食",
                    "全天零糖无饮料", "多吃一份绿叶蔬菜", "运动后放松拉伸", "严格记录今日饮食", "早睡不熬夜",
                    "今天走满一万步", "完美做20个深蹲", "练一组核心卷腹", "早晨空腹称体重", "对镜子夸赞自己",
                    "拒绝一切高热宵夜", "爬楼梯代替坐电梯", "饭后靠墙站立20分钟", "闭眼冥想减压", "准备明天的健康餐",
                    "洗个舒服的澡", "睡前泡脚排毛汗", "尝试一次空腹有氧", "听一首动燃的歌", "看一篇健身科普干货"
                ];
            } else if (/工作|上班|搞钱|打工人/.test(topic)) {
                 tasks = [
                    "早起吃顿丰盛早餐", "列出今日3条核心TODO", "清理工作台表面", "专注深度工作1小时", "准时完成一项交付",
                    "带薪离开工位散步5分钟", "拒绝无效精神内耗", "和同事友善沟通", "到点立马准时下班", "回家路上听商业播客",
                    "下班坚决不回复工作群", "花3分钟总结今天成果", "睡前放下手机看纸质书", "吨吨喝满8杯水", "注意坐姿挺直不驼背",
                    "向上主动汇报一次进度", "断舍离整理电脑文件", "趴着午休20分钟", "闭目养神5分钟", "吃水果补充维C",
                    "给自己买杯少糖咖啡", "给家里打个电话闲聊", "用手做一套拉伸肩颈", "认真做眼保健操", "记一笔今天的开销"
                 ];
            } else if (/家务|整理|大扫除/.test(topic)) {
                tasks = [
                    "扔掉肉眼可见的垃圾", "把桌面清空", "叠好乱放的衣物", "扫地机/吸尘器扫全屋", "拖一次地",
                    "清洗积攒的碗筷", "擦拭厨房台面", "清理冰箱过期食物", "清洗床单被套", "擦干净镜子和水槽",
                    "给植物浇水", "整理衣柜断舍离1件", "洗个舒服的澡", "点上喜欢的香薰", "开窗通风15分钟",
                    "玄关鞋子摆放整齐", "出门顺手倒垃圾", "洗手间补充卷纸/洗手液", "整理各种充电线", "洗一次沙发套",
                    "整理书架上的书", "擦拭电脑和键盘", "换一个新的垃圾袋", "把洗好的衣服挂起来", "给自己倒杯水休息"
                ];
            } else if (/恋爱|异地恋|情侣|宝宝|感情/.test(topic)) {
                tasks = [
                    "分享今天的天空", "打个视频电话", "一起听同一首歌", "同步看一部电影", "给对方点杯奶茶",
                    "寄一封手写真心信", "一起玩线上小游戏", "分享好吃的午餐照片", "睡前语音互说晚安", "拍一张搞笑的自拍",
                    "聊聊最近的压力", "规划下次相见的行程", "给对方准备个小惊喜", "互换今天行走的步数", "共同存一笔恋爱基金",
                    "截图一条搞笑的评论", "同步看同一本书", "连着麦安静地睡觉", "分享一件身边的趣事", "给对方挑一件衣服",
                    "互相监督今日早睡", "一起学一个新的单词", "发一条专属的动态", "抱怨一下今天的不顺", "隔着屏幕碰杯干杯"
                ];
            } else {
                let verbs = ["享受", "完成", "挑战", "记录", "整理", "打卡", "探索", "专注", "开启", "坚持", "推进", "搞定", "精进", "发力", "行动"];
                for (let i = 1; i <= 25; i++) {
                    const verb = verbs[Math.floor(Math.random() * verbs.length)];
                    tasks.push(`${verb}「${topic}」的第 ${i} 步`);
                }
            }
            resolve(tasks);
        }, 1500);
    });
}

function openModal() {
    if (poolModal) poolModal.classList.add('active');
    renderPoolList();
}

function closeModal() {
    if (poolModal) poolModal.classList.remove('active');
}

function renderPoolList() {
    if (!taskChipsContainer) return;
    taskChipsContainer.innerHTML = '';
    if (poolCount) poolCount.textContent = customPool.length;
    if (poolWarning) poolWarning.style.display = customPool.length < currentTotalCells ? 'block' : 'none';

    customPool.forEach((task, index) => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `<span>${task}</span> <span class="chip-delete" onclick="deleteTask(${index})">&times;</span>`;
        taskChipsContainer.appendChild(chip);
    });
}

window.deleteTask = function(index) {
    customPool.splice(index, 1);
    savePool();
    renderPoolList();
}

function handleAddTask() {
    if (!newTaskInput) return;
    const task = newTaskInput.value.trim();
    if (task && !customPool.includes(task)) {
        customPool.push(task);
        savePool();
        renderPoolList();
        newTaskInput.value = '';
    }
}

function savePool() {
    localStorage.setItem('adhd_bingo_pool', JSON.stringify(customPool));
}

async function callTrueAI(topic) {
    // 启用专业的 serverless 云端中转架构请求模型
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic: topic })
    });
    
    if (!response.ok) {
        throw new Error(`云端中转服务器拦截或断网：错误码 ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    let jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) {
         let parsed = JSON.parse(jsonMatch[0]);
         if(Array.isArray(parsed) && parsed.length >= 9) return parsed;
    }
    let directParse = JSON.parse(content);
    if(Array.isArray(directParse) && directParse.length >= 9) return directParse;
    
    throw new Error('大模型未能按照严格格式返回');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
