// Reálne odmeny / vouchery — odomykajú sa pri dosiahnutí levelu.
// Niektoré sú „easter eggs" za špecifické úspechy.

import type { GameState } from './game';
import { levelFromXp } from './game';

export type RewardId =
  | 'pizza-party'
  | 'pick-movie'
  | 'ice-cream-date'
  | 'screen-time-bonus'
  | 'cinema-friend'
  | 'stay-up-late'
  | 'new-book'
  | 'sushi-night'
  | 'manicure'
  | 'sleepover'
  | 'aupark-friend'
  | 'no-chores-day'
  | 'shopping-budget'
  | 'breakfast-in-bed'
  | 'unicorn-secret';

export type Reward = {
  id: RewardId;
  emoji: string;
  title: string;
  desc: string;
  unlock: { kind: 'level'; level: number } | { kind: 'condition'; label: string };
  isEgg?: boolean;
};

export const REWARDS: Reward[] = [
  { id: 'pizza-party',       emoji: '🍕', title: 'Pizza večer',                  desc: 'Vyber si pizzu na piatkovú večeru pre celú rodinu.',          unlock: { kind: 'level', level: 2 } },
  { id: 'pick-movie',        emoji: '🎬', title: 'Tvoj film na večer',           desc: 'Vyberáš film na rodinný filmový večer.',                       unlock: { kind: 'level', level: 3 } },
  { id: 'ice-cream-date',    emoji: '🍦', title: 'Zmrzlina s mamou alebo otcom', desc: 'Romantická zmrzlinová prechádzka — len ty a jeden rodič.',     unlock: { kind: 'level', level: 4 } },
  { id: 'screen-time-bonus', emoji: '📱', title: 'Bonus 1 h obrazovky',          desc: 'Extra hodina TikToku / hier / YouTube — kedykoľvek tento týždeň.', unlock: { kind: 'level', level: 5 } },
  { id: 'cinema-friend',     emoji: '🎬', title: '2× lístky do kina s kamoškou', desc: 'Vyberte si film, ideme do kina! Občerstvenie v cene.',         unlock: { kind: 'level', level: 6 } },
  { id: 'stay-up-late',      emoji: '🌙', title: 'Ponocovanie',                  desc: 'Jeden školský deň môžeš ostať hore o 1 hodinu dlhšie.',        unlock: { kind: 'level', level: 7 } },
  { id: 'new-book',          emoji: '📚', title: 'Nová kniha',                   desc: 'Ideme do kníhkupectva — vyberáš si akúkoľvek knihu.',          unlock: { kind: 'level', level: 8 } },
  { id: 'sushi-night',       emoji: '🍣', title: 'Sushi večera',                 desc: 'Sushi pre celú rodinu — alebo donáška, ako chceš.',            unlock: { kind: 'level', level: 9 } },
  { id: 'manicure',          emoji: '💅', title: 'Manikúra s mamou',             desc: 'Spoločný salón — vyberáš si farbu aj dizajn.',                  unlock: { kind: 'level', level: 10 } },
  { id: 'sleepover',         emoji: '🛌', title: 'Sleepover s kamoškou',         desc: 'Pozvi kamošku, večer pizza + filmy.',                          unlock: { kind: 'level', level: 12 } },
  { id: 'aupark-friend',     emoji: '🛍️', title: 'Aupark deň s kamoškou',        desc: 'Rozpočet 30 € + zmrzlina, mama vás zavezie.',                  unlock: { kind: 'level', level: 14 } },
  { id: 'no-chores-day',     emoji: '🛋️', title: 'Deň bez povinností',           desc: 'Žiadne upratovanie, riad, ani povinnosti — celú jednu sobotu.', unlock: { kind: 'level', level: 16 } },
  { id: 'shopping-budget',   emoji: '💸', title: 'Shopping rozpočet 50 €',       desc: 'Vyber si oblečenie / kozmetiku / čo chceš za 50 €.',           unlock: { kind: 'level', level: 18 } },
  // Easter eggs
  { id: 'breakfast-in-bed',  emoji: '🥐', title: 'Raňajky do postele',           desc: 'Tajná odmena: trénovala si 7 dní v rade!',                     unlock: { kind: 'condition', label: 'Denná séria 7 dní' }, isEgg: true },
  { id: 'unicorn-secret',    emoji: '🦄', title: 'Tajný jednorožec',             desc: 'Tri 100 % testy za sebou — si génius!',                        unlock: { kind: 'condition', label: '3× perfektné skóre po sebe' }, isEgg: true },
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

export function nextRewardForLevel(currentLevel: number): Reward | null {
  const rs = REWARDS.filter((r) => r.unlock.kind === 'level' && r.unlock.level > currentLevel);
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
