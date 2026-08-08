"use client";

import { useEffect, useState } from "react";
import { questions, Question } from "../data/question";

type Answer = "○" | "×";

type QuestionStats = {
  attempts: number;
  correct: number;
  wrong: number;
};

type StatsMap = Record<number, QuestionStats>;

export default function FavoritePage() {
  const [favoriteQuestions, setFavoriteQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Answer | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("favoriteQuestions");

    if (!saved) {
      setFavoriteQuestions([]);
      return;
    }

    try {
      const ids: number[] = JSON.parse(saved);

      const filtered = questions.filter((question) =>
        ids.includes(question.id)
      );

      setFavoriteQuestions(filtered);
    } catch {
      setFavoriteQuestions([]);
    }
  }, []);

  function saveAnswer(questionId: number, correct: boolean) {
    const saved = localStorage.getItem("questionStats");

    const stats: StatsMap = saved ? JSON.parse(saved) : {};

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

    const question = favoriteQuestions[currentIndex];

    if (!question) return;

    const correct = answer === question.answer;

    setSelected(answer);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    saveAnswer(question.id, correct);
  }

  function goNext() {
    if (currentIndex < favoriteQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function removeFavorite(questionId: number) {
    const saved = localStorage.getItem("favoriteQuestions");

    const ids: number[] = saved ? JSON.parse(saved) : [];

    const updated = ids.filter((id) => id !== questionId);

    localStorage.setItem(
      "favoriteQuestions",
      JSON.stringify(updated)
    );

    const updatedQuestions = favoriteQuestions.filter(
      (question) => question.id !== questionId
    );

    setFavoriteQuestions(updatedQuestions);

    if (updatedQuestions.length === 0) {
      setCurrentIndex(0);
      setSelected(null);
      return;
    }

    if (currentIndex >= updatedQuestions.length) {
      setCurrentIndex(updatedQuestions.length - 1);
    }

    setSelected(null);
  }

  if (favoriteQuestions.length === 0) {
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

  if (finished) {
    const total = favoriteQuestions.length;

    const accuracy =
      total > 0
        ? Math.round((score / total) * 100)
        : 0;

    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
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

          <a
            href="/favorite"
            className="block w-full rounded-2xl bg-white py-4 font-semibold text-black"
          >
            もう一度解く
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

  const question = favoriteQuestions[currentIndex];

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
            {currentIndex + 1} / {favoriteQuestions.length}
          </span>

        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-white transition-all"
            style={{
              width: `${
                ((currentIndex + 1) /
                  favoriteQuestions.length) *
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
              favoriteQuestions.length - 1
                ? "次の問題へ"
                : "結果を見る"}
            </button>

          </div>
        )}

      </div>
    </main>
  );
}