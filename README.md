# 🎓 Mini Genius — prijímačky na 8-ročné gymnázium

Tréningová appka pre **piataka, ktorý sa pripravuje na prijímacie skúšky** na
osemročné gymnáziá v Bratislave. Postavené pre dcéru, open-sourced pre ostatných
rodičov.

## ▶️ Otvor appku

**🔗 https://jozokovac.github.io/prijimacky-gymnazium/**

Funguje hneď v mobilnom prehliadači. Pre najlepší zážitok ju **pridaj na plochu**
(Safari → Zdieľať → Pridať na plochu / Chrome → ⋮ → Inštalovať appku).
Vtedy bude vyzerať ako fakt-appka a údaje sa nestrácajú.

---

## Čo to robí pre tvoje dieťa

### 220 otázok v štýle reálnych prijímačiek

- **Slovenčina** (110): vybrané slová, slovné druhy, vzory, pravopis, skladba
  vety, druhy viet, časy slovies, synonymá/antonymá, frazeologizmy, literatúra
  (rozprávka, povesť, bájka, rým…), čítanie s porozumením, slabiky, hlásky,
  priama reč, časti slova.
- **Matematika** (110): počty, slovné úlohy (vek, pohyb, nákup, zlomky), desatinné,
  rímske číslice, geometria, jednotky, čas, postupnosti, logika, percentá.

Otázky sú v štýle prijímačiek na Gamča, Gymnázium Jura Hronca, Metodovu, Ladislava
Sáru, PaBa, 1. súkromné gymnázium. Reálny formát prijímačiek je **SJL 35 otázok /
60 min** a **Matematika 20 otázok / 60 min** (overené z `exam.sk`, `egjak.sk`,
gympaba.sk a Metodovej).

### Tri režimy

| Režim | Otázky | Časomiera | Spätná väzba | Účel |
|---|---|---|---|---|
| 🌸 **Tréning** | 5 | žiadna | hneď po každej otázke | učenie |
| ⚡ **Malý test** | 10 | 15 min | až po review | bežný test |
| 🎓 **Veľký test** | 20 | 30 min | až po review | dry-run prijímačiek |

V testoch nevidí odpoveď hneď — najprv ich všetky vyplní, potom dostane **review
screen**, kde si ich môže prekontrolovať a meniť pred odovzdaním. *Učí kontrolovať
si odpovede pred odovzdaním — kľúčová zručnosť pre prijímačky.*

Vo Veľkom teste môže **otázku preskočiť** a vrátiť sa k nej na koniec — taktika,
ktorá nie je intuitívna pre dieťa, ale na ostro pomáha.

Tempo **90 sekúnd na otázku** je trochu rýchlejšie ako reálny test (kde je
priemer 140 s/q). *„Hard in training, easy in life."*

### 🎮 Gamifikácia, ktorá motivuje

- **Onboarding:** pohlavie (👧 / 👦) prepne tému (ružová / modrá), meno
  → personalizované oslovenia („Bomba, Eli!", „Si génius, Adam!").
- **20 levelov, XP** za správne odpovede + bonusy za sériu.
- **Denná séria** (🔥 → 🔥🔥 → 🔥🔥🔥) — pulzuje, keď je v ohrození.
- **Šanca na prijatie** — kalibrovaná na realitu BA gymnázií (~25 prijatých
  z ~250 = base rate **15 %**). Rastie s tréningom, klesá s chybami,
  optimistic-biased ale honest.
- **Live countdown** na 1. termín (4. máj 2026) aj 2. termín (11. máj 2026).
- **🔁 Zopakuj svoje chyby** — appka si pamätá, čo netrafila, a ponúka jej to
  na opakovanie. Otázka opúšťa „chybový pool" až keď ju dá **2× správne za sebou**.
- **10 odznakov** za rôzne úspechy.
- **Konfety** pri sériách 3/5/10 a perfect skóre.

---

## 🎁 Vauchere — reálne odmeny od rodiča

Toto je tá časť, ktorá to robí naozaj motivačné. Voucher = vec, ktorú si dieťa
odomyká **u teba**. Keď príde na výsledkovú obrazovku „odomkla si voucher",
povie ti to a ty ho splníš.

| Level | Voucher |
|---|---|
| 5 | 🍕 Pizza večer (vyberá pizzu pre rodinu) |
| 10 | 🎬 **2× lístky do kina s kamoškou** *(THE BIG ONE)* |
| 15 | 🛍️ Aupark deň s kamoškou (rozpočet 30 €) |
| 20 | 💸 Shopping rozpočet 50 € |

