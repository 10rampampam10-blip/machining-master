"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "../data/question";

type Answer = "○" | "×";

type Question = {
  id: number;
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


function getStats(): StatsMap {
  const saved = localStorage.getItem("questionStats");
  return saved ? JSON.parse(saved) : {};
}

function getWeight(questionNo: number, stats: StatsMap) {
  const data = stats[questionNo];

  // 未回答もある程度出す
  if (!data || data.attempts === 0) {
    return 3;
  }

  const wrongRate = data.wrong / data.attempts;

  // 苦手度の基本
  let weight = 1 + wrongRate * 8;

  // 回答回数が多いほど「本当に苦手」の信頼度を少し上げる
  weight += Math.min(data.attempts, 10) * 0.15;

  return weight;
}

function pickWeightedQuestion(
  stats: StatsMap,
  previousQuestionNo?: number
) {
  const candidates = questions.map((question) => ({
    question,
    weight: getWeight(question.id, stats),
  }));

  // 同じ問題の連続出題をなるべく避ける
  const filtered =
    candidates.length > 1
      ? candidates.filter(
          (item) => item.question.id !== previousQuestionNo
        )
      : candidates;

  const totalWeight = filtered.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  let random = Math.random() * totalWeight;

  for (const item of filtered) {
    random -= item.weight;

    if (random <= 0) {
      return item.question;
    }
  }

  return filtered[filtered.length - 1].question;
}

export default function WeakPage() {
  const router = useRouter();

  const sessionLength = 10;

  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<Answer | null>(null);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [finished, setFinished] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({});

useEffect(() => {
  const stats = getStats();

  const firstQuestion = pickWeightedQuestion(stats);

  setQuestion(firstQuestion);

  setQuestionCounts({
    [firstQuestion.id]: 1,
  });
}, []);

  function saveAnswer(questionNo: number, correct: boolean) {
    const stats = getStats();

    const current = stats[questionNo] ?? {
      attempts: 0,
      correct: 0,
      wrong: 0,
    };

    stats[questionNo] = {
      attempts: current.attempts + 1,
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
    };

    localStorage.setItem("questionStats", JSON.stringify(stats));
  }

  function answerQuestion(answer: Answer) {
    if (!question || selected !== null) return;

    const correct = answer === question.answer;

    setSelected(answer);
    saveAnswer(question.id, correct);

    if (correct) {
      setSessionCorrect((prev) => prev + 1);
    }
  }

  function goNext() {
    if (!question) return;

    if (currentNumber >= sessionLength) {
      setFinished(true);
      return;
    }

    const stats = getStats();

const nextQuestion = pickWeightedQuestion(
  stats,
  question.id
);

setQuestionCounts((prev) => ({
  ...prev,
  [nextQuestion.id]: (prev[nextQuestion.id] ?? 0) + 1,
}));

setQuestion(nextQuestion);
    setSelected(null);
    setCurrentNumber((prev) => prev + 1);
  }

  if (!question) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        読み込み中...
      </main>
    );
  }

  if (finished) {
    const accuracy = Math.round(
      (sessionCorrect / sessionLength) * 100
    );

    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">
          <p className="text-zinc-400 mb-3">
            🎯 苦手克服
          </p>

          <h1 className="text-4xl font-bold mb-8">
            復習完了！
          </h1>

          <div className="rounded-3xl bg-zinc-900 p-8 mb-6">
            <p className="text-zinc-400 mb-2">
              今回の結果
            </p>

            <p className="text-5xl font-bold mb-3">
              {sessionCorrect} / {sessionLength}
            </p>

            <p className="text-xl">
              正答率 {accuracy}%
            </p>
            <div className="mt-6 text-left">
  <p className="text-zinc-400 mb-3">
    今回の出題回数
  </p>

  <div className="space-y-2">
    {Object.entries(questionCounts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([questionNo, count]) => (
        <div
          key={questionNo}
          className="flex justify-between rounded-xl bg-zinc-800 px-4 py-3"
        >
          <span>問題 {questionNo}</span>
          <span>{count}回</span>
        </div>
      ))}
  </div>
</div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-2xl bg-white text-black py-4 font-semibold mb-3"
          >
            もう10問やる
          </button>

          <button
            onClick={() => router.push("/stats")}
            className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold mb-3"
          >
            成績を見る
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-2xl bg-zinc-800 py-4 font-semibold"
          >
            ホームへ戻る
          </button>
        </div>
      </main>
    );
  }

  const isCorrect = selected === question.answer;

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl">

        <div className="flex justify-between text-sm text-zinc-400 mb-3">
          <span>🎯 苦手克服</span>

          <span>
            {currentNumber} / {sessionLength}
          </span>
        </div>

        <p className="text-sm text-zinc-500 mb-3">
          問題 {question.id}
        </p>

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
              {currentNumber < sessionLength
                ? "次の問題へ"
                : "結果を見る"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}