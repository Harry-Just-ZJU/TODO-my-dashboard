// ==========================================
// --- 1. 字典与初始化 ---
// ==========================================
const i18n = {
    zh: {
        dailyTitle: "📅 每日任务池", projectTitle: "🚀 长期计划", timelineTitle: "⏱️ 今日时间轴",
        dailyPlaceholder: "输入待办任务...", projectPlaceholder: "输入长期目标...",
        addBtn: "添加", buildBtn: "建立", scoreText: "✨ 积分: ", langBtn: "EN",
        deleteBtn: "删除", completed: "🎉 已完成", advance: "+1% 推进", dragHint: "💡 提示：按住任务可以拖拽到右侧时间轴",
        removeBtn: "移除",
        days: { Monday: "星期一", Tuesday: "星期二", Wednesday: "星期三", Thursday: "星期四", Friday: "星期五", Saturday: "星期六", Sunday: "星期日" }
    },
    en: {
        dailyTitle: "📅 Task Pool", projectTitle: "🚀 Long-term Plans", timelineTitle: "⏱️ Timeline",
        dailyPlaceholder: "Enter task...", projectPlaceholder: "Enter goal...",
        addBtn: "Add", buildBtn: "Create", scoreText: "✨ Score: ", langBtn: "中文",
        deleteBtn: "Del", completed: "🎉 Done", advance: "+1% Push", dragHint: "💡 Hint: Drag tasks to the right timeline",
        removeBtn: "Remove",
        days: { Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday", Sunday: "Sunday" }
    }
};

let currentLang = localStorage.getItem('myAppLang') || 'zh';
// 更换数据库名称，强制读取新的时间轴数据结构
// let db = JSON.parse(localStorage.getItem('myDashboardDB_v3'));
// 如果你经常要改 schedule.js 并希望看到变化，可以修改 script.js 里的存储名字。
let db = JSON.parse(localStorage.getItem('myDashboardDB_v4'));
if (!db) db = initialData; 
const rewards = initialData.rewards;

let currentDay = document.getElementById('daySelector').value;
const dailyList = document.getElementById('dailyList');
const projectList = document.getElementById('projectList');
const timelineContainer = document.getElementById('timelineContainer');
const scoreDisplay = document.getElementById('scoreDisplay');

// 拖拽全局状态
let draggedTaskIndex = null;

function saveDB() { localStorage.setItem('myDashboardDB_v3', JSON.stringify(db)); updateScoreUI(); }
function updateScoreUI() { scoreDisplay.textContent = db.score; renderStore(); }

// ==========================================
// --- 2. 语言切换 ---
// ==========================================
function toggleLanguage() { currentLang = currentLang === 'zh' ? 'en' : 'zh'; localStorage.setItem('myAppLang', currentLang); applyLanguage(); }
function applyLanguage() {
    const t = i18n[currentLang];
    document.getElementById('textDailyTitle').textContent = t.dailyTitle;
    document.getElementById('textProjectTitle').textContent = t.projectTitle;
    document.getElementById('textTimelineTitle').textContent = `${t.timelineTitle} (08:00 - 23:00)`;
    document.getElementById('dailyInput').placeholder = t.dailyPlaceholder;
    document.getElementById('projectInput').placeholder = t.projectPlaceholder;
    document.getElementById('btnAddDaily').textContent = t.addBtn;
    document.getElementById('btnBuildProj').textContent = t.buildBtn;
    document.getElementById('textScore').textContent = t.scoreText;
    document.getElementById('langBtnText').textContent = t.langBtn;
    document.getElementById('textDragHint').textContent = t.dragHint;

    const daysArr = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    daysArr.forEach(day => document.getElementById(`opt${day.substring(0,3)}`).textContent = t.days[day]);
    renderAll();
}

// ==========================================
// --- 3. 拖拽引擎与时间轴渲染 ---
// ==========================================
// 生成 08:00 到 23:00 的网格
function renderTimeline() {
    timelineContainer.innerHTML = '';
    const dayData = db.schedule[currentDay] || { classes: [], tasks: [] };
    const t = i18n[currentLang];

    // 1. 生成基础的空时间网格插槽
    for (let i = 8; i <= 23; i++) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        
        // 左侧时间标签
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = `${i.toString().padStart(2, '0')}:00`;
        
        // 右侧放置区
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        // 绑定拖拽事件
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); };
        dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
        dropZone.ondrop = (e) => handleDrop(e, i); // i 是放下的目标小时
        
        slot.appendChild(label);
        slot.appendChild(dropZone);
        timelineContainer.appendChild(slot);
    }

    // 2. 渲染固定课程 (绝对定位浮在网格上)
    dayData.classes.forEach(cls => {
        const topPos = (cls.startHour - 8) * 60; 
        const height = (cls.endHour - cls.startHour) * 60;
        
        const block = document.createElement('div');
        block.className = 'timeline-block';
        block.style.top = `${topPos+2}px`;
        block.style.height = `${height-4}px`;
        block.style.backgroundColor = cls.color || 'rgba(52, 152, 219, 0.8)';
        
        block.innerHTML = `
            <div class="block-title">${cls.text}</div>
            <div class="block-time">${cls.startHour}:00 - ${cls.endHour}:00</div>
        `;
        // 追加到相对定位的容器里
        timelineContainer.appendChild(block);
    });

    // 3. 渲染已经被拖进时间轴的灵活任务
    dayData.tasks.forEach((task, index) => {
        if (task.scheduledHour !== null && task.scheduledHour >= 8 && task.scheduledHour <= 23) {
            const topPos = (task.scheduledHour - 8) * 60;
            const block = document.createElement('div');
            block.className = `timeline-block ${task.completed ? 'completed' : ''}`;
            block.style.top = `${topPos + 2}px`; // 稍微偏移避开边框
            block.style.height = `56px`; // 默认占一个小时
            block.style.backgroundColor = task.completed ? 'rgba(149, 165, 166, 0.8)' : 'rgba(46, 204, 113, 0.8)'; // 绿色代表任务
            block.style.cursor = 'pointer';
            block.onclick = () => toggleTask(index); // 在时间轴里点击也能打勾完成
            
            block.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <div class="block-title" style="${task.completed ? 'text-decoration:line-through' : ''}">🎯 ${task.text}</div>
                    <button class="btn-delete" style="padding:2px 6px; font-size:10px; background:transparent; border:1px solid white;" onclick="unscheduleTask(event, ${index})">${t.removeBtn}</button>
                </div>
            `;
            timelineContainer.appendChild(block);
        }
    });
}

// 开始拖拽
function handleDragStart(e, index) {
    draggedTaskIndex = index;
    e.dataTransfer.effectAllowed = 'move';
}

// 放下任务到指定小时
function handleDrop(e, hour) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    if (draggedTaskIndex !== null) {
        db.schedule[currentDay].tasks[draggedTaskIndex].scheduledHour = hour;
        draggedTaskIndex = null;
        saveDB();
        renderAll();
    }
}

// 从时间轴移除，退回左侧任务池
function unscheduleTask(e, index) {
    e.stopPropagation(); // 阻止触发打勾
    db.schedule[currentDay].tasks[index].scheduledHour = null;
    saveDB();
    renderAll();
}

// ==========================================
// --- 4. 任务与项目渲染 ---
// ==========================================
function changeDay() { currentDay = document.getElementById('daySelector').value; renderAll(); }

function renderTasks() {
    dailyList.innerHTML = ''; 
    const t = i18n[currentLang];
    const dayData = db.schedule[currentDay] || { classes: [], tasks: [] };

    dayData.tasks.forEach((task, index) => {
        // 只有没被排进时间轴的任务，才会显示在左侧列表里！
        if (task.scheduledHour === null) {
            const li = document.createElement('li'); 
            li.className = `daily-item ${task.completed ? 'completed' : ''}`;
            li.draggable = true; // 开启拖拽
            li.ondragstart = (e) => handleDragStart(e, index);
            
            li.innerHTML = `
                <div class="task-content" onclick="toggleTask(${index})">
                    <div class="task-text">${task.text}</div>
                </div>
                <button class="btn-delete" onclick="deleteTask(${index})">${t.deleteBtn}</button>
            `;
            dailyList.appendChild(li);
        }
    });
}
function renderProjects() {
    projectList.innerHTML = ''; 
    const t = i18n[currentLang];
    
    // 排序逻辑保持不变
    db.projects.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
    });

    db.projects.forEach((proj, index) => {
        const li = document.createElement('li'); 
        li.className = 'project-item';
        const isDone = proj.progress === 100;
        const ddlHtml = proj.deadline ? `<span class="ddl-badge">📅 ${proj.deadline}</span>` : '<span></span>';
        
        li.innerHTML = `
            <div class="project-header">
                <div class="project-title-group">
                    <span class="project-title">${proj.title}</span>
                    ${ddlHtml}
                </div>
                <button class="btn-delete-icon" onclick="deleteProject(${index})">🗑️</button>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${proj.progress}%; background-color: ${isDone ? '#fbc2eb' : '#a18cd1'}"></div>
            </div>
            <div class="project-controls">
                <div style="display:flex; gap:10px; align-items:center;">
                    <span class="progress-num">${proj.progress}%</span>
                    <button class="btn-decompose" onclick="decomposeToDaily('${proj.title}')" title="拆解到今日任务">➕今日</button>
                </div>
                <button class="btn-push" ${isDone ? 'disabled' : ''} onclick="addProgress(${index})">
                    ${isDone ? t.completed : t.advance}
                </button>
            </div>
        `;
        projectList.appendChild(li);
    });
}

// 新增函数：将长期目标转化为每日任务
function decomposeToDaily(title) {
    // 根据当前语言决定前缀
    const prefix = currentLang === 'zh' ? '[推进] ' : '[Push] ';
    const taskText = `${prefix}${title}`;
    
    if(!db.schedule[currentDay]) db.schedule[currentDay] = {classes:[], tasks:[]};
    
    db.schedule[currentDay].tasks.push({ 
        text: taskText, 
        priority: "med", 
        difficulty: "normal", 
        completed: false, 
        scheduledHour: null 
    });
    
    saveDB(); 
    renderAll(); // 这里会触发 renderDailyTasks，确保新任务被加上语言对应的标签
}


// 增删改逻辑
function addDailyTask() {
    const txt = document.getElementById('dailyInput').value.trim();
    if (!txt) return;
    if(!db.schedule[currentDay]) db.schedule[currentDay] = {classes:[], tasks:[]};
    db.schedule[currentDay].tasks.push({ text: txt, priority: "med", difficulty: "normal", completed: false, scheduledHour: null });
    saveDB(); renderAll(); document.getElementById('dailyInput').value = '';
}
function toggleTask(index) {
    const task = db.schedule[currentDay].tasks[index];
    if (!task.completed) { db.score += 10; triggerScoreBump(); } else { db.score -= 10; }
    task.completed = !task.completed; saveDB(); renderAll();
}
function deleteTask(index) { db.schedule[currentDay].tasks.splice(index, 1); saveDB(); renderAll(); }

function addProject() {
    const txt = document.getElementById('projectInput').value.trim();
    const ddl = document.getElementById('projectDdl').value;
    if (!txt) return;
    db.projects.push({ title: txt, progress: 0, deadline: ddl }); saveDB(); renderAll(); 
    document.getElementById('projectInput').value = ''; document.getElementById('projectDdl').value = '';
}
function addProgress(index) { if (db.projects[index].progress < 100) { db.projects[index].progress += 1; db.score += 2; triggerScoreBump(); saveDB(); renderAll(); } }
function deleteProject(index) { db.projects.splice(index, 1); saveDB(); renderAll(); }

// ==========================================
// --- 5. 聚合渲染与商城特效 ---
// ==========================================
function renderAll() { renderTasks(); renderProjects(); renderTimeline(); }

function toggleStore() { document.getElementById('storeModal').classList.toggle('hidden'); }
function renderStore() {
    const storeList = document.getElementById('storeList');
    storeList.innerHTML = '';
    const t = i18n[currentLang];

    rewards.forEach((item, index) => {
        const canAfford = db.score >= item.cost;
        // 确保语言切换时名称正确
        const itemName = currentLang === 'zh' ? item.name_zh : item.name_en;
        
        const div = document.createElement('div');
        div.className = 'store-item';
        div.innerHTML = `
            <div class="item-info">
                <span style="font-size: 30px;">${item.icon}</span>
                <div class="item-details">
                    <div class="item-name">${itemName}</div>
                    <div class="item-cost">💎 ${item.cost}</div>
                </div>
            </div>
            <button class="btn-redeem" ${canAfford ? '' : 'disabled'} onclick="redeemReward(${index})">
                ${t.redeemBtn || (currentLang === 'zh' ? '兑换' : 'Redeem')}
            </button>
        `;
        storeList.appendChild(div);
    });
}
function redeemReward(index) {
    if (db.score >= rewards[index].cost) { db.score -= rewards[index].cost; saveDB(); alert("🎉 兑换成功！"); }
}

function triggerScoreBump() { const board = document.querySelector('.score-board'); board.classList.add('bump'); setTimeout(() => board.classList.remove('bump'), 300); }
function createPetals() {
    const container = document.getElementById('petal-container');
    for (let i = 0; i < 40; i++) {
        const petal = document.createElement('div'); petal.classList.add('petal');
        const size = Math.random() * 12 + 8; petal.style.width = `${size}px`; petal.style.height = `${size}px`;
        petal.style.left = `${Math.random() * 100}vw`; petal.style.animationDuration = `${Math.random() * 5 + 5}s`; petal.style.animationDelay = `-${Math.random() * 10}s`; 
        container.appendChild(petal);
    }
}

// 页面加载启动
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
document.getElementById('daySelector').value = daysOfWeek[new Date().getDay()];
currentDay = daysOfWeek[new Date().getDay()];

applyLanguage(); updateScoreUI(); createPetals();