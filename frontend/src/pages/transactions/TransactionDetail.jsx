import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchTransactionById,
  confirmReturn,
  cancelTransaction,
} from "../../services/transactionService";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../layouts/UserLayout";
import QRDisplay from "./QRDisplay";
import QRScanner from "./QRScanner";
import { Alert, Button, Spinner } from "flowbite-react";
import {
  ArrowLeft,
  Zap,
  Calendar,
  Clock,
  Package,
  User,
  QrCode,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  ESCROW_LOCKED: { label: "Đã khóa Karma (Chờ nhận đồ)", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: ShieldCheck },
  QR_VERIFIED: { label: "Đã giao nhận (Đang mượn)", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: CheckCircle2 },
  COMPLETED: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400", icon: XCircle },
  DISPUTED: { label: "Tranh chấp", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: AlertTriangle },
};

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [activePanel, setActivePanel] = useState(null); // 'qr' | 'scan' | null

  const loadTx = async () => {
    try {
      setLoading(true);
      const res = await fetchTransactionById(id);
      setTx(res.data);
      // Auto open panel
      if (res.data.status === "ESCROW_LOCKED") {
        if (res.data.lender_id === user?.user_id) setActivePanel("qr");
        else if (res.data.borrower_id === user?.user_id) setActivePanel("scan");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTx();
  }, [id]);

  const handleReturn = async () => {
    if (!confirm("Xác nhận người mượn đã trả lại đồ đầy đủ và nguyên vẹn?")) return;
    setActionLoading(true);
    try {
      await confirmReturn(tx.trans_id);
      await loadTx();
      setActivePanel(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy giao dịch? Toàn bộ Karma đã khóa sẽ được hoàn trả.")) return;
    setActionLoading(true);
    try {
      await cancelTransaction(tx.trans_id);
      await loadTx();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="xl" />
        </div>
      </UserLayout>
    );
  }

  if (error || !tx) {
    return (
      <UserLayout>
        <Alert color="failure" className="mx-auto mt-10 max-w-2xl">{error || "Không tìm thấy giao dịch"}</Alert>
      </UserLayout>
    );
  }

  const isLender = user?.user_id === tx.lender_id;
  const isBorrower = user?.user_id === tx.borrower_id;
  const status = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const totalKarma = tx.karma_amount + tx.deposit_amount;

  return (
    <UserLayout>
      <div className="mx-auto max-w-4xl space-y-6 pb-10">
        {/* Back + Title */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-6 dark:border-slate-700">
          <button
            onClick={() => navigate("/transactions")}
            aria-label="Quay lại danh sách giao dịch"
            className="rounded-xl border border-slate-200 p-2.5 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/40 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">Mã giao dịch #{tx.trans_id}</p>
            <h1 className="font-display text-3xl font-semibold text-slate-950 dark:text-white">
              Chi tiết giao dịch
            </h1>
            <p className="text-sm text-gray-500">
              Tạo lúc {formatDate(tx.created_at)}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border-2 ${status.color} border-current/20`}
        >
          <StatusIcon className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold text-base">{status.label}</p>
            {tx.status === "ESCROW_LOCKED" && isLender && (
              <p className="text-xs opacity-90">
                Hãy hiển thị mã QR bên dưới để người mượn quét xác nhận nhận đồ
              </p>
            )}
            {tx.status === "ESCROW_LOCKED" && isBorrower && (
              <p className="text-xs opacity-90">
                Vui lòng quét mã QR từ người cho mượn khi gặp mặt trực tiếp để nhận đồ
              </p>
            )}
            {tx.status === "QR_VERIFIED" && isLender && (
              <p className="text-xs opacity-90">
                Khi người mượn hoàn trả đồ, bấm nút "Xác nhận đã nhận lại đồ" để hoàn cọc
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Thông tin đồ vật */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" /> Đồ vật
            </h2>
            {tx.item?.image_url && (
              <img
                src={tx.item.image_url}
                alt={tx.item.title}
                className="w-full h-36 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {tx.item?.title}
              </p>
              <p className="text-xs text-gray-500">
                {tx.item?.category?.name} · {tx.item?.type === "GIVE" ? "Tặng" : "Cho mượn"}
              </p>
              {tx.item?.location && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" /> {tx.item.location}</p>
              )}
            </div>
          </div>

          {/* Thông tin Karma */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" /> Phân phối Karma
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phí mượn:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {tx.karma_amount} Karma
                </span>
              </div>
              {tx.deposit_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tiền cọc (hoàn khi trả đồ):</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {tx.deposit_amount} Karma
                  </span>
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between text-sm font-bold">
                <span>Tổng tạm khóa:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {totalKarma} Karma
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Hạn trả đồ:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {formatDate(tx.due_date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hai bên tham gia */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-emerald-500" /> Các bên tham gia
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Người cho mượn", user: tx.lender, isMe: isLender },
              { label: "Người mượn", user: tx.borrower, isMe: isBorrower },
            ].map(({ label, user: u, isMe }) => (
              <div
                key={u?.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isMe
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700"
                    : "bg-gray-50 dark:bg-gray-700/50"
                }`}
              >
                <img
                  src={
                    u?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      u?.full_name || "U"
                    )}&background=10b981&color=fff`
                  }
                  alt={u?.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs text-gray-500">
                    {label} {isMe && <span className="text-emerald-600 font-bold">(Bạn)</span>}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {u?.full_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel QR Code & Scanner */}
        {tx.status === "ESCROW_LOCKED" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-500" /> Xác thực giao nhận
            </h2>

            {/* Tab switchers */}
            <div className="flex gap-2 mb-5">
              {isLender && (
                <button
                  onClick={() => setActivePanel(activePanel === "qr" ? null : "qr")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    activePanel === "qr"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Hiển thị mã QR của tôi
                </button>
              )}
              {isBorrower && (
                <button
                  onClick={() => setActivePanel(activePanel === "scan" ? null : "scan")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    activePanel === "scan"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400"
                  }`}
                >
                  <ScanLine className="w-4 h-4" /> Bật camera quét QR
                </button>
              )}
            </div>

            {activePanel === "qr" && isLender && <QRDisplay transaction={tx} />}
            {activePanel === "scan" && isBorrower && (
              <QRScanner
                transaction={tx}
                onSuccess={() => {
                  loadTx();
                  setActivePanel(null);
                }}
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {tx.status === "QR_VERIFIED" && isLender && (
            <Button
              onClick={handleReturn}
              disabled={actionLoading}
              className="flex-1"
            >
              <CheckCircle2 className="w-5 h-5" />
              {actionLoading ? "Đang xử lý..." : "Xác nhận đã nhận lại đồ (Hoàn cọc)"}
            </Button>
          )}

          {["PENDING", "ESCROW_LOCKED"].includes(tx.status) && (
            <Button
              color="light"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              <XCircle className="w-4 h-4" />
              Hủy giao dịch (Hoàn Karma)
            </Button>
          )}

          <Button
            color="light"
            onClick={loadTx}
          >
            <RefreshCw className="w-4 h-4" /> Làm mới
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}
