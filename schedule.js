// ==========================================
// --- schedule.js: 你的专属数据仓库 ---
// ==========================================
const initialData = {
    schedule: {
        Monday: { classes: [], tasks: [] },
        Tuesday: { classes: [], tasks: [] },
        Wednesday: { classes: [], tasks: [] },
        Thursday: { classes: [], tasks: [] },
        Friday: { 
            classes: [
                { text: "IBMS 8009B - 整合人体结构与功能2", startHour: 9, endHour: 10, color: "rgba(52, 152, 219, 0.7)" },
                { text: "IBMS 8014 - 基因组学与蛋白质组学2", startHour: 11, endHour: 12, color: "rgba(52, 152, 219, 0.7)" },
                { text: "IBMS 8014 - 实习 (PRB) | 北教学B楼323", startHour: 13, endHour: 17, color: "rgba(52, 152, 219, 0.7)" }
            ],
            tasks: [
                { text: "复习 ifbs", priority: "high", difficulty: "hard", completed: false, scheduledHour: null },
                { text: "背 50 个单词", priority: "med", difficulty: "normal", completed: false, scheduledHour: null }
            ]
        },
        Saturday: { classes: [], tasks: [] },
        Sunday: { classes: [], tasks: [] }
    },
    projects: [
        // 加入了 deadline 字段
        { title: "CET-6 600+", progress: 0, deadline: "2026-06-15" },
        { title: "史纲", progress: 0, deadline: "2026-05-22" },
        { title: "马原", progress: 0, deadline: "2026-05-13" },
        { title: "GP2 Presentation", progress: 0, deadline: "2026-05-07" },
        { title: "GP2 Report", progress: 0 },
        { title: "DST2 Report", progress: 0 },
        { title: "IFBS2 MCQ", progress: 0 }

    ],
    score: 0,
    rewards: [
        { icon: "🧋", cost: 50, name_zh: "喝一杯奶茶", name_en: "Milk Tea" },
        { icon: "🎮", cost: 100, name_zh: "玩一小时游戏", name_en: "Play Games (1h)" },
        { icon: "🛌", cost: 300, name_zh: "无罪恶感睡懒觉", name_en: "Sleep In" }
    ]
};