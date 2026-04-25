const i18n = {
    zh: {
        dailyTitle: "📅 每日任务池", projectTitle: "🚀 长期计划", timelineTitle: "⏱️ 今日时间轴",
        addBtn: "添加", buildBtn: "建立", scoreText: "✨ 积分: ", langBtn: "EN",
        deleteBtn: "删除", completed: "🎉 已完成", advance: "+1% 推进",
        removeBtn: "移除", pushPrefix: "[推进] ", redeemBtn: "兑换",
        days: { Monday: "星期一", Tuesday: "星期二", Wednesday: "星期三", Thursday: "星期四", Friday: "星期五", Saturday: "星期六", Sunday: "星期日" }
    },
    en: {
        dailyTitle: "📅 Task Pool", projectTitle: "🚀 Long-term Plans", timelineTitle: "⏱️ Timeline",
        addBtn: "Add", buildBtn: "Create", scoreText: "✨ Score: ", langBtn: "中文",
        deleteBtn: "Del", completed: "🎉 Done", advance: "+1% Push",
        removeBtn: "Remove", pushPrefix: "[Push] ", redeemBtn: "Redeem",
        days: { Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday", Sunday: "Sunday" }
    }
};

let currentLang = localStorage.getItem('myAppLang') || 'zh';
let db = JSON.parse(localStorage.getItem('myDashboardDB_v4'));
if (!db) db = initialData; 
const rewards = initialData.rewards;

let currentDay = document.getElementById('daySelector').value;
const dailyList = document.getElementById('dailyList');
const projectList = document.getElementById('projectList');
const timelineContainer = document.getElementById('timelineContainer');
const scoreDisplay = document.getElementById('scoreDisplay');

function saveDB() { localStorage.setItem('myDashboardDB_v4', JSON.stringify(db)); updateScoreUI(); }
function updateScoreUI() { scoreDisplay.textContent = db.score; renderStore(); }

function toggleLanguage() { 
    currentLang = currentLang === 'zh' ? 'en' : 'zh'; 
    localStorage.setItem('myAppLang', currentLang); 
    applyLanguage(); 
}

function applyLanguage() {
    const t = i18n[currentLang];
    document.getElementById('textDailyTitle').textContent = t.dailyTitle;
    document.getElementById('textProjectTitle').textContent = t.projectTitle;
    document.getElementById('btnAddDaily').textContent = t.addBtn;
    document.getElementById('btnBuildProj').textContent = t.buildBtn;
    document.getElementById('textScore').textContent = t.scoreText;
    document.getElementById('langBtnText').textContent = t.langBtn;
    renderAll();
}

// 渲染逻辑
function renderAll() { renderTasks(); renderProjects(); renderTimeline(); }

function renderTimeline() {
    timelineContainer.innerHTML = '';
    const dayData = db.schedule[currentDay] || { classes: [], tasks: [] };
    for (let i = 8; i <= 23; i++) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerHTML = `<div class="time-label">${i}:00</div><div class="drop-zone" ondragover="event.preventDefault()" ondrop="handleDrop(event, ${i})"></div>`;
        timelineContainer.appendChild(slot);
    }
    // 渲染固定课程
    dayData.classes.forEach(cls => {
        const block = document.createElement('div');
        block.className = 'timeline-block';
        block.style.top = `${(cls.startHour - 8) * 60 + 2}px`;
        block.style.height = `${(cls.endHour - cls.startHour) * 60 - 4}px`;
        block.style.backgroundColor = cls.color || '#3498db';
        block.innerHTML = `<div class="block-title">${cls.text}</div><div class="block-time">${cls.startHour}:00 - ${cls.endHour}:00</div>`;
        timelineContainer.appendChild(block);
    });
    // 渲染已排程任务
    dayData.tasks.forEach((task, index) => {
        if (task.scheduledHour !== null) {
            const block = document.createElement('div');
            block.className = 'timeline-block';
            block.style.top = `${(task.scheduledHour - 8) * 60 + 2}px`;
            block.style.height = '56px';
            block.style.backgroundColor = task.completed ? '#bdc3c7' : '#2ecc71';
            block.innerHTML = `<div>${task.text}</div><button onclick="unschedule(${index})" style="background:none;border:1px solid white;color:white;font-size:10px;">${i18n[currentLang].removeBtn}</button>`;
            timelineContainer.appendChild(block);
        }
    });
}

function handleDrop(e, hour) {
    if (draggedTaskIndex !== null) {
        db.schedule[currentDay].tasks[draggedTaskIndex].scheduledHour = hour;
        saveDB(); renderAll();
    }
}

let draggedTaskIndex = null;
function renderTasks() {
    dailyList.innerHTML = '';
    const tasks = db.schedule[currentDay].tasks;
    tasks.forEach((task, index) => {
        if (task.scheduledHour === null) {
            const li = document.createElement('li');
            li.draggable = true;
            li.ondragstart = () => { draggedTaskIndex = index; };
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `<span onclick="toggleTask(${index})">${task.text}</span> <button onclick="deleteTask(${index})">×</button>`;
            dailyList.appendChild(li);
        }
    });
}

function renderProjects() {
    projectList.innerHTML = '';
    db.projects.sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
    db.projects.forEach((proj, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="project-header">
                <div class="project-title-group">
                    <span class="project-title">${proj.title}</span>
                    ${proj.deadline ? `<span class="ddl-badge">📅 ${proj.deadline}</span>` : ''}
                </div>
                <button onclick="deleteProject(${index})" class="btn-delete-icon">🗑️</button>
            </div>
            <div class="progress-container"><div class="progress-bar" style="width:${proj.progress}%; background:${proj.progress==100?'#fbc2eb':'#a18cd1'}"></div></div>
            <div class="project-controls">
                <div>
                    <span>${proj.progress}%</span>
                    <button class="btn-decompose" onclick="decompose('${proj.title}')">+今日</button>
                </div>
                <button class="btn-push" onclick="addProgress(${index})">${proj.progress==100?i18n[currentLang].completed:i18n[currentLang].advance}</button>
            </div>
        `;
        projectList.appendChild(li);
    });
}

function decompose(title) {
    const prefix = i18n[currentLang].pushPrefix;
    db.schedule[currentDay].tasks.push({ text: prefix + title, completed: false, scheduledHour: null });
    saveDB(); renderAll();
}

function addProgress(index) {
    if(db.projects[index].progress < 100) {
        db.projects[index].progress += 1;
        db.score += 2; saveDB(); renderAll();
    }
}

function toggleTask(index) {
    db.schedule[currentDay].tasks[index].completed = !db.schedule[currentDay].tasks[index].completed;
    db.score += db.schedule[currentDay].tasks[index].completed ? 10 : -10;
    saveDB(); renderAll();
}

function unschedule(index) {
    db.schedule[currentDay].tasks[index].scheduledHour = null;
    saveDB(); renderAll();
}

// 导入导出功能
function exportConfig() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "my_dash_config.json");
    dlAnchor.click();
}

function importConfig(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        db = JSON.parse(event.target.result);
        saveDB(); location.reload();
    };
    reader.readAsText(e.target.files[0]);
}

// 初始化
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
currentDay = daysOfWeek[new Date().getDay()];
document.getElementById('daySelector').value = currentDay;
applyLanguage();