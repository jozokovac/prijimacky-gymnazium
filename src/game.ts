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

export type Gender = 'girl' | 'boy';

export type GameState = {
  name: string | null;
  gender: Gender | null;
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
  // posledných 10 testov (% skóre) — pre trend
  recentScores: number[];
};

const KEY = 'prijimacky-game-v1';

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as GameState;
  } catch {}
  return {
    name: null,
    gender: null,
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
    recentScores: [],
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
  const scorePct = Math.round((summary.correct / summary.total) * 100);
  const newRecent = [...(prev.recentScores ?? []), scorePct].slice(-10);

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
    recentScores: newRecent,
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

// Šanca na prijatie — kalibrovaná na realitu Bratislavy.
// Reálny prijímací pomer na top 8-ročné gymnáziá v BA (Gamča, Jur Hronec,
// Metodova, PaBa, L. Sáru…) je ~10–15 % (cca 25–30 prijatých z 200–300
// uchádzačov). Base rate = 15 %.
//
// Bias je miernyoptimistický — biased toward optimism (každý solídny tréning
// posúva kandidátku NAD priemer základného poolu), ale honest: poor performance
// znižuje odhad. Floor 12 % (nikdy nie panika), ceiling 92 % (vždy je čo zlepšiť).
export const BASE_ACCEPTANCE_RATE = 15;

export type Odds = {
  pct: number;
  trend: 'up' | 'flat' | 'down';
  confidence: 'low' | 'medium' | 'high';
};

export function oddsOfAcceptance(game: GameState): Odds {
  if (game.totalQuestions === 0) {
    return { pct: BASE_ACCEPTANCE_RATE, trend: 'flat', confidence: 'low' };
  }

  const accuracy = game.totalCorrect / game.totalQuestions; // 0..1

  // Accuracy nad 40 % posúva NAD priemer poolu, pod 40 % mierne dolu.
  // 50 % → +11, 70 % → +33, 80 % → +44, 90 % → +55, 100 % → +66
  // 40 % → 0, 30 % → −11, 20 % → −22 (poor)
  const accuracyDelta = (accuracy - 0.4) * 110;

  // Objem tréningu → vyššia istota (cap +12)
  const volume = Math.min(12, Math.sqrt(game.totalQuizzes) * 3);

  // Denná séria → konzistencia, ktorá pri prijímačkách rozhoduje (cap +8)
  const streakBoost = Math.min(8, game.dailyStreak * 1.0);

  // Perfect streak → kvalita pod tlakom (cap +5)
  const perfectBoost = Math.min(5, game.perfectStreak * 1.5);

  // Trend posledných 3 vs predchádzajúcich 3 testov
  let trendDelta = 0;
  let trend: Odds['trend'] = 'flat';
  const rs = game.recentScores ?? [];
  if (rs.length >= 4) {
    const recent = rs.slice(-3);
    const older = rs.slice(-6, -3);
    if (older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      trendDelta = (recentAvg - olderAvg) * 0.1;
      if (recentAvg > olderAvg + 5) trend = 'up';
      else if (recentAvg < olderAvg - 5) trend = 'down';
    }
  } else if (rs.length >= 2) {
    const last = rs[rs.length - 1];
    const prev = rs[rs.length - 2];
    if (last > prev + 5) trend = 'up';
    else if (last < prev - 5) trend = 'down';
  }

  let pct =
    BASE_ACCEPTANCE_RATE + accuracyDelta + volume + streakBoost + perfectBoost + trendDelta;
  pct = Math.max(12, Math.min(92, pct));

  const confidence: Odds['confidence'] =
    game.totalQuizzes >= 10 ? 'high' : game.totalQuizzes >= 3 ? 'medium' : 'low';

  return { pct: Math.round(pct), trend, confidence };
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
