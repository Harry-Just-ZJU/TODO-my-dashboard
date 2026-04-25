// ==========================================
// --- schedule.js: 默认初始化模板 ---
// ==========================================
const initialData = {
    schedule: {
        Monday: { classes: [], tasks: [] },
        Tuesday: { classes: [], tasks: [] },
        Wednesday: { classes: [], tasks: [] },
        Thursday: { classes: [], tasks: [] },
        Friday: { classes: [], tasks: [] },
        Saturday: { classes: [], tasks: [] },
        Sunday: { classes: [], tasks: [] }
    },
    projects: [
        { title: "尝试添加一个长期目标，并设定 DDL！", progress: 5, deadline: "2026-12-31" }
    ],
    score: 100,
    rewards: [
        { icon: "🧋", cost: 50, name_zh: "喝一杯奶茶", name_en: "Milk Tea" },
        { icon: "🎮", cost: 100, name_zh: "玩一小时游戏", name_en: "Play Games" },
        { icon: "🛌", cost: 300, name_zh: "赖床半小时", name_en: "Sleep In" }
    ]
};