"use client";

import { useEffect, useState } from "react";
import { questions, Question } from "../data/question";

type Answer = "○" | "×";
type SessionLength = 5 | 10 | 20 | "all";

type QuestionStats = {
  attempts: number;
  correct: number;
  wrong: number;
};

type StatsMap = Record<number, QuestionStats>;

function shuffleQuestions(list: Question[]) {
  const shuffled = [...list];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export default function FavoritePage() {
  const [allFavoriteQuestions, setAllFavoriteQuestions] = useState<Question[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [selectedLength, setSelectedLength] = useState<SessionLength | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Answer | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("favoriteQuestions");

    if (!saved) {
      setAllFavoriteQuestions([]);
      setLoaded(true);
      return;
    }

    try {
      const ids: number[] = JSON.parse(saved);

      const filtered = questions.filter((question) =>
        ids.includes(question.id)
      );

      setAllFavoriteQuestions(filtered);
    } catch {
      setAllFavoriteQuestions([]);
    }

    setLoaded(true);
  }, []);

  function startSession(length: SessionLength) {
    if (allFavoriteQuestions.length === 0) {
      return;
    }

    const shuffled = shuffleQuestions(allFavoriteQuestions);

    const actualLength =
      length === "all"
        ? shuffled.length
        : Math.min(length, shuffled.length);

    const pickedQuestions =
      length === "all"
        ? shuffled
        : shuffled.slice(0, actualLength);

    setSelectedLength(length);
    setSessionQuestions(pickedQuestions);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  function saveAnswer(questionId: number, correct: boolean) {
    const saved = localStorage.getItem("questionStats");

    let stats: StatsMap = {};

    if (saved) {
      try {
        stats = JSON.parse(saved);
      } catch {
        stats = {};
      }
    }

    const current = stats[questionId] ?? {
      attempts: 0,
      correct: 0,
      wrong: 0,
    };

    stats[questionId] = {
      attempts: current.attempts + 1,
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
    };

    localStorage.setItem(
      "questionStats",
      JSON.stringify(stats)
    );
  }

  function answerQuestion(answer: Answer) {
    if (selected !== null) return;

    const question = sessionQuestions[currentIndex];

    if (!question) return;

    const correct = answer === question.answer;

    setSelected(answer);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    saveAnswer(question.id, correct);
  }

  function goNext() {
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function removeFavorite(questionId: number) {
    const saved = localStorage.getItem("favoriteQuestions");

    let ids: number[] = [];

    if (saved) {
      try {
        ids = JSON.parse(saved);
      } catch {
        ids = [];
      }
    }

    const updatedIds = ids.filter(
      (id) => id !== questionId
    );

    localStorage.setItem(
      "favoriteQuestions",
      JSON.stringify(updatedIds)
    );

    const updatedAll = allFavoriteQuestions.filter(
      (question) => question.id !== questionId
    );

    setAllFavoriteQuestions(updatedAll);

    const updatedSession = sessionQuestions.filter(
      (question) => question.id !== questionId
    );

    setSessionQuestions(updatedSession);

    if (updatedSession.length === 0) {
      setCurrentIndex(0);
      setSelected(null);
      setFinished(false);
      setSelectedLength(null);
      return;
    }

    if (currentIndex >= updatedSession.length) {
      setCurrentIndex(updatedSession.length - 1);
    }

    setSelected(null);
  }

  function restartSession() {
    if (!selectedLength) return;

    startSession(selectedLength);
  }

  function backToLengthSelection() {
    setSelectedLength(null);
    setSessionQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        読み込み中...
      </main>
    );
  }

  if (allFavoriteQuestions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="w-full max-w-xl text-center">

          <p className="mb-3 text-5xl">
            ☆
          </p>

          <h1 className="mb-3 text-3xl font-bold">
            要復習問題はまだありません
          </h1>

          <p className="mb-8 text-zinc-400">
            通常学習で「☆ 要復習に追加」を押すと、
            ここに問題が追加されます。
          </p>

          <a
            href="/quiz"
            className="block w-full rounded-2xl bg-white py-4 font-semibold text-black"
          >
            通常学習へ
          </a>

          <a
            href="/"
            className="mt-3 block w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            ホームへ戻る
          </a>

        </div>
      </main>
    );
  }

  if (!selectedLength) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-xl">

          <div className="mb-8 text-center">

            <p className="mb-2 text-sm text-zinc-400">
              ★ 要復習問題
            </p>

            <h1 className="mb-3 text-3xl font-bold">
              何問解く？
            </h1>

            <p className="text-zinc-400">
              登録した要復習問題から
              ランダムに出題します。
            </p>

            <p className="mt-3 text-sm font-semibold">
              現在の要復習問題：
              {allFavoriteQuestions.length}問
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() => startSession(5)}
              className="rounded-3xl bg-zinc-900 p-7 transition hover:scale-105 hover:bg-zinc-800"
            >
              <p className="text-3xl font-bold">
                5
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                問
              </p>
            </button>

            <button
              onClick={() => startSession(10)}
              className="rounded-3xl bg-zinc-900 p-7 transition hover:scale-105 hover:bg-zinc-800"
            >
              <p className="text-3xl font-bold">
                10
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                問
              </p>
            </button>

            <button
              onClick={() => startSession(20)}
              className="rounded-3xl bg-zinc-900 p-7 transition hover:scale-105 hover:bg-zinc-800"
            >
              <p className="text-3xl font-bold">
                20
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                問
              </p>
            </button>

            <button
              onClick={() => startSession("all")}
              className="rounded-3xl bg-white p-7 text-black transition hover:scale-105"
            >
              <p className="text-2xl font-bold">
                全問
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                {allFavoriteQuestions.length}問
              </p>
            </button>

          </div>

          <div className="mt-6 rounded-2xl bg-zinc-900 p-4">
            <p className="text-sm leading-6 text-zinc-400">
              💡 選んだ問題数より登録数が少ない場合は、
              登録されている問題をすべて出題します。
            </p>
          </div>

          <a
            href="/"
            className="mt-8 block w-full rounded-2xl bg-zinc-800 py-4 text-center font-semibold"
          >
            ホームへ戻る
          </a>

        </div>
      </main>
    );
  }

  if (sessionQuestions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        読み込み中...
      </main>
    );
  }

  if (finished) {
    const total = sessionQuestions.length;

    const accuracy =
      total > 0
        ? Math.round((score / total) * 100)
        : 0;

    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-white">
        <div className="w-full max-w-xl text-center">

          <p className="mb-2 text-sm text-zinc-400">
            ★ 要復習問題
          </p>

          <h1 className="mb-8 text-4xl font-bold">
            復習完了！
          </h1>

          <div className="mb-6 rounded-3xl bg-zinc-900 p-8">

            <p className="mb-2 text-zinc-400">
              今回の結果
            </p>

            <p className="mb-3 text-5xl font-bold">
              {score} / {total}
            </p>

            <p className="text-xl">
              正答率 {accuracy}%
            </p>

          </div>

          <button
            onClick={restartSession}
            className="block w-full rounded-2xl bg-white py-4 font-semibold text-black"
          >
            同じ問題数でもう一度
          </button>

          <button
            onClick={backToLengthSelection}
            className="mt-3 w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            問題数を変更
          </button>

          <a
            href="/"
            className="mt-3 block w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            ホームへ戻る
          </a>

        </div>
      </main>
    );
  }

  const question = sessionQuestions[currentIndex];

  const isCorrect =
    selected === question.answer;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-white">
      <div className="w-full max-w-xl">

        <div className="mb-2 flex justify-between text-sm text-zinc-400">

          <span>
            ★ 要復習問題
          </span>

          <span>
            {currentIndex + 1} / {sessionQuestions.length}
          </span>

        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-white transition-all"
            style={{
              width: `${
                ((currentIndex + 1) /
                  sessionQuestions.length) *
                100
              }%`,
            }}
          />
        </div>

        <p className="mb-3 text-sm text-zinc-500">
          問題 {question.id}
        </p>

        <div className="mb-4 rounded-3xl bg-zinc-900 p-6">

          <p className="text-xl font-medium leading-8">
            {question.text}
          </p>

        </div>

        <button
          onClick={() =>
            removeFavorite(question.id)
          }
          className="mb-6 w-full rounded-2xl bg-yellow-400 py-3 font-semibold text-black"
        >
          ★ 要復習から外す
        </button>

        <div className="mb-6 grid grid-cols-2 gap-4">

          <button
            onClick={() =>
              answerQuestion("○")
            }
            disabled={selected !== null}
            className="rounded-2xl bg-zinc-800 py-6 text-3xl font-bold hover:bg-zinc-700 disabled:opacity-50"
          >
            ○
          </button>

          <button
            onClick={() =>
              answerQuestion("×")
            }
            disabled={selected !== null}
            className="rounded-2xl bg-zinc-800 py-6 text-3xl font-bold hover:bg-zinc-700 disabled:opacity-50"
          >
            ×
          </button>

        </div>

        {selected && (
          <div className="rounded-3xl bg-zinc-900 p-6">

            <p className="mb-3 text-2xl font-bold">
              {isCorrect
                ? "✅ 正解！"
                : "❌ 不正解"}
            </p>

            <p className="mb-3">
              正解：{question.answer}
            </p>

            <p className="mb-6 leading-7 text-zinc-300">
              {question.explanation}
            </p>

            <button
              onClick={goNext}
              className="w-full rounded-2xl bg-white py-4 font-semibold text-black"
            >
              {currentIndex <
              sessionQuestions.length - 1
                ? "次の問題へ"
                : "結果を見る"}
            </button>

          </div>
        )}

      </div>
    </main>
  );
}
