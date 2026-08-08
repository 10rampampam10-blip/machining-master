"use client";

import { useState } from "react";
import { questions, Question } from "../data/question";

type Answer = "○" | "×";
type ExamLength = 10 | 20 | 30 | 40;

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
  const [examLength, setExamLength] =
    useState<ExamLength | null>(null);

  const [examQuestions, setExamQuestions] =
    useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<ExamAnswer[]>([]);

  const [finished, setFinished] =
    useState(false);

  // ─────────────────────────────
  // シャッフル
  // ─────────────────────────────

  function shuffleQuestions(list: Question[]) {
    const shuffled = [...list];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    return shuffled;
  }

  // ─────────────────────────────
  // 模擬試験スタート
  // ─────────────────────────────

  function startExam(length: ExamLength) {
    const shuffled =
      shuffleQuestions(questions);

    const selectedQuestions =
      shuffled.slice(0, length);

    setExamLength(length);
    setExamQuestions(selectedQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setFinished(false);
  }

  // ─────────────────────────────
  // 成績保存
  // ─────────────────────────────

  function saveAnswer(
    questionId: number,
    correct: boolean
  ) {
    const saved =
      localStorage.getItem("questionStats");

    let stats: StatsMap = {};

    if (saved) {
      try {
        stats = JSON.parse(saved);
      } catch {
        stats = {};
      }
    }

    const current =
      stats[questionId] ?? {
        attempts: 0,
        correct: 0,
        wrong: 0,
      };

    stats[questionId] = {
      attempts:
        current.attempts + 1,

      correct:
        current.correct +
        (correct ? 1 : 0),

      wrong:
        current.wrong +
        (correct ? 0 : 1),
    };

    localStorage.setItem(
      "questionStats",
      JSON.stringify(stats)
    );
  }

  // ─────────────────────────────
  // 回答
  // ─────────────────────────────

  function answerQuestion(
    selected: Answer
  ) {
    const currentQuestion =
      examQuestions[currentIndex];

    if (!currentQuestion) {
      return;
    }

    const correct =
      selected === currentQuestion.answer;

    const newAnswer: ExamAnswer = {
      question: currentQuestion,
      selected,
      correct,
    };

    const updatedAnswers = [
      ...answers,
      newAnswer,
    ];

    setAnswers(updatedAnswers);

    saveAnswer(
      currentQuestion.id,
      correct
    );

    if (
      currentIndex <
      examQuestions.length - 1
    ) {
      setCurrentIndex(
        (prev) => prev + 1
      );
    } else {
      setFinished(true);
    }
  }

  // ─────────────────────────────
  // 点数の色
  // ─────────────────────────────

  function getScoreColor(
    percentage: number
  ) {
    if (percentage >= 95) {
      return "text-yellow-400";
    }

    if (percentage >= 90) {
      return "text-zinc-300";
    }

    if (percentage >= 85) {
      return "text-amber-600";
    }

    if (percentage >= 80) {
      return "text-blue-400";
    }

    if (percentage >= 70) {
      return "text-green-400";
    }

    return "text-red-400";
  }

  // ─────────────────────────────
  // 点数ランク
  // ─────────────────────────────

  function getScoreRank(
    percentage: number
  ) {
    if (percentage >= 95) {
      return "🥇 GOLD";
    }

    if (percentage >= 90) {
      return "🥈 SILVER";
    }

    if (percentage >= 85) {
      return "🥉 BRONZE";
    }

    if (percentage >= 80) {
      return "BLUE";
    }

    if (percentage >= 70) {
      return "GREEN";
    }

    return "RED";
  }

  // ─────────────────────────────
  // 問題数選択画面
  // ─────────────────────────────

  if (!examLength) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-xl">

          <div className="mb-8 text-center">

            <p className="mb-2 text-sm text-zinc-400">
              📝 模擬試験
            </p>

            <h1 className="mb-3 text-3xl font-bold">
              問題数を選択
            </h1>

            <p className="leading-6 text-zinc-400">
              本番を意識して、
              解説なしで最後まで挑戦しよう。
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() =>
                startExam(10)
              }
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
              onClick={() =>
                startExam(20)
              }
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
              onClick={() =>
                startExam(30)
              }
              className="rounded-3xl bg-zinc-900 p-7 transition hover:scale-105 hover:bg-zinc-800"
            >
              <p className="text-3xl font-bold">
                30
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                問
              </p>
            </button>

            <button
              onClick={() =>
                startExam(40)
              }
              className="rounded-3xl bg-white p-7 text-black transition hover:scale-105"
            >
              <p className="text-3xl font-bold">
                40
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                問
              </p>
            </button>

          </div>

          <div className="mt-6 rounded-2xl bg-zinc-900 p-4">

            <p className="text-sm leading-6 text-zinc-400">
              💡 全597問からランダムに出題します。
              模擬試験中は正解・解説は表示されません。
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

  // ─────────────────────────────
  // 結果画面
  // ─────────────────────────────

  if (finished) {
    const correctCount =
      answers.filter(
        (answer) => answer.correct
      ).length;

    const total =
      examQuestions.length;

    const percentage =
      total > 0
        ? Math.round(
            (correctCount / total) * 100
          )
        : 0;

    const wrongAnswers =
      answers.filter(
        (answer) => !answer.correct
      );

    const scoreColor =
      getScoreColor(percentage);

    const scoreRank =
      getScoreRank(percentage);

    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
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
                {correctCount}
                {" / "}
                {total}
              </p>

              <p className="text-lg text-zinc-400">
                正答率
              </p>

              <p
                className={`mt-1 text-5xl font-black ${scoreColor}`}
              >
                {percentage}%
              </p>

              <div
                className={`mt-5 text-2xl font-bold ${scoreColor}`}
              >
                {scoreRank}
              </div>

              {percentage >= 95 && (
                <p className="mt-3 text-sm text-yellow-400">
                  ✨ 最高ランク達成！
                </p>
              )}

            </div>

          </div>

          {wrongAnswers.length > 0 ? (
            <div className="mb-8">

              <h2 className="mb-4 text-2xl font-bold">
                間違えた問題
              </h2>

              <div className="space-y-4">

                {wrongAnswers.map(
                  (answer) => (
                    <div
                      key={answer.question.id}
                      className="rounded-2xl bg-zinc-900 p-5"
                    >

                      <p className="mb-2 text-sm text-zinc-500">
                        問題{" "}
                        {answer.question.id}
                      </p>

                      <p className="mb-4 leading-7">
                        {answer.question.text}
                      </p>

                      <p className="mb-1">
                        あなたの回答：
                        {answer.selected}
                      </p>

                      <p className="mb-4">
                        正解：
                        {answer.question.answer}
                      </p>

                      <p className="leading-7 text-zinc-300">
                        {answer.question.explanation}
                      </p>

                    </div>
                  )
                )}

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

            <button
              onClick={() =>
                startExam(examLength)
              }
              className="w-full rounded-2xl bg-white py-4 font-semibold text-black"
            >
              同じ問題数でもう一度
            </button>

            <button
              onClick={() => {
                setExamLength(null);
                setExamQuestions([]);
                setCurrentIndex(0);
                setAnswers([]);
                setFinished(false);
              }}
              className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
            >
              問題数を変更
            </button>

            <a
              href="/stats"
              className="block w-full rounded-2xl bg-zinc-800 py-4 text-center font-semibold"
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

  const currentQuestion =
    examQuestions[currentIndex];

  if (!currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        読み込み中...
      </main>
    );
  }

  const progress =
    ((currentIndex + 1) /
      examQuestions.length) *
    100;

  // ─────────────────────────────
  // 模擬試験問題画面
  // ─────────────────────────────

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-xl">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <p className="text-sm text-zinc-400">
              📝 模擬試験
            </p>

            <h1 className="text-2xl font-bold">
              全{examQuestions.length}問
            </h1>

          </div>

          <p className="text-lg font-bold">
            {currentIndex + 1}
            {" / "}
            {examQuestions.length}
          </p>

        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-zinc-800">

          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
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
            onClick={() =>
              answerQuestion("○")
            }
            className="rounded-2xl bg-zinc-800 py-8 text-4xl font-bold transition hover:scale-[1.02] hover:bg-zinc-700"
          >
            ○
          </button>

          <button
            onClick={() =>
              answerQuestion("×")
            }
            className="rounded-2xl bg-zinc-800 py-8 text-4xl font-bold transition hover:scale-[1.02] hover:bg-zinc-700"
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