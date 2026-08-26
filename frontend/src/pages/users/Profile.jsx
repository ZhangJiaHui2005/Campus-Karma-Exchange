import { useEffect, useState } from "react";
import {
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Avatar,
  Tooltip,
} from "flowbite-react";
import {
  Award,
  Zap,
  ShieldCheck,
  LogOut,
  BookOpen,
  Percent,
  MessageSquare,
  RefreshCw,
  Star,
} from "lucide-react";
import UserLayout from "../../layouts/UserLayout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Không thể tải thông tin profile");

      setUser(data.user || data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" color="success" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto mt-10">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }

  if (!user) return null;

  const { level, karma_balance } = user;

  return (
    <UserLayout>
      <div className="max-w-4xl space-y-6 mx-auto">
        {/* --- HEADER PROFILE & AVATAR --- */}
        <Card className="overflow-hidden">
          <div className="relative h-24 bg-linear-to-r from-emerald-500 to-teal-600 -m-6 mb-0 p-6 flex justify-end items-start gap-2">
            <Button
              size="xs"
              color="light"
              onClick={fetchProfile}
              className="h-8"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Làm mới
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pt-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <Avatar
                img={(props) => {
                  return (
                    <img
                      src={user.avatar || undefined}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      {...props}
                    />
                  );
                }}
                placeholderInitials={(
                  user.full_name?.charAt(0) || "U"
                ).toUpperCase()}
                rounded
                size="lg"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.full_name}
                  </h1>
                  {user.is_verified && (
                    <Tooltip content="Đã xác thực Sinh viên">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <Badge color="success" icon={Award} className="px-2.5 py-0.5">
                    {level?.level_name || "Tân thủ"}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    ID: #{user.user_id}
                  </span>
                </div>
              </div>
            </div>

            <Button
              color="gray"
              outline
              size="sm"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2 text-red-500" />
              Đăng xuất
            </Button>
          </div>
        </Card>

        {/* --- KHU VỰC THÔNG TIN CHÍNH --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CỘT 1: VÍ KARMA */}
          <Card className="bg-linear-to-br from-emerald-600 to-teal-700 text-white border-none shadow-lg md:col-span-1 [&>div]:gap-4">
            <div className="flex items-center justify-between">
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
                Số dư Ví Karma
              </p>
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
                <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight">
                  {karma_balance ?? 0}
                </span>
                <span className="text-emerald-200 font-bold text-lg">
                  Karma
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1">
                Dùng để đặt cọc & mượn đồ
              </p>
            </div>
          </Card>

          {/* CỘT 2 & 3: ĐẶC QUYỀN CẤP ĐỘ HIỆN TẠI */}
          <Card className="md:col-span-2">
            <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Đặc quyền cấp độ ({level?.level_name || "Tân thủ"})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Giới hạn mượn
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Tối đa {level?.borrow_limit ?? 2} món cùng lúc
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-start gap-3">
                <Percent className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ưu đãi cọc
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Giảm {level?.deposit_discount_pct ?? 0}% Karma cọc
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-start gap-3 sm:col-span-2">
                <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quyền Nhắn tin (Chat)
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {(level?.level_id ?? 1) >= 2 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Đã mở khóa trao đổi trực tiếp
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">
                        Mở khóa từ Level 2
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* --- CHỈ SỐ BẢO MẬT & XÁC THỰC --- */}
        <Card>
          <h3 className="font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700">
            Thông tin tài khoản
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center justify-between sm:justify-start sm:gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Đánh giá:
              </span>
              <div className="flex items-center gap-1 font-bold text-amber-500 text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>5.0 / 5.0</span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Trạng thái:
              </span>
              <Badge color="success">Đang hoạt động</Badge>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Email SV:
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {user.is_verified ? "Đã xác thực" : "Chưa xác thực"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </UserLayout>
  );
}
