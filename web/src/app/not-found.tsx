import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-zinc-950 text-white">
      <h2 className="text-3xl font-black mb-2">404</h2>
      <p className="text-zinc-400 mb-4">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-[#C4FF00] text-black font-bold text-sm"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
