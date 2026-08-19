"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  questions,
  Question,
  QuestionType,
  QuestionLevel,
} from "../data/question";

type QuestionStats = {
  attempts: number;
  correct: number;
  wrong: number;
};

type StatsMap = Record<number, QuestionStats>;

type Group = {
  id: string;
  name: string;
  icon: string;
  level: QuestionLevel;
  type: QuestionType;
};

const groups: Group[] = [
  {
    id: "level1-truefalse",
    name: "1級 真偽法",
    icon: "⭕",
    level: "1級",
    type: "truefalse",
  },
  {
    id: "level1-choice",
    name: "1級 多肢選一",
    icon: "🔢",
    level: "1級",
    type: "choice",
  },
  {
    id: "level2-truefalse",
    name: "2級 真偽法",
    icon: "⭕",
    level: "2級",
    type: "truefalse",
  },
  {
    id: "level2-choice",
    name: "2級 多肢選一",
    icon: "🔢",
    level: "2級",
    type: "choice",
  },
];

function getQuestionsForGroup(
  group: Group
) {
  return questions.filter(
    (question) =>
      question.level === group.level &&
      question.type === group.type
  );
}

export default function StatsPage() {
  const router = useRouter();

  const [stats, setStats] =
    useState<StatsMap>({});

  const [favoriteCount, setFavoriteCount] =
    useState(0);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    const savedStats =
      localStorage.getItem(
        "questionStats"
      );

    if (savedStats) {
      try {
        setStats(
          JSON.parse(savedStats)
        );
      } catch {
        setStats({});
      }
    }

    const savedFavorites =
      localStorage.getItem(
        "favoriteQuestions"
      );

    if (savedFavorites) {
      try {
        const ids: number[] =
          JSON.parse(
            savedFavorites
          );

        const validIds =
          new Set(
            questions.map(
              (question) =>
                question.id
            )
          );

        setFavoriteCount(
          ids.filter((id) =>
            validIds.has(id)
          ).length
        );
      } catch {
        setFavoriteCount(0);
      }
    }

    setLoaded(true);
  }, []);

  const validQuestionIds =
    useMemo(
      () =>
        new Set(
          questions.map(
            (question) =>
              question.id
          )
        ),
      []
    );

  const entries =
    Object.entries(stats)
      .filter(([id]) =>
        validQuestionIds.has(
          Number(id)
        )
      )
      .sort(
        ([a], [b]) =>
          Number(a) -
          Number(b)
      );

  const totalAttempts =
    entries.reduce(
      (sum, [, value]) =>
        sum +
        value.attempts,
      0
    );

  const totalCorrect =
    entries.reduce(
      (sum, [, value]) =>
        sum +
        value.correct,
      0
    );

  const totalWrong =
    entries.reduce(
      (sum, [, value]) =>
        sum +
        value.wrong,
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
    questions.filter(
      (question) =>
        stats[question.id] &&
        stats[question.id]
          .attempts > 0
    ).length;

  const weakCount =
    questions.filter(
      (question) =>
        stats[question.id] &&
        stats[question.id]
          .attempts > 0 &&
        stats[question.id]
          .wrong > 0
    ).length;

  const totalProgress =
    questions.length > 0
      ? Math.round(
          (studiedQuestions /
            questions.length) *
            100
        )
      : 0;

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

  function getGroupStats(
    group: Group
  ) {
    const groupQuestions =
      getQuestionsForGroup(
        group
      );

    let attempts = 0;
    let correct = 0;
    let studied = 0;

    for (
      const question of
      groupQuestions
    ) {
      const data =
        stats[question.id];

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
      groupQuestions.length;

    const accuracy =
      attempts > 0
        ? Math.round(
            (correct /
              attempts) *
              100
          )
        : null;

    const progress =
      total > 0
        ? Math.round(
            (studied /
              total) *
              100
          )
        : 0;

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
    questions
      .filter(
        (question) => {
          const value =
            stats[
              question.id
            ];

          return (
            value &&
            value.attempts >
              0 &&
            value.wrong >
              0
          );
        }
      )
      .map(
        (question) => {
          const value =
            stats[
              question.id
            ];

          const accuracy =
            Math.round(
              (value.correct /
                value.attempts) *
                100
            );

          return {
            question,
            accuracy,
            wrong:
              value.wrong,
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

        if (
          a.wrong !==
          b.wrong
        ) {
          return (
            b.wrong -
            a.wrong
          );
        }

        return (
          b.attempts -
          a.attempts
        );
      })
      .slice(0, 5);

  function getQuestionById(
    id: number
  ): Question | undefined {
    return questions.find(
      (question) =>
        question.id === id
    );
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        読み込み中...
      </main>
    );
  }

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
            機械加工{questions.length}問の学習状況を確認できます。
          </p>

        </div>

        {/* 全体成績 */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-bold">
            🏭 機械加工
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
                className={`text-3xl font-bold ${
                  totalAttempts > 0
                    ? getAccuracyColor(
                        totalAccuracy
                      )
                    : "text-zinc-600"
                }`}
              >
                {totalAttempts > 0
                  ? `${totalAccuracy}%`
                  : "--"}
              </p>

            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">

              <p className="mb-1 text-sm text-zinc-400">
                学習済み
              </p>

              <p className="text-3xl font-bold">
                {studiedQuestions}

                <span className="ml-1 text-lg text-zinc-500">
                  / {questions.length}
                </span>
              </p>

            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">

              <p className="mb-1 text-sm text-zinc-400">
                苦手問題
              </p>

              <p className="text-3xl font-bold">
                {weakCount}
              </p>

            </div>

          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-zinc-900 p-5">

              <p className="mb-1 text-sm text-zinc-400">
                正解数
              </p>

              <p className="text-2xl font-bold">
                {totalCorrect}
              </p>

            </div>

            <div className="rounded-2xl bg-zinc-900 p-5">

              <p className="mb-1 text-sm text-zinc-400">
                要復習
              </p>

              <p className="text-2xl font-bold">
                {favoriteCount}
              </p>

            </div>

          </div>

          <div className="mt-4 rounded-2xl bg-zinc-900 p-5">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-zinc-400">
                全体学習進捗
              </span>

              <span className="font-semibold">
                {totalProgress}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-700">

              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{
                  width: `${totalProgress}%`,
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

        {/* 級・形式ごとの成績 */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-bold">
            級・形式ごとの成績
          </h2>

          <div className="space-y-3">

            {groups.map(
              (group) => {
                const data =
                  getGroupStats(
                    group
                  );

                return (
                  <div
                    key={
                      group.id
                    }
                    className="rounded-2xl bg-zinc-900 p-5"
                  >

                    <div className="mb-4 flex items-start justify-between gap-3">

                      <div className="flex gap-3">

                        <span className="text-2xl">
                          {
                            group.icon
                          }
                        </span>

                        <div>

                          <p className="font-semibold">
                            {
                              group.name
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
              まだ間違えた問題がありません。
            </div>
          ) : (
            <div className="space-y-3">

              {weakQuestions.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.question.id
                    }
                    className="rounded-2xl bg-zinc-900 p-5"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold">
                          {index + 1}
                        </div>

                        <div className="min-w-0">

                          <p className="font-semibold">
                            問題{" "}
                            {
                              item.question
                                .sourceQuestionNo
                            }
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {
                              item.question
                                .level
                            }
                            {" / "}
                            {item.question
                              .type ===
                            "truefalse"
                              ? "真偽法"
                              : "多肢選一"}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {
                              item.attempts
                            }
                            回回答 /{" "}
                            {
                              item.wrong
                            }
                            回不正解
                          </p>

                        </div>

                      </div>

                      <p
                        className={`shrink-0 text-xl font-bold ${getAccuracyColor(
                          item.accuracy
                        )}`}
                      >
                        {
                          item.accuracy
                        }
                        %
                      </p>

                    </div>

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

            {entries.length ===
            0 ? (
              <div className="rounded-2xl bg-zinc-900 p-6 text-zinc-400">
                まだ回答履歴がありません。
              </div>
            ) : (
              entries.map(
                ([
                  questionId,
                  value,
                ]) => {
                  const id =
                    Number(
                      questionId
                    );

                  const question =
                    getQuestionById(
                      id
                    );

                  if (
                    !question ||
                    value.attempts <=
                      0
                  ) {
                    return null;
                  }

                  const accuracy =
                    Math.round(
                      (value.correct /
                        value.attempts) *
                        100
                    );

                  return (
                    <div
                      key={id}
                      className="rounded-2xl bg-zinc-900 p-5"
                    >

                      <div className="mb-3 flex items-center justify-between gap-3">

                        <div>

                          <p className="text-lg font-semibold">
                            問題{" "}
                            {
                              question.sourceQuestionNo
                            }
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {
                              question.level
                            }
                            {" / "}
                            {question.type ===
                            "truefalse"
                              ? "真偽法"
                              : "多肢選一"}
                          </p>

                        </div>

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

                      <p className="mb-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                        {
                          question.text
                        }
                      </p>

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
