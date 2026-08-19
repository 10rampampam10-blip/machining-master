"use client";

import { useEffect, useState } from "react";
import {
  questions,
  Question,
  QuestionAnswer,
} from "../data/question";

type Answer = QuestionAnswer;

type QuestionStats = {
  attempts: number;
  correct: number;
  wrong: number;
};

type StatsMap = Record<number, QuestionStats>;

export default function ReviewPage() {
  const [todayQuestions, setTodayQuestions] =
    useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selected, setSelected] =
    useState<Answer | null>(null);

  const [sessionCorrect, setSessionCorrect] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "questionStats"
      );

    let stats: StatsMap = {};

    if (saved) {
      try {
        stats = JSON.parse(saved);
      } catch {
        stats = {};
      }
    }

    const sorted =
      [...questions].sort((a, b) => {
        const aStats =
          stats[a.id];

        const bStats =
          stats[b.id];

        // 未学習問題は「苦手度50%」として扱う
        const aWrongRate =
          aStats &&
          aStats.attempts > 0
            ? aStats.wrong /
              aStats.attempts
            : 0.5;

        const bWrongRate =
          bStats &&
          bStats.attempts > 0
            ? bStats.wrong /
              bStats.attempts
            : 0.5;

        return (
          bWrongRate -
          aWrongRate
        );
      });

    setTodayQuestions(
      sorted.slice(0, 10)
    );

    setLoaded(true);
  }, []);

  const currentQuestion =
    todayQuestions[currentIndex];

  const isCorrect =
    selected !== null &&
    currentQuestion !== undefined &&
    selected ===
      currentQuestion.answer;

  function saveAnswer(
    questionId: number,
    correct: boolean
  ) {
    const saved =
      localStorage.getItem(
        "questionStats"
      );

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

    if (correct) {
      setSessionCorrect(
        (prev) => prev + 1
      );
    }
  }

  function answerQuestion(
    answer: Answer
  ) {
    if (
      !currentQuestion ||
      selected !== null
    ) {
      return;
    }

    const correct =
      answer ===
      currentQuestion.answer;

    setSelected(answer);

    saveAnswer(
      currentQuestion.id,
      correct
    );
  }

  function goNext() {
    if (
      currentIndex <
      todayQuestions.length - 1
    ) {
      setCurrentIndex(
        (prev) => prev + 1
      );

      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        読み込み中...
      </main>
    );
  }

  if (finished) {
    const total =
      todayQuestions.length;

    const percentage =
      total > 0
        ? Math.round(
            (sessionCorrect /
              total) *
              100
          )
        : 0;

    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-white">

        <div className="w-full max-w-xl text-center">

          <p className="mb-3 text-zinc-400">
            🎯 今日の復習
          </p>

          <h1 className="mb-8 text-4xl font-bold">
            復習完了！
          </h1>

          <div className="mb-6 rounded-3xl bg-zinc-900 p-8">

            <p className="mb-2 text-zinc-400">
              今回の結果
            </p>

            <p className="mb-3 text-5xl font-bold">
              {sessionCorrect}
              {" / "}
              {total}
            </p>

            <p className="text-xl">
              正答率 {percentage}%
            </p>

          </div>

          <div className="space-y-3">

            <a
              href="/stats"
              className="block w-full rounded-2xl bg-white py-4 font-semibold text-black"
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        問題がありません
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-white">

      <div className="w-full max-w-xl">

        <div className="mb-3 flex justify-between text-sm text-zinc-400">

          <span>
            🎯 今日の復習
          </span>

          <span>
            {currentIndex + 1}
            {" / "}
            {todayQuestions.length}
          </span>

        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-zinc-800">

          <div
            className="h-full bg-white transition-all duration-500"
            style={{
              width: `${
                ((currentIndex + 1) /
                  todayQuestions.length) *
                100
              }%`,
            }}
          />

        </div>

        <div className="mb-3 flex items-center justify-between gap-3 text-sm text-zinc-500">

          <p>
            問題{" "}
            {
              currentQuestion.sourceQuestionNo
            }
          </p>

          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs">
            {currentQuestion.level}
            {" / "}
            {currentQuestion.type ===
            "truefalse"
              ? "真偽法"
              : "多肢選一"}
          </span>

        </div>

        <div className="mb-4 rounded-3xl bg-zinc-900 p-6">

          <p className="text-xl font-medium leading-8">
            {currentQuestion.text}
          </p>

        </div>

        {currentQuestion.requiresImage && (
          <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">

            <p className="text-sm font-semibold text-amber-200">
              🖼️ この問題は図・記号を使う問題です
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-100/70">
              現在は問題データのみ登録済みです。図画像は後で追加します。
            </p>

          </div>
        )}

        {currentQuestion.type ===
        "truefalse" ? (
          <div className="mb-6 grid grid-cols-2 gap-4">

            <button
              onClick={() =>
                answerQuestion("○")
              }
              disabled={
                selected !== null
              }
              className="rounded-2xl bg-zinc-800 py-6 text-3xl font-bold transition hover:scale-[1.02] hover:bg-zinc-700 disabled:opacity-50"
            >
              ○
            </button>

            <button
              onClick={() =>
                answerQuestion("×")
              }
              disabled={
                selected !== null
              }
              className="rounded-2xl bg-zinc-800 py-6 text-3xl font-bold transition hover:scale-[1.02] hover:bg-zinc-700 disabled:opacity-50"
            >
              ×
            </button>

          </div>
        ) : (
          <div className="mb-6 space-y-3">

            {(
              [
                "イ",
                "ロ",
                "ハ",
                "ニ",
              ] as const
            ).map(
              (choiceKey) => {
                const choiceText =
                  currentQuestion.choices?.[
                    choiceKey
                  ] ?? "";

                return (
                  <button
                    key={choiceKey}
                    onClick={() =>
                      answerQuestion(
                        choiceKey
                      )
                    }
                    disabled={
                      selected !== null
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected ===
                      choiceKey
                        ? choiceKey ===
                          currentQuestion.answer
                          ? "border-green-400 bg-green-400/10"
                          : "border-red-400 bg-red-400/10"
                        : selected !==
                              null &&
                            choiceKey ===
                              currentQuestion.answer
                          ? "border-green-400 bg-green-400/10"
                          : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                    } disabled:cursor-default`}
                  >

                    <div className="flex items-start gap-4">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-lg font-bold">
                        {choiceKey}
                      </span>

                      <span className="pt-1 leading-7 text-zinc-100">
                        {choiceText ||
                          "（図・記号の選択肢）"}
                      </span>

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

        {selected && (
          <div className="rounded-3xl bg-zinc-900 p-6">

            <p className="mb-3 text-2xl font-bold">
              {isCorrect
                ? "✅ 正解！"
                : "❌ 不正解"}
            </p>

            <p className="mb-3">
              正解：
              {
                currentQuestion.answer
              }

              {currentQuestion.type ===
                "choice" &&
                currentQuestion.choices?.[
                  currentQuestion.answer as
                    | "イ"
                    | "ロ"
                    | "ハ"
                    | "ニ"
                ] && (
                  <span className="ml-2 text-zinc-400">
                    {
                      currentQuestion.choices[
                        currentQuestion.answer as
                          | "イ"
                          | "ロ"
                          | "ハ"
                          | "ニ"
                      ]
                    }
                  </span>
                )}
            </p>

            <p className="mb-6 leading-7 text-zinc-300">
              {
                currentQuestion.explanation
              }
            </p>

            <button
              onClick={goNext}
              className="w-full rounded-2xl bg-white py-4 font-semibold text-black"
            >
              {currentIndex <
              todayQuestions.length - 1
                ? "次の問題へ"
                : "結果を見る"}
            </button>

          </div>
        )}

      </div>

    </main>
  );
}
