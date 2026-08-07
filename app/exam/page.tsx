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

type ExamAnswer = {
  question: Question;
  selected: Answer;
  correct: boolean;
};

export default function ExamPage() {
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setExamQuestions(shuffled.slice(0, 20));
  }, []);

  const currentQuestion = examQuestions[currentIndex];

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
  }

  function answerQuestion(selected: Answer) {
    if (!currentQuestion) return;

    const correct = selected === currentQuestion.answer;

    const newAnswer: ExamAnswer = {
      question: currentQuestion,
      selected,
      correct,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    saveAnswer(currentQuestion.id, correct);

    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    const correctCount = answers.filter((answer) => answer.correct).length;
    const total = examQuestions.length;

    const percentage =
      total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const wrongAnswers = answers.filter((answer) => !answer.correct);

    return (
      <main className="min-h-screen bg-zinc-950 text-white px-6 py-10">
        <div className="mx-auto w-full max-w-xl">

          <div className="mb-8 text-center">
            <p className="mb-2 text-sm text-zinc-400">
              📝 模擬試験
            </p>

            <h1 className="mb-6 text-4xl font-bold">
              試験終了！
            </h1>

            <div className="rounded-3xl bg-zinc-900 p-8">
              <p className="mb-2 text-zinc-400">
                今回の結果
              </p>

              <p className="mb-3 text-5xl font-bold">
                {correctCount} / {total}
              </p>

              <p className="text-2xl font-bold">
                正答率 {percentage}%
              </p>
            </div>
          </div>

          {wrongAnswers.length > 0 ? (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">
                間違えた問題
              </h2>

              <div className="space-y-4">
                {wrongAnswers.map((answer) => (
                  <div
                    key={answer.question.id}
                    className="rounded-2xl bg-zinc-900 p-5"
                  >
                    <p className="mb-2 text-sm text-zinc-500">
                      問題 {answer.question.id}
                    </p>

                    <p className="mb-4 leading-7">
                      {answer.question.text}
                    </p>

                    <p className="mb-1">
                      あなたの回答：{answer.selected}
                    </p>

                    <p className="mb-4">
                      正解：{answer.question.answer}
                    </p>

                    <p className="leading-7 text-zinc-300">
                      {answer.question.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-8 rounded-3xl bg-zinc-900 p-6 text-center">
              <p className="text-2xl font-bold">
                🎉 全問正解！
              </p>
            </div>
          )}

          <div className="space-y-3">
            <a
              href="/stats"
              className="block w-full rounded-2xl bg-white py-4 text-center font-semibold text-black"
            >
              成績を見る
            </a>

            <a
              href="/"
              className="block w-full rounded-2xl bg-zinc-800 py-4 text-center font-semibold"
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        読み込み中...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">
              📝 模擬試験
            </p>

            <h1 className="text-2xl font-bold">
              全20問
            </h1>
          </div>

          <p className="text-lg font-bold">
            {currentIndex + 1} / {examQuestions.length}
          </p>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-white transition-all"
            style={{
              width: `${
                ((currentIndex + 1) / examQuestions.length) * 100
              }%`,
            }}
          />
        </div>

        <p className="mb-3 text-sm text-zinc-500">
          問題 {currentQuestion.id}
        </p>

        <div className="mb-8 rounded-3xl bg-zinc-900 p-6">
          <p className="text-xl font-medium leading-8">
            {currentQuestion.text}
          </p>
        </div>

        <p className="mb-4 text-center text-sm text-zinc-400">
          正しいと思う方を選択してください
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => answerQuestion("○")}
            className="rounded-2xl bg-zinc-800 py-8 text-4xl font-bold hover:bg-zinc-700"
          >
            ○
          </button>

          <button
            onClick={() => answerQuestion("×")}
            className="rounded-2xl bg-zinc-800 py-8 text-4xl font-bold hover:bg-zinc-700"
          >
            ×
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          模擬試験中は正解・解説を表示しません
        </p>

      </div>
    </main>
  );
}