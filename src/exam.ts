// Termín prijímačiek na 8-ročné gymnáziá v BA (2026): 4. mája 2026 (1. termín),
// 11. mája 2026 (2. termín). Cielime na prvý termín.

export const EXAM_DATE = new Date('2026-05-04T08:00:00+02:00');

export function daysUntilExam(now: Date = new Date()): number {
  const ms = EXAM_DATE.getTime() - now.getTime();
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
