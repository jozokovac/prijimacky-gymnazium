// Odmeny: vouchere (material — od rodičov) + míľniky (intrinsic — afirmácie)
// + tajné easter eggs.
//
// Filozofia: prvých pár levelov = pocit „si na ceste, mozog rastie",
// každý 5. level = niečo materiálne. Cieľom je naučiť hľadať hodnotu
// v procese a v sebe, nie v sladkostiach.

import type { GameState } from './game';
import { levelFromXp } from './game';

export type RewardId =
  // Vouchers (material)
  | 'pizza-party'        // L5
  | 'cinema-friend'      // L10
  | 'aupark-friend'      // L15
  | 'shopping-budget'    // L20
  // Milestones (intrinsic)
  | 'm-l2'  | 'm-l3'  | 'm-l4'
  | 'm-l6'  | 'm-l7'  | 'm-l8'  | 'm-l9'
  | 'm-l11' | 'm-l12' | 'm-l13' | 'm-l14'
  | 'm-l16' | 'm-l17' | 'm-l18' | 'm-l19'
  // Eggs
  | 'breakfast-in-bed'
  | 'unicorn-secret';

export type Reward = {
  id: RewardId;
  emoji: string;
  title: string;
  desc: string;
  kind: 'voucher' | 'milestone' | 'egg';
  unlock: { kind: 'level'; level: number } | { kind: 'condition'; label: string };
};

export const REWARDS: Reward[] = [
  // ====== Material — every 5 levels ======
  {
    id: 'pizza-party',
    emoji: '🍕',
    title: 'Pizza večer',
    desc: 'Vyber si pizzu na piatkovú večeru pre celú rodinu.',
    kind: 'voucher',
    unlock: { kind: 'level', level: 5 },
  },
  {
    id: 'cinema-friend',
    emoji: '🎬',
    title: '2× lístky do kina s kamoškou',
    desc: 'Vyberte si film, ideme do kina! Občerstvenie v cene.',
    kind: 'voucher',
    unlock: { kind: 'level', level: 10 },
  },
  {
    id: 'aupark-friend',
    emoji: '🛍️',
    title: 'Aupark deň s kamoškou',
    desc: 'Rozpočet 30 € + zmrzlina, mama vás zavezie.',
    kind: 'voucher',
    unlock: { kind: 'level', level: 15 },
  },
  {
    id: 'shopping-budget',
    emoji: '💸',
    title: 'Shopping deň · 50 €',
    desc: 'Vyber si oblečenie, kozmetiku, čo chceš — 50 € rozpočet.',
    kind: 'voucher',
    unlock: { kind: 'level', level: 20 },
  },

  // ====== Intrinsic milestones — affirmácie pre vnútorný rast ======
  // L1 = štart, žiadna afirmácia
  { id: 'm-l2',  emoji: '🌱', title: 'Si v hre!',     desc: 'Bomba — držíš tempo.',          kind: 'milestone', unlock: { kind: 'level', level: 2 } },
  { id: 'm-l3',  emoji: '⭐', title: 'Si v rytme',    desc: 'Tri levely za sebou!',          kind: 'milestone', unlock: { kind: 'level', level: 3 } },
  { id: 'm-l4',  emoji: '💪', title: 'Sila rastie',   desc: 'Vidieť ťa makať.',              kind: 'milestone', unlock: { kind: 'level', level: 4 } },
  { id: 'm-l6',  emoji: '🧠', title: 'Big brain',     desc: 'Levelujeme!',                    kind: 'milestone', unlock: { kind: 'level', level: 6 } },
  { id: 'm-l7',  emoji: '🎯', title: 'Na ceste',      desc: 'Skvelý progres.',                kind: 'milestone', unlock: { kind: 'level', level: 7 } },
  { id: 'm-l8',  emoji: '🌟', title: 'Star mode',     desc: 'Žiariš.',                        kind: 'milestone', unlock: { kind: 'level', level: 8 } },
  { id: 'm-l9',  emoji: '🚀', title: 'Skoro tam',     desc: 'Ešte level a ďalšia odmena!',    kind: 'milestone', unlock: { kind: 'level', level: 9 } },
  { id: 'm-l11', emoji: '🏆', title: 'Pro level',     desc: 'Si v top forme.',                kind: 'milestone', unlock: { kind: 'level', level: 11 } },
  { id: 'm-l12', emoji: '🦋', title: 'Glow up',       desc: 'Veľký progres za krátky čas.',   kind: 'milestone', unlock: { kind: 'level', level: 12 } },
  { id: 'm-l13', emoji: '👑', title: 'Queen vibes',   desc: 'Vládneš týmto akadémiám.',       kind: 'milestone', unlock: { kind: 'level', level: 13 } },
  { id: 'm-l14', emoji: '💎', title: 'Diamond',       desc: 'Pevná, žiarivá, drahá.',         kind: 'milestone', unlock: { kind: 'level', level: 14 } },
  { id: 'm-l16', emoji: '🌈', title: 'Magic',         desc: 'Vyzerá to ako kúzlo.',           kind: 'milestone', unlock: { kind: 'level', level: 16 } },
  { id: 'm-l17', emoji: '🔥', title: 'Final push',    desc: 'Tri levely do top!',             kind: 'milestone', unlock: { kind: 'level', level: 17 } },
  { id: 'm-l18', emoji: '⚡', title: 'Lightning',     desc: 'Rýchla a presná.',               kind: 'milestone', unlock: { kind: 'level', level: 18 } },
  { id: 'm-l19', emoji: '🎓', title: 'Pred bránou',   desc: 'Top je na dosah.',               kind: 'milestone', unlock: { kind: 'level', level: 19 } },

  // ====== Easter eggs ======
  {
    id: 'breakfast-in-bed',
    emoji: '🥐',
    title: 'Raňajky do postele',
    desc: 'Tajná odmena: trénovala si 7 dní v rade!',
    kind: 'egg',
    unlock: { kind: 'condition', label: 'Denná séria 7 dní' },
  },
  {
    id: 'unicorn-secret',
    emoji: '🦄',
    title: 'Tajný jednorožec',
    desc: 'Tri 100 % testy za sebou — si génius!',
    kind: 'egg',
    unlock: { kind: 'condition', label: '3× perfektné skóre po sebe' },
  },
];

