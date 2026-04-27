// Otázky pripravené podľa formátu prijímacích skúšok na 8-ročné gymnáziá v Bratislave
// (Gymnázium PaBa, Ladislava Sáru, Metodova, Gamča...). Úroveň 5. ročník ZŠ.

export type Choice = { id: string; text: string };
export type Question = {
  id: string;
  subject: 'matematika' | 'slovencina';
  topic: string;
  prompt: string;
  // Buď výber z možností, alebo otvorená textová odpoveď
  type: 'choice' | 'text';
  choices?: Choice[];
  answer: string; // pre 'choice' = id; pre 'text' = presná odpoveď (porovnáva sa po normalizácii)
  acceptable?: string[]; // alternatívne správne odpovede pre 'text'
  explanation?: string;
};

// ====================== MATEMATIKA ======================
const math: Question[] = [
  {
    id: 'm1',
    subject: 'matematika',
    topic: 'Počítanie spamäti',
    prompt: 'Vypočítaj: 248 + 367',
    type: 'text',
    answer: '615',
    explanation: '248 + 367 = 615',
  },
  {
    id: 'm2',
    subject: 'matematika',
    topic: 'Počítanie spamäti',
    prompt: 'Vypočítaj: 1 000 − 437',
    type: 'text',
    answer: '563',
    explanation: '1000 − 437 = 563',
  },
  {
    id: 'm3',
    subject: 'matematika',
    topic: 'Násobenie',
    prompt: 'Vypočítaj: 24 · 15',
    type: 'text',
    answer: '360',
    explanation: '24 · 15 = 24 · 10 + 24 · 5 = 240 + 120 = 360',
  },
  {
    id: 'm4',
    subject: 'matematika',
    topic: 'Delenie so zvyškom',
    prompt: 'Koľko je 83 : 6? Napíš výsledok v tvare „podiel zvyšok x" (napr. 13 zvyšok 5).',
    type: 'text',
    answer: '13 zvyšok 5',
    acceptable: ['13 zv 5', '13 zv. 5', '13zvysok5', '13 zvysok 5'],
    explanation: '6 · 13 = 78, 83 − 78 = 5. Teda 13 zvyšok 5.',
  },
  {
    id: 'm5',
    subject: 'matematika',
    topic: 'Slovná úloha',
    prompt:
      'V triede je 30 detí. Tretina detí má modré oči, ostatné hnedé. Koľko detí má hnedé oči?',
    type: 'choice',
    choices: [
      { id: 'a', text: '10' },
      { id: 'b', text: '15' },
      { id: 'c', text: '20' },
      { id: 'd', text: '24' },
    ],
    answer: 'c',
    explanation: 'Tretina z 30 je 10 detí s modrými očami, zvyšných 30 − 10 = 20 má hnedé.',
  },
  {
    id: 'm6',
    subject: 'matematika',
    topic: 'Slovná úloha',
    prompt:
      'Otec má 42 rokov, syn má 12 rokov. O koľko rokov bude otec presne 3-krát starší než syn?',
    type: 'text',
    answer: '3',
    explanation:
      'Hľadáme x: 42 + x = 3 · (12 + x). 42 + x = 36 + 3x → 6 = 2x → x = 3 roky.',
  },
  {
    id: 'm7',
    subject: 'matematika',
    topic: 'Zlomky',
    prompt: 'Koľko je 3/4 z 200?',
    type: 'text',
    answer: '150',
    explanation: '200 : 4 = 50, 50 · 3 = 150.',
  },
  {
    id: 'm8',
    subject: 'matematika',
    topic: 'Geometria – obvod',
    prompt:
      'Obdĺžnik má strany 8 cm a 5 cm. Aký je jeho obvod (v cm)?',
    type: 'text',
    answer: '26',
    explanation: 'O = 2·(8+5) = 2·13 = 26 cm.',
  },
  {
    id: 'm9',
    subject: 'matematika',
    topic: 'Geometria – obsah',
    prompt:
      'Štvorec má stranu 7 cm. Aký je jeho obsah (v cm²)?',
    type: 'text',
    answer: '49',
    explanation: 'S = a · a = 7 · 7 = 49 cm².',
  },
  {
    id: 'm10',
    subject: 'matematika',
    topic: 'Jednotky',
    prompt: 'Koľko centimetrov je 2,3 metra?',
    type: 'text',
    answer: '230',
    explanation: '1 m = 100 cm, 2,3 · 100 = 230 cm.',
  },
  {
    id: 'm11',
    subject: 'matematika',
    topic: 'Jednotky času',
    prompt: 'Film trvá 1 hodinu a 25 minút. Koľko je to spolu minút?',
    type: 'text',
    answer: '85',
    explanation: '60 + 25 = 85 minút.',
  },
  {
    id: 'm12',
    subject: 'matematika',
    topic: 'Slovná úloha',
    prompt:
      'V košíku je 5-krát viac jabĺk ako hrušiek. Spolu je tam 36 kusov ovocia. Koľko hrušiek je v košíku?',
    type: 'text',
    answer: '6',
    explanation: 'h + 5h = 36 → 6h = 36 → h = 6 hrušiek.',
  },
  {
    id: 'm13',
    subject: 'matematika',
    topic: 'Logika',
    prompt:
      'Aké číslo nasleduje v rade: 2, 4, 8, 16, 32, … ?',
    type: 'text',
    answer: '64',
    explanation: 'Každé číslo je dvojnásobkom predchádzajúceho.',
  },
  {
    id: 'm14',
    subject: 'matematika',
    topic: 'Logika',
    prompt:
      'Ktoré číslo doplníš? 1, 4, 9, 16, 25, …',
    type: 'text',
    answer: '36',
    explanation: 'Sú to druhé mocniny: 1², 2², 3², 4², 5², 6² = 36.',
  },
  {
    id: 'm15',
    subject: 'matematika',
    topic: 'Desatinné čísla',
    prompt: 'Vypočítaj: 3,5 + 2,75',
    type: 'text',
    answer: '6,25',
    acceptable: ['6.25'],
    explanation: '3,50 + 2,75 = 6,25.',
  },
  {
    id: 'm16',
    subject: 'matematika',
    topic: 'Desatinné čísla',
    prompt: 'Vypočítaj: 12 · 0,5',
    type: 'text',
    answer: '6',
    explanation: '0,5 = polovica, polovica z 12 je 6.',
  },
  {
    id: 'm17',
    subject: 'matematika',
    topic: 'Slovná úloha – nákup',
    prompt:
      'Rožok stojí 0,15 €, mlieko 1,20 €. Koľko zaplatíš za 4 rožky a 2 mlieka?',
    type: 'text',
    answer: '3',
    acceptable: ['3,00', '3,00 €', '3 €', '3.00'],
    explanation: '4 · 0,15 = 0,60 €; 2 · 1,20 = 2,40 €; spolu 3,00 €.',
  },
  {
    id: 'm18',
    subject: 'matematika',
    topic: 'Geometria – uhly',
    prompt:
      'Aký uhol zviera ručička hodín o 15:00 (3 hodiny)?',
    type: 'choice',
    choices: [
      { id: 'a', text: '45°' },
      { id: 'b', text: '60°' },
      { id: 'c', text: '90°' },
      { id: 'd', text: '180°' },
    ],
    answer: 'c',
    explanation: 'Hodinový ciferník má 360°, štvrtina = 90°.',
  },
  {
    id: 'm19',
    subject: 'matematika',
    topic: 'Slovná úloha – pohyb',
    prompt:
      'Cyklista ide rýchlosťou 18 km/h. Koľko kilometrov prejde za 2 a pol hodiny?',
    type: 'text',
    answer: '45',
    explanation: '18 · 2,5 = 45 km.',
  },
  {
    id: 'm20',
    subject: 'matematika',
    topic: 'Slovná úloha – percentá (vstup)',
    prompt:
      'V triede je 25 žiakov a 5 z nich sú dnes chorí. Koľko percent triedy je chorých?',
    type: 'text',
    answer: '20',
    acceptable: ['20%', '20 %'],
    explanation: '5 z 25 = 1/5 = 20 %.',
  },
  {
    id: 'm21',
    subject: 'matematika',
    topic: 'Logika – zámky',
    prompt:
      'Maťo má číselný zámok s tromi číslicami od 0 po 9. Koľko rôznych kombinácií môže nastaviť?',
    type: 'text',
    answer: '1000',
    explanation: '10 · 10 · 10 = 1000 kombinácií (od 000 po 999).',
  },
  {
    id: 'm22',
    subject: 'matematika',
    topic: 'Slovná úloha – delenie',
    prompt:
      'Štyria kamaráti si rovnakým dielom rozdelili 92 €. Koľko € dostane každý?',
    type: 'text',
    answer: '23',
    explanation: '92 : 4 = 23 €.',
  },
  {
    id: 'm23',
    subject: 'matematika',
    topic: 'Slovná úloha – vek',
    prompt:
      'Mama je 4-krát staršia než dcéra. Spolu majú 50 rokov. Koľko rokov má dcéra?',
    type: 'text',
    answer: '10',
    explanation: 'd + 4d = 50 → 5d = 50 → d = 10 rokov.',
  },
  {
    id: 'm24',
    subject: 'matematika',
    topic: 'Geometria – obsah trojuholníka',
    prompt:
      'Trojuholník má základňu 10 cm a výšku 6 cm. Aký je jeho obsah (v cm²)?',
    type: 'text',
    answer: '30',
    explanation: 'S = (a · v) : 2 = (10 · 6) : 2 = 30 cm².',
  },
  {
    id: 'm25',
    subject: 'matematika',
    topic: 'Logika',
    prompt:
      'Anna, Ben a Cyril stoja v rade. Anna nestojí prvá, Cyril nestojí posledný. Ben stojí v strede. V akom poradí stoja?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'Anna, Ben, Cyril' },
      { id: 'b', text: 'Cyril, Ben, Anna' },
      { id: 'c', text: 'Ben, Anna, Cyril' },
      { id: 'd', text: 'Anna, Cyril, Ben' },
    ],
    answer: 'b',
    explanation:
      'Ben je v strede. Anna nemôže byť prvá, takže prvý je Cyril. Posledná je Anna.',
  },
  {
    id: 'm26',
    subject: 'matematika',
    topic: 'Násobenie veľkých čísel',
    prompt: 'Vypočítaj: 125 · 8',
    type: 'text',
    answer: '1000',
    explanation: '125 · 8 = 1000.',
  },
  {
    id: 'm27',
    subject: 'matematika',
    topic: 'Slovná úloha – cesta',
    prompt:
      'Vlak vyšiel zo stanice o 8:45 a do cieľa prišiel o 11:20. Koľko hodín a minút trvala cesta?',
    type: 'text',
    answer: '2 h 35 min',
    acceptable: [
      '2h 35min',
      '2 hodiny 35 minút',
      '2:35',
      '2 hod 35 min',
      '2 h 35 minút',
    ],
    explanation: 'Z 8:45 do 9:00 je 15 min, z 9:00 do 11:20 je 2 h 20 min, spolu 2 h 35 min.',
  },
  {
    id: 'm28',
    subject: 'matematika',
    topic: 'Zaokrúhľovanie',
    prompt:
      'Zaokrúhli číslo 4 873 na stovky.',
    type: 'text',
    answer: '4900',
    acceptable: ['4 900'],
    explanation: 'Číslica desiatok je 7 ⇒ zaokrúhľujeme nahor na 4 900.',
  },
  {
    id: 'm29',
    subject: 'matematika',
    topic: 'Postupnosť',
    prompt: 'Aké číslo doplníš? 100, 91, 82, 73, …',
    type: 'text',
    answer: '64',
    explanation: 'Postupne odčítavame 9: 73 − 9 = 64.',
  },
  {
    id: 'm30',
    subject: 'matematika',
    topic: 'Logika – mince',
    prompt:
      'V peňaženke máš 8 mincí v hodnote 1 € a 2 €, spolu 13 €. Koľko z nich sú dvojeurovky?',
    type: 'text',
    answer: '5',
    explanation:
      'Označme dvojeurovky x. Potom 2x + (8 − x) = 13 → x + 8 = 13 → x = 5.',
  },
];

