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
} from './game';

type Subject = 'matematika' | 'slovencina' | 'mix';
type Phase = 'home' | 'quiz' | 'results';

type Answer = {
  question: Question;
  given: string;
  correct: boolean;
};

export default function App() {
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
  const [game, setGame] = useState<GameState>(() => migrateOldStats(loadGame()));
  const [startedAt, setStartedAt] = useState<number>(0);
  const [now, setNow] = useState<number>(0);
  const [award, setAward] = useState<{
    xpGained: number;
    newBadges: BadgeId[];
    leveledUpTo: number | null;
  } | null>(null);
  const [showBadges, setShowBadges] = useState(false);

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
      const result = awardForQuiz(game, {
        total: questions.length,
        correct,
        bestStreakInQuiz,
        mathCorrect,
        slovakCorrect,
      });
      setGame(result.next);
      setAward({
        xpGained: result.xpGained,
        newBadges: result.newBadges,
        leveledUpTo: result.leveledUpTo,
      });
      if (correct === questions.length) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#a855f7', '#6366f1', '#fbbf24', '#10b981'],
        });
      }
      setPhase('results');
    } else {
      setCurrent((c) => c + 1);
      setGiven('');
      setReveal(null);
    }
  }

  if (showBadges) {
    return <BadgesScreen game={game} onBack={() => setShowBadges(false)} />;
  }

  if (phase === 'home') {
    return (
      <Home
        subject={subject}
        setSubject={setSubject}
        count={count}
        setCount={setCount}
        onStart={startQuiz}
        game={game}
        onShowBadges={() => setShowBadges(true)}
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
    />
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full px-3 py-4 sm:px-4 sm:py-8 flex justify-center">
      <div className="w-full max-w-2xl">{children}</div>
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
      ? `${import.meta.env.BASE_URL}images/mascot-cheer.png`
      : variant === 'think'
      ? `${import.meta.env.BASE_URL}images/mascot-think.png`
      : `${import.meta.env.BASE_URL}images/mascot.png`;
  return (
    <img
      src={src}
      alt="Sovička"
      className={`drop-shadow-lg ${className}`}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function LevelBar({ game }: { game: GameState }) {
  const { level, current, needed, pct } = levelProgress(game.xp);
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md shadow-indigo-200/40 p-3 sm:p-4">
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
    </div>
  );
}

function Home(props: {
  subject: Subject;
  setSubject: (s: Subject) => void;
  count: number;
  setCount: (n: number) => void;
  onStart: () => void;
  game: GameState;
  onShowBadges: () => void;
}) {
  const subjects: { id: Subject; label: string; emoji: string }[] = [
    { id: 'mix', label: 'Mix', emoji: '🎯' },
    { id: 'matematika', label: 'Matematika', emoji: '🔢' },
    { id: 'slovencina', label: 'Slovenčina', emoji: '📚' },
  ];

  return (
    <Container>
      <header className="text-center mb-5 sm:mb-8">
        <Mascot className="w-28 h-28 sm:w-32 sm:h-32 mx-auto -mb-2" />
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-indigo-950 leading-tight">
          Prijímačky na 8-ročné gymnázium
        </h1>
        <p className="mt-2 text-sm sm:text-base text-indigo-700/80">
          Tréning testov · slovenčina + matematika · 5. ročník
        </p>
      </header>

      <div className="mb-4">
        <LevelBar game={props.game} />
      </div>

      <section className="bg-white/70 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-4 sm:p-6 mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-indigo-950 mb-3">Vyber predmet</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => props.setSubject(s.id)}
              className={`rounded-2xl p-3 sm:p-4 border-2 transition-all touch-manipulation min-h-[88px] flex flex-col items-center justify-center text-center ${
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
              className={`py-3 rounded-xl font-bold transition-all touch-manipulation ${
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
        onClick={props.onShowBadges}
        className="w-full bg-white/70 backdrop-blur rounded-2xl shadow-md p-4 flex items-center gap-3 active:scale-[0.98] transition-all"
      >
        <div className="text-3xl">🏅</div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-indigo-950">Odznaky a štatistiky</div>
          <div className="text-xs text-indigo-700/70">
            {props.game.badges.length} z {Object.keys(BADGES).length} · najlepšia séria{' '}
            {props.game.bestStreak}
          </div>
        </div>
        <div className="text-indigo-400 text-xl">›</div>
      </button>

      <p className="text-center text-[11px] text-indigo-700/60 mt-6">
        Otázky v štýle prijímačiek z gympaba.sk, gamca.sk, gymlsba.edupage.org
      </p>
    </Container>
  );
}

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
}) {
  const { q, index, total, given, setGiven, reveal, submit, next, elapsedStr, streak } = props;
  const progress = ((index + (reveal ? 1 : 0)) / total) * 100;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (q.type === 'text' && !reveal) {
      // Don't autofocus on mobile (keyboard pops up). Only focus on >=md.
      if (window.matchMedia('(min-width: 768px)').matches) {
        inputRef.current?.focus();
      }
    }
  }, [q.id, q.type, reveal]);

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
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 touch-manipulation ${
                    isAnswer
                      ? 'border-emerald-500 bg-emerald-50'
                      : isWrongPick
                      ? 'border-rose-400 bg-rose-50'
                      : selected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-transparent bg-white active:scale-[0.99]'
                  } ${reveal ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="font-bold text-indigo-700 uppercase shrink-0 w-6">
                    {c.id})
                  </span>
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
                {reveal.correct ? '🎉 Výborne, správne!' : '🤔 Nevadí, skús sa to zapamätať.'}
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

      {/* Sticky action bar on mobile for thumb-reach */}
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

