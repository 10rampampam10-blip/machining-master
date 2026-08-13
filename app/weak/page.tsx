"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions, Question } from "../data/question";

type Answer = "○" | "×";
type SessionLength = 5 | 10 | 20 | "all";

type QuestionStats = {
  attempts: number;
  correct: number;
  wrong: number;
};

type StatsMap = Record<number, QuestionStats>;

function getStats(): StatsMap {
  const saved = localStorage.getItem("questionStats");

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

// ─────────────────────────────
// 本当に間違えた問題だけ取得
// ─────────────────────────────

function getWeakQuestions(stats: StatsMap) {
  return questions.filter((question) => {
    const data = stats[question.id];

    return (
      data &&
      data.attempts > 0 &&
      data.wrong > 0
    );
  });
}

// ─────────────────────────────
// 苦手度
// ─────────────────────────────

function getWeight(
  questionId: number,
  stats: StatsMap
) {
  const data = stats[questionId];

  if (
    !data ||
    data.attempts === 0 ||
    data.wrong === 0
  ) {
    return 0;
  }

  const wrongRate =
    data.wrong / data.attempts;

  // 誤答率を最重要視
  let weight =
    1 + wrongRate * 10;

  // 複数回間違えている問題を
  // 少しだけ優先
  weight +=
    Math.min(data.wrong, 5) * 0.5;

  return weight;
}

// ─────────────────────────────
// 重み付きで1問選ぶ
// ─────────────────────────────

function pickOneWeighted(
  candidates: Question[],
  stats: StatsMap
) {
  const weighted =
    candidates.map((question) => ({
      question,
      weight: getWeight(
        question.id,
        stats
      ),
    }));

  const totalWeight =
    weighted.reduce(
      (sum, item) =>
        sum + item.weight,
      0
    );

  let random =
    Math.random() * totalWeight;

  for (const item of weighted) {
    random -= item.weight;

    if (random <= 0) {
      return item.question;
    }
  }

  return weighted[
    weighted.length - 1
  ].question;
}

// ─────────────────────────────
// 苦手問題セット作成
// 同じ問題は重複しない
// ─────────────────────────────

function createWeakSession(
  length: number,
  stats: StatsMap
) {
  // ★ ここが今回の重要変更
  // 間違えたことがある問題だけ候補にする
  const remaining =
    getWeakQuestions(stats);

  const result: Question[] = [];

  const targetLength =
    Math.min(
      length,
      remaining.length
    );

  while (
    result.length < targetLength &&
    remaining.length > 0
  ) {
    const picked =
      pickOneWeighted(
        remaining,
        stats
      );

    result.push(picked);

    const index =
      remaining.findIndex(
        (question) =>
          question.id ===
          picked.id
      );

    if (index !== -1) {
      remaining.splice(index, 1);
    }
  }

  return result;
}

export default function WeakPage() {
  const router = useRouter();

  const [
    selectedLength,
    setSelectedLength,
  ] =
    useState<SessionLength | null>(
      null
    );

  const [
    sessionQuestions,
    setSessionQuestions,
  ] =
    useState<Question[]>([]);

  const [
    currentIndex,
    setCurrentIndex,
  ] =
    useState(0);

  const [
    selected,
    setSelected,
  ] =
    useState<Answer | null>(null);

  const [
    finished,
    setFinished,
  ] =
    useState(false);

  const [
    sessionCorrect,
    setSessionCorrect,
  ] =
    useState(0);

  const [
    noWeakQuestions,
    setNoWeakQuestions,
  ] =
    useState(false);

  // ─────────────────────────────
  // 苦手学習スタート
  // ─────────────────────────────

  function startSession(
    length: SessionLength
  ) {
    const stats = getStats();

    const weakQuestions =
      getWeakQuestions(stats);

    // 苦手問題が1問もない場合
    if (weakQuestions.length === 0) {
      setNoWeakQuestions(true);
      return;
    }

    const actualLength =
      length === "all"
        ? weakQuestions.length
        : length;

    const pickedQuestions =
      createWeakSession(
        actualLength,
        stats
      );

    setSelectedLength(length);

    setSessionQuestions(
      pickedQuestions
    );

    setCurrentIndex(0);
    setSelected(null);
    setFinished(false);
    setSessionCorrect(0);
    setNoWeakQuestions(false);
  }

  // ─────────────────────────────
  // 成績保存
  // ─────────────────────────────

  function saveAnswer(
    questionId: number,
    correct: boolean
  ) {
    const stats = getStats();

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
    answer: Answer
  ) {
    if (selected !== null) {
      return;
    }

    const question =
      sessionQuestions[
        currentIndex
      ];

    if (!question) {
      return;
    }

    const correct =
      answer === question.answer;

    setSelected(answer);

    saveAnswer(
      question.id,
      correct
    );

    if (correct) {
      setSessionCorrect(
        (prev) => prev + 1
      );
    }
  }

  // ─────────────────────────────
  // 次の問題
  // ─────────────────────────────

  function goNext() {
    if (
      currentIndex >=
      sessionQuestions.length - 1
    ) {
      setFinished(true);
      return;
    }

    setCurrentIndex(
      (prev) => prev + 1
    );

    setSelected(null);
  }

  // ─────────────────────────────
  // 同じ問題数でもう一度
  // ─────────────────────────────

  function restartSession() {
    if (!selectedLength) {
      return;
    }

    startSession(
      selectedLength
    );
  }

  // ─────────────────────────────
  // 問題数選択へ戻る
  // ─────────────────────────────

  function backToLengthSelection() {
    setSelectedLength(null);
    setSessionQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setFinished(false);
    setSessionCorrect(0);
    setNoWeakQuestions(false);
  }

  // ─────────────────────────────
  // 苦手問題なし
  // ─────────────────────────────

  if (noWeakQuestions) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-white">
        <div className="w-full max-w-xl text-center">

          <p className="mb-3 text-zinc-400">
            🎯 苦手克服
          </p>

          <h1 className="mb-4 text-3xl font-bold">
            苦手問題はありません！
          </h1>

          <p className="mb-8 leading-7 text-zinc-400">
            まだ間違えた問題がありません。
            通常学習や模擬試験を進めると、
            間違えた問題がここに追加されます。
          </p>

          <button
            onClick={() =>
              router.push("/quiz")
            }
            className="mb-3 w-full rounded-2xl bg-white py-4 font-semibold text-black"
          >
            通常学習へ
          </button>

          <button
            onClick={() =>
              router.push("/")
            }
            className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            ホームへ戻る
          </button>

        </div>
      </main>
    );
  }

  // ─────────────────────────────
  // 問題数選択画面
  // ─────────────────────────────

  if (!selectedLength) {
    const stats =
      typeof window !== "undefined"
        ? getStats()
        : {};

    const weakCount =
      typeof window !== "undefined"
        ? getWeakQuestions(stats).length
        : 0;

    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">

        <div className="mx-auto w-full max-w-xl">

          <div className="mb-8 text-center">

            <p className="mb-2 text-sm text-zinc-400">
              🎯 苦手克服
            </p>

            <h1 className="mb-3 text-3xl font-bold">
              何問解く？
            </h1>

            <p className="leading-6 text-zinc-400">
              過去に間違えた問題だけを
              優先して復習します。
            </p>

            {weakCount > 0 && (
              <p className="mt-3 text-sm font-semibold text-white">
                現在の苦手問題：
                {weakCount}問
              </p>
            )}

          </div>

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() =>
                startSession(5)
              }
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
              onClick={() =>
                startSession(10)
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
                startSession(20)
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
                startSession("all")
              }
              className="rounded-3xl bg-white p-7 text-black transition hover:scale-105"
            >
              <p className="text-2xl font-bold">
                全問
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                {weakCount}問
              </p>
            </button>

          </div>

          <div className="mt-6 rounded-2xl bg-zinc-900 p-4">

            <p className="text-sm leading-6 text-zinc-400">
              💡 1回以上間違えた問題だけが
              出題対象です。
              その中でも誤答率が高い問題ほど
              優先して出題されます。
            </p>

          </div>

          <button
            onClick={() =>
              router.push("/")
            }
            className="mt-8 w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            ホームへ戻る
          </button>

        </div>

      </main>
    );
  }

  // ─────────────────────────────
  // 読み込み
  // ─────────────────────────────

  if (
    sessionQuestions.length === 0
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        読み込み中...
      </main>
    );
  }

  // ─────────────────────────────
  // 結果画面
  // ─────────────────────────────

  if (finished) {
    const total =
      sessionQuestions.length;

    const accuracy =
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
            🎯 苦手克服
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
              正答率 {accuracy}%
            </p>

          </div>

          <div className="space-y-3">

            <button
              onClick={
                restartSession
              }
              className="w-full rounded-2xl bg-white py-4 font-semibold text-black"
            >
              同じ問題数でもう一度
            </button>

            <button
              onClick={
                backToLengthSelection
              }
              className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
            >
              問題数を変更
            </button>

            <button
              onClick={() =>
                router.push(
                  "/stats"
                )
              }
              className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
            >
              成績を見る
            </button>

            <button
              onClick={() =>
                router.push("/")
              }
              className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
            >
              ホームへ戻る
            </button>

          </div>

        </div>

      </main>
    );
  }

  // ─────────────────────────────
  // 問題画面
  // ─────────────────────────────

  const question =
    sessionQuestions[
      currentIndex
    ];

  const isCorrect =
    selected ===
    question.answer;

  const progress =
    ((currentIndex + 1) /
      sessionQuestions.length) *
    100;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-white">

      <div className="w-full max-w-xl">

        <div className="mb-3 flex justify-between text-sm text-zinc-400">

          <span>
            🎯 苦手克服
          </span>

          <span>
            {currentIndex + 1}
            {" / "}
            {sessionQuestions.length}
          </span>

        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-zinc-800">

          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <p className="mb-3 text-sm text-zinc-500">
          問題 {question.id}
        </p>

        <div className="mb-6 rounded-3xl bg-zinc-900 p-6">

          <p className="text-xl font-medium leading-8">
            {question.text}
          </p>

        </div>

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

        {selected && (
          <div className="rounded-3xl bg-zinc-900 p-6">

            <p className="mb-3 text-2xl font-bold">

              {isCorrect
                ? "✅ 正解！"
                : "❌ 不正解"}

            </p>

            <p className="mb-3">
              正解：
              {question.answer}
            </p>

            <p className="mb-6 leading-7 text-zinc-300">
              {question.explanation}
            </p>

            <button
              onClick={goNext}
              className="w-full rounded-2xl bg-white py-4 font-semibold text-black transition hover:scale-[1.01]"
            >

              {currentIndex <
              sessionQuestions.length -
                1
                ? "次の問題へ"
                : "結果を見る"}

            </button>

          </div>
        )}

      </div>

    </main>
  );
}