// ====================== SLOVENČINA ======================
const slovak: Question[] = [
  {
    id: 's1',
    subject: 'slovencina',
    topic: 'Vybrané slová – y/i',
    prompt: 'Doplň správne y/i: „M_š sa skryla do diery."',
    type: 'choice',
    choices: [
      { id: 'a', text: 'Myš (y)' },
      { id: 'b', text: 'Miš (i)' },
    ],
    answer: 'a',
    explanation: '„Myš" patrí medzi vybrané slová po m – píše sa s tvrdým y.',
  },
  {
    id: 's2',
    subject: 'slovencina',
    topic: 'Vybrané slová – y/i',
    prompt: 'Doplň: „Otec b_l doma celý deň."',
    type: 'choice',
    choices: [
      { id: 'a', text: 'byl' },
      { id: 'b', text: 'bol' },
      { id: 'c', text: 'bil' },
    ],
    answer: 'b',
    explanation: '„Bol" – minulý čas slovesa „byť" sa píše s o, nie i/y.',
  },
  {
    id: 's3',
    subject: 'slovencina',
    topic: 'Vybrané slová',
    prompt: 'V ktorej dvojici sa obe slová píšu s tvrdým y?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'm_dlo, b_strý' },
      { id: 'b', text: 'p_šem, l_šaj' },
      { id: 'c', text: 'kr_ť, dob_tok' },
      { id: 'd', text: 'sito, cit' },
    ],
    answer: 'c',
    explanation:
      '„Kryť" aj „dobytok" sú vybrané slová – kr/dob – s y. (Sito a cit sa píšu s i, ale nie sú vybrané slová.)',
  },
  {
    id: 's4',
    subject: 'slovencina',
    topic: 'Slovné druhy',
    prompt: 'Ktoré slovo je podstatné meno?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'rýchlo' },
      { id: 'b', text: 'pekný' },
      { id: 'c', text: 'pero' },
      { id: 'd', text: 'beží' },
    ],
    answer: 'c',
    explanation: '„Pero" je vec – podstatné meno.',
  },
  {
    id: 's5',
    subject: 'slovencina',
    topic: 'Slovné druhy',
    prompt: 'Ktoré slovo je prídavné meno?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'pes' },
      { id: 'b', text: 'malý' },
      { id: 'c', text: 'spí' },
      { id: 'd', text: 'rýchlo' },
    ],
    answer: 'b',
    explanation: '„Malý" vyjadruje vlastnosť – je to prídavné meno.',
  },
  {
    id: 's6',
    subject: 'slovencina',
    topic: 'Slovné druhy',
    prompt: 'Koľko slovies je vo vete: „Janka rada číta knihy a píše príbehy."?',
    type: 'text',
    answer: '2',
    explanation: '„Číta" a „píše" sú slovesá.',
  },
  {
    id: 's7',
    subject: 'slovencina',
    topic: 'Synonymá',
    prompt: 'Vyber synonymum (slovo s rovnakým významom) k slovu „veselý":',
    type: 'choice',
    choices: [
      { id: 'a', text: 'smutný' },
      { id: 'b', text: 'radostný' },
      { id: 'c', text: 'unavený' },
      { id: 'd', text: 'pomalý' },
    ],
    answer: 'b',
    explanation: '„Veselý" a „radostný" majú podobný význam – sú to synonymá.',
  },
  {
    id: 's8',
    subject: 'slovencina',
    topic: 'Antonymá',
    prompt: 'Aké je antonymum (opak) slova „smelý"?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'odvážny' },
      { id: 'b', text: 'bojazlivý' },
      { id: 'c', text: 'silný' },
      { id: 'd', text: 'mladý' },
    ],
    answer: 'b',
    explanation: '„Smelý" znamená odvážny; jeho opakom je „bojazlivý".',
  },
  {
    id: 's9',
    subject: 'slovencina',
    topic: 'Druhy viet',
    prompt:
      'Aký je druh vety: „Choď, prosím, do obchodu."?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'oznamovacia' },
      { id: 'b', text: 'opytovacia' },
      { id: 'c', text: 'rozkazovacia' },
      { id: 'd', text: 'zvolacia' },
    ],
    answer: 'c',
    explanation: 'Veta vyjadruje rozkaz / prosbu – je rozkazovacia.',
  },
  {
    id: 's10',
    subject: 'slovencina',
    topic: 'Pravopis – veľké písmená',
    prompt:
      'V ktorej vete je správne použité veľké písmeno?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'Bývame v meste bratislava.' },
      { id: 'b', text: 'Cez prázdniny sme boli pri Mori.' },
      { id: 'c', text: 'Najdlhšia rieka na Slovensku je Váh.' },
      { id: 'd', text: 'Môj kamarát sa volá peter.' },
    ],
    answer: 'c',
    explanation:
      'Bratislava aj Peter musia mať veľké písmeno; „more" sa píše s malým. Správna je veta o rieke Váh.',
  },
  {
    id: 's11',
    subject: 'slovencina',
    topic: 'Vzory podstatných mien',
    prompt: 'Podľa ktorého vzoru sa skloňuje slovo „kniha"?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'žena' },
      { id: 'b', text: 'ulica' },
      { id: 'c', text: 'dlaň' },
      { id: 'd', text: 'kosť' },
    ],
    answer: 'a',
    explanation: '„Kniha" je ženský rod, vzor „žena" (tvrdé zakončenie).',
  },
  {
    id: 's12',
    subject: 'slovencina',
    topic: 'Vzory – mužský rod',
    prompt: 'Podľa ktorého vzoru sa skloňuje slovo „žiak"?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'dub' },
      { id: 'b', text: 'stroj' },
      { id: 'c', text: 'chlap' },
      { id: 'd', text: 'hrdina' },
    ],
    answer: 'c',
    explanation:
      '„Žiak" je životné podstatné meno mužského rodu, v pluráli „žiaci" (ako „chlapi") — skloňuje sa podľa vzoru „chlap".',
  },
  {
    id: 's13',
    subject: 'slovencina',
    topic: 'Pravopis – i/í, y/ý',
    prompt: 'Doplň správne: „L_pa kvitne v júni."',
    type: 'choice',
    choices: [
      { id: 'a', text: 'Lipa' },
      { id: 'b', text: 'Lypa' },
    ],
    answer: 'a',
    explanation: '„Lipa" sa píše s mäkkým i (po l, ktoré nie je vybrané slovo v tomto prípade).',
  },
  {
    id: 's14',
    subject: 'slovencina',
    topic: 'Skladba vety',
    prompt: 'Ktoré slovo je vo vete podmet? „Malý chlapec spieva peknú pieseň."',
    type: 'choice',
    choices: [
      { id: 'a', text: 'malý' },
      { id: 'b', text: 'chlapec' },
      { id: 'c', text: 'spieva' },
      { id: 'd', text: 'pieseň' },
    ],
    answer: 'b',
    explanation: 'Podmet je ten, kto deje – chlapec (kto spieva?). „Malý" je prívlastok.',
  },
  {
    id: 's15',
    subject: 'slovencina',
    topic: 'Skladba vety',
    prompt: 'Aký vetný člen je slovo „pieseň" vo vete „Chlapec spieva peknú pieseň."?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'podmet' },
      { id: 'b', text: 'prísudok' },
      { id: 'c', text: 'predmet' },
      { id: 'd', text: 'príslovkové určenie' },
    ],
    answer: 'c',
    explanation: 'Spieva (čo?) pieseň – pieseň je predmet.',
  },
  {
    id: 's16',
    subject: 'slovencina',
    topic: 'Literatúra',
    prompt: 'Ako voláme krátky príbeh, v ktorom vystupujú zvieratá a má poučenie na konci?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'rozprávka' },
      { id: 'b', text: 'báseň' },
      { id: 'c', text: 'bájka' },
      { id: 'd', text: 'povesť' },
    ],
    answer: 'c',
    explanation: 'Bájka má zvieracie postavy a mravné ponaučenie.',
  },
  {
    id: 's17',
    subject: 'slovencina',
    topic: 'Literatúra',
    prompt: 'Ako sa nazýva opakovanie hlások na konci veršov v básni?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'rytmus' },
      { id: 'b', text: 'rým' },
      { id: 'c', text: 'sloha' },
      { id: 'd', text: 'verš' },
    ],
    answer: 'b',
    explanation: 'Zvuková zhoda na koncoch veršov sa volá rým.',
  },
  {
    id: 's18',
    subject: 'slovencina',
    topic: 'Pravopis – y/i',
    prompt: 'Doplň: „Včera sme b_l_ na výlete."',
    type: 'choice',
    choices: [
      { id: 'a', text: 'byli' },
      { id: 'b', text: 'boli' },
      { id: 'c', text: 'bili' },
    ],
    answer: 'b',
    explanation: 'Tvar minulého času „byť" v 1. os. množ. čísla = „boli".',
  },
  {
    id: 's19',
    subject: 'slovencina',
    topic: 'Slovné druhy – číslovky',
    prompt: 'Ktoré slovo je číslovka?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'rýchly' },
      { id: 'b', text: 'piaty' },
      { id: 'c', text: 'beží' },
      { id: 'd', text: 'pekne' },
    ],
    answer: 'b',
    explanation: '„Piaty" vyjadruje poradie – je to radová číslovka.',
  },
  {
    id: 's20',
    subject: 'slovencina',
    topic: 'Pravopis – ie/é',
    prompt: 'Ktorá veta je napísaná správne?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'Mám rád biele kvety.' },
      { id: 'b', text: 'Mám rád bielé kvety.' },
      { id: 'c', text: 'Mám rád biéle kvety.' },
    ],
    answer: 'a',
    explanation: 'Prídavné meno „biele" má v prípone „-ie".',
  },
  {
    id: 's21',
    subject: 'slovencina',
    topic: 'Čítanie s porozumením',
    prompt:
      'Prečítaj: „Keď Mirko vyšiel von, slnko práve zapadalo a obloha sa sfarbila do oranžova." Aká bola denná doba?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'ráno' },
      { id: 'b', text: 'poludnie' },
      { id: 'c', text: 'večer' },
      { id: 'd', text: 'noc' },
    ],
    answer: 'c',
    explanation: 'Slnko zapadá pri západe, teda večer.',
  },
  {
    id: 's22',
    subject: 'slovencina',
    topic: 'Slovné druhy',
    prompt: 'Ktoré slovo je príslovka?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'rýchly' },
      { id: 'b', text: 'rýchlo' },
      { id: 'c', text: 'rýchlosť' },
      { id: 'd', text: 'rýchlik' },
    ],
    answer: 'b',
    explanation: '„Rýchlo" odpovedá na otázku „ako?" – je to príslovka.',
  },
  {
    id: 's23',
    subject: 'slovencina',
    topic: 'Pravopis – predložky',
    prompt: 'Ktorá veta je správne napísaná?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'Idem so školy domov.' },
      { id: 'b', text: 'Idem zo školy domov.' },
      { id: 'c', text: 'Idem zoškoly domov.' },
    ],
    answer: 'b',
    explanation: 'Predložka „zo" pred slovami začínajúcimi na s/z; píše sa zvlášť: „zo školy".',
  },
  {
    id: 's24',
    subject: 'slovencina',
    topic: 'Frazeologizmy',
    prompt: 'Čo znamená „mať maslo na hlave"?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'byť veľmi šikovný' },
      { id: 'b', text: 'mať niečo na svedomí, byť vinný' },
      { id: 'c', text: 'byť hladný' },
      { id: 'd', text: 'mať veľa peňazí' },
    ],
    answer: 'b',
    explanation: 'Frazeologizmus znamená, že človek nie je úplne nevinný.',
  },
  {
    id: 's25',
    subject: 'slovencina',
    topic: 'Rody podstatných mien',
    prompt: 'Aký rod má slovo „dievča"?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'mužský' },
      { id: 'b', text: 'ženský' },
      { id: 'c', text: 'stredný' },
    ],
    answer: 'c',
    explanation: 'Slovo „dievča" má v slovenčine stredný rod (vzor „dievča").',
  },
  {
    id: 's26',
    subject: 'slovencina',
    topic: 'Pravopis – ä',
    prompt: 'Ktoré slovo sa píše s ä?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'p_ť (číslovka)' },
      { id: 'b', text: 'l_to (ročné obdobie)' },
      { id: 'c', text: 'p_ro (na písanie)' },
      { id: 'd', text: 'd_ti (kam ísť)' },
    ],
    answer: 'a',
    explanation: '„Päť" sa píše s ä. Ostatné: leto, pero, deti – píšu sa s e.',
  },
  {
    id: 's27',
    subject: 'slovencina',
    topic: 'Časy slovies',
    prompt: 'V akom čase je veta: „Zajtra pôjdeme do divadla."?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'minulý' },
      { id: 'b', text: 'prítomný' },
      { id: 'c', text: 'budúci' },
    ],
    answer: 'c',
    explanation: 'Slovo „zajtra" a tvar „pôjdeme" sú v budúcom čase.',
  },
  {
    id: 's28',
    subject: 'slovencina',
    topic: 'Pravopis – dvojhlásky',
    prompt: 'Ktoré z týchto slov obsahuje dvojhlásku?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'mama' },
      { id: 'b', text: 'kvietok' },
      { id: 'c', text: 'pero' },
      { id: 'd', text: 'sloh' },
    ],
    answer: 'b',
    explanation: '„Kvietok" obsahuje dvojhlásku „ie".',
  },
  {
    id: 's29',
    subject: 'slovencina',
    topic: 'Skladba vety',
    prompt:
      'Vo vete „Naša mačka rada spí na okne." je prísudkom slovo:',
    type: 'choice',
    choices: [
      { id: 'a', text: 'mačka' },
      { id: 'b', text: 'spí' },
      { id: 'c', text: 'rada' },
      { id: 'd', text: 'okne' },
    ],
    answer: 'b',
    explanation: 'Prísudok je sloveso, ktoré vyjadruje, čo podmet robí – „spí".',
  },
  {
    id: 's30',
    subject: 'slovencina',
    topic: 'Pravopis – mäkčene',
    prompt: 'Ktoré slovo je napísané správne?',
    type: 'choice',
    choices: [
      { id: 'a', text: 'dievca' },
      { id: 'b', text: 'dievča' },
      { id: 'c', text: 'dževča' },
    ],
    answer: 'b',
    explanation: 'Správne je „dievča" – po „č" je mäkčeň.',
  },
];

export const allQuestions: Question[] = [...math, ...slovak];

export function pickQuestions(
  subject: 'matematika' | 'slovencina' | 'mix',
  count: number,
): Question[] {
  let pool = allQuestions;
  if (subject !== 'mix') pool = allQuestions.filter((q) => q.subject === subject);
  // Fisher-Yates shuffle
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,/g, '.')
    .replace(/€/g, '')
    .replace(/[.,]$/, '')
    .trim();
}

export function isCorrect(q: Question, given: string): boolean {
  if (q.type === 'choice') return given === q.answer;
  const g = normalizeAnswer(given);
  if (g === normalizeAnswer(q.answer)) return true;
  if (q.acceptable?.some((a) => normalizeAnswer(a) === g)) return true;
  return false;
}
