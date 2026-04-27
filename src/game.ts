// Gamifikácia: XP, levely, série, denné série, odznaky.
// Stav je perzistovaný v localStorage.

export type BadgeId =
  | 'rookie'
  | 'streak3'
  | 'streak5'
  | 'streak10'
  | 'perfect'
  | 'math10'
  | 'slovak10'
  | 'marathon'
  | 'daily3'
  | 'daily7';

export type Badge = {
  id: BadgeId;
  title: string;
  desc: string;
  image: string; // /images/...
};

export const BADGES: Record<BadgeId, Badge> = {
  rookie: {
    id: 'rookie',
    title: 'Prvé kroky',
    desc: 'Dokonči svoj prvý test.',
    image: '/images/badge-rookie.png',
  },
  streak3: {
    id: 'streak3',
    title: 'V plameňoch',
    desc: '3 správne odpovede za sebou.',
    image: '/images/badge-streak.png',
  },
  streak5: {
    id: 'streak5',
    title: 'Horiaca séria',
    desc: '5 správnych odpovedí za sebou.',
    image: '/images/badge-streak.png',
  },
  streak10: {
    id: 'streak10',
    title: 'Nezastaviteľná!',
    desc: '10 správnych odpovedí za sebou.',
    image: '/images/badge-streak.png',
  },
  perfect: {
    id: 'perfect',
    title: 'Stopercentne!',
    desc: '100 % v jednom teste.',
    image: '/images/badge-perfect.png',
  },
  math10: {
    id: 'math10',
    title: 'Matematický čarodej',
    desc: '10 správnych z matematiky.',
    image: '/images/badge-math.png',
  },
  slovak10: {
    id: 'slovak10',
    title: 'Slovenský bard',
    desc: '10 správnych zo slovenčiny.',
    image: '/images/badge-slovak.png',
  },
  marathon: {
    id: 'marathon',
    title: 'Maratónec',
    desc: 'Dokonči 5 testov.',
    image: '/images/badge-marathon.png',
  },
  daily3: {
    id: 'daily3',
    title: '3 dni v rade',
    desc: 'Trénuj 3 dni za sebou.',
    image: '/images/badge-streak.png',
  },
  daily7: {
    id: 'daily7',
    title: 'Týždeň zápalu',
    desc: 'Trénuj 7 dní za sebou.',
    image: '/images/badge-streak.png',
  },
};

export type GameState = {
  name: string | null;
  xp: number;
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: number;
  bestStreak: number;
  perfectStreak: number;
  mathCorrect: number;
  slovakCorrect: number;
  badges: BadgeId[];
  // denná séria
  lastPlayedDate: string | null; // YYYY-MM-DD
  dailyStreak: number;
};

const KEY = 'prijimacky-game-v1';

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as GameState;
  } catch {}
  return {
    name: null,
    xp: 0,
    totalQuizzes: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestScore: 0,
    bestStreak: 0,
    perfectStreak: 0,
    mathCorrect: 0,
    slovakCorrect: 0,
    badges: [],
    lastPlayedDate: null,
    dailyStreak: 0,
  };
}

export function saveGame(s: GameState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

// Level rastie ako 100, 250, 450, 700, 1000, 1350, ...
// XP potrebné po level n je 50 * n * (n+1)
export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level;
}

export function levelProgress(xp: number): {
  level: number;
  current: number;
  needed: number;
  pct: number;
} {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const current = xp - base;
  const needed = next - base;
  return { level, current, needed, pct: Math.round((current / needed) * 100) };
}

export type AwardResult = {
  next: GameState;
  xpGained: number;
  newBadges: BadgeId[];
  leveledUpTo: number | null;
  newPerfectStreak: number;
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function dayDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / 86400000);
}

export function awardForQuiz(prev: GameState, summary: {
  total: number;
  correct: number;
  bestStreakInQuiz: number;
  mathCorrect: number;
  slovakCorrect: number;
}): AwardResult {
  const xpFromCorrect = summary.correct * 10;
  const streakBonus = summary.bestStreakInQuiz >= 5 ? 25 : summary.bestStreakInQuiz >= 3 ? 10 : 0;
  const perfect = summary.correct === summary.total;
  const perfectBonus = perfect ? 50 : 0;
  const xpGained = xpFromCorrect + streakBonus + perfectBonus;

  const today = todayStr();
  let dailyStreak = prev.dailyStreak;
  if (prev.lastPlayedDate === today) {
    // rovnaký deň – nemení sa
  } else if (prev.lastPlayedDate && dayDiff(prev.lastPlayedDate, today) === 1) {
    dailyStreak += 1;
  } else {
    dailyStreak = 1;
  }

  const newPerfectStreak = perfect ? prev.perfectStreak + 1 : 0;

  const next: GameState = {
    ...prev,
    xp: prev.xp + xpGained,
    totalQuizzes: prev.totalQuizzes + 1,
    totalCorrect: prev.totalCorrect + summary.correct,
    totalQuestions: prev.totalQuestions + summary.total,
    bestScore: Math.max(prev.bestScore, Math.round((summary.correct / summary.total) * 100)),
    bestStreak: Math.max(prev.bestStreak, summary.bestStreakInQuiz),
    perfectStreak: newPerfectStreak,
    mathCorrect: prev.mathCorrect + summary.mathCorrect,
    slovakCorrect: prev.slovakCorrect + summary.slovakCorrect,
    badges: [...prev.badges],
    lastPlayedDate: today,
    dailyStreak,
  };

  const newBadges: BadgeId[] = [];
  function unlock(id: BadgeId) {
    if (!next.badges.includes(id)) {
      next.badges.push(id);
      newBadges.push(id);
    }
  }

  if (next.totalQuizzes >= 1) unlock('rookie');
  if (summary.bestStreakInQuiz >= 3) unlock('streak3');
  if (summary.bestStreakInQuiz >= 5) unlock('streak5');
  if (summary.bestStreakInQuiz >= 10) unlock('streak10');
  if (perfect) unlock('perfect');
  if (next.mathCorrect >= 10) unlock('math10');
  if (next.slovakCorrect >= 10) unlock('slovak10');
  if (next.totalQuizzes >= 5) unlock('marathon');
  if (next.dailyStreak >= 3) unlock('daily3');
  if (next.dailyStreak >= 7) unlock('daily7');

  const prevLevel = levelFromXp(prev.xp);
  const newLevel = levelFromXp(next.xp);
  const leveledUpTo = newLevel > prevLevel ? newLevel : null;

  return { next, xpGained, newBadges, leveledUpTo, newPerfectStreak };
}

// Migrácia zo starého kľúča prijimacky-stats-v1 (ak existuje)
export function migrateOldStats(state: GameState): GameState {
  try {
    const oldRaw = localStorage.getItem('prijimacky-stats-v1');
    if (!oldRaw) return state;
    const old = JSON.parse(oldRaw);
    localStorage.removeItem('prijimacky-stats-v1');
    return {
      ...state,
      totalQuizzes: state.totalQuizzes + (old.totalQuizzes || 0),
      totalCorrect: state.totalCorrect + (old.totalCorrect || 0),
      totalQuestions: state.totalQuestions + (old.totalQuestions || 0),
      bestScore: Math.max(state.bestScore, old.bestScore || 0),
      xp: state.xp + (old.totalCorrect || 0) * 10,
    };
  } catch {
    return state;
  }
}
