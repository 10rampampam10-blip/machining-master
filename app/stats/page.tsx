"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QuestionStats = {
  attempts: number;
  correct: number;
  wrong: number;
};

type StatsMap = Record<number, QuestionStats>;

type Chapter = {
  id: string;
  name: string;
  icon: string;
  start: number;
  end: number;
};

const chapters: Chapter[] = [
  {
    id: "machine-gears",
    name: "機械要素（ねじ・歯車）",
    icon: "⚙️",
    start: 1,
    end: 62,
  },
  {
    id: "machine-other",
    name: "機械要素（その他の機素）",
    icon: "🔩",
    start: 63,
    end: 116,
  },
  {
    id: "material-1",
    name: "材料（鉄鋼・非鉄・非金属）",
    icon: "🧱",
    start: 117,
    end: 157,
  },
  {
    id: "material-2",
    name: "材料（熱処理・材料試験）",
    icon: "🔥",
    start: 158,
    end: 196,
  },
  {
    id: "strength",
    name: "材料力学",
    icon: "📐",
    start: 197,
    end: 222,
  },
  {
    id: "drawing",
    name: "製図",
    icon: "✏️",
    start: 223,
    end: 265,
  },
  {
    id: "electric",
    name: "電気",
    icon: "⚡",
    start: 266,
    end: 297,
  },
  {
    id: "safety",
    name: "安全衛生",
    icon: "🦺",
    start: 298,
    end: 321,
  },
  {
    id: "oil",
    name: "切削油剤・潤滑",
    icon: "🛢️",
    start: 322,
    end: 363,
  },
  {
    id: "measurement",
    name: "工作測定・品質管理",
    icon: "📏",
    start: 364,
    end: 407,
  },
  {
    id: "hydraulic",
    name: "油圧・空圧",
    icon: "💨",
    start: 408,
    end: 421,
  },
  {
    id: "work-1",
    name: "工作法一般1",
    icon: "🪚",
    start: 422,
    end: 474,
  },
  {
    id: "work-2",
    name: "工作法一般2",
    icon: "🛠️",
    start: 475,
    end: 540,
  },
  {
    id: "work-3",
    name: "工作法一般3",
    icon: "🏭",
    start: 541,
    end: 597,
  },
];

