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

export default function ReviewPage() {
  const [todayQuestions, setTodayQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Answer | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("questionStats");
    const stats: StatsMap = saved ? JSON.parse(saved) : {};

    const sorted = [...questions].sort((a, b) => {
      const aStats = stats[a.id];
      const bStats = stats[b.id];

      // 未学習問題は「苦手度50%」として扱う
      const aWrongRate =
        aStats && aStats.attempts > 0
          ? aStats.wrong / aStats.attempts
          : 0.5;

      const bWrongRate =
        bStats && bStats.attempts > 0
          ? bStats.wrong / bStats.attempts
          : 0.5;

      return bWrongRate - aWrongRate;
    });

    setTodayQuestions(sorted.slice(0, 10));
  }, []);

  const currentQuestion = todayQuestions[currentIndex];

  const isCorrect =
    selected !== null &&
    currentQuestion !== undefined &&
    selected === currentQuestion.answer;

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

    localStorage.setItem("questionStats", JSON.stringify(stats));

    if (correct) {
      setSessionCorrect((prev) => prev + 1);
    }
  }

  function answerQuestion(answer: Answer) {
    if (!currentQuestion || selected !== null) return;

    const correct = answer === currentQuestion.answer;

    setSelected(answer);
    saveAnswer(currentQuestion.id, correct);
  }

  function goNext() {
    if (currentIndex < todayQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    const total = todayQuestions.length;

    const percentage =
      total > 0
        ? Math.round((sessionCorrect / total) * 100)
        : 0;

    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">

          <p className="text-zinc-400 mb-3">
            🎯 今日の復習
          </p>

          <h1 className="text-4xl font-bold mb-8">
            復習完了！
          </h1>

          <div className="rounded-3xl bg-zinc-900 p-8 mb-6">

            <p className="text-zinc-400 mb-2">
              今回の結果
            </p>

            <p className="text-5xl font-bold mb-3">
              {sessionCorrect} / {total}
            </p>

            <p className="text-xl">
              正答率 {percentage}%
            </p>

          </div>

          <div className="space-y-3">

            <a
              href="/stats"
              className="block w-full rounded-2xl bg-white text-black py-4 font-semibold"
            >
              成績を見る
            </a>

            <a
              href="/"
              className="block w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
            >
              ホームへ戻る
            </a>

          </div>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        読み込み中...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl">

        <div className="flex justify-between text-sm text-zinc-400 mb-3">

          <span>🎯 今日の復習</span>

          <span>
            {currentIndex + 1} / {todayQuestions.length}
          </span>

        </div>

        <p className="text-sm text-zinc-500 mb-3">
          問題 {currentQuestion.id}
        </p>

        <div className="rounded-3xl bg-zinc-900 p-6 mb-6">

          <p className="text-xl leading-8 font-medium">
            {currentQuestion.text}
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">

          <button
            onClick={() => answerQuestion("○")}
            disabled={selected !== null}
            className="rounded-2xl bg-zinc-800 py-6 text-3xl font-bold hover:bg-zinc-700 disabled:opacity-50"
          >
            ○
          </button>

          <button
            onClick={() => answerQuestion("×")}
            disabled={selected !== null}
            className="rounded-2xl bg-zinc-800 py-6 text-3xl font-bold hover:bg-zinc-700 disabled:opacity-50"
          >
            ×
          </button>

        </div>

        {selected && (
          <div className="rounded-3xl bg-zinc-900 p-6">

            <p className="text-2xl font-bold mb-3">
              {isCorrect ? "✅ 正解！" : "❌ 不正解"}
            </p>

            <p className="mb-3">
              正解：{currentQuestion.answer}
            </p>

            <p className="text-zinc-300 leading-7 mb-6">
              {currentQuestion.explanation}
            </p>

            <button
              onClick={goNext}
              className="w-full rounded-2xl bg-white text-black py-4 font-semibold"
            >
              {currentIndex < todayQuestions.length - 1
                ? "次の問題へ"
                : "結果を見る"}
            </button>

          </div>
        )}

      </div>
    </main>
  );
}