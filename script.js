const i18n = {
    zh: {
        dailyTitle: "📅 每日任务池", projectTitle: "🚀 长期计划", timelineTitle: "⏱️ 今日时间轴",
        addBtn: "添加", buildBtn: "建立", scoreText: "✨ 积分: ", langBtn: "EN",
        deleteBtn: "删除", completed: "🎉 已完成", advance: "+1% 推进",
        removeBtn: "移除", pushPrefix: "[推进] ", redeemBtn: "兑换",
        dragHint: "💡 提示：按住任务可直接拖拽到右侧时间轴",
        days: { Monday: "星期一", Tuesday: "星期二", Wednesday: "星期三", Thursday: "星期四", Friday: "星期五", Saturday: "星期六", Sunday: "星期日" },
        placeholderDaily: "输入待办任务...", placeholderProject: "目标...",
        btnSettings: "⚙️ 我的课表管理", btnBackup: "📤 备份数据", btnRestore: "📥 恢复数据",
        settingsTitle: "⚙️ 课表排版引擎", placeholderCourse: "课程名称 (例: 高等数学)",
        btnAddCourse: "➕ 批量添加至时间轴", textExistingClasses: "当前预览日已有课程：",
        addDdl: "添加 DDL", finishProj: "太棒了！确定要完成这个长期目标吗？(将获得 50 积分！)", cancelProj: "确定要取消并删除这个目标吗？(不会扣除积分)",
        tooltipComplete: "完成目标", tooltipCancel: "取消目标", titleStore: "点击打开奖励商城", titleBackup: "导出 JSON 配置", titleRestore: "导入 JSON 配置", titleDdl: "点击修改 DDL",
        titleDatePicker: "选择截止日期" // 新增：覆盖浏览器原生日历提示
    },
    en: {
        dailyTitle: "📅 Task Pool", projectTitle: "🚀 Long-term Plans", timelineTitle: "⏱️ Timeline",
        addBtn: "Add", buildBtn: "Create", scoreText: "✨ Score: ", langBtn: "中文",
        deleteBtn: "Del", completed: "🎉 Done", advance: "+1% Push",
        removeBtn: "Remove", pushPrefix: "[Push] ", redeemBtn: "Redeem",
        dragHint: "💡 Hint: Drag tasks to the right timeline",
        days: { Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday", Sunday: "Sunday" },
        placeholderDaily: "Enter task...", placeholderProject: "Goal...",
        btnSettings: "⚙️ Schedule Settings", btnBackup: "📤 Backup Data", btnRestore: "📥 Restore Data",
        settingsTitle: "⚙️ Schedule Engine", placeholderCourse: "Course Name (e.g. Math)",
        btnAddCourse: "➕ Batch Add to Timeline", textExistingClasses: "Existing classes on preview day:",
        addDdl: "Add DDL", finishProj: "Awesome! Complete this long-term goal? (+50 points!)", cancelProj: "Cancel and delete this goal? (No points deducted)",
        tooltipComplete: "Complete Goal", tooltipCancel: "Cancel Goal", titleStore: "Click to open Reward Store", titleBackup: "Export JSON config", titleRestore: "Import JSON config", titleDdl: "Click to edit DDL",
        titleDatePicker: "Select deadline" // 新增：覆盖浏览器原生日历提示
    }
};

const DB_VERSION = 'myDashboardDB_v7';
let currentLang = localStorage.getItem('myAppLang') || 'zh';
let db = JSON.parse(localStorage.getItem(DB_VERSION));
if (!db) db = typeof initialData !== 'undefined' ? initialData : { schedule: {}, projects: [], score: 0, rewards: [] }; 

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let currentDay = daysOfWeek[new Date().getDay()];

const dailyList = document.getElementById('dailyList');
const projectList = document.getElementById('projectList');
const timelineContainer = document.getElementById('timelineContainer');
const scoreDisplay = document.getElementById('scoreDisplay');
let draggedTaskIndex = null;

document.getElementById('daySelector').value = currentDay;
applyLanguage();
createPetals();

function saveDB() { localStorage.setItem(DB_VERSION, JSON.stringify(db)); updateScoreUI(); }
function updateScoreUI() { scoreDisplay.textContent = db.score; if(!document.getElementById('storeModal').classList.contains('hidden')) renderStore(); }
function changeDay() { currentDay = document.getElementById('daySelector').value; renderTasks(); renderTimeline(); }

function toggleLanguage() { 
    currentLang = currentLang === 'zh' ? 'en' : 'zh'; 
    localStorage.setItem('myAppLang', currentLang); 
    applyLanguage(); 
}

function applyLanguage() {
    const t = i18n[currentLang];
    
    document.getElementById('textDailyTitle').textContent = t.dailyTitle;
    document.getElementById('textProjectTitle').textContent = t.projectTitle;
    document.getElementById('textTimelineTitle').textContent = t.timelineTitle;
    document.getElementById('btnAddDaily').textContent = t.addBtn;
    document.getElementById('btnBuildProj').textContent = t.buildBtn;
    document.getElementById('textScore').textContent = t.scoreText;
    document.getElementById('langBtnText').textContent = t.langBtn;
    document.getElementById('textDragHint').textContent = t.dragHint;
    
    document.getElementById('dailyInput').placeholder = t.placeholderDaily;
    document.getElementById('projectInput').placeholder = t.placeholderProject;
    document.getElementById('btnSettings').textContent = t.btnSettings;
    document.getElementById('btnBackup').textContent = t.btnBackup;
    document.getElementById('textRestore').textContent = t.btnRestore;
    
    document.getElementById('textSettingsTitle').textContent = t.settingsTitle;
    document.getElementById('courseName').placeholder = t.placeholderCourse;
    document.getElementById('btnAddCourse').textContent = t.btnAddCourse;
    document.getElementById('textExistingClasses').textContent = t.textExistingClasses;

    // 悬浮提示翻译 (覆盖浏览器原生日期提示)
    document.getElementById('scoreBoard').title = t.titleStore;
    document.getElementById('btnBackup').title = t.titleBackup;
    document.getElementById('lblRestore').title = t.titleRestore;
    document.getElementById('projectDdl').title = t.titleDatePicker; 

    const selector = document.getElementById('daySelector');
    Array.from(selector.options).forEach(opt => opt.text = t.days[opt.value]);
    const settingSelector = document.getElementById('settingDay');
    Array.from(settingSelector.options).forEach(opt => opt.text = t.days[opt.value]);
    
    const repeatSelector = document.getElementById('settingRepeat');
    if (currentLang === 'en') {
        repeatSelector.options[0].text = "Single Day";
        repeatSelector.options[1].text = "Workdays (Mon-Fri)";
        repeatSelector.options[2].text = "Weekends (Sat-Sun)";
        repeatSelector.options[3].text = "Everyday";
        repeatSelector.options[4].text = "Custom (Select Days)"; 
        const dayKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        document.querySelectorAll('.cb-lbl').forEach((lbl, i) => lbl.textContent = dayKeys[i].substring(0,3));
    } else {
        repeatSelector.options[0].text = "单次 (仅特定日期)";
        repeatSelector.options[1].text = "工作日重复 (周一至周五)";
        repeatSelector.options[2].text = "周末重复 (周六至周日)";
        repeatSelector.options[3].text = "每天重复";
        repeatSelector.options[4].text = "自定义 (多选)"; 
        const zhDays = ['一', '二', '三', '四', '五', '六', '日'];
        document.querySelectorAll('.cb-lbl').forEach((lbl, i) => lbl.textContent = zhDays[i]);
    }

    renderAll();
    if (!document.getElementById('settingsModal').classList.contains('hidden')) renderSettingCourses();
}

function renderAll() { renderTasks(); renderProjects(); renderTimeline(); }

function addDailyTask() {
    const input = document.getElementById('dailyInput');
    const text = input.value.trim();
    if (!text) return;
    if (!db.schedule[currentDay]) db.schedule[currentDay] = { classes: [], tasks: [] };
    db.schedule[currentDay].tasks.push({ text: text, completed: false, scheduledHour: null });
    input.value = ''; saveDB(); renderTasks();
}

function renderTasks() {
    dailyList.innerHTML = '';
    const tasks = db.schedule[currentDay]?.tasks || [];
    tasks.forEach((task, index) => {
        if (task.scheduledHour === null) {
            const li = document.createElement('li');
            li.draggable = true;
            li.ondragstart = () => { draggedTaskIndex = index; };
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `
                <span onclick="toggleTask(${index})" style="cursor:pointer; flex:1;">${task.completed ? '✅ ' : '⏳ '}${task.text}</span> 
                <button class="btn-delete-icon" onclick="deleteTask(${index})">🗑️</button>
            `;
            dailyList.appendChild(li);
        }
    });
}

function toggleTask(index) {
    const tasks = db.schedule[currentDay].tasks;
    tasks[index].completed = !tasks[index].completed;
    db.score += tasks[index].completed ? 10 : -10;
    saveDB(); renderAll();
}
function deleteTask(index) { db.schedule[currentDay].tasks.splice(index, 1); saveDB(); renderAll(); }

function floatToTimeStr(floatVal) {
    const h = Math.floor(floatVal);
    const m = Math.round((floatVal - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
function timeStrToFloat(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
}

function renderTimeline() {
    timelineContainer.innerHTML = '';
    const dayData = db.schedule[currentDay] || { classes: [], tasks: [] };
    
    for (let i = 8; i <= 23; i++) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerHTML = `<div class="time-label">${i}:00</div><div class="drop-zone" ondragover="event.preventDefault()" ondrop="handleDrop(event, ${i})"></div>`;
        timelineContainer.appendChild(slot);
    }
    
    dayData.classes?.forEach(cls => {
        const block = document.createElement('div');
        block.className = 'timeline-block';
        const safeStart = Math.max(8, cls.startHour);
        const safeEnd = Math.min(24, cls.endHour);
        const duration = safeEnd - safeStart;

        block.style.top = `${(safeStart - 8) * 60 + 2}px`;
        block.style.height = `${duration * 60 - 4}px`;
        block.style.backgroundColor = cls.color || '#3498db';
        
        const startStr = floatToTimeStr(cls.startHour);
        const endStr = floatToTimeStr(cls.endHour);

        block.innerHTML = `<div class="block-title">${cls.text}</div><div class="block-time">${startStr} - ${endStr}</div>`;
        timelineContainer.appendChild(block);
    });
    
    dayData.tasks?.forEach((task, index) => {
        if (task.scheduledHour !== null) {
            const block = document.createElement('div');
            block.className = 'timeline-block';
            block.style.top = `${(task.scheduledHour - 8) * 60 + 2}px`;
            block.style.height = '56px';
            block.style.backgroundColor = task.completed ? '#bdc3c7' : '#2ecc71';
            block.innerHTML = `
                <div style="flex:1; cursor:pointer;" onclick="toggleTask(${index})">${task.completed ? '✅ ' : ''}${task.text}</div>
                <button onclick="unschedule(${index})" style="background:none; border:none; color:white; font-size:12px; text-align:right; cursor:pointer; opacity:0.8;">[${i18n[currentLang].removeBtn}]</button>
            `;
            timelineContainer.appendChild(block);
        }
    });
}

function handleDrop(e, hour) {
    if (draggedTaskIndex !== null) {
        db.schedule[currentDay].tasks[draggedTaskIndex].scheduledHour = hour;
        draggedTaskIndex = null; saveDB(); renderAll();
    }
}
function unschedule(index) { db.schedule[currentDay].tasks[index].scheduledHour = null; saveDB(); renderAll(); }

function addProject() {
    const input = document.getElementById('projectInput');
    const ddl = document.getElementById('projectDdl');
    if (!input.value.trim()) return;
    db.projects.push({ title: input.value.trim(), progress: 0, deadline: ddl.value });
    input.value = ''; ddl.value = ''; saveDB(); renderProjects();
}

function renderProjects() {
    projectList.innerHTML = '';
    const t = i18n[currentLang];
    db.projects.sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
    
    db.projects.forEach((proj, index) => {
        const li = document.createElement('li');
        const isDone = proj.progress === 100;
        
        const ddlText = proj.deadline ? `📅 ${proj.deadline}` : `📅 ${t.addDdl}`;
        const ddlClass = proj.deadline ? 'ddl-badge' : 'ddl-badge empty';

        li.innerHTML = `
            <div class="project-header">
                <div class="project-title-group">
                    <span class="project-title">${proj.title}</span>
                    <div class="ddl-container" title="${t.titleDdl}">
                        <span class="${ddlClass}">${ddlText}</span>
                        <input type="date" class="ddl-input-hidden" title="${t.titleDdl}" value="${proj.deadline || ''}" onchange="updateProjectDDL(${index}, this.value)">
                    </div>
                </div>
                <div class="project-actions">
                    <button onclick="finishProject(${index})" class="btn-icon btn-complete" title="${t.tooltipComplete}">✅</button>
                    <button onclick="deleteProject(${index})" class="btn-icon btn-delete" title="${t.tooltipCancel}">🗑️</button>
                </div>
            </div>
            <div class="progress-container"><div class="progress-bar" style="width:${proj.progress}%; background:${isDone?'#fbc2eb':'#a18cd1'}"></div></div>
            <div class="project-controls">
                <div>
                    <span style="font-size:13px; font-weight:bold; color:#8e8e93;">${proj.progress}%</span>
                    <button class="btn-decompose" onclick="decompose('${proj.title}')">➕ ${t.days[currentDay].substring(0,3)}</button>
                </div>
                <button class="btn-push" ${isDone?'disabled':''} onclick="addProgress(${index})">${isDone ? t.completed : t.advance}</button>
            </div>
        `;
        projectList.appendChild(li);
    });
}

function updateProjectDDL(index, newDate) {
    if (newDate) db.projects[index].deadline = newDate;
    else delete db.projects[index].deadline;
    saveDB(); renderProjects();
}
function finishProject(index) {
    if (confirm(i18n[currentLang].finishProj)) {
        db.score += 50; db.projects.splice(index, 1); saveDB(); renderAll();
    }
}
function deleteProject(index) {
    if (confirm(i18n[currentLang].cancelProj)) {
        db.projects.splice(index, 1); saveDB(); renderProjects();
    }
}

function decompose(title) {
    const prefix = i18n[currentLang].pushPrefix;
    if (!db.schedule[currentDay]) db.schedule[currentDay] = { classes: [], tasks: [] };
    db.schedule[currentDay].tasks.push({ text: prefix + title, completed: false, scheduledHour: null });
    saveDB(); renderAll();
}

function addProgress(index) {
    if(db.projects[index].progress < 100) { db.projects[index].progress += 1; db.score += 2; saveDB(); renderProjects(); }
}

function toggleStore() {
    const modal = document.getElementById('storeModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) renderStore();
}

function renderStore() {
    const storeList = document.getElementById('storeList');
    storeList.innerHTML = '';
    const t = i18n[currentLang];

    (db.rewards || []).forEach((item, index) => {
        const canAfford = db.score >= item.cost;
        const itemName = currentLang === 'zh' ? item.name_zh : item.name_en;
        const div = document.createElement('div');
        div.className = 'store-item';
        div.innerHTML = `
            <div class="item-info">
                <span style="font-size: 30px;">${item.icon}</span>
                <div>
                    <div class="item-name">${itemName}</div>
                    <div class="item-cost">💎 ${item.cost}</div>
                </div>
            </div>
            <button class="btn-redeem" ${canAfford ? '' : 'disabled'} onclick="redeemReward(${index})">
                ${t.redeemBtn}
            </button>
        `;
        storeList.appendChild(div);
    });
}
function redeemReward(index) {
    const item = db.rewards[index];
    if (db.score >= item.cost) { db.score -= item.cost; saveDB(); alert(currentLang === 'zh' ? `兑换成功：${item.icon}！` : `Successfully redeemed: ${item.icon}!`); renderStore(); }
}

function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('settingDay').value = currentDay;
    document.getElementById('settingRepeat').value = 'single';
    toggleSettingDay();
    renderSettingCourses();
}

function closeSettings() { document.getElementById('settingsModal').classList.add('hidden'); }

function toggleSettingDay() {
    const repeatMode = document.getElementById('settingRepeat').value;
    const daySelector = document.getElementById('settingDay');
    const customWrapper = document.getElementById('customDaysWrapper');

    if (repeatMode === 'single') {
        daySelector.style.display = 'block';
        customWrapper.style.display = 'none';
    } else if (repeatMode === 'custom') {
        daySelector.style.display = 'none';
        customWrapper.style.display = 'flex';
    } else {
        daySelector.style.display = 'none';
        customWrapper.style.display = 'none';
    }
    renderSettingCourses();
}

function renderSettingCourses() {
    const day = document.getElementById('settingDay').value;
    const list = document.getElementById('settingCourseList');
    list.innerHTML = '';
    if(!db.schedule[day]) db.schedule[day] = {classes:[], tasks:[]};
    
    db.schedule[day].classes.sort((a, b) => a.startHour - b.startHour);

    db.schedule[day].classes.forEach((cls, index) => {
        const startTimeStr = floatToTimeStr(cls.startHour);
        const endTimeStr = floatToTimeStr(cls.endHour);
        const li = document.createElement('li');
        li.className = 'setting-course-item';
        li.innerHTML = `
            <div>
                <strong>${cls.text}</strong><br>
                <span style="color:#7f8c8d; font-size:11px;">${startTimeStr} - ${endTimeStr}</span>
            </div>
            <button class="btn-delete-icon" onclick="deleteSettingCourse('${day}', ${index})">${i18n[currentLang].deleteBtn || '删除'}</button>
        `;
        list.appendChild(li);
    });
}

function saveCourse() {
    const name = document.getElementById('courseName').value.trim();
    const startTimeStr = document.getElementById('courseStartTime').value;
    const endTimeStr = document.getElementById('courseEndTime').value;
    const repeatMode = document.getElementById('settingRepeat').value;
    const singleDay = document.getElementById('settingDay').value;

    const startFloat = timeStrToFloat(startTimeStr);
    const endFloat = timeStrToFloat(endTimeStr);

    if (!name || startFloat === null || endFloat === null || startFloat >= endFloat) {
        alert(currentLang === 'zh' ? "请完整填写名称和合法的时间区间！" : "Please fill in valid name and time range!"); 
        return;
    }

    let targetDays = [];
    if (repeatMode === 'single') targetDays = [singleDay];
    else if (repeatMode === 'workday') targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    else if (repeatMode === 'weekend') targetDays = ['Saturday', 'Sunday'];
    else if (repeatMode === 'everyday') targetDays = daysOfWeek;
    else if (repeatMode === 'custom') {
        const checkboxes = document.querySelectorAll('.custom-day-cb:checked');
        checkboxes.forEach(cb => targetDays.push(cb.value));
        if (targetDays.length === 0) {
            alert(currentLang === 'zh' ? "请至少勾选一天！" : "Please select at least one day!");
            return;
        }
    }

    targetDays.forEach(day => {
        if(!db.schedule[day]) db.schedule[day] = {classes:[], tasks:[]};
        db.schedule[day].classes.push({ text: name, startHour: startFloat, endHour: endFloat, color: '#3498db' });
    });

    saveDB(); renderSettingCourses(); renderTimeline();
    
    if(targetDays.length > 1) {
        alert(currentLang === 'zh' ? `已成功批量添加到 ${targetDays.length} 天！` : `Successfully added to ${targetDays.length} days!`);
    }

    document.getElementById('courseName').value = '';
}

function deleteSettingCourse(day, index) { 
    db.schedule[day].classes.splice(index, 1); 
    saveDB(); renderSettingCourses(); renderTimeline(); 
}

function exportConfig() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr); dl.setAttribute("download", "MyDashboard_Backup.json"); dl.click();
}
function importConfig(e) {
    const reader = new FileReader();
    reader.onload = (event) => { db = JSON.parse(event.target.result); saveDB(); location.reload(); };
    reader.readAsText(e.target.files[0]);
}

function createPetals() {
    const container = document.getElementById('petal-container');
    for (let i = 0; i < 20; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.width = Math.random() * 10 + 5 + 'px';
        petal.style.height = Math.random() * 10 + 5 + 'px';
        petal.style.animationDuration = Math.random() * 3 + 4 + 's';
        petal.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(petal);
    }
}