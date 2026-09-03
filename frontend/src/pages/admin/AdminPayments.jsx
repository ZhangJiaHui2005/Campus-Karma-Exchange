import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAdminPayments } from "../../services/adminAuthService";

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatVnd = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VND`;

const statusConfig = {
  PENDING: {
    label: "Đang chờ thanh toán",
    className: "bg-amber-50 text-amber-700",
    icon: Clock3,
  },
  SUCCESS: {
    label: "Thanh toán thành công",
    className: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Thanh toán thất bại",
    className: "bg-rose-50 text-rose-700",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Thanh toán đã hủy",
    className: "bg-slate-100 text-slate-600",
    icon: XCircle,
  },
};

export default function AdminPayments({ archived = false }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminPayments(archived);
      setPayments(data.payments || []);
    } catch (requestError) {
      setPayments([]);
      setError(requestError.message || "Không thể tải thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [archived]);

  const visiblePayments = payments.filter((payment) => {
    const search = query.trim().toLocaleLowerCase("vi");
    if (!search) return true;
    return `${payment.user?.full_name || ""} ${payment.user?.email || ""} ${payment.transaction_ref}`
      .toLocaleLowerCase("vi")
      .includes(search);
  });

  return (
    <section>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {archived ? "Lưu trữ hóa đơn" : "Thanh toán"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {archived
              ? "Các hóa đơn nạp Karma đã thanh toán thành công."
              : "Theo dõi trạng thái các giao dịch nạp Karma của người dùng."}
          </p>
        </div>
        <button
          type="button"
          onClick={loadPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Đang tải yêu cầu nạp Karma...
        </div>
      ) : !error && payments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <CircleDollarSign className="mx-auto text-slate-300" size={36} />
          <p className="mt-3 font-semibold text-slate-700">
            {archived
              ? "Chưa có hóa đơn thành công trong kho lưu trữ."
              : "Chưa có giao dịch nạp Karma."}
          </p>
        </div>
      ) : (
        !error && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên, email hoặc mã giao dịch"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 sm:max-w-md"
              />
              <span className="whitespace-nowrap text-sm text-slate-500">
                {visiblePayments.length} hóa đơn
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Người dùng</th>
                      <th className="px-5 py-3 font-semibold">Karma</th>
                      <th className="px-5 py-3 font-semibold">Số tiền</th>
                      <th className="px-5 py-3 font-semibold">Mã giao dịch</th>
                      <th className="px-5 py-3 font-semibold">Thời gian</th>
                      <th className="px-5 py-3 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visiblePayments.map((payment) => (
                      <tr
                        key={payment.payment_id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {payment.user?.full_name || "Không rõ người dùng"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {payment.user?.email || ""}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-emerald-700">
                          {Number(payment.karma_received || 0).toLocaleString(
                            "vi-VN",
                          )}{" "}
                          Karma
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {formatVnd(payment.amount_vnd)}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">
                          {payment.transaction_ref}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          {(() => {
                            const config =
                              statusConfig[payment.status] ||
                              statusConfig.PENDING;
                            const StatusIcon = config.icon;
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
                              >
                                <StatusIcon size={13} /> {config.label}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {selectedPayment && (
              <div
                className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
                onClick={() => setSelectedPayment(null)}
              >
                <article
                  className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        Hóa đơn nạp Karma
                      </p>
                      <h3 className="mt-1 text-xl font-bold">
                        {selectedPayment.user?.full_name ||
                          "Không rõ người dùng"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Đóng hóa đơn"
                      onClick={() => setSelectedPayment(null)}
                      className="text-xl text-slate-400 hover:text-slate-700"
                    >
                      ×
                    </button>
                  </div>
                  <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-slate-500">Email</dt>
                      <dd className="mt-1 font-semibold">
                        {selectedPayment.user?.email || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Mã giao dịch</dt>
                      <dd className="mt-1 break-all font-mono text-xs font-semibold">
                        {selectedPayment.transaction_ref}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Số tiền</dt>
                      <dd className="mt-1 font-semibold">
                        {formatVnd(selectedPayment.amount_vnd)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Karma nhận</dt>
                      <dd className="mt-1 font-semibold text-emerald-700">
                        {Number(
                          selectedPayment.karma_received || 0,
                        ).toLocaleString("vi-VN")}{" "}
                        Karma
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Tạo lúc</dt>
                      <dd className="mt-1 font-semibold">
                        {formatDate(selectedPayment.created_at)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Thanh toán lúc</dt>
                      <dd className="mt-1 font-semibold">
                        {selectedPayment.paid_at
                          ? formatDate(selectedPayment.paid_at)
                          : "-"}
                      </dd>
                    </div>
                  </dl>
                </article>
              </div>
            )}
          </div>
        )
      )}
    </section>
  );
}