export default function StatsPage() {
  const router = useRouter();

  const [stats, setStats] =
    useState<StatsMap>({});

  useEffect(() => {
    const saved =
      localStorage.getItem("questionStats");

    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch {
        setStats({});
      }
    }
  }, []);

  const entries =
    Object.entries(stats).sort(
      ([a], [b]) =>
        Number(a) - Number(b)
    );

  const totalAttempts =
    entries.reduce(
      (sum, [, value]) =>
        sum + value.attempts,
      0
    );

  const totalCorrect =
    entries.reduce(
      (sum, [, value]) =>
        sum + value.correct,
      0
    );

  const totalWrong =
    entries.reduce(
      (sum, [, value]) =>
        sum + value.wrong,
      0
    );

  const totalAccuracy =
    totalAttempts === 0
      ? 0
      : Math.round(
          (totalCorrect /
            totalAttempts) *
            100
        );

  const studiedQuestions =
    entries.filter(
      ([, value]) =>
        value.attempts > 0
    ).length;

  function getAccuracyColor(
    accuracy: number
  ) {
    if (accuracy >= 90) {
      return "text-green-400";
    }

    if (accuracy >= 80) {
      return "text-blue-400";
    }

    if (accuracy >= 70) {
      return "text-yellow-400";
    }

    return "text-red-400";
  }

  function getChapterStats(
    chapter: Chapter
  ) {
    let attempts = 0;
    let correct = 0;
    let studied = 0;

    for (
      let id = chapter.start;
      id <= chapter.end;
      id++
    ) {
      const data =
        stats[id];

      if (!data) {
        continue;
      }

      attempts +=
        data.attempts;

      correct +=
        data.correct;

      if (
        data.attempts > 0
      ) {
        studied++;
      }
    }

    const total =
      chapter.end -
      chapter.start +
      1;

    const accuracy =
      attempts > 0
        ? Math.round(
            (correct /
              attempts) *
              100
          )
        : null;

    const progress =
      Math.round(
        (studied / total) *
          100
      );

    return {
      attempts,
      correct,
      studied,
      total,
      accuracy,
      progress,
    };
  }

  const weakQuestions =
    entries
      .filter(
        ([, value]) =>
          value.attempts > 0
      )
      .map(
        ([questionNo, value]) => {
          const accuracy =
            Math.round(
              (value.correct /
                value.attempts) *
                100
            );

          return {
            questionNo:
              Number(questionNo),
            accuracy,
            wrong: value.wrong,
            attempts:
              value.attempts,
          };
        }
      )
      .sort((a, b) => {
        if (
          a.accuracy !==
          b.accuracy
        ) {
          return (
            a.accuracy -
            b.accuracy
          );
        }

        return (
          b.attempts -
          a.attempts
        );
      })
      .slice(0, 5);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-xl">

        <div className="mb-8">

          <p className="mb-2 text-sm text-zinc-400">
            学習データ
          </p>

          <h1 className="mb-2 text-3xl font-bold">
            成績
          </h1>

          <p className="text-sm text-zinc-500">
            全体と章ごとの学習状況を確認できます。
          </p>

        </div>

        {/* 全体成績 */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-bold">
            全体成績
          </h2>

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="mb-1 text-sm text-zinc-400">
                総回答数
              </p>

              <p className="text-3xl font-bold">
                {totalAttempts}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="mb-1 text-sm text-zinc-400">
                全体正答率
              </p>

              <p
                className={`text-3xl font-bold ${getAccuracyColor(
                  totalAccuracy
                )}`}
              >
                {totalAccuracy}%
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="mb-1 text-sm text-zinc-400">
                正解数
              </p>

              <p className="text-3xl font-bold">
                {totalCorrect}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="mb-1 text-sm text-zinc-400">
                学習済み
              </p>

              <p className="text-3xl font-bold">
                {studiedQuestions}
                <span className="ml-1 text-lg text-zinc-500">
                  / 597
                </span>
              </p>
            </div>

          </div>

          <div className="mt-4 rounded-2xl bg-zinc-900 p-5">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-zinc-400">
                全体学習進捗
              </span>

              <span className="font-semibold">
                {Math.round(
                  (studiedQuestions /
                    597) *
                    100
                )}
                %
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-700">

              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{
                  width: `${
                    (studiedQuestions /
                      597) *
                    100
                  }%`,
                }}
              />

            </div>

            <div className="mt-3 flex justify-between text-xs text-zinc-500">
              <span>
                正解 {totalCorrect}
              </span>

              <span>
                不正解 {totalWrong}
              </span>
            </div>

          </div>

        </div>

        {/* 章ごとの成績 */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-bold">
            章ごとの成績
          </h2>

          <div className="space-y-3">

            {chapters.map(
              (chapter) => {
                const data =
                  getChapterStats(
                    chapter
                  );

                return (
                  <div
                    key={
                      chapter.id
                    }
                    className="rounded-2xl bg-zinc-900 p-5"
                  >

                    <div className="mb-4 flex items-start justify-between gap-3">

                      <div className="flex gap-3">

                        <span className="text-2xl">
                          {
                            chapter.icon
                          }
                        </span>

                        <div>

                          <p className="font-semibold">
                            {
                              chapter.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {
                              data.studied
                            }
                            /
                            {
                              data.total
                            }
                            問 学習済み
                          </p>

                        </div>

                      </div>

                      <p
                        className={`text-xl font-bold ${
                          data.accuracy !==
                          null
                            ? getAccuracyColor(
                                data.accuracy
                              )
                            : "text-zinc-600"
                        }`}
                      >
                        {data.accuracy !==
                        null
                          ? `${data.accuracy}%`
                          : "--"}
                      </p>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-700">

                      <div
                        className="h-full rounded-full bg-white transition-all duration-700"
                        style={{
                          width: `${data.progress}%`,
                        }}
                      />

                    </div>

                    <div className="mt-2 flex justify-between text-xs text-zinc-500">

                      <span>
                        進捗{" "}
                        {
                          data.progress
                        }
                        %
                      </span>

                      <span>
                        回答{" "}
                        {
                          data.attempts
                        }
                        回
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* 苦手TOP5 */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-bold">
            🎯 苦手TOP5
          </h2>

          {weakQuestions.length ===
          0 ? (
            <div className="rounded-2xl bg-zinc-900 p-6 text-zinc-400">
              まだ回答履歴がありません。
            </div>
          ) : (
            <div className="space-y-3">

              {weakQuestions.map(
                (
                  question,
                  index
                ) => (
                  <div
                    key={
                      question.questionNo
                    }
                    className="flex items-center justify-between rounded-2xl bg-zinc-900 p-5"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 font-bold">
                        {index + 1}
                      </div>

                      <div>

                        <p className="font-semibold">
                          問題{" "}
                          {
                            question.questionNo
                          }
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {
                            question.attempts
                          }
                          回回答 /{" "}
                          {
                            question.wrong
                          }
                          回不正解
                        </p>

                      </div>

                    </div>

                    <p
                      className={`text-xl font-bold ${getAccuracyColor(
                        question.accuracy
                      )}`}
                    >
                      {
                        question.accuracy
                      }
                      %
                    </p>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* 問題別詳細 */}

        <div>

          <h2 className="mb-4 text-xl font-bold">
            問題別詳細
          </h2>

          <div className="space-y-3">

            {entries.length === 0 ? (
              <div className="rounded-2xl bg-zinc-900 p-6 text-zinc-400">
                まだ回答履歴がありません。
              </div>
            ) : (
              entries.map(
                ([
                  questionNo,
                  value,
                ]) => {

                  const accuracy =
                    Math.round(
                      (value.correct /
                        value.attempts) *
                        100
                    );

                  return (
                    <div
                      key={
                        questionNo
                      }
                      className="rounded-2xl bg-zinc-900 p-5"
                    >

                      <div className="mb-3 flex items-center justify-between">

                        <p className="text-lg font-semibold">
                          問題{" "}
                          {
                            questionNo
                          }
                        </p>

                        <p
                          className={`text-xl font-bold ${getAccuracyColor(
                            accuracy
                          )}`}
                        >
                          {
                            accuracy
                          }
                          %
                        </p>

                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">

                        <span>
                          回答{" "}
                          {
                            value.attempts
                          }
                          回
                        </span>

                        <span>
                          正解{" "}
                          {
                            value.correct
                          }
                          回
                        </span>

                        <span>
                          不正解{" "}
                          {
                            value.wrong
                          }
                          回
                        </span>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

        <button
          onClick={() =>
            router.push("/")
          }
          className="mt-8 w-full rounded-2xl bg-white py-4 font-semibold text-black"
        >
          ホームへ戻る
        </button>

      </div>
    </main>
  );
}