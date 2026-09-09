import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Spinner } from "flowbite-react";
import { BadgeCheck, Check, Crown, Sparkles, WalletCards, Zap } from "lucide-react";
import UserLayout from "../../layouts/UserLayout";
import { createMembership, getCurrentMembership } from "../../services/walletService";

const money = new Intl.NumberFormat("vi-VN");
const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value)) : "—";
const plans = [
  { months: 1, karma: 100, price: 50000, note: "Linh hoạt" },
  { months: 3, karma: 250, price: 120000, note: "Phổ biến" },
  { months: 6, karma: 450, price: 200000, note: "Tiết kiệm nhất" },
];

export default function KarmaPass() {
  const [membership, setMembership] = useState(null);
  const [method, setMethod] = useState("KARMA");
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const selectedPlan = plans.find((plan) => plan.months === months) || plans[0];

  useEffect(() => {
    getCurrentMembership()
      .then((data) => setMembership(data.membership))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const data = await createMembership({
        months,
        payment_method: method,
        ...(method === "KARMA"
          ? { karma_cost: selectedPlan.karma }
          : { price_vnd: selectedPlan.price }),
      });
      if (data.payment_url) window.location.assign(data.payment_url);
      else setMembership(data.membership);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-8 pb-12">
        <header className="border-b border-slate-200 pb-7 dark:border-slate-800">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">Membership</p>
          <h1 className="font-display text-4xl font-semibold text-slate-950 dark:text-white sm:text-5xl">Karma Pass</h1>
          <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
            Trải nghiệm mượn đồ nhẹ nhàng hơn với ưu đãi cọc, bảo vệ giao dịch và quyền ưu tiên hiển thị.
          </p>
        </header>

        {membership && (
          <section className="editorial-grid overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
              <div className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-slate-950">
                  <Crown className="h-6 w-6" />
                </span>
                <div>
                  <Badge color={membership.status === "PENDING" ? "warning" : "success"}>
                    {membership.status === "PENDING" ? "Chờ thanh toán" : "Đang hoạt động"}
                  </Badge>
                  <h2 className="mt-3 font-display text-3xl font-semibold">Gói hiện tại của bạn</h2>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-8 text-sm">
                <div><dt className="text-slate-400">Bắt đầu</dt><dd className="mt-1 font-bold">{formatDate(membership.start_at)}</dd></div>
                <div><dt className="text-slate-400">Hết hạn</dt><dd className="mt-1 font-bold">{formatDate(membership.end_at)}</dd></div>
              </dl>
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center gap-3" aria-busy="true">
            <Spinner size="lg" />
            <span className="text-sm font-semibold text-slate-500">Đang kiểm tra gói thành viên...</span>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Bước 01</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">Chọn thời hạn</h2>
                <p className="mt-1 text-sm text-slate-500">Gói mới sẽ nối tiếp thời hạn đang hoạt động.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {plans.map((plan) => {
                  const selected = months === plan.months;
                  return (
                    <button
                      key={plan.months}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setMonths(plan.months)}
                      className={`relative rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 ${
                        selected
                          ? "border-slate-900 bg-slate-900 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-slate-950"
                          : "border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
                      }`}
                    >
                      <span className="block text-xs font-bold uppercase tracking-[0.12em] opacity-65">{plan.note}</span>
                      <span className="mt-3 block font-display text-3xl font-semibold">{plan.months}</span>
                      <span className="text-sm font-bold">tháng</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:grid-cols-2 dark:border-slate-800 dark:text-slate-300">
                {["Giảm hoặc miễn phí đặt cọc", "Ưu tiên hiển thị bài đăng", "Gia hạn liền mạch", "Lớp bảo vệ giao dịch"].map((benefit) => (
                  <p key={benefit} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" /> {benefit}
                  </p>
                ))}
              </div>
            </Card>

            <Card className="h-fit">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Bước 02</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">Thanh toán</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {[
                  { value: "KARMA", icon: WalletCards, label: "Bằng Karma", price: `${money.format(selectedPlan.karma)} Karma` },
                  { value: "PAYOS", icon: Sparkles, label: "Qua PayOS", price: `${money.format(selectedPlan.price)} đ` },
                ].map(({ value, icon: Icon, label, price }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={method === value}
                    onClick={() => setMethod(value)}
                    className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 ${
                      method === value
                        ? "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    <p className="mt-3 font-bold text-slate-900 dark:text-white">{label}</p>
                    <p className="mt-1 text-sm text-slate-500">{price}</p>
                  </button>
                ))}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Tổng thanh toán</span>
                  <span className="font-display text-2xl font-semibold text-slate-950 dark:text-white">
                    {method === "KARMA"
                      ? `${money.format(selectedPlan.karma)} Karma`
                      : `${money.format(selectedPlan.price)} đ`}
                  </span>
                </div>
              </div>
              {error && <Alert color="failure">{error}</Alert>}
              <Button size="lg" className="w-full" onClick={submit} disabled={submitting}>
                {submitting ? <Spinner size="sm" className="mr-2" /> : <Zap className="mr-2 h-5 w-5" />}
                {submitting ? "Đang xử lý..." : method === "KARMA" ? "Đăng ký bằng Karma" : "Tiếp tục với PayOS"}
              </Button>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <BadgeCheck className="h-4 w-4 text-emerald-600" /> Thanh toán an toàn, trạng thái cập nhật tự động.
              </p>
            </Card>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
