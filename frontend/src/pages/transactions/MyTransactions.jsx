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
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-emerald-400 hover:shadow-md transition-all group"
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
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 shrink-0 mt-0.5 transition-colors" />
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
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Giao dịch của tôi</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeCount > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{activeCount} giao dịch đang chờ xử lý</span>
              ) : (
                "Theo dõi lịch sử mượn và cho mượn đồ dùng"
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