function Results(props: {
  answers: Answer[];
  elapsed: string;
  award: { xpGained: number; newBadges: BadgeId[]; leveledUpTo: number | null } | null;
  game: GameState;
  onAgain: () => void;
}) {
  const correct = props.answers.filter((a) => a.correct).length;
  const total = props.answers.length;
  const pct = Math.round((correct / total) * 100);

  const message = useMemo(() => {
    if (pct === 100) return { emoji: '🏆', text: 'Úžasné! Stopercentne!' };
    if (pct >= 80) return { emoji: '🌟', text: 'Skvelá práca!' };
    if (pct >= 60) return { emoji: '💪', text: 'Dobre, ešte trošku tréningu!' };
    return { emoji: '📚', text: 'Skús ešte raz, naučíš sa to!' };
  }, [pct]);

  return (
    <Container>
      <div className="bg-white/85 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-5 sm:p-8 text-center mb-4">
        <Mascot
          variant={pct >= 80 ? 'cheer' : pct >= 50 ? 'default' : 'think'}
          className="w-28 h-28 sm:w-32 sm:h-32 mx-auto -mb-2"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-950">
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
                  src={`${import.meta.env.BASE_URL}images/level-up.png`}
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

function BadgeChip({ id }: { id: BadgeId }) {
  const b = BADGES[id];
  return (
    <div className="bg-white rounded-2xl p-2 shadow-sm flex items-center gap-2 max-w-full">
      <img
        src={`${import.meta.env.BASE_URL}${b.image.replace(/^\//, '')}`}
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

function BadgesScreen({ game, onBack }: { game: GameState; onBack: () => void }) {
  const all = Object.values(BADGES);
  const avg =
    game.totalQuestions > 0
      ? Math.round((game.totalCorrect / game.totalQuestions) * 100)
      : 0;
  return (
    <Container>
      <button
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-indigo-700 font-medium active:scale-95"
      >
        ← Späť
      </button>
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-4 sm:p-6 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-950 mb-3">Tvoj postup</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <Stat label="Testy" value={`${game.totalQuizzes}`} />
          <Stat label="Najlepšie skóre" value={`${game.bestScore} %`} />
          <Stat label="Priemer" value={`${avg} %`} />
          <Stat label="Najdlhšia séria" value={`${game.bestStreak}`} />
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-indigo-950 mb-3">
          Odznaky ({game.badges.length} / {all.length})
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {all.map((b) => {
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
                  src={`${import.meta.env.BASE_URL}${b.image.replace(/^\//, '')}`}
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
    </Container>
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
