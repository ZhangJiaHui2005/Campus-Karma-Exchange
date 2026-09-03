import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Spinner, Alert } from "flowbite-react";
import {
  MapPin,
  Zap,
  Calendar,
  User,
  Package,
  ArrowLeft,
  ShieldCheck,
  Clock,
  BookOpen,
  Percent,
} from "lucide-react";
import UserLayout from "../../layouts/UserLayout";
import { useAuth } from "../../context/AuthContext";
import { createTransaction } from "../../services/transactionService";

const API = import.meta.env.VITE_API_URL;

const TYPE_LABEL = { GIVE: "Tặng", LEND: "Cho mượn", BORROW: "Cho mượn", EXCHANGE: "Trao đổi" };
const TYPE_COLOR = { GIVE: "success", LEND: "info", BORROW: "info", EXCHANGE: "warning" };

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal mượn đồ
  const [showModal, setShowModal] = useState(false);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [borrowing, setBorrowing] = useState(false);
  const [borrowError, setBorrowError] = useState("");

  useEffect(() => {
    fetch(`${API}/items/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.message);
        setItem(d.item);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBorrow = async () => {
    setBorrowing(true);
    setBorrowError("");
    try {
      const res = await createTransaction({
        item_id: parseInt(id),
        due_date: dueDate,
      });
      // Chuyển thẳng đến trang giao dịch vừa tạo
      navigate(`/transactions/${res.data.trans_id}`);
    } catch (err) {
      setBorrowError(err.message);
    } finally {
      setBorrowing(false);
    }
  };

  // Tính cọc ước lượng theo level của user
  const discountPct = user?.level?.deposit_discount_pct ?? 0;
  const estimatedDeposit = item
    ? item.type === "GIVE"
      ? 0
      : Math.ceil(item.karma_value * (1 - discountPct / 100))
    : 0;
  const totalKarma = item ? item.karma_value + estimatedDeposit : 0;
  const isOwner = user?.user_id === item?.owner_id;
  const canBorrow = item?.status === "AVAILABLE" && !isOwner;

  if (loading) return (
    <UserLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" color="success" />
      </div>
    </UserLayout>
  );

  if (error || !item) return (
    <UserLayout>
      <div className="max-w-2xl mx-auto mt-10">
        <Alert color="failure">{error || "Không tìm thấy vật phẩm"}</Alert>
      </div>
    </UserLayout>
  );

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hình ảnh */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>

          {/* Thông tin */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge color={TYPE_COLOR[item.type] || "gray"} size="sm">
                {TYPE_LABEL[item.type] || item.type}
              </Badge>
              <Badge color="gray" size="sm">{item.category?.name}</Badge>
              {item.status !== "AVAILABLE" && (
                <Badge color="failure" size="sm">Không khả dụng</Badge>
              )}
            </div>

            {/* Tên */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.title}
            </h1>

            {/* Mô tả */}
            {item.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Địa điểm */}
            {item.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-emerald-500" />
                {item.location}
              </div>
            )}

            {/* Karma breakdown */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  Phí {item.type === "GIVE" ? "nhận" : "mượn"}:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {item.karma_value} ⚡
                </span>
              </div>
              {item.type !== "GIVE" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    Đặt cọc (Level {user?.level?.level_name || "Tân thủ"}):
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {estimatedDeposit} ⚡
                    {discountPct > 0 && (
                      <span className="ml-1 text-xs text-emerald-600">(-{discountPct}%)</span>
                    )}
                  </span>
                </div>
              )}
              <div className="border-t border-emerald-200 dark:border-emerald-700 pt-2 flex justify-between font-bold">
                <span className="text-gray-800 dark:text-gray-200">Tổng cần có:</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-lg">
                  {totalKarma} ⚡
                </span>
              </div>
              <p className="text-xs text-gray-400 pt-1">
                Số dư của bạn:{" "}
                <span className={`font-bold ${user?.karma_balance >= totalKarma ? "text-emerald-600" : "text-red-500"}`}>
                  {user?.karma_balance ?? "..."} ⚡
                </span>
              </p>
            </div>

            {/* Level privileges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">
                  Giới hạn: {user?.level?.borrow_limit ?? 2} món
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Percent className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">
                  Ưu đãi cọc: {discountPct}%
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            {isOwner ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-400 text-center">
                Đây là vật phẩm của bạn
              </div>
            ) : item.status !== "AVAILABLE" ? (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm text-gray-500 text-center">
                Vật phẩm này hiện không khả dụng
              </div>
            ) : (
              <Button
                color="success"
                size="lg"
                className="w-full dark:text-white"
                onClick={() => setShowModal(true)}
              >
                <Zap className="w-5 h-5 mr-2 fill-yellow-300 text-yellow-300" />
                {item.type === "GIVE" ? "Nhận đồ này" : "Mượn ngay"}
              </Button>
            )}
          </div>
        </div>

        {/* Thông tin người cho */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-emerald-500" />
            Người {item.type === "GIVE" ? "tặng" : "cho mượn"}
          </h2>
          <div className="flex items-center gap-4">
            <img
              src={item.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.owner?.full_name || "U")}&background=10b981&color=fff&size=64`}
              alt={item.owner?.full_name}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.owner?.full_name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Đăng {new Date(item.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận mượn */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Xác nhận {item.type === "GIVE" ? "nhận" : "mượn"} đồ
            </h3>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Vật phẩm:</span>
                <span className="font-semibold text-gray-900 dark:text-white max-w-[180px] text-right">{item.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí {item.type === "GIVE" ? "nhận" : "mượn"}:</span>
                <span className="font-bold">{item.karma_value} ⚡</span>
              </div>
              {estimatedDeposit > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cọc:</span>
                  <span className="font-bold">{estimatedDeposit} ⚡</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-bold">
                <span>Tổng Karma bị khóa:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{totalKarma} ⚡</span>
              </div>
            </div>

            {item.type !== "GIVE" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Hạn trả đồ
                </label>
                <input
                  type="date"
                  value={dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>
            )}

            {borrowError && (
              <Alert color="failure" className="text-sm">{borrowError}</Alert>
            )}

            <div className="flex gap-3">
              <Button
                color="gray"
                className="flex-1"
                onClick={() => { setShowModal(false); setBorrowError(""); }}
                disabled={borrowing}
              >
                Hủy
              </Button>
              <Button
                color="success"
                className="flex-1 dark:text-white"
                onClick={handleBorrow}
                disabled={borrowing || (user?.karma_balance ?? 0) < totalKarma}
              >
                {borrowing ? (
                  <><Spinner size="sm" className="mr-2" /> Đang xử lý...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-1.5 fill-yellow-300 text-yellow-300" /> Xác nhận</>
                )}
              </Button>
            </div>

            {(user?.karma_balance ?? 0) < totalKarma && (
              <p className="text-xs text-center text-red-500">
                Không đủ Karma. Cần {totalKarma}, bạn có {user?.karma_balance}.{" "}
                <a href="/wallet/topup" className="underline font-semibold">Nạp thêm?</a>
              </p>
            )}
          </div>
        </div>
      )}
    </UserLayout>
  );
}
