import { HeartHandshake, Recycle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-white/70 dark:border-slate-700 dark:bg-slate-950/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 dark:bg-white">
              <Recycle className="h-5 w-5 text-emerald-400 dark:text-slate-900" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold text-slate-950 dark:text-white">Campus Karma</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Trao vật dụng · Gieo tử tế</span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Không gian trao đổi đáng tin cậy giúp sinh viên dùng ít hơn, chia sẻ nhiều hơn và xây dựng một khuôn viên bền vững.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Khám phá</p>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link to="/browse" className="hover:text-slate-950 dark:hover:text-emerald-300">Vật phẩm</Link>
            <Link to="/membership" className="hover:text-slate-950 dark:hover:text-emerald-300">Karma Pass</Link>
            <Link to="/about" className="hover:text-slate-950 dark:hover:text-emerald-300">Về dự án</Link>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" /> Xác thực email sinh viên</p>
          <p className="flex items-center gap-2"><HeartHandshake className="h-4 w-4 text-emerald-600" aria-hidden="true" /> Giao nhận minh bạch bằng QR</p>
          <p className="pt-2 text-xs">© {new Date().getFullYear()} Campus Karma Exchange</p>
        </div>
      </div>
    </footer>
  );
}
