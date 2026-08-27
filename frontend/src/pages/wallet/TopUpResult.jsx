import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { confirmKarmaTopup } from "../../services/walletService";

const messages = {
  "00": {
    title: "Nạp Karma thành công",
    detail:
      "Giao dịch đã được xác nhận. Số Karma mới sẽ xuất hiện trong ví của bạn.",
  },
   24: {
    title: "Bạn đã hủy thanh toán",
    detail:
      "Giao dịch chưa được thực hiện. Bạn có thể quay lại và thử lại bất cứ lúc nào.",
  },
};

export default function TopUpResult() {
  const [params] = useSearchParams();
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const code = params.get("code");
  const orderCode = params.get("orderCode");
  const success = code === "00";

  let result = messages[code] || {
    title: "Không thể hoàn tất thanh toán",
    detail:
      "PayOS chưa xác nhận giao dịch này. Vui lòng kiểm tra lịch sử ví hoặc thử lại.",
  };

  if (cancelled) {
    result = {
      title: "Giao dịch đã bị hủy",
      detail: "Không có Karma nào được cộng.",
    };
  }

  useEffect(() => {
    if (success && orderCode && !confirmed && !error) {
      setConfirming(true);
      confirmKarmaTopup(orderCode)
        .then(() => setConfirmed(true))
        .catch((err) => {
          if (err.cancelled) {
            setCancelled(true);
            setError("Giao dịch đã bị hủy. Không có Karma nào được cộng.");
          } else {
            setError(err.message);
          }
        })
        .finally(() => setConfirming(false));
    }
  }, [success, orderCode, confirmed, error]);

  const renderIcon = () => {
    if (confirmed)
      return <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />;
    if (cancelled || !success)
      return <XCircle className="mx-auto h-16 w-16 text-rose-500" />;
    return <CircleAlert className="mx-auto h-16 w-16 text-amber-500" />;
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-xl py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800 sm:p-12">
          {renderIcon()}
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] dark:text-white">
            Payment result
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {result?.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">
            {result?.detail}
          </p>
          {confirming && (
            <p className="mt-4 text-sm text-emerald-600">
              Đang xác nhận thanh toán...
            </p>
          )}
          {confirmed && (
            <p className="mt-4 text-sm font-semibold text-emerald-600">
              ✓ Đã cộng Karma thành công!
            </p>
          )}
          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/wallet"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              <ArrowLeft size={16} /> Về ví Karma
            </Link>
            <Link
              to="/wallet/topup"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-600 dark:text-slate-200"
            >
              Nạp lại <ExternalLink size={16} />
            </Link>
          </div>
        </div>
        <div className="mt-5 flex justify-center gap-2 text-xs text-slate-400">
          <Clock3 size={14} /> Trạng thái được xác nhận trực tiếp từ PayOS
        </div>
      </div>
    </UserLayout>
  );
}