**Prečo iba každý 5. level?** Aby sa dieťa naučilo, že odmena nie je za každú
malichernosť. Levely 2–4, 6–9, 11–14, 16–19 sú **míľniky** — krátke afirmačné
správy bez materiálnej odmeny („Si v hre!", „Glow up", „Diamond mind").
Vnútorná motivácia > sladkosti.

**🥚 Tajné easter eggs** (skryté kým sa neodomknú):
- 🥐 **Raňajky do postele** — trénovala 7 dní v rade
- 🦄 **Tajný jednorožec** — 3× perfektný test po sebe

Tieto upravíš pod seba v `src/rewards.ts` (viď nižšie).

---

## 🛠️ Pre rodičov: ako to nasadiť pre svoje dieťa

### Najjednoduchšie: použi moju verziu

Otvor jej v telefóne **https://jozokovac.github.io/prijimacky-gymnazium/**, pridaj
na plochu, vyplní pohlavie + meno a začnete. Voucherové úrovne sú nastavené
generické (kino, sushi, shopping) — môžeš jej ich len verbálne premenovať
(„u nás je level 10 = výlet na bowling").

### Vlastný build s vlastnými odmenami

Najpoužívanejšia úprava — vauchere podľa tvojej rodiny. Forkni repo a uprav:

#### `src/rewards.ts` — vauchere
Všetky odmeny majú emoji, titulok a popis. Zachovaj 4 vouchery na L5/10/15/20:

```ts
{ id: 'cinema-friend', emoji: '🎬', title: '2× lístky do kina s kamoškou',
  desc: 'Vyberte si film, ideme do kina!', kind: 'voucher',
  unlock: { kind: 'level', level: 10 } },
```

Premeň ich pokojne na: koncert, akvapark, herňa, kníhkupectvo, lego set,
bowling, malovanie keramiky, kreatívny workshop, …

#### `src/exam.ts` — termíny prijímačiek
```ts
export const EXAM_DATE_1 = new Date('2026-05-04T08:00:00+02:00');
export const EXAM_DATE_2 = new Date('2026-05-11T08:00:00+02:00');
```

#### `src/App.tsx` — tempo testov
Hľadaj `MODES`, uprav `secondsPerQ` ak chceš inú náročnosť času.

#### Pridanie vlastných otázok
Vytvor `src/questions-pack-X.ts` (skopíruj formát z existujúcich packov)
a importni v `src/questions.ts`.

### Lokálne spustenie

```bash
bun install
bun dev
# http://localhost:5173
```

### Deploy na vlastný GitHub

```bash
# v vite.config.ts zmeň `repoName` na svoj repo
# potom:
git push
```

GitHub Actions sa o build a deploy postará automaticky (`.github/workflows/deploy.yml`).

---

## 📋 Reálny formát prijímačiek (pre orientáciu)

Z overených zdrojov (PDF Metodovej, exam.sk specifikácia, EGJ Komenského Košice):

- **Slovenský jazyk a literatúra:** 35 otázok, **60 minút**
  - 15× single-choice (zo 4 možností 1 správna)
  - 10× multi-select (zo 4 možností 2–4 správne)
  - 10× otvorená odpoveď
- **Matematika:** 20 otázok, **60 minút**
  - 7× single, 7× multi-select, 6× otvorená
- **Oba testy v ten istý deň** s prestávkou medzi nimi
- **Termíny 2026:** 1. termín 4. máj, 2. termín 11. máj
- **2 voľby na prihláške** = až 4 šance ukázať, čo vie

---

## 🤖 Tech stack (krátko)

Vite + React + TypeScript + Tailwind 4. Postavené pomocou Claude Code,
mascot a odznaky generované cez OpenAI `gpt-image-2`. Hosting GitHub Pages.

Otázky generované 4 paralelnymi AI subagentmi, manuálne overené (rodená
Slovenka mala 14 oprávnených pripomienok k pravopisu, najmä k vzorom 😅).

---

## 📚 Zdroje a inšpirácia

- [Gymnázium PaBa — 8-ročné gymnázium](https://www.gympaba.sk/prijimanie-8-rocne-gymnazium/)
- [Gamča — admission criteria](https://www.gamca.sk/en/entrance-exam/admission-criteria/)
- [Gymnázium Ladislava Sáru — testy](https://gymlsba.edupage.org/a/8-rocne-studium)
- [Gymnázium Metodova — vzorové úlohy](https://gmet.edupage.org/a/vzorove-ulohy-z-prijimacich-skusok)
- [1. súkromné gymnázium BA](https://1sg.sk/prijimacie-konanie-8-rocne-gymnazium/)
- [exam.sk — špecifikácia testov 2024](https://exam.sk/wp-content/uploads/2023/11/Informacie-o-PS-23-24_H_m-1.pdf)
- [EGJ Komenského Košice — reálny test SJL 2025](https://egjak.sk/app/uploads/2025/11/SJL5r-AQ48-2025-test.pdf)

---

## Licencia

MIT. Forkni si to, priprav si dieťa, pošli vám aj pull request s vylepšeniami.

---

*Postavené pre Eli. Good luck na prijímačkách 🌟*
