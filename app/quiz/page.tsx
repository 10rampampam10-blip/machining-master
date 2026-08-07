"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "../data/question";

type Answer = "○" | "×";

type Question = {
  no: number;
  text: string;
  answer: Answer;
  explanation: string;
};

type QuestionStats = {
  attempts: number;
  correct: number;
  wrong: number;
};

type StatsMap = Record<number, QuestionStats>;

 

export default function QuizPage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Answer | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];
  const isCorrect = selected === question.answer;

  function loadStats(): StatsMap {
    const saved = localStorage.getItem("questionStats");

    if (!saved) {
      return {};
    }

    return JSON.parse(saved);
  }

  function saveAnswer(questionNo: number, correct: boolean) {
    const stats = loadStats();

    const currentStats = stats[questionNo] ?? {
      attempts: 0,
      correct: 0,
      wrong: 0,
    };

    const updatedStats: QuestionStats = {
      attempts: currentStats.attempts + 1,
      correct: currentStats.correct + (correct ? 1 : 0),
      wrong: currentStats.wrong + (correct ? 0 : 1),
    };

    stats[questionNo] = updatedStats;

    localStorage.setItem("questionStats", JSON.stringify(stats));
  }

  function answerQuestion(answer: Answer) {
    if (selected !== null) return;

    const correct = answer === question.answer;

    setSelected(answer);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    saveAnswer(question.id, correct);
  }

  function goNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function restartQuiz() {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  const accuracy = Math.round((score / questions.length) * 100);

  if (finished) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">
          <p className="text-zinc-400 mb-3">学習完了</p>

          <h1 className="text-4xl font-bold mb-8">
            おつかれさま！
          </h1>

          <div className="rounded-3xl bg-zinc-900 p-8 mb-6">
            <p className="text-zinc-400 mb-2">
              今回の結果
            </p>

            <p className="text-5xl font-bold mb-3">
              {score} / {questions.length}
            </p>

            <p className="text-xl">
              正答率 {accuracy}%
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={restartQuiz}
              className="w-full rounded-2xl bg-white text-black py-4 font-semibold"
            >
              もう一度挑戦
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
            >
              ホームへ戻る
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl">
        <div className="flex justify-between text-sm text-zinc-400 mb-3">
          <span>問題 {question.id}</span>

          <span>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="rounded-3xl bg-zinc-900 p-6 mb-6">
          <p className="text-xl leading-8 font-medium">
            {question.text}
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
              正解：{question.answer}
            </p>

            <p className="text-zinc-300 leading-7 mb-6">
              {question.explanation}
            </p>

            <button
              onClick={goNext}
              className="w-full rounded-2xl bg-white text-black py-4 font-semibold"
            >
              {currentIndex < questions.length - 1
                ? "次の問題へ"
                : "結果を見る"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}