export function unlockedRewardIds(game: GameState): Set<RewardId> {
  const out = new Set<RewardId>();
  const level = levelFromXp(game.xp);
  for (const r of REWARDS) {
    if (r.unlock.kind === 'level' && level >= r.unlock.level) out.add(r.id);
    else if (r.unlock.kind === 'condition') {
      if (r.id === 'breakfast-in-bed' && game.dailyStreak >= 7) out.add(r.id);
      if (r.id === 'unicorn-secret' && game.perfectStreak >= 3) out.add(r.id);
    }
  }
  return out;
}

export function nextVoucherForLevel(currentLevel: number): Reward | null {
  const rs = REWARDS.filter(
    (r) => r.kind === 'voucher' && r.unlock.kind === 'level' && r.unlock.level > currentLevel,
  );
  rs.sort((a, b) => (a.unlock as any).level - (b.unlock as any).level);
  return rs[0] ?? null;
}

// Spätná kompatibilita: nextRewardForLevel = ďalšia odmena akéhokoľvek typu
export function nextRewardForLevel(currentLevel: number): Reward | null {
  const rs = REWARDS.filter(
    (r) =>
      (r.kind === 'voucher' || r.kind === 'milestone') &&
      r.unlock.kind === 'level' &&
      r.unlock.level > currentLevel,
  );
  rs.sort((a, b) => (a.unlock as any).level - (b.unlock as any).level);
  return rs[0] ?? null;
}

export function readSeenRewards(): Set<RewardId> {
  try {
    const raw = localStorage.getItem('prijimacky-seen-rewards');
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as RewardId[]);
  } catch {
    return new Set();
  }
}
export function writeSeenRewards(s: Set<RewardId>) {
  localStorage.setItem('prijimacky-seen-rewards', JSON.stringify([...s]));
}
