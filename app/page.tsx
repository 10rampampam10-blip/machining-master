"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8">
          <p className="mb-2 text-sm text-zinc-400">
            技能大会 学科対策
          </p>

          <h1 className="mb-3 text-4xl font-bold">
            仕上げマスター
          </h1>

          <p className="leading-7 text-zinc-400">
            苦手を優先して、効率よく学習しよう。
          </p>
        </div>

        <div className="mb-8 rounded-3xl bg-zinc-900 p-5">
          <p className="mb-1 text-sm text-zinc-400">
            おすすめ
          </p>

          <h2 className="mb-2 text-xl font-bold">
            今日の復習
          </h2>

          <p className="mb-5 text-sm leading-6 text-zinc-400">
            苦手問題や未学習問題から、今日やる10問を自動で選びます。
          </p>

          <a
            href="/review"
            className="block w-full rounded-2xl bg-white py-4 text-center font-semibold text-black"
          >
            今日の10問を始める
          </a>
        </div>

        <div className="space-y-3">
          <a
            href="/quiz"
            className="block w-full rounded-2xl bg-zinc-800 py-4 text-center font-semibold hover:bg-zinc-700"
          >
            通常学習
          </a>

          <a
            href="/weak"
            className="block w-full rounded-2xl bg-zinc-800 py-4 text-center font-semibold hover:bg-zinc-700"
          >
            苦手問題
          </a>

          <a
            href="/exam"
            className="block w-full rounded-2xl bg-zinc-800 py-4 text-center font-semibold hover:bg-zinc-700"
          >
            模擬試験
          </a>

          <a
            href="/stats"
            className="block w-full rounded-2xl bg-zinc-800 py-4 text-center font-semibold hover:bg-zinc-700"
          >
            成績
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          仕上げ作業 学科対策
        </p>
      </div>
    </main>
  );
}