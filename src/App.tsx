import { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { type Question, pickQuestions, isCorrect } from './questions';
import {
  type GameState,
  type BadgeId,
  BADGES,
  loadGame,
  saveGame,
  migrateOldStats,
  awardForQuiz,
  levelProgress,
  levelFromXp,
  xpForLevel,
} from './game';
import {
  REWARDS,
  type Reward,
  type RewardId,
  unlockedRewardIds,
  nextRewardForLevel,
  readSeenRewards,
  writeSeenRewards,
} from './rewards';

type Subject = 'matematika' | 'slovencina' | 'mix';
type Phase = 'home' | 'quiz' | 'results' | 'progress';

type Answer = { question: Question; given: string; correct: boolean };

type Award = {
  xpGained: number;
  newBadges: BadgeId[];
  leveledUpTo: number | null;
  newRewards: Reward[];
};

const img = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export default function App() {
  const [game, setGame] = useState<GameState>(() => migrateOldStats(loadGame()));
  const [phase, setPhase] = useState<Phase>('home');
  const [subject, setSubject] = useState<Subject>('mix');
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [given, setGiven] = useState('');
  const [reveal, setReveal] = useState<null | { correct: boolean }>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreakInQuiz, setBestStreakInQuiz] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [now, setNow] = useState<number>(0);
  const [award, setAward] = useState<Award | null>(null);

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => {
    if (phase !== 'quiz') return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const elapsed = phase === 'quiz' ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(
    elapsed % 60,
  ).padStart(2, '0')}`;

  function startQuiz() {
    const qs = pickQuestions(subject, count);
    setQuestions(qs);
    setCurrent(0);
    setGiven('');
    setReveal(null);
    setAnswers([]);
    setStreak(0);
    setBestStreakInQuiz(0);
    setStartedAt(Date.now());
    setPhase('quiz');
  }

  function submit() {
    if (reveal) return;
    const q = questions[current];
    if (!given.trim()) return;
    const ok = isCorrect(q, given);
    setReveal({ correct: ok });
    setAnswers((a) => [...a, { question: q, given, correct: ok }]);
    if (ok) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreakInQuiz((b) => Math.max(b, newStreak));
      if (newStreak === 3 || newStreak === 5 || newStreak >= 10) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.4 },
          colors: ['#ec4899', '#a855f7', '#6366f1', '#fbbf24'],
        });
      }
    } else {
      setStreak(0);
    }
  }

  function next() {
    if (current + 1 >= questions.length) {
      const correct = answers.filter((a) => a.correct).length;
      const mathCorrect = answers.filter(
        (a) => a.correct && a.question.subject === 'matematika',
      ).length;
      const slovakCorrect = answers.filter(
        (a) => a.correct && a.question.subject === 'slovencina',
      ).length;

      const before = game;
      const result = awardForQuiz(before, {
        total: questions.length,
        correct,
        bestStreakInQuiz,
        mathCorrect,
        slovakCorrect,
      });

      const seen = readSeenRewards();
      const beforeIds = unlockedRewardIds(before);
      const afterIds = unlockedRewardIds(result.next);
      const newRewards: Reward[] = [];
      for (const r of REWARDS) {
        if (afterIds.has(r.id) && !beforeIds.has(r.id) && !seen.has(r.id)) {
          newRewards.push(r);
          seen.add(r.id);
        }
      }
      writeSeenRewards(seen);

      setGame(result.next);
      setAward({
        xpGained: result.xpGained,
        newBadges: result.newBadges,
        leveledUpTo: result.leveledUpTo,
        newRewards,
      });
      if (correct === questions.length) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#a855f7', '#6366f1', '#fbbf24', '#10b981'],
        });
      }
      if (newRewards.length > 0) {
        setTimeout(
          () =>
            confetti({
              particleCount: 250,
              spread: 120,
              origin: { y: 0.4 },
              colors: ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7'],
            }),
          400,
        );
      }
      setPhase('results');
    } else {
      setCurrent((c) => c + 1);
      setGiven('');
      setReveal(null);
    }
  }

  // Onboarding
  if (!game.name) {
    return (
      <Onboarding onSubmit={(name) => setGame((g) => ({ ...g, name }))} />
    );
  }

  if (phase === 'progress') {
    return <ProgressScreen game={game} onBack={() => setPhase('home')} />;
  }

  if (phase === 'home') {
    return (
      <Home
        subject={subject}
        setSubject={setSubject}
        count={count}
        setCount={setCount}
        onStart={startQuiz}
        onShowProgress={() => setPhase('progress')}
        game={game}
      />
    );
  }

  if (phase === 'results') {
    return (
      <Results
        answers={answers}
        elapsed={elapsedStr}
        award={award}
        game={game}
        onAgain={() => {
          setAward(null);
          setPhase('home');
        }}
      />
    );
  }

  const q = questions[current];
  return (
    <Quiz
      q={q}
      index={current}
      total={questions.length}
      given={given}
      setGiven={setGiven}
      reveal={reveal}
      submit={submit}
      next={next}
      elapsedStr={elapsedStr}
      streak={streak}
      name={game.name}
    />
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] w-full flex justify-center px-3 py-4 sm:px-4 sm:py-6">
      <div className="w-full max-w-2xl flex flex-col">{children}</div>
    </div>
  );
}

function Mascot({
  variant = 'default',
  className = '',
}: {
  variant?: 'default' | 'cheer' | 'think';
  className?: string;
}) {
  const src =
    variant === 'cheer'
      ? img('images/mascot-cheer.png')
      : variant === 'think'
      ? img('images/mascot-think.png')
      : img('images/mascot.png');
  return (
    <img
      src={src}
      alt=""
      className={`drop-shadow-lg ${className}`}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

// ====================== ONBOARDING ======================
function Onboarding({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <Container>
      <div className="text-center pt-6">
        <Mascot className="w-32 h-32 sm:w-40 sm:h-40 mx-auto" />
        <div className="text-xs uppercase font-bold tracking-widest text-pink-600 mt-2">
          Mini Genius akadémia
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-indigo-950 mt-1 leading-tight">
          Vitaj v akadémii!
        </h1>
        <p className="text-indigo-700/80 mt-3">
          Som tvoja sovička-tútorka. Ako sa voláš?
        </p>
      </div>
      <div className="bg-white/85 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-5 sm:p-6 mt-6">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) onSubmit(name.trim());
          }}
          placeholder="napr. Eli"
          maxLength={20}
          className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-200 bg-white text-xl text-center text-indigo-950 focus:border-indigo-500 focus:outline-none"
        />
        <button
          disabled={!name.trim()}
          onClick={() => onSubmit(name.trim())}
          className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 text-white font-bold text-lg shadow-lg shadow-fuchsia-300/40 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          Začnime ✨
        </button>
      </div>
      <p className="text-center text-xs text-indigo-700/60 mt-6">
        Ukáž svoj talent · Trénuj prijímačky · Odomykaj odmeny
      </p>
    </Container>
  );
}

// ====================== HEADER STRIP ======================
function LevelBar({ game, onClick }: { game: GameState; onClick?: () => void }) {
  const { level, current, needed, pct } = levelProgress(game.xp);
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/80 backdrop-blur rounded-2xl shadow-md shadow-indigo-200/40 p-3 sm:p-4 active:scale-[0.99] transition-all"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-pink-500 text-white font-bold shadow-md">
            {level}
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-indigo-950">Level {level}</div>
            <div className="text-xs text-indigo-700/70">
              {game.xp} XP · {current}/{needed} do ďalšieho
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {game.dailyStreak > 0 && (
            <div className="flex items-center gap-1 font-semibold text-orange-600">
              🔥 {game.dailyStreak}d
            </div>
          )}
          <div className="flex items-center gap-1 font-semibold text-indigo-700">
            🏅 {game.badges.length}
          </div>
        </div>
      </div>
      <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}

// ====================== HOME ======================
function Home(props: {
  subject: Subject;
  setSubject: (s: Subject) => void;
  count: number;
  setCount: (n: number) => void;
  onStart: () => void;
  onShowProgress: () => void;
  game: GameState;
}) {
  const subjects: { id: Subject; label: string; emoji: string }[] = [
    { id: 'mix', label: 'Mix', emoji: '🎯' },
    { id: 'matematika', label: 'Matika', emoji: '🔢' },
    { id: 'slovencina', label: 'Slovina', emoji: '📚' },
  ];

  const level = levelFromXp(props.game.xp);
  const next = nextRewardForLevel(level);
  const xpToNext = next && next.unlock.kind === 'level' ? xpForLevel(next.unlock.level) - props.game.xp : 0;
  const greeting = props.game.totalQuizzes === 0
    ? `Ahoj ${props.game.name}! 🌟`
    : props.game.dailyStreak >= 2
    ? `Vitaj späť, ${props.game.name}! 🔥`
    : `Ahoj ${props.game.name}!`;

  return (
    <Container>
      <header className="text-center mb-4">
        <Mascot className="w-24 h-24 sm:w-28 sm:h-28 mx-auto -mb-1" />
        <div className="text-[11px] uppercase font-bold tracking-widest text-pink-600">
          Mini Genius akadémia
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-950 leading-tight mt-0.5">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-indigo-700/80">
          Ukáž svoj talent · Zvládni prijímačky 🎓
        </p>
      </header>

      <div className="mb-3">
        <LevelBar game={props.game} onClick={props.onShowProgress} />
      </div>

      {next && (
        <button
          onClick={props.onShowProgress}
          className="w-full mb-3 bg-gradient-to-r from-amber-50 to-pink-50 border-2 border-amber-200 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] transition-all"
        >
          <div className="text-3xl shrink-0">{next.emoji}</div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wide">
              Ďalšia odmena na leveli {(next.unlock as any).level}
            </div>
            <div className="font-bold text-indigo-950 text-sm truncate">{next.title}</div>
            <div className="text-xs text-indigo-700/70">ešte {xpToNext} XP</div>
          </div>
          <div className="text-amber-600 text-xl">›</div>
        </button>
      )}

      <section className="bg-white/70 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-4 sm:p-6 mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-indigo-950 mb-3">Predmet</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => props.setSubject(s.id)}
              className={`rounded-2xl p-3 sm:p-4 border-2 transition-all min-h-[88px] flex flex-col items-center justify-center text-center ${
                props.subject === s.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]'
                  : 'border-transparent bg-white active:scale-95'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-1">{s.emoji}</div>
              <div className="font-semibold text-indigo-950 text-sm sm:text-base">{s.label}</div>
            </button>
          ))}
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-indigo-950 mt-5 mb-2">
          Počet otázok
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 20].map((n) => (
            <button
              key={n}
              onClick={() => props.setCount(n)}
              className={`py-3 rounded-xl font-bold transition-all ${
                props.count === n
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-indigo-700 active:scale-95'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={props.onStart}
          className="w-full mt-6 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 text-white font-bold text-lg sm:text-xl shadow-lg shadow-fuchsia-300/40 active:scale-[0.98] transition-all"
        >
          ✨ Spustiť tréning
        </button>
      </section>

      <button
        onClick={props.onShowProgress}
        className="w-full bg-white/70 backdrop-blur rounded-2xl shadow-md p-4 flex items-center gap-3 active:scale-[0.99] transition-all"
      >
        <div className="text-3xl">🏆</div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-indigo-950">Levely, odznaky a odmeny</div>
          <div className="text-xs text-indigo-700/70">
            Pozri si, čo všetko môžeš odomknúť
          </div>
        </div>
        <div className="text-indigo-400 text-xl">›</div>
      </button>

      <p className="text-center text-[11px] text-indigo-700/60 mt-5">
        Otázky v štýle prijímačiek na osemročné gymnáziá v BA
      </p>
    </Container>
  );
}

// ====================== QUIZ ======================
function Quiz(props: {
  q: Question;
  index: number;
  total: number;
  given: string;
  setGiven: (s: string) => void;
  reveal: null | { correct: boolean };
  submit: () => void;
  next: () => void;
  elapsedStr: string;
  streak: number;
  name: string;
}) {
  const { q, index, total, given, setGiven, reveal, submit, next, elapsedStr, streak, name } = props;
  const progress = ((index + (reveal ? 1 : 0)) / total) * 100;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (q.type === 'text' && !reveal) {
      if (window.matchMedia('(min-width: 768px)').matches) {
        inputRef.current?.focus();
      }
    }
  }, [q.id, q.type, reveal]);

  const correctMsg = useMemo(() => {
    const opts = [
      `Výborne, ${name}! 🎉`,
      `${name}, ty si génius! ✨`,
      `Bomba, ${name}!`,
      `Skvelé, ${name}! 🌟`,
      `Presne tak, ${name}!`,
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }, [reveal?.correct, q.id]);

  return (
    <Container>
      <div className="flex items-center justify-between mb-3 text-sm font-medium text-indigo-700">
        <span>
          {index + 1} / {total}
        </span>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <span className="font-bold text-orange-600 animate-pulse">🔥 {streak}</span>
          )}
          <span className="font-mono">⏱ {elapsedStr}</span>
        </div>
      </div>
      <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white/85 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
              q.subject === 'matematika'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-pink-100 text-pink-700'
            }`}
          >
            {q.subject === 'matematika' ? '🔢 Matematika' : '📚 Slovenčina'}
          </span>
          <span className="text-[11px] text-indigo-700/60">{q.topic}</span>
        </div>

        <p className="text-base sm:text-lg text-indigo-950 leading-relaxed mb-5 whitespace-pre-wrap">
          {q.prompt}
        </p>

        {q.type === 'choice' && q.choices ? (
          <div className="space-y-2">
            {q.choices.map((c) => {
              const selected = given === c.id;
              const isAnswer = reveal && c.id === q.answer;
              const isWrongPick = reveal && selected && c.id !== q.answer;
              return (
                <button
                  key={c.id}
                  disabled={!!reveal}
                  onClick={() => setGiven(c.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    isAnswer
                      ? 'border-emerald-500 bg-emerald-50'
                      : isWrongPick
                      ? 'border-rose-400 bg-rose-50'
                      : selected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-transparent bg-white active:scale-[0.99]'
                  } ${reveal ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="font-bold text-indigo-700 uppercase shrink-0 w-6">{c.id})</span>
                  <span className="text-indigo-950 flex-1">{c.text}</span>
                  {isAnswer && <span className="text-emerald-600 font-bold">✓</span>}
                  {isWrongPick && <span className="text-rose-500 font-bold">✗</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            ref={inputRef}
            disabled={!!reveal}
            value={given}
            inputMode="text"
            onChange={(e) => setGiven(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (reveal) next();
                else submit();
              }
            }}
            placeholder="Tvoja odpoveď…"
            className="w-full px-4 py-4 rounded-2xl border-2 border-indigo-200 bg-white text-lg text-indigo-950 focus:border-indigo-500 focus:outline-none disabled:opacity-70"
          />
        )}

        {reveal && (
          <div
            className={`mt-4 rounded-2xl p-4 flex gap-3 ${
              reveal.correct
                ? 'bg-emerald-50 border-2 border-emerald-200'
                : 'bg-rose-50 border-2 border-rose-200'
            }`}
          >
            <Mascot
              variant={reveal.correct ? 'cheer' : 'think'}
              className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 self-start"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base sm:text-lg mb-1">
                {reveal.correct ? correctMsg : `Nevadí, ${name}, skús sa to zapamätať. 🤔`}
              </div>
              {!reveal.correct && (
                <div className="text-sm text-indigo-900">
                  Správna odpoveď:{' '}
                  <span className="font-semibold">
                    {q.type === 'choice'
                      ? q.choices?.find((c) => c.id === q.answer)?.text
                      : q.answer}
                  </span>
                </div>
              )}
              {q.explanation && (
                <div className="text-sm text-indigo-800/80 mt-1">💡 {q.explanation}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-3 mt-4">
        {!reveal ? (
          <button
            onClick={submit}
            disabled={!given.trim()}
            className="w-full px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-400/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            Odpovedať
          </button>
        ) : (
          <button
            onClick={next}
            className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold text-lg shadow-lg shadow-fuchsia-300/40 active:scale-[0.98] transition-all"
          >
            {index + 1 >= total ? 'Vidieť výsledky →' : 'Ďalšia otázka →'}
          </button>
        )}
      </div>
    </Container>
  );
}

// ====================== RESULTS ======================
function Results(props: {
  answers: Answer[];
  elapsed: string;
  award: Award | null;
  game: GameState;
  onAgain: () => void;
}) {
  const correct = props.answers.filter((a) => a.correct).length;
  const total = props.answers.length;
  const pct = Math.round((correct / total) * 100);

  const message = useMemo(() => {
    if (pct === 100) return { emoji: '🏆', text: `Úžasné, ${props.game.name}! Stopercentne!` };
    if (pct >= 80) return { emoji: '🌟', text: `Skvelá práca, ${props.game.name}!` };
    if (pct >= 60) return { emoji: '💪', text: `Dobre, ${props.game.name}, ešte trošku tréningu!` };
    return { emoji: '📚', text: `Skús ešte raz, ${props.game.name}, naučíš sa to!` };
  }, [pct, props.game.name]);

  return (
    <Container>
      <div className="bg-white/85 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-5 sm:p-8 text-center mb-4">
        <Mascot
          variant={pct >= 80 ? 'cheer' : pct >= 50 ? 'default' : 'think'}
          className="w-28 h-28 sm:w-32 sm:h-32 mx-auto -mb-2"
        />
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-950">
          {message.emoji} {message.text}
        </h1>
        <div className="mt-4">
          <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">
            {pct} %
          </div>
          <div className="text-indigo-700 mt-1 text-sm sm:text-base">
            {correct} / {total} správne · ⏱ {props.elapsed}
          </div>
        </div>

        {props.award && (
          <div className="mt-5 space-y-2.5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-bold">
              ✨ +{props.award.xpGained} XP
            </div>
            {props.award.leveledUpTo && (
              <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-pink-100 p-4 flex items-center gap-3">
                <img
                  src={img('images/level-up.png')}
                  alt=""
                  className="w-16 h-16"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
                <div className="text-left">
                  <div className="text-xs uppercase font-bold text-amber-700">Level up!</div>
                  <div className="font-black text-lg text-indigo-950">
                    Si na leveli {props.award.leveledUpTo} 🎉
                  </div>
                </div>
              </div>
            )}
            {props.award.newRewards.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-amber-200 via-pink-200 to-indigo-200 p-1">
                <div className="bg-white rounded-[20px] p-4">
                  <div className="text-[11px] uppercase font-bold text-pink-700 tracking-widest">
                    🎁 Nová odmena!
                  </div>
                  {props.award.newRewards.map((r) => (
                    <div key={r.id} className="mt-2 text-left">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{r.emoji}</div>
                        <div className="min-w-0">
                          <div className="font-black text-indigo-950">{r.title}</div>
                          <div className="text-xs text-indigo-700/80">{r.desc}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 rounded-lg px-2 py-1">
                        💌 Povedz mame alebo otcovi — odomkla si vauchera!
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {props.award.newBadges.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-pink-100 to-indigo-100 p-3">
                <div className="text-xs uppercase font-bold text-pink-700 mb-2">Nové odznaky</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {props.award.newBadges.map((id) => (
                    <BadgeChip key={id} id={id} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={props.onAgain}
          className="mt-6 w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold shadow-md active:scale-[0.98] transition-all"
        >
          Ešte raz ✨
        </button>
      </div>

      <section className="bg-white/70 backdrop-blur rounded-3xl shadow-md p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-indigo-950 mb-3">Prehľad odpovedí</h2>
        <ol className="space-y-2.5">
          {props.answers.map((a, i) => (
            <li
              key={i}
              className={`rounded-2xl p-3 sm:p-4 border-2 ${
                a.correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                    a.correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {a.correct ? '✓' : '✗'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-indigo-700/70 mb-0.5">
                    {a.question.subject === 'matematika' ? '🔢' : '📚'} {a.question.topic}
                  </div>
                  <div className="text-indigo-950 font-medium text-sm sm:text-base mb-1">
                    {a.question.prompt}
                  </div>
                  {!a.correct && (
                    <div className="text-sm">
                      <span className="text-rose-700">Tvoja odpoveď: </span>
                      <span className="font-medium text-rose-900">
                        {a.question.type === 'choice'
                          ? a.question.choices?.find((c) => c.id === a.given)?.text || '—'
                          : a.given}
                      </span>
                      <br />
                      <span className="text-emerald-700">Správna odpoveď: </span>
                      <span className="font-medium text-emerald-900">
                        {a.question.type === 'choice'
                          ? a.question.choices?.find((c) => c.id === a.question.answer)?.text
                          : a.question.answer}
                      </span>
                    </div>
                  )}
                  {a.question.explanation && (
                    <div className="text-xs sm:text-sm text-indigo-800/80 mt-1">
                      💡 {a.question.explanation}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
}

// ====================== PROGRESS / LEVELS / REWARDS / BADGES ======================
function ProgressScreen({ game, onBack }: { game: GameState; onBack: () => void }) {
  const [tab, setTab] = useState<'levels' | 'rewards' | 'badges'>('levels');
  const level = levelFromXp(game.xp);
  const allBadges = Object.values(BADGES);
  const unlocked = unlockedRewardIds(game);
  const avg =
    game.totalQuestions > 0 ? Math.round((game.totalCorrect / game.totalQuestions) * 100) : 0;

  return (
    <Container>
      <button
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-indigo-700 font-medium active:scale-95"
      >
        ← Späť
      </button>

      <div className="bg-white/85 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-pink-500 text-white font-black text-2xl shadow-md">
            {level}
          </span>
          <div>
            <div className="text-sm text-indigo-700/70">Si na leveli</div>
            <div className="text-2xl font-black text-indigo-950">{level}</div>
            <div className="text-xs text-indigo-700/70">{game.xp} XP celkovo</div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
          <Stat label="Testy" value={`${game.totalQuizzes}`} />
          <Stat label="Najlepšie" value={`${game.bestScore} %`} />
          <Stat label="Priemer" value={`${avg} %`} />
          <Stat label="Najdlhšia séria" value={`${game.bestStreak}`} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {([
          { id: 'levels', label: 'Levely', emoji: '⭐' },
          { id: 'rewards', label: 'Odmeny', emoji: '🎁' },
          { id: 'badges', label: 'Odznaky', emoji: '🏅' },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-3 rounded-2xl font-bold transition-all ${
              tab === t.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/80 text-indigo-700 active:scale-95'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === 'levels' && <LevelsTab currentLevel={level} currentXp={game.xp} />}
      {tab === 'rewards' && <RewardsTab unlocked={unlocked} currentLevel={level} />}
      {tab === 'badges' && (
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-indigo-950 mb-3">
            Odznaky · {game.badges.length} / {allBadges.length}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {allBadges.map((b) => {
              const earned = game.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl p-3 border-2 flex items-center gap-3 ${
                    earned
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-pink-50'
                      : 'border-indigo-100 bg-white/60 opacity-60'
                  }`}
                >
                  <img
                    src={img(b.image)}
                    alt=""
                    className={`w-14 h-14 shrink-0 ${earned ? '' : 'grayscale'}`}
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-indigo-950 truncate">{b.title}</div>
                    <div className="text-xs text-indigo-700/70">{b.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Container>
  );
}

function LevelsTab({ currentLevel, currentXp }: { currentLevel: number; currentXp: number }) {
  const maxLevel = 20;
  const rows = [];
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    const xpReq = xpForLevel(lvl);
    const reward = REWARDS.find((r) => r.unlock.kind === 'level' && r.unlock.level === lvl);
    const reached = currentLevel >= lvl;
    rows.push(
      <div
        key={lvl}
        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
          lvl === currentLevel
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : reached
            ? 'border-emerald-200 bg-emerald-50/40'
            : 'border-indigo-100 bg-white/60'
        }`}
      >
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-sm shrink-0 ${
            reached
              ? 'bg-gradient-to-br from-amber-300 to-pink-500 text-white shadow'
              : 'bg-indigo-100 text-indigo-400'
          }`}
        >
          {lvl}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-indigo-950">
            Level {lvl}
            {lvl === currentLevel && (
              <span className="ml-2 text-[10px] uppercase font-bold text-indigo-600">si tu</span>
            )}
          </div>
          <div className="text-xs text-indigo-700/70">
            {xpReq} XP {!reached && `(ešte ${xpReq - currentXp})`}
          </div>
        </div>
        {reward ? (
          <div className="text-right shrink-0 max-w-[55%]">
            <div className="text-2xl">{reward.emoji}</div>
            <div className="text-[11px] font-bold text-indigo-950 leading-tight truncate">
              {reward.title}
            </div>
          </div>
        ) : (
          <span className="text-indigo-300 text-xs">+ XP</span>
        )}
      </div>,
    );
  }
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-3 sm:p-4">
      <div className="text-sm text-indigo-700/80 mb-3 px-1">
        Za každú správnu odpoveď ↑ +10 XP. Bonus za sériu (+10 / +25) a za stopercentný test (+50).
      </div>
      <div className="space-y-2">{rows}</div>
    </div>
  );
}

function RewardsTab({
  unlocked,
  currentLevel,
}: {
  unlocked: Set<RewardId>;
  currentLevel: number;
}) {
  const main = REWARDS.filter((r) => !r.isEgg);
  const eggs = REWARDS.filter((r) => r.isEgg);

  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-3 sm:p-4">
        <h2 className="text-base font-semibold text-indigo-950 px-1 mb-2">
          Odmeny · {[...unlocked].filter((id) => !REWARDS.find((r) => r.id === id)?.isEgg).length} /{' '}
          {main.length}
        </h2>
        <div className="space-y-2">
          {main.map((r) => {
            const isUnlocked = unlocked.has(r.id);
            const lvl = (r.unlock as any).level as number;
            return (
              <div
                key={r.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                  isUnlocked
                    ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-pink-50'
                    : 'border-indigo-100 bg-white/60'
                }`}
              >
                <div className={`text-3xl shrink-0 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-indigo-600">
                    Level {lvl}
                    {isUnlocked && (
                      <span className="ml-2 text-emerald-600">✓ odomknuté</span>
                    )}
                  </div>
                  <div
                    className={`font-bold text-sm truncate ${
                      isUnlocked ? 'text-indigo-950' : 'text-indigo-400'
                    }`}
                  >
                    {r.title}
                  </div>
                  <div
                    className={`text-xs ${
                      isUnlocked ? 'text-indigo-700/80' : 'text-indigo-400'
                    }`}
                  >
                    {r.desc}
                  </div>
                </div>
                {!isUnlocked && lvl - currentLevel > 0 && (
                  <div className="text-[11px] text-indigo-400 shrink-0">
                    +{lvl - currentLevel} lvl
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-fuchsia-50 to-indigo-50 rounded-3xl shadow-md p-3 sm:p-4">
        <h2 className="text-base font-semibold text-indigo-950 px-1 mb-2">
          ✨ Tajné odmeny ({[...unlocked].filter((id) => REWARDS.find((r) => r.id === id)?.isEgg).length} / {eggs.length})
        </h2>
        <div className="space-y-2">
          {eggs.map((r) => {
            const isUnlocked = unlocked.has(r.id);
            return (
              <div
                key={r.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
                  isUnlocked
                    ? 'border-fuchsia-300 bg-white'
                    : 'border-indigo-100 bg-white/60'
                }`}
              >
                <div className="text-3xl shrink-0">{isUnlocked ? r.emoji : '❓'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-fuchsia-600">
                    Tajná odmena
                  </div>
                  <div className="font-bold text-sm text-indigo-950">
                    {isUnlocked ? r.title : '???'}
                  </div>
                  <div className="text-xs text-indigo-700/70">
                    {isUnlocked
                      ? r.desc
                      : `Tip: ${(r.unlock as any).label}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BadgeChip({ id }: { id: BadgeId }) {
  const b = BADGES[id];
  return (
    <div className="bg-white rounded-2xl p-2 shadow-sm flex items-center gap-2 max-w-full">
      <img
        src={img(b.image)}
        alt=""
        className="w-10 h-10 shrink-0"
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
      />
      <div className="text-left min-w-0">
        <div className="text-xs font-bold text-indigo-950 truncate">{b.title}</div>
        <div className="text-[10px] text-indigo-700/70 truncate">{b.desc}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl sm:text-2xl font-bold text-indigo-700">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-indigo-700/60 mt-0.5">{label}</div>
    </div>
  );
}
