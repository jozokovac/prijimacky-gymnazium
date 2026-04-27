// Prijímačky na 8-ročné gymnáziá v Bratislave 2026:
//   1. termín: pondelok 4. mája 2026
//   2. termín: pondelok 11. mája 2026
// Každá prihláška má 2 voľby (dve školy), takže reálne sú 2 šance v 1. termíne
// + 2 šance v 2. termíne. Cielime na 1. termín.

export const EXAM_DATE_1 = new Date('2026-05-04T08:00:00+02:00');
export const EXAM_DATE_2 = new Date('2026-05-11T08:00:00+02:00');
export const EXAM_DATE = EXAM_DATE_1;

export function daysUntilExam(now: Date = new Date()): number {
  const ms = EXAM_DATE_1.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export function daysUntilSecondRound(now: Date = new Date()): number {
  const ms = EXAM_DATE_2.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export function examCountdownLabel(now: Date = new Date()): string {
  const d = daysUntilExam(now);
  if (d === 0) return 'Dnes sú prijímačky! 🎓';
  if (d === 1) return 'Zajtra sú prijímačky! 🔥';
  if (d <= 7) return `Do prijímačiek ${d === 2 ? '2 dni' : d === 3 ? '3 dni' : d === 4 ? '4 dni' : `${d} dní`} 🔥`;
  if (d < 5) return `Do prijímačiek ${d} dni`;
  return `Do prijímačiek ${d} dní`;
}

export function motivationalLine(now: Date = new Date()): string {
  const d = daysUntilExam(now);
  if (d === 0) return 'Si pripravená — dnes je tvoj deň. Poď ukázať, čo vieš!';
  if (d === 1) return 'Zajtra je veľký deň. Ešte jeden tréning a si pripravená!';
  if (d <= 3) return 'Posledné dni — každý moment tréningu sa teraz počíta. Zvládneš to!';
  if (d <= 7) return 'Posledný týždeň pred prijímačkami — aj 10 minút denne robí veľký rozdiel.';
  if (d <= 14) return 'Ešte máš dva týždne — krok za krokom budeš stále silnejšia.';
  if (d <= 30) return 'Mesiac do prijímačiek — máš dosť času, ak budeš trénovať pravidelne.';
  return 'Začnime postupne — máš ešte dosť času sa pripraviť.';
}
