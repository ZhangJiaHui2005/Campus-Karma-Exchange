import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyTransactions } from "../../services/transactionService";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../layouts/UserLayout";
import {
  Zap,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ xác nhận", bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", icon: Clock },
  ESCROW_LOCKED: { label: "Đã khóa Karma", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", icon: ShieldCheck },
  QR_VERIFIED: { label: "Đã giao nhận", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", icon: CheckCircle2 },
  COMPLETED: { label: "Hoàn thành", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-500 dark:text-gray-400", icon: XCircle },
  DISPUTED: { label: "Tranh chấp", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", icon: AlertTriangle },
};

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "borrower", label: "Đang mượn" },
  { key: "lender", label: "Đang cho mượn" },
];

function TransactionCard({ tx, currentUserId }) {
  const navigate = useNavigate();
  const isLender = tx.lender_id === currentUserId;
  const status = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const otherUser = isLender ? tx.borrower : tx.lender;
  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  return (
    <button
      onClick={() => navigate(`/transactions/${tx.trans_id}`)}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-start gap-4">
        {/* Item image */}
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {tx.item?.image_url ? (
            <img src={tx.item.image_url} alt={tx.item.title} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{tx.item?.title}</p>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400" />
          </div>

          <div className="flex items-center gap-2 mt-1">
            {/* Role badge */}
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isLender ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
              {isLender ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              {isLender ? "Cho mượn" : "Đang mượn"}
            </span>

            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <img
                src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.full_name || "U")}&size=32&background=10b981&color=fff`}
                alt={otherUser?.full_name}
                className="w-4 h-4 rounded-full"
              />
              {isLender ? "Người mượn" : "Người cho"}: {otherUser?.full_name}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400">
              <Zap className="w-3 h-3 fill-yellow-400" />
              {tx.karma_amount + tx.deposit_amount} Karma
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-1">Hạn trả: {formatDate(tx.due_date)}</p>
        </div>
      </div>
    </button>
  );
}

export default function MyTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadTransactions();
  }, [activeTab]);

  const loadTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const params = activeTab !== "all" ? { role: activeTab } : {};
      const res = await fetchMyTransactions(params);
      setTransactions(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = transactions.filter((t) =>
    ["ESCROW_LOCKED", "QR_VERIFIED"].includes(t.status)
  ).length;

  return (
    <UserLayout>
      <div className="mx-auto max-w-4xl space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-7 dark:border-slate-800">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">Lịch sử trao đổi</p>
            <h1 className="font-display text-4xl font-semibold text-slate-950 dark:text-white sm:text-5xl">Giao dịch của tôi</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {activeCount > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{activeCount} giao dịch đang chờ xử lý</span>
              ) : (
                "Theo dõi lịch sử mượn và cho mượn đồ dùng"
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white shadow-sm dark:bg-amber-400 dark:text-slate-950"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 font-medium">Chưa có giao dịch nào</p>
            <p className="text-xs text-gray-400 mt-1">Tìm kiếm vật phẩm để mượn hoặc đăng đồ cho mượn!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <TransactionCard key={tx.trans_id} tx={tx} currentUserId={user?.user_id} />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
