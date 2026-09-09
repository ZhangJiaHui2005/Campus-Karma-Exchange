import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  TextInput,
} from "flowbite-react";
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

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TYPE_LABEL = { GIVE: "Tặng", LEND: "Cho mượn", BORROW: "Cho mượn", SELL: "Bán", EXCHANGE: "Bán" };
const TYPE_COLOR = { GIVE: "success", LEND: "info", BORROW: "info", SELL: "warning", EXCHANGE: "warning" };

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
      <div className="mx-auto max-w-5xl space-y-7 pb-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Hình ảnh */}
          <div className="aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
          <div className="space-y-6 lg:py-3">
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
            <h1 className="font-display text-4xl font-semibold leading-tight text-slate-950 dark:text-white sm:text-5xl">
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
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  Phí {item.type === "GIVE" ? "nhận" : "mượn"}:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {item.karma_value} Karma
                </span>
              </div>
              {item.type !== "GIVE" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    Đặt cọc (Level {user?.level?.level_name || "Tân thủ"}):
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {estimatedDeposit} Karma
                    {discountPct > 0 && (
                      <span className="ml-1 text-xs text-emerald-600">(-{discountPct}%)</span>
                    )}
                  </span>
                </div>
              )}
              <div className="border-t border-emerald-200 dark:border-emerald-700 pt-2 flex justify-between font-bold">
                <span className="text-gray-800 dark:text-gray-200">Tổng cần có:</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-lg">
                  {totalKarma} Karma
                </span>
              </div>
              <p className="text-xs text-gray-400 pt-1">
                Số dư của bạn:{" "}
                <span className={`font-bold ${user?.karma_balance >= totalKarma ? "text-emerald-600" : "text-red-500"}`}>
                  {user?.karma_balance ?? "..."} Karma
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
                color="default"
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
        <Card>
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
        </Card>
      </div>

      {/* Modal xác nhận mượn */}
      <Modal show={showModal} size="md" onClose={() => setShowModal(false)} dismissible={!borrowing}>
        <ModalHeader>Xác nhận {item.type === "GIVE" ? "nhận" : "mượn"} đồ</ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800/70">
              <div className="flex justify-between">
                <span className="text-gray-500">Vật phẩm:</span>
                <span className="font-semibold text-gray-900 dark:text-white max-w-[180px] text-right">{item.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí {item.type === "GIVE" ? "nhận" : "mượn"}:</span>
                <span className="font-bold">{item.karma_value} Karma</span>
              </div>
              {estimatedDeposit > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cọc:</span>
                  <span className="font-bold">{estimatedDeposit} Karma</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-bold">
                <span>Tổng Karma bị khóa:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{totalKarma} Karma</span>
              </div>
            </div>

            {item.type !== "GIVE" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Hạn trả đồ
                </label>
                <TextInput
                  type="date"
                  value={dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            )}

            {borrowError && (
              <Alert color="failure" className="text-sm">{borrowError}</Alert>
            )}

            {(user?.karma_balance ?? 0) < totalKarma && (
              <p className="text-xs text-center text-red-500">
                Không đủ Karma. Cần {totalKarma}, bạn có {user?.karma_balance}.{" "}
                <a href="/wallet/topup" className="underline font-semibold">Nạp thêm?</a>
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleBorrow} disabled={borrowing || (user?.karma_balance ?? 0) < totalKarma}>
            {borrowing ? <Spinner size="sm" className="mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
            {borrowing ? "Đang xử lý..." : "Xác nhận"}
          </Button>
          <Button color="light" onClick={() => { setShowModal(false); setBorrowError(""); }} disabled={borrowing}>
            Hủy
          </Button>
        </ModalFooter>
      </Modal>
    </UserLayout>
  );
}
