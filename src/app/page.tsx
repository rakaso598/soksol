import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-16 max-w-4xl mx-auto w-full">
      <section className="text-center mb-14">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#34D399] via-[#86EFAC] to-[#CFFBE6] text-transparent bg-clip-text mb-6">
          속솔
        </h1>
        <p className="text-lg sm:text-xl leading-relaxed text-neutral-700 max-w-2xl mx-auto">
          당신이 누구인지 아무도 모르는 곳에서, 가장 솔직한 당신을 만나보세요. <br />
          <span className="font-semibold">속마음을 솔직하게</span> 털어놓고 비워내며 스스로를 돌보는 익명 AI 멘탈 케어.
        </p>
        <Link
          href="/chat"
          className="inline-block mt-10 px-10 py-4 rounded-full bg-gradient-to-r from-[#34D399] to-[#10B981] text-white font-semibold shadow-md shadow-emerald-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition"
        >
          시작하기
        </Link>
        <div className="mt-6 text-sm space-x-4">
          <Link href="/privacy-check" className="underline text-[#10B981] hover:text-[#0ea56f]">
            실시간 비저장 증명
          </Link>
          <Link href="/privacy" className="underline text-[#10B981] hover:text-[#0ea56f]">
            개인정보 처리방침
          </Link>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-3 w-full">
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur border border-[#E6F7EE] shadow-sm hover:shadow-md transition flex flex-col">
          <h3 className="text-lg font-semibold text-[#10B981] mb-2">비움의 경험</h3>
          <p className="text-sm leading-relaxed text-neutral-600 flex-1">
            대화는 저장되지 않아 과거에 얽매이지 않고 마음속 응어리를 깨끗이 비워내는 순간에 집중합니다.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur border border-[#E6F7EE] shadow-sm hover:shadow-md transition flex flex-col">
          <h3 className="text-lg font-semibold text-[#10B981] mb-2">AI 동반자</h3>
          <p className="text-sm leading-relaxed text-neutral-600 flex-1">
            판단이나 선입견 없이 경청하고, 스스로 답을 찾도록 돕는 질문과 공감을 전합니다.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur border border-[#E6F7EE] shadow-sm hover:shadow-md transition flex flex-col">
          <h3 className="text-lg font-semibold text-[#10B981] mb-2">마음의 성장</h3>
          <p className="text-sm leading-relaxed text-neutral-600 flex-1">
            내면 깊은 감정을 마주하고 자신감을 회복해 앞으로 나아갈 용기를 얻는 여정을 함께합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
