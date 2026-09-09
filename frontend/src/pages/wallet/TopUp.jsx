import { useState } from "react";
import { Alert, Badge, Button, Card, Spinner } from "flowbite-react";
import { ArrowLeft, ArrowRight, BadgeCheck, Banknote, Check, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { createKarmaTopup } from "../../services/walletService";

const options = [
  { amount_vnd: 10000, karma_received: 100 },
  { amount_vnd: 20000, karma_received: 200 },
  { amount_vnd: 50000, karma_received: 550, bonus: "Tặng 10%" },
  { amount_vnd: 100000, karma_received: 1200, bonus: "Tặng 20%" },
  { amount_vnd: 200000, karma_received: 2500, bonus: "Tặng 25%" },
  { amount_vnd: 500000, karma_received: 5750, bonus: "Giá trị cao" },
];
const money = new Intl.NumberFormat("vi-VN");

export default function TopUp() {
  const [selected, setSelected] = useState(options[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await createKarmaTopup(selected);
      window.location.assign(data.payment_url);
    } catch (submitError) {
      setError(submitError.message);
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <Link to="/wallet" className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Quay lại Ví Karma
        </Link>
        <header className="border-b border-slate-200 pb-7 dark:border-slate-800">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">Nạp số dư</p>
          <h1 className="font-display text-4xl font-semibold text-slate-950 dark:text-white sm:text-5xl">Nạp Karma</h1>
          <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
            Chọn một mệnh giá, kiểm tra tóm tắt và hoàn tất thanh toán an toàn qua PayOS.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-amber-400">
                <Banknote className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-950 dark:text-white">Chọn mệnh giá</h2>
                <p className="text-sm text-slate-500">Mệnh giá lớn được cộng thêm Karma.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((option) => {
                const active = selected.amount_vnd === option.amount_vnd;
                return (
                  <button
                    key={option.amount_vnd}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected(option)}
                    className={`relative rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-slate-950"
                        : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    {option.bonus && <Badge color={active ? "warning" : "success"} className="mb-3 w-fit">{option.bonus}</Badge>}
                    <span className="block font-display text-2xl font-semibold">{money.format(option.amount_vnd)} đ</span>
                    <span className={`mt-1 block text-sm font-bold ${active ? "text-amber-300 dark:text-slate-700" : "text-amber-700 dark:text-amber-400"}`}>
                      +{money.format(option.karma_received)} Karma
                    </span>
                    {active && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-slate-950 dark:bg-slate-950 dark:text-amber-400"><Check className="h-4 w-4" /></span>}
                  </button>
                );
              })}
            </div>
          </Card>

          <aside className="editorial-grid h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Tóm tắt giao dịch</p>
            <div className="mt-8 border-b border-white/10 pb-6">
              <p className="text-sm text-slate-400">Bạn sẽ nhận</p>
              <p className="mt-2 font-display text-5xl font-semibold text-amber-400">{money.format(selected.karma_received)}</p>
              <p className="mt-1 text-sm font-bold text-slate-300">Karma</p>
            </div>
            <div className="flex items-center justify-between py-6 text-sm">
              <span className="text-slate-400">Thanh toán</span>
              <span className="font-bold">{money.format(selected.amount_vnd)} đ</span>
            </div>
            {error && <Alert color="failure" className="mb-4">{error}</Alert>}
            <Button onClick={submit} disabled={loading} size="lg" className="w-full bg-amber-400 text-slate-950 hover:bg-amber-300">
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              {loading ? "Đang tạo giao dịch..." : "Tiếp tục với PayOS"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Giao dịch được xử lý trên cổng PayOS bảo mật.
            </p>
          </aside>
        </div>
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <BadgeCheck className="h-4 w-4 text-emerald-600" /> Karma chỉ được cộng sau khi PayOS xác nhận thành công.
        </p>
      </div>
    </UserLayout>
  );
}
