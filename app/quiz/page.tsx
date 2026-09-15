"use client";

import { useEffect, useState } from "react";
import { questions, Question, QuestionAnswer } from "../data/question";

type Answer = QuestionAnswer;
type StudyMode = "order" | "shuffle";
type QuestionCount = 5 | 10 | 20 | "all";

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
  level?: "1級" | "2級";
  type?: "truefalse" | "choice";
  section?: string;
};

type SectionOption = {
  id: string;
  name: string;
  icon: string;
  section: string;
};

const sections: SectionOption[] = [
  {
    id: "common",
    name: "機械加工",
    icon: "🏭",
    section: "共通問題",
  },
  {
    id: "boring",
    name: "横中ぐり盤 ジグ中ぐり盤",
    icon: "⚙️",
    section: "横中ぐり盤 ジグ中ぐり盤",
  },
  {
    id: "nc-machining",
    name: "NC工作機械 マシニングセンタ",
    icon: "🧭",
    section: "NC工作機械 マシニングセンタ",
  },
];

const chapters: Chapter[] = [
  {
    id: "all",
    name: "全範囲",
    icon: "🎯",
  },
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

function getQuestionsForChapter(
  chapter: Chapter
) {
  if (chapter.id === "all") {
    return questions;
  }

  return questions.filter(
    (question) =>
      question.level === chapter.level &&
      question.type === chapter.type &&
      (!chapter.section ||
        question.section === chapter.section)
  );
}

export default function QuizPage() {
  const [selectedSection, setSelectedSection] =
    useState<SectionOption | null>(null);

  const [selectedChapter, setSelectedChapter] =
    useState<Chapter | null>(null);

  const [studyMode, setStudyMode] =
    useState<StudyMode | null>(null);

  const [questionCount, setQuestionCount] =
    useState<QuestionCount | null>(null);

  const [quizQuestions, setQuizQuestions] =
    useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selected, setSelected] =
    useState<Answer | null>(null);

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [favoriteIds, setFavoriteIds] =
    useState<number[]>([]);

  const [stats, setStats] =
    useState<StatsMap>({});

  const [streak, setStreak] =
    useState(0);

  const [bestStreak, setBestStreak] =
    useState(0);

  const [answerEffect, setAnswerEffect] =
    useState<"correct" | "wrong" | null>(null);

  // ─────────────────────────────
  // 保存データ読み込み
  // ─────────────────────────────

  useEffect(() => {
    const savedFavorites =
      localStorage.getItem("favoriteQuestions");

    if (savedFavorites) {
      try {
        setFavoriteIds(
          JSON.parse(savedFavorites)
        );
      } catch {
        setFavoriteIds([]);
      }
    }

    const savedStats =
      localStorage.getItem("questionStats");

    if (savedStats) {
      try {
        setStats(
          JSON.parse(savedStats)
        );
      } catch {
        setStats({});
      }
    }
  }, []);

  // ─────────────────────────────
  // 章ごとの成績
  // ─────────────────────────────

  function getChapterStats(
    chapter: Chapter
  ) {
    const chapterQuestions =
      getQuestionsForChapter(chapter);

    const studiedQuestions =
      chapterQuestions.filter(
        (question) =>
          stats[question.id] &&
          stats[question.id].attempts > 0
      );

    const attempts =
      chapterQuestions.reduce(
        (total, question) =>
          total +
          (stats[question.id]?.attempts ?? 0),
        0
      );

    const correct =
      chapterQuestions.reduce(
        (total, question) =>
          total +
          (stats[question.id]?.correct ?? 0),
        0
      );

    const accuracy =
      attempts > 0
        ? Math.round(
            (correct / attempts) * 100
          )
        : null;

    return {
      accuracy,
      studied: studiedQuestions.length,
      total: chapterQuestions.length,
    };
  }

  // ─────────────────────────────
  // 章選択
  // ─────────────────────────────

  function selectChapter(
    chapter: Chapter
  ) {
    setSelectedChapter(chapter);
    setStudyMode(null);
    setQuestionCount(null);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
    setAnswerEffect(null);
  }

  function selectStudyMode(
    mode: StudyMode
  ) {
    setStudyMode(mode);

    // 順番に解く場合は、問題数選択を飛ばして
    // 選択した章の全問をそのまま開始する
    if (mode === "order") {
      if (!selectedChapter) {
        return;
      }

      const filtered =
        getQuestionsForChapter(
          selectedChapter
        );

      setQuestionCount("all");
      setQuizQuestions(filtered);
      setCurrentIndex(0);
      setSelected(null);
      setScore(0);
      setFinished(false);
      setStreak(0);
      setBestStreak(0);
      setAnswerEffect(null);

      return;
    }

    // シャッフルのときだけ問題数選択へ進む
    setQuestionCount(null);
  }

  // ─────────────────────────────
  // シャッフル
  // ─────────────────────────────

  function shuffleQuestions(
    list: Question[]
  ) {
    const shuffled = [...list];

    for (
      let i = shuffled.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        shuffled[i],
        shuffled[j],
      ] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    return shuffled;
  }

  // ─────────────────────────────
  // 学習開始
  // ─────────────────────────────

  function startStudy(
    count: QuestionCount
  ) {
    if (
      !selectedChapter ||
      !studyMode
    ) {
      return;
    }

    let filtered =
      getQuestionsForChapter(
        selectedChapter
      );

    if (studyMode === "shuffle") {
      filtered =
        shuffleQuestions(filtered);
    }

    if (count !== "all") {
      filtered =
        filtered.slice(0, count);
    }

    setQuestionCount(count);
    setQuizQuestions(filtered);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
    setAnswerEffect(null);
  }

  // ─────────────────────────────
  // ★ 要復習
  // ─────────────────────────────

  function toggleFavorite(
    questionId: number
  ) {
    setFavoriteIds((prev) => {
      const exists =
        prev.includes(questionId);

      const updated =
        exists
          ? prev.filter(
              (id) =>
                id !== questionId
            )
          : [
              ...prev,
              questionId,
            ];

      localStorage.setItem(
        "favoriteQuestions",
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  // ─────────────────────────────
  // 成績保存
  // ─────────────────────────────

  function saveAnswer(
    questionId: number,
    correct: boolean
  ) {
    const saved =
      localStorage.getItem(
        "questionStats"
      );

    const currentStats: StatsMap =
      saved
        ? JSON.parse(saved)
        : {};

    const current =
      currentStats[questionId] ?? {
        attempts: 0,
        correct: 0,
        wrong: 0,
      };

    currentStats[questionId] = {
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
      JSON.stringify(currentStats)
    );

    // 章一覧の正答率も即更新
    setStats({
      ...currentStats,
    });
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
      quizQuestions[currentIndex];

    if (!question) {
      return;
    }

    const correct =
      answer === question.answer;

    setSelected(answer);

    if (correct) {
      setScore(
        (prev) => prev + 1
      );

      setStreak((prev) => {
        const next =
          prev + 1;

        setBestStreak(
          (best) =>
            Math.max(
              best,
              next
            )
        );

        return next;
      });

      setAnswerEffect(
        "correct"
      );
    } else {
      setStreak(0);

      setAnswerEffect(
        "wrong"
      );
    }

    saveAnswer(
      question.id,
      correct
    );

    setTimeout(() => {
      setAnswerEffect(null);
    }, 650);
  }

  // ─────────────────────────────
  // 次の問題
  // ─────────────────────────────

  function goNext() {
    if (
      currentIndex <
      quizQuestions.length - 1
    ) {
      setCurrentIndex(
        (prev) => prev + 1
      );

      setSelected(null);
      setAnswerEffect(null);
    } else {
      setFinished(true);
    }
  }

  // ─────────────────────────────
  // 各画面へ戻る
  // ─────────────────────────────

  function restartStudy() {
    if (!questionCount) {
      return;
    }

    startStudy(
      questionCount
    );
  }

  function backToCountSelection() {
    setQuestionCount(null);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
  }

  function backToModeSelection() {
    setStudyMode(null);
    setQuestionCount(null);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
  }

  function backToSections() {
    setSelectedSection(null);
    setSelectedChapter(null);
    setStudyMode(null);
    setQuestionCount(null);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
    setAnswerEffect(null);
  }

  function backToChapters() {
    setSelectedChapter(null);
    setStudyMode(null);
    setQuestionCount(null);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
    setAnswerEffect(null);
  }

  // ─────────────────────────────
  // 結果ランク
  // ─────────────────────────────

  function getRank(
    accuracy: number
  ) {
    if (accuracy >= 90) {
      return {
        rank: "S",
        message:
          "完璧クラス！",
      };
    }

    if (accuracy >= 80) {
      return {
        rank: "A",
        message:
          "かなり身についてる！",
      };
    }

    if (accuracy >= 70) {
      return {
        rank: "B",
        message:
          "いい感じ！",
      };
    }

    if (accuracy >= 60) {
      return {
        rank: "C",
        message:
          "あと少し！",
      };
    }

    return {
      rank: "D",
      message:
        "ここから伸ばそう！",
    };
  }

  // ─────────────────────────────
  // ジャンル選択画面
  // ─────────────────────────────


  if (!selectedSection) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">

        <div className="mx-auto w-full max-w-xl">

          <div className="mb-8">

            <p className="mb-2 text-sm text-zinc-400">
              通常学習
            </p>

            <h1 className="mb-3 text-3xl font-bold">
              学習するジャンルを選択
            </h1>

            <p className="text-zinc-400">
              学習したいジャンルを選ぼう。
            </p>

          </div>

          <div className="space-y-4">

            {sections.map((section) => {
              const sectionQuestions =
                questions.filter(
                  (question) =>
                    question.section ===
                    section.section
                );

              const attempts =
                sectionQuestions.reduce(
                  (total, question) =>
                    total +
                    (stats[question.id]?.attempts ?? 0),
                  0
                );

              const correct =
                sectionQuestions.reduce(
                  (total, question) =>
                    total +
                    (stats[question.id]?.correct ?? 0),
                  0
                );

              const studied =
                sectionQuestions.filter(
                  (question) =>
                    stats[question.id] &&
                    stats[question.id].attempts > 0
                ).length;

              const accuracy =
                attempts > 0
                  ? Math.round(
                      (correct / attempts) * 100
                    )
                  : null;

              const progress =
                sectionQuestions.length > 0
                  ? Math.round(
                      (studied /
                        sectionQuestions.length) *
                        100
                    )
                  : 0;

              return (
                <button
                  key={section.id}
                  onClick={() =>
                    setSelectedSection(section)
                  }
                  className="w-full rounded-3xl bg-zinc-900 p-5 text-left transition duration-200 hover:scale-[1.01] hover:bg-zinc-800"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <span className="text-2xl">
                        {section.icon}
                      </span>

                      <div>

                        <p className="font-semibold">
                          {section.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {section.id === "common"
                            ? "1級・2級 / 真偽法・多肢選一"
                            : "1級・2級 / 真偽法"}
                        </p>

                      </div>

                    </div>

                    <span className="whitespace-nowrap text-sm text-zinc-400">
                      {sectionQuestions.length}問
                    </span>

                  </div>

                  <div className="mt-5">

                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-400">

                      <span className="font-semibold">
                        {accuracy !== null
                          ? `正答率 ${accuracy}%`
                          : "未学習"}
                      </span>

                      <span>
                        {studied}
                        {" / "}
                        {sectionQuestions.length}
                        問 学習済み
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-700">

                      <div
                        className="h-full rounded-full bg-white transition-all duration-700"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                    <p className="mt-2 text-right text-[11px] text-zinc-600">
                      学習進捗 {progress}%
                    </p>

                  </div>

                </button>
              );
            })}

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
  // 級・形式選択
  // ─────────────────────────────

  if (!selectedChapter) {
    const availableChapters = chapters
      .filter((chapter) => chapter.id !== "all")
      .map((chapter) => ({
        ...chapter,
        section: selectedSection.section,
      }))
      .filter(
        (chapter) =>
          getQuestionsForChapter(chapter).length > 0
      );

    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">

        <div className="mx-auto w-full max-w-xl">

          <div className="mb-8">

            <p className="mb-2 text-sm text-zinc-400">
              通常学習
            </p>

            <h1 className="mb-3 text-3xl font-bold">
              {selectedSection.icon}{" "}
              {selectedSection.name}
            </h1>

            <p className="text-zinc-400">
              級と問題形式を選択しよう。
            </p>

          </div>

          <div className="space-y-4">

            {availableChapters.map(
              (chapter) => {
                const chapterStats =
                  getChapterStats(chapter);

                const progress =
                  chapterStats.total > 0
                    ? Math.round(
                        (chapterStats.studied /
                          chapterStats.total) *
                          100
                      )
                    : 0;

                return (
                  <button
                    key={chapter.id}
                    onClick={() =>
                      selectChapter(chapter)
                    }
                    className="w-full rounded-3xl bg-zinc-900 p-5 text-left transition duration-200 hover:scale-[1.01] hover:bg-zinc-800"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-start gap-3">

                        <span className="text-2xl">
                          {chapter.icon}
                        </span>

                        <div>

                          <p className="font-semibold">
                            {chapter.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {chapter.type === "truefalse"
                              ? "○×で解答"
                              : "イ・ロ・ハ・ニから選択"}
                          </p>

                        </div>

                      </div>

                      <span className="whitespace-nowrap text-sm text-zinc-400">
                        {chapterStats.total}問
                      </span>

                    </div>

                    <div className="mt-5">

                      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-400">

                        <span className="font-semibold">
                          {chapterStats.accuracy !== null
                            ? `正答率 ${chapterStats.accuracy}%`
                            : "未学習"}
                        </span>

                        <span>
                          {chapterStats.studied}
                          {" / "}
                          {chapterStats.total}
                          問 学習済み
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-zinc-700">

                        <div
                          className="h-full rounded-full bg-white transition-all duration-700"
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                      <p className="mt-2 text-right text-[11px] text-zinc-600">
                        学習進捗 {progress}%
                      </p>

                    </div>

                  </button>
                );
              }
            )}

          </div>

          <button
            onClick={backToSections}
            className="mt-8 w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            ジャンル選択へ戻る
          </button>

        </div>

      </main>
    );
  }

  // ─────────────────────────────
  // 順番 / シャッフル
  // ─────────────────────────────

  if (!studyMode) {
    const chapterStats =
      getChapterStats(
        selectedChapter
      );

    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">

        <div className="mx-auto w-full max-w-xl">

          <div className="mb-8 text-center">

            <div className="mb-3 text-5xl">
              {
                selectedChapter.icon
              }
            </div>

            <h1 className="mb-3 text-3xl font-bold">
              {
                selectedChapter.name
              }
            </h1>

            <p className="text-zinc-400">
              全
              {
                chapterStats.total
              }
              問
            </p>

            <div className="mt-5 flex justify-center gap-3">

              <div className="rounded-2xl bg-zinc-900 px-4 py-3">

                <p className="text-xs text-zinc-500">
                  正答率
                </p>

                <p className="mt-1 font-bold">
                  {chapterStats.accuracy !==
                  null
                    ? `${chapterStats.accuracy}%`
                    : "--"}
                </p>

              </div>

              <div className="rounded-2xl bg-zinc-900 px-4 py-3">

                <p className="text-xs text-zinc-500">
                  学習済み
                </p>

                <p className="mt-1 font-bold">
                  {
                    chapterStats.studied
                  }
                  /
                  {
                    chapterStats.total
                  }
                </p>

              </div>

            </div>

          </div>

          <div className="space-y-4">

            <button
              onClick={() =>
                selectStudyMode(
                  "order"
                )
              }
              className="w-full rounded-3xl bg-white p-6 text-left text-black transition hover:scale-[1.01]"
            >

              <p className="mb-2 text-xl font-bold">
                📖 順番に解く
              </p>

              <p className="text-sm text-zinc-600">
                問題番号の順番に
                学習します。
              </p>

            </button>

            <button
              onClick={() =>
                selectStudyMode(
                  "shuffle"
                )
              }
              className="w-full rounded-3xl bg-zinc-900 p-6 text-left transition hover:scale-[1.01] hover:bg-zinc-800"
            >

              <p className="mb-2 text-xl font-bold">
                🔀 シャッフルで解く
              </p>

              <p className="text-sm text-zinc-400">
                ランダムな順番で
                出題します。
              </p>

            </button>

          </div>

          <button
            onClick={
              backToChapters
            }
            className="mt-8 w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            級・形式選択へ戻る
          </button>

        </div>

      </main>
    );
  }

  // ─────────────────────────────
  // 出題数選択
  // ─────────────────────────────

  if (
    studyMode === "shuffle" &&
    !questionCount
  ) {
    const totalCount =
      getQuestionsForChapter(
        selectedChapter
      ).length;

    const countOptions =
      [5, 10, 20].filter(
        (count) =>
          count <=
          totalCount
      );

    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">

        <div className="mx-auto w-full max-w-xl">

          <div className="mb-8 text-center">

            <p className="mb-2 text-sm text-zinc-400">
              {
                selectedChapter.name
              }
            </p>

            <h1 className="mb-3 text-3xl font-bold">
              何問解く？
            </h1>

            <p className="text-sm text-zinc-500">
              🔀 シャッフルで解く
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4">

            {countOptions.map(
              (count) => (
                <button
                  key={count}
                  onClick={() =>
                    startStudy(
                      count as QuestionCount
                    )
                  }
                  className="rounded-3xl bg-zinc-900 p-7 transition hover:scale-105 hover:bg-zinc-800"
                >

                  <p className="text-3xl font-bold">
                    {count}
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">
                    問
                  </p>

                </button>
              )
            )}

            <button
              onClick={() =>
                startStudy(
                  "all"
                )
              }
              className="rounded-3xl bg-white p-7 text-black transition hover:scale-105"
            >

              <p className="text-2xl font-bold">
                全問
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                {
                  totalCount
                }
                問
              </p>

            </button>

          </div>

          <button
            onClick={
              backToModeSelection
            }
            className="mt-8 w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            学習方法へ戻る
          </button>

        </div>

      </main>
    );
  }

  // ─────────────────────────────
  // 結果
  // ─────────────────────────────

  if (finished) {
    const total =
      quizQuestions.length;

    const accuracy =
      total > 0
        ? Math.round(
            (score /
              total) *
              100
          )
        : 0;

    const result =
      getRank(
        accuracy
      );

    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-white">

        <div className="w-full max-w-xl text-center">

          <p className="mb-2 text-sm text-zinc-400">
            {
              selectedChapter.name
            }
          </p>

          <h1 className="mb-6 text-4xl font-bold">
            学習完了！
          </h1>

          <div className="mb-6 rounded-3xl bg-zinc-900 p-8">

            <p className="mb-2 text-sm text-zinc-400">
              今回のランク
            </p>

            <p className="mb-2 text-7xl font-black">
              {
                result.rank
              }
            </p>

            <p className="mb-7 text-zinc-400">
              {
                result.message
              }
            </p>

            <p className="mb-2 text-5xl font-bold">
              {score}
              {" / "}
              {total}
            </p>

            <p className="mb-5 text-xl">
              正答率{" "}
              {accuracy}%
            </p>

            <div className="rounded-2xl bg-zinc-800 p-4">

              <p className="text-sm text-zinc-400">
                最高連続正解
              </p>

              <p className="mt-1 text-2xl font-bold">
                🔥{" "}
                {
                  bestStreak
                }
                問
              </p>

            </div>

          </div>

          <div className="space-y-3">

            <button
              onClick={
                restartStudy
              }
              className="w-full rounded-2xl bg-white py-4 font-semibold text-black"
            >
              同じ条件でもう一度
            </button>

            {studyMode === "shuffle" && (
              <button
                onClick={
                  backToCountSelection
                }
                className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
              >
                出題数を変更
              </button>
            )}

            <button
              onClick={
                backToModeSelection
              }
              className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
            >
              学習方法を変更
            </button>

            <button
              onClick={
                backToChapters
              }
              className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
            >
              級・形式を変更
            </button>

          </div>

        </div>

      </main>
    );
  }

  const question =
    quizQuestions[
      currentIndex
    ];

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        読み込み中...
      </main>
    );
  }

  const isCorrect =
    selected ===
    question.answer;

  const isFavorite =
    favoriteIds.includes(
      question.id
    );

  // ─────────────────────────────
  // 問題画面
  // ─────────────────────────────

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-10 text-white">

      <div
        className={`w-full max-w-xl ${
          answerEffect ===
          "wrong"
            ? "animate-[shake_0.35s_ease-in-out]"
            : ""
        }`}
      >

        <style jsx global>{`
          @keyframes shake {
            0%,
            100% {
              transform: translateX(
                0
              );
            }

            20% {
              transform: translateX(
                -8px
              );
            }

            40% {
              transform: translateX(
                8px
              );
            }

            60% {
              transform: translateX(
                -5px
              );
            }

            80% {
              transform: translateX(
                5px
              );
            }
          }

          @keyframes correctGlow {
            0% {
              box-shadow: 0 0 0
                rgba(
                  255,
                  255,
                  255,
                  0
                );
              transform: scale(
                1
              );
            }

            50% {
              box-shadow: 0 0
                35px
                rgba(
                  255,
                  255,
                  255,
                  0.22
                );
              transform: scale(
                1.015
              );
            }

            100% {
              box-shadow: 0 0 0
                rgba(
                  255,
                  255,
                  255,
                  0
                );
              transform: scale(
                1
              );
            }
          }
        `}</style>

        <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">

          <span>
            {
              selectedChapter.icon
            }{" "}
            {
              selectedChapter.name
            }
          </span>

          <span>
            {
              currentIndex +
              1
            }
            {" / "}
            {
              quizQuestions.length
            }
          </span>

        </div>

        <div className="mb-3 flex items-center justify-between">

          <p className="text-xs text-zinc-500">
            {studyMode ===
            "order"
              ? "📖 順番"
              : "🔀 シャッフル"}
          </p>

          <div
            className={`rounded-full px-3 py-1 text-sm font-bold transition ${
              streak >= 5
                ? "bg-orange-500/20 text-orange-300"
                : "bg-zinc-900 text-zinc-400"
            }`}
          >
            🔥 {streak}
            連続
          </div>

        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-zinc-800">

          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{
              width: `${
                ((currentIndex +
                  1) /
                  quizQuestions.length) *
                100
              }%`,
            }}
          />

        </div>

        <div className="mb-3 flex items-center justify-between gap-3 text-sm text-zinc-500">
          <p>
            問題 {question.sourceQuestionNo}
          </p>

          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs">
            {question.type === "truefalse"
              ? "真偽法"
              : "多肢選一"}
          </span>
        </div>

        <div
          className={`mb-4 rounded-3xl bg-zinc-900 p-6 transition ${
            answerEffect ===
            "correct"
              ? "animate-[correctGlow_0.6s_ease-out]"
              : ""
          }`}
        >

          <p className="text-xl font-medium leading-8">
            {
              question.text
            }
          </p>

        </div>

        {question.requiresImage && (
          <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="text-sm font-semibold text-amber-200">
              🖼️ この問題は図・記号を使う問題です
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-100/70">
              現在は問題データのみ登録済みです。図画像は後で追加します。
            </p>
          </div>
        )}

        <button
          onClick={() =>
            toggleFavorite(
              question.id
            )
          }
          className={`mb-6 w-full rounded-2xl py-3 font-semibold transition ${
            isFavorite
              ? "bg-yellow-400 text-black"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >

          {isFavorite
            ? "★ 要復習に追加済み"
            : "☆ 要復習に追加"}

        </button>

        {question.type === "truefalse" ? (
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

            {(["イ", "ロ", "ハ", "ニ"] as const).map(
              (choiceKey) => {
                const choiceText =
                  question.choices?.[
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
                      selected === choiceKey
                        ? choiceKey === question.answer
                          ? "border-green-400 bg-green-400/10"
                          : "border-red-400 bg-red-400/10"
                        : selected !== null &&
                            choiceKey === question.answer
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

            {isCorrect &&
              streak >= 5 && (
                <p className="mb-4 text-lg font-bold text-orange-300">
                  🔥{" "}
                  {streak}
                  連続正解！
                </p>
              )}

            <p className="mb-3">
              正解：
              {
                question.answer
              }
              {question.type === "choice" &&
                question.choices?.[
                  question.answer as
                    "イ" | "ロ" | "ハ" | "ニ"
                ] && (
                  <span className="ml-2 text-zinc-400">
                    {
                      question.choices[
                        question.answer as
                          "イ" | "ロ" | "ハ" | "ニ"
                      ]
                    }
                  </span>
                )}
            </p>

            <p className="mb-6 leading-7 text-zinc-300">
              {
                question.explanation
              }
            </p>

            <button
              onClick={
                goNext
              }
              className="w-full rounded-2xl bg-white py-4 font-semibold text-black transition hover:scale-[1.01]"
            >

              {currentIndex <
              quizQuestions.length -
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