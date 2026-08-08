"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-xl">

        {/* ヘッダー */}

        <div className="mb-9">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400" />

            <p className="text-xs font-medium tracking-wide text-zinc-400">
              技能大会 学科対策
            </p>
          </div>

          {/* ロゴ */}

          <div className="mb-5">

            <h1 className="text-[46px] font-black leading-none tracking-[-0.07em] text-white sm:text-5xl">
              仕上げマスター
            </h1>

            <div className="mt-4 flex items-center gap-3">

              <div className="h-[2px] w-12 rounded-full bg-white" />

              <p className="text-[10px] font-bold tracking-[0.38em] text-zinc-600">
                SHIAGE MASTER
              </p>

            </div>

          </div>

          <p className="max-w-md leading-7 text-zinc-400">
            苦手を見つけて、効率よく仕上げる。
            毎日の積み重ねで本番に強くなろう。
          </p>

        </div>

        {/* 今日の復習 */}

        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl shadow-black/20">

          <div className="mb-4">

            <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-zinc-500">
              TODAY&apos;S REVIEW
            </p>

            <h2 className="text-2xl font-bold">
              今日の復習
            </h2>

          </div>

          <p className="mb-6 text-sm leading-6 text-zinc-400">
            苦手問題や未学習問題から、
            今日やる10問を自動で選びます。
          </p>

          <a
            href="/review"
            className="block w-full rounded-2xl bg-white py-4 text-center font-bold text-black transition duration-200 hover:scale-[1.01] hover:bg-zinc-100"
          >
            今日の10問を始める
          </a>

        </div>

        {/* メニュー */}

        <div className="mb-4">

          <div className="mb-3 flex items-center justify-between">

            <p className="text-xs font-semibold tracking-[0.16em] text-zinc-600">
              STUDY MENU
            </p>

            <span className="text-[10px] tracking-wider text-zinc-700">
              SHIAGE MASTER
            </span>

          </div>

          <div className="space-y-3">

            <a
              href="/quiz"
              className="group block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition duration-200 hover:-translate-y-[1px] hover:border-zinc-700 hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-xl">
                    📚
                  </div>

                  <div>
                    <p className="font-bold">
                      通常学習
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      章・順番・問題数を選んで学習
                    </p>
                  </div>

                </div>

                <span className="text-xl text-zinc-600 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                  ›
                </span>

              </div>
            </a>

            <a
              href="/favorite"
              className="group block rounded-2xl border border-yellow-500/20 bg-zinc-900 p-5 transition duration-200 hover:-translate-y-[1px] hover:border-yellow-400/40 hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-400/10 text-xl text-yellow-400">
                    ★
                  </div>

                  <div>
                    <p className="font-bold">
                      要復習問題
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      自分でマークした問題を集中復習
                    </p>
                  </div>

                </div>

                <span className="text-xl text-zinc-600 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                  ›
                </span>

              </div>
            </a>

            <a
              href="/weak"
              className="group block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition duration-200 hover:-translate-y-[1px] hover:border-zinc-700 hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-xl">
                    🎯
                  </div>

                  <div>
                    <p className="font-bold">
                      苦手問題
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      間違い率の高い問題を優先
                    </p>
                  </div>

                </div>

                <span className="text-xl text-zinc-600 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                  ›
                </span>

              </div>
            </a>

            <a
              href="/exam"
              className="group block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition duration-200 hover:-translate-y-[1px] hover:border-zinc-700 hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-xl">
                    📝
                  </div>

                  <div>
                    <p className="font-bold">
                      模擬試験
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      本番形式でランダム出題
                    </p>
                  </div>

                </div>

                <span className="text-xl text-zinc-600 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                  ›
                </span>

              </div>
            </a>

            <a
              href="/stats"
              className="group block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition duration-200 hover:-translate-y-[1px] hover:border-zinc-700 hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-xl">
                    📊
                  </div>

                  <div>
                    <p className="font-bold">
                      成績
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      正答率・進捗・苦手を確認
                    </p>
                  </div>

                </div>

                <span className="text-xl text-zinc-600 transition duration-200 group-hover:translate-x-1 group-hover:text-white">
                  ›
                </span>

              </div>
            </a>

          </div>

        </div>

        {/* フッター */}

        <div className="mt-10 border-t border-zinc-900 pt-6 text-center">

          <p className="text-xs text-zinc-700">
            仕上げ作業 学科対策
          </p>

          <p className="mt-2 text-[9px] font-bold tracking-[0.3em] text-zinc-800">
            SHIAGE MASTER
          </p>

        </div>

      </div>
    </main>
  );
}