"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QuestionStats = {
  attempts: number;
  correct: number;
  wrong: number;
};

type StatsMap = Record<number, QuestionStats>;

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsMap>({});

  useEffect(() => {
    const saved = localStorage.getItem("questionStats");

    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  const entries = Object.entries(stats).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  const totalAttempts = entries.reduce(
    (sum, [, value]) => sum + value.attempts,
    0
  );

  const totalCorrect = entries.reduce(
    (sum, [, value]) => sum + value.correct,
    0
  );

  const totalAccuracy =
    totalAttempts === 0
      ? 0
      : Math.round((totalCorrect / totalAttempts) * 100);

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-sm text-zinc-400 mb-2">学習データ</p>

          <h1 className="text-3xl font-bold mb-6">成績</h1>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400 mb-1">
                総回答数
              </p>

              <p className="text-3xl font-bold">
                {totalAttempts}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400 mb-1">
                全体正答率
              </p>

              <p className="text-3xl font-bold">
                {totalAccuracy}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900 p-6 text-zinc-400">
              まだ回答履歴がありません。
            </div>
          ) : (
            entries.map(([questionNo, value]) => {
              const accuracy = Math.round(
                (value.correct / value.attempts) * 100
              );

              return (
                <div
                  key={questionNo}
                  className="rounded-2xl bg-zinc-900 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-semibold">
                      問題 {questionNo}
                    </p>

                    <p className="text-xl font-bold">
                      {accuracy}%
                    </p>
                  </div>

                  <div className="text-sm text-zinc-400 flex gap-4">
                    <span>
                      回答 {value.attempts}回
                    </span>

                    <span>
                      正解 {value.correct}回
                    </span>

                    <span>
                      不正解 {value.wrong}回
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full rounded-2xl bg-white text-black py-4 font-semibold mt-8"
        >
          ホームへ戻る
        </button>
      </div>
    </main>
  );
}