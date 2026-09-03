import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Avatar,
  Tooltip,
  Progress,
  TextInput,
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
  Sparkles,
  TrendingUp,
  Crown,
  Wallet,
  SlidersHorizontal,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import UserLayout from "../../layouts/UserLayout";
import {
  adjustUserLevel,
  getUserLevelStatus,
} from "../../services/userService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Cấu hình visual cho từng Level (Huy hiệu & màu sắc phong cách gaming/fintech)
const LEVEL_CONFIGS = {
  1: {
    id: 1,
    name: "Tân thủ",
    title: "Mầm Non Tín Nhiệm",
    motto: "Khởi đầu hành trình chia sẻ đồ dùng văn minh",
    badgeColor: "emerald",
    gradient: "from-emerald-500 via-teal-600 to-green-700",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    borderLight: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
    icon: Shield,
    iconColor: "text-emerald-500",
    ringColor: "ring-emerald-400/50",
    tag: "Cấp 1 - Mầm non",
  },
  2: {
    id: 2,
    name: "Tích cực",
    title: "Hiệp Sĩ Năng Động",
    motto: "Thành viên tích cực, xây dựng uy tín cộng đồng",
    badgeColor: "cyan",
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    bgLight: "bg-sky-50 dark:bg-sky-950/30",
    borderLight: "border-sky-200 dark:border-sky-800",
    textColor: "text-sky-700 dark:text-sky-300",
    icon: Star,
    iconColor: "text-sky-400",
    ringColor: "ring-sky-400/50",
    tag: "Cấp 2 - Uy tín cao",
  },
  3: {
    id: 3,
    name: "Đại sứ Xanh",
    title: "Đại Sứ Xanh Tối Cao",
    motto: "Biểu tượng tín nhiệm & văn hóa chia sẻ tinh hoa",
    badgeColor: "amber",
    gradient: "from-amber-400 via-orange-500 to-yellow-600",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    borderLight: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-800 dark:text-amber-300",
    icon: Crown,
    iconColor: "text-amber-400",
    ringColor: "ring-amber-400/50",
    tag: "Cấp 3 - Tối cao",
  },
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [levelStatus, setLevelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionNotification, setActionNotification] = useState(null);

  // State cho bộ điều khiển test API
  const [customKarmaAmount, setCustomKarmaAmount] = useState("50");
  const [showSimulator, setShowSimulator] = useState(true);
  const [activeTabLevel, setActiveTabLevel] = useState(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resProfile, resLevel] = await Promise.all([
        fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        getUserLevelStatus().catch(() => null),
      ]);

      const dataProfile = await resProfile.json();
      if (!resProfile.ok)
        throw new Error(dataProfile.message || "Không thể tải thông tin profile");

      const currentUser = dataProfile.user || dataProfile.data;
      setUser(currentUser);

      if (resLevel?.data) {
        setLevelStatus(resLevel.data);
        setActiveTabLevel(resLevel.data.level?.level_id || currentUser?.level_id || 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Handler gọi API Lên/Xuống Level & Điều chỉnh Karma
  const handleAdjustLevel = async (payload) => {
    try {
      setActionLoading(true);
      setActionNotification(null);

      const response = await adjustUserLevel(payload);

      if (response.success) {
        const { change_type, current_level, current_karma, karma_difference } =
          response.data;

        let type = "info";
        let title = "Cập nhật Karma thành công";

        if (change_type === "LEVEL_UP") {
          type = "success";
          title = `🎉 Chúc mừng! Bạn đã thăng hạng lên Cấp "${current_level.level_name}"!`;
        } else if (change_type === "LEVEL_DOWN") {
          type = "warning";
          title = `⚠️ Cảnh báo: Cấp độ đã hạ xuống "${current_level.level_name}"!`;
        } else {
          title = `Điểm Karma: ${karma_difference > 0 ? "+" : ""}${karma_difference} (${current_karma} Karma)`;
        }

        setActionNotification({
          type,
          title,
          message: response.message,
          data: response.data,
        });

        // Cập nhật lại state trực tiếp để UI phản hồi mượt mà
        await fetchProfileData();
      }
    } catch (err) {
      setActionNotification({
        type: "failure",
        title: "Thao tác thất bại",
        message: err.message || "Không thể thực hiện điều chỉnh cấp độ.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-3">
        <Spinner size="xl" color="success" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
          Đang tải dữ liệu hồ sơ sinh viên...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto mt-10">
        <Alert color="failure" icon={AlertTriangle}>
          <span className="font-medium">Lỗi:</span> {error}
        </Alert>
        <div className="mt-4 text-center">
          <Button color="light" onClick={fetchProfileData}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentLevelId = user.level_id || user.level?.level_id || 1;
  const currentLevelInfo = LEVEL_CONFIGS[currentLevelId] || LEVEL_CONFIGS[1];
  const LevelIcon = currentLevelInfo.icon;

  const allLevels = levelStatus?.all_levels || [
    { level_id: 1, level_name: "Tân thủ", min_karma: 0, max_karma: 200, borrow_limit: 2, deposit_discount_pct: 0 },
    { level_id: 2, level_name: "Tích cực", min_karma: 201, max_karma: 1000, borrow_limit: 5, deposit_discount_pct: 20 },
    { level_id: 3, level_name: "Đại sứ Xanh", min_karma: 1001, max_karma: 999999, borrow_limit: 10, deposit_discount_pct: 50 },
  ];

  const progress = levelStatus?.progress || {
    progressPct: Math.min(100, Math.round(((user.karma_balance || 0) / 200) * 100)),
    karmaNeeded: Math.max(0, 201 - (user.karma_balance || 0)),
    nextLevel: allLevels[1],
    isMaxLevel: currentLevelId === 3,
  };

  const selectedTier = allLevels.find((l) => l.level_id === (activeTabLevel || currentLevelId)) || user.level;

  return (
    <UserLayout>
      <div className="max-w-5xl space-y-6 mx-auto pb-12">
        {/* --- NOTIFICATION BANNER KHI THỰC HIỆN API LEVEL --- */}
        {actionNotification && (
          <Alert
            color={
              actionNotification.type === "success"
                ? "success"
                : actionNotification.type === "warning"
                ? "warning"
                : actionNotification.type === "failure"
                ? "failure"
                : "info"
            }
            onDismiss={() => setActionNotification(null)}
            className="shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {actionNotification.title}
              </span>
            </div>
            <p className="text-xs mt-1 text-gray-700 dark:text-gray-200">
              {actionNotification.message}
            </p>
          </Alert>
        )}

        {/* --- HEADER PROFILE & AVATAR --- */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
          {/* Banner Gradient Phông nền */}
          <div className="relative h-32 sm:h-36 bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 flex justify-between items-start">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Campus Karma Profile</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="xs"
                color="light"
                onClick={fetchProfileData}
                disabled={actionLoading}
                className="bg-white/90 dark:bg-gray-800/90 hover:bg-white text-gray-700 dark:text-gray-200 shadow-xs"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1 ${actionLoading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
              <Button
                size="xs"
                color="light"
                onClick={() => setShowSimulator(!showSimulator)}
                className="bg-white/90 dark:bg-gray-800/90 hover:bg-white text-gray-700 dark:text-gray-200 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {showSimulator ? "Ẩn Test API" : "Test API Level"}
              </Button>
            </div>
          </div>

          {/* Avatar & Thông tin Sinh viên */}
          <div className="px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="relative">
                  <Avatar
                    img={(props) => (
                      <img
                        src={user.avatar || undefined}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        className="rounded-full ring-4 ring-white dark:ring-gray-800 shadow-md object-cover"
                        {...props}
                      />
                    )}
                    placeholderInitials={(
                      user.full_name?.charAt(0) || "U"
                    ).toUpperCase()}
                    rounded
                    size="xl"
                  />
                  {/* Badge icon nhỏ trên avatar */}
                  <div className="absolute bottom-0 right-0 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
                      ✓
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {user.full_name}
                    </h1>
                    {user.is_verified && (
                      <Tooltip content="Sinh viên đã xác thực Email (.edu.vn)">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {user.email}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <Badge
                      color={currentLevelInfo.badgeColor}
                      icon={currentLevelInfo.icon}
                      className="px-3 py-1 font-semibold text-xs tracking-wide uppercase"
                    >
                      {user.level?.level_name || currentLevelInfo.name}
                    </Badge>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                      Mã SV: #{user.user_id}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  color="gray"
                  outline
                  size="sm"
                  onClick={handleLogout}
                  className="w-full sm:w-auto hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  <LogOut className="w-4 h-4 mr-2 text-red-500" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- KHU VỰC CHÍNH: VÍ KARMA & HUY HIỆU LEVEL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI (5/12): THẺ SỐ DƯ KARMA */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-6 shadow-xl flex flex-col justify-between min-h-[260px] border border-emerald-400/20">
              {/* Background watermark icon */}
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <Zap className="w-48 h-48 text-white fill-white" />
              </div>

              {/* Header card ví */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl ring-1 ring-white/30">
                    <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold block">
                      Ví Điểm Tín Nhiệm
                    </span>
                    <span className="text-[11px] text-emerald-100/70">
                      Campus Karma Balance
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-400/20 text-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  Khả dụng
                </span>
              </div>

              {/* Số dư to nổi bật */}
              <div className="my-6 z-10">
                <p className="text-xs text-emerald-100 font-medium mb-1">
                  Số dư hiện tại
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight drop-shadow-sm font-sans">
                    {(user.karma_balance || 0).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-xl font-bold text-yellow-300 tracking-wide">
                    Karma
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-2 flex items-center gap-1.5">
                  <span className="font-semibold text-white">
                    ≈ {(user.karma_balance * 1000).toLocaleString("vi-VN")} VNĐ
                  </span>
                  <span>(1 Karma = 1,000đ khi quy đổi)</span>
                </p>
              </div>

              {/* Các nút thao tác ví */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 z-10">
                <Link
                  to="/wallet/topup"
                  className="flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-xs py-2 px-3 rounded-xl transition shadow-md"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-900 fill-amber-900" />
                  Nạp thêm Karma
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs py-2 px-3 rounded-xl backdrop-blur-md transition border border-white/20"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Lịch sử nạp
                </Link>
              </div>
            </div>

            {/* Thẻ mô tả công dụng số dư Karma */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Công dụng của Điểm Karma</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-500 dark:text-gray-400 pl-1">
                <li>Dùng để ký quỹ và đặt cọc khi mượn đồ dùng sinh viên.</li>
                <li>Tự động xác định đẳng cấp & quyền hạn mượn đồ.</li>
                <li>Có thể tích lũy thêm thông qua hoàn thành nhiệm vụ & chia sẻ đồ.</li>
              </ul>
            </div>
          </div>

          {/* CỘT PHẢI (7/12): HUY HIỆU LEVEL & TIẾN TRÌNH THĂNG HẠNG */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* THẺ HUY HIỆU LEVEL ĐỘC QUYỀN (Theo đúng Image 2) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/90 dark:border-gray-700/90 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Huy Hiệu & Cấp Độ Tín Nhiệm
                  </h3>
                </div>
                <Badge
                  color={currentLevelInfo.badgeColor}
                  className="font-bold text-xs"
                >
                  {currentLevelInfo.tag}
                </Badge>
              </div>

              {/* Showcase Huy Hiệu (Level Badge) */}
              <div className="mt-5 p-5 rounded-2xl bg-linear-to-r from-gray-50 to-emerald-50/40 dark:from-gray-900/60 dark:to-emerald-950/20 border border-emerald-100/60 dark:border-emerald-800/40 flex flex-col sm:flex-row items-center gap-5">
                {/* Visual Huy hiệu */}
                <div className="relative shrink-0">
                  <div
                    className={`w-24 h-24 rounded-2xl bg-linear-to-br ${currentLevelInfo.gradient} p-0.5 shadow-lg flex items-center justify-center transform hover:rotate-3 transition duration-300`}
                  >
                    <div className="w-full h-full bg-white/10 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-2 text-white border border-white/30">
                      <LevelIcon className="w-10 h-10 text-white drop-shadow-md" />
                      <span className="text-[10px] font-black uppercase tracking-wider mt-1 drop-shadow-xs">
                        {user.level?.level_name || currentLevelInfo.name}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`absolute -bottom-2 -right-2 px-2 py-0.5 bg-gray-900 text-yellow-400 text-[10px] font-black rounded-full border border-yellow-400/40 shadow-xs`}
                  >
                    LV.{currentLevelId}
                  </div>
                </div>

                {/* Nội dung danh hiệu & khẩu hiệu */}
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-xl font-black text-gray-900 dark:text-white">
                      {currentLevelInfo.title}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      Cấp {currentLevelId}/3
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                    "{currentLevelInfo.motto}"
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    Khoảng điểm cấp độ: {user.level?.min_karma ?? 0} -{" "}
                    {user.level?.max_karma?.toLocaleString("vi-VN") ?? "200"} Karma
                  </p>
                </div>
              </div>

              {/* THANH TIẾN TRÌNH THĂNG HẠNG (LEVEL PROGRESS BAR) */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Tiến trình thăng cấp</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {progress.progressPct}%
                  </span>
                </div>

                {/* Flowbite Progress Bar */}
                <Progress
                  progress={progress.progressPct}
                  color="green"
                  size="lg"
                  className="rounded-full shadow-inner"
                />

                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  <span>
                    Hiện tại:{" "}
                    <strong className="text-gray-900 dark:text-white">
                      {user.karma_balance} Karma
                    </strong>
                  </span>
                  {progress.isMaxLevel ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" /> Đã đạt cấp tối đa!
                    </span>
                  ) : (
                    <span>
                      Cần thêm:{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {progress.karmaNeeded} Karma
                      </strong>{" "}
                      để lên{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {progress.nextLevel?.level_name || "Cấp tiếp theo"}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BẢNG ĐẶC QUYỀN CẤP ĐỘ (LEVEL PERKS) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/90 dark:border-gray-700/90 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  Đặc Quyền Của Cấp Độ ({user.level?.level_name})
                </h3>

                {/* Tabs chọn xem đặc quyền các cấp độ */}
                <div className="flex items-center gap-1">
                  {allLevels.map((lvl) => (
                    <button
                      key={lvl.level_id}
                      onClick={() => setActiveTabLevel(lvl.level_id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        (activeTabLevel || currentLevelId) === lvl.level_id
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {lvl.level_name}
                      {lvl.level_id === currentLevelId && " (Tôi)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lưới các đặc quyền */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                {/* Đặc quyền 1: Hạn mức mượn */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Hạn mức mượn đồ</span>
                  </div>
                  <p className="text-base font-black text-gray-900 dark:text-white">
                    Tối đa {selectedTier?.borrow_limit ?? 2} món
                  </p>
                  <p className="text-[11px] text-gray-400">cùng một thời điểm</p>
                </div>

                {/* Đặc quyền 2: Giảm cọc */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Percent className="w-4 h-4 text-emerald-500" />
                    <span>Ưu đãi tiền cọc</span>
                  </div>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    Giảm {selectedTier?.deposit_discount_pct ?? 0}% cọc
                  </p>
                  <p className="text-[11px] text-gray-400">tiết kiệm điểm đặt cọc</p>
                </div>

                {/* Đặc quyền 3: Quyền chat */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>Quyền nhắn tin (Chat)</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">
                    {(selectedTier?.level_id ?? 1) >= 2 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">
                        ✓ Mở khóa chat trực tiếp
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">
                        Khóa (Yêu cầu Level 2)
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400">trao đổi với người mượn</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BỘ ĐIỀU KHIỂN THỬ NGHIỆM API LÊN/XUỐNG LEVEL (LEVEL SIMULATOR) --- */}
        {showSimulator && (
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-indigo-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
                    Bộ Điều Khiển Thử Nghiệm API Lên / Xuống Level
                    <Badge color="purple" className="text-[10px]">
                      DEV TEST API
                    </Badge>
                  </h3>
                  <p className="text-xs text-indigo-200/80">
                    Endpoint: <code className="bg-black/40 px-1.5 py-0.5 rounded text-indigo-300 font-mono">POST /api/users/level/adjust</code> (Tự động tính lên/xuống cấp theo Karma)
                  </p>
                </div>
              </div>

              <div className="text-xs text-indigo-300 bg-indigo-900/40 px-3 py-1 rounded-lg border border-indigo-700/50">
                Trạng thái: <strong>Level {currentLevelId}</strong> ({user.level?.level_name}) | <strong>{user.karma_balance} Karma</strong>
              </div>
            </div>

            {/* Các nút bấm kiểm thử API nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
              {/* CỘT 1: HÀNH ĐỘNG NHANH CỘNG / TRỪ KARMA */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider block">
                  1. Thử nghiệm thay đổi Karma (Tự động tính Level)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="xs"
                    color="success"
                    disabled={actionLoading}
                    onClick={() => handleAdjustLevel({ amount: 50, reason: "Test +50 Karma" })}
                    className="font-bold"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
                    +50 Karma
                  </Button>

                  <Button
                    size="xs"
                    color="purple"
                    disabled={actionLoading}
                    onClick={() => handleAdjustLevel({ amount: 250, reason: "Test +250 Karma (Thăng cấp)" })}
                    className="font-bold"
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +250 Karma
                  </Button>

                  <Button
                    size="xs"
                    color="failure"
                    disabled={actionLoading}
                    onClick={() => handleAdjustLevel({ amount: -150, reason: "Test -150 Karma (Hạ cấp)" })}
                    className="font-bold"
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5 mr-1" />
                    -150 Karma
                  </Button>
                </div>

                {/* Nhập số tùy chỉnh */}
                <div className="flex items-center gap-2 pt-1">
                  <TextInput
                    type="number"
                    size="sm"
                    placeholder="Nhập số Karma (+ hoặc -)"
                    value={customKarmaAmount}
                    onChange={(e) => setCustomKarmaAmount(e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <Button
                    size="xs"
                    color="blue"
                    disabled={actionLoading || !customKarmaAmount}
                    onClick={() =>
                      handleAdjustLevel({
                        amount: Number(customKarmaAmount),
                        reason: `Tùy chỉnh ${customKarmaAmount} Karma`,
                      })
                    }
                    className="font-bold shrink-0 h-9"
                  >
                    {actionLoading ? <Spinner size="xs" /> : "Gửi API"}
                  </Button>
                </div>
              </div>

              {/* CỘT 2: HÀNH ĐỘNG TRỰC TIẾP LEVEL UP / LEVEL DOWN */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider block">
                  2. Thử nghiệm trực tiếp Level Up & Down
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    color="light"
                    disabled={actionLoading || currentLevelId >= 3}
                    onClick={() => handleAdjustLevel({ action: "level_up", reason: "Test Level Up" })}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold"
                  >
                    <ArrowUpCircle className="w-4 h-4 mr-2 text-emerald-400" />
                    Thăng 1 Cấp (Level Up)
                  </Button>

                  <Button
                    color="light"
                    disabled={actionLoading || currentLevelId <= 1}
                    onClick={() => handleAdjustLevel({ action: "level_down", reason: "Test Level Down" })}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/40 font-bold"
                  >
                    <ArrowDownCircle className="w-4 h-4 mr-2 text-red-400" />
                    Hạ 1 Cấp (Level Down)
                  </Button>
                </div>

                <p className="text-[11px] text-indigo-300/70 pt-1">
                  💡 Sau này khi tích hợp hệ thống nhiệm vụ (missions), module missions chỉ cần gọi hàm <code className="text-yellow-300 font-mono">adjustUserKarmaAndLevel()</code> là level sẽ tự động nhảy tương ứng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- CHỈ SỐ TÀI KHOẢN & BẢO MẬT --- */}
        <Card className="bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700 text-sm">
            Thông Tin Tài Khoản & Uy Tín
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center justify-between sm:justify-start sm:gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Đánh giá uy tín:
              </span>
              <div className="flex items-center gap-1 font-black text-amber-500 text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>5.0 / 5.0</span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Trạng thái:
              </span>
              <Badge color="success">Đang hoạt động</Badge>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Email Sinh Viên:
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user.is_verified ? "Đã xác thực (.edu.vn)" : "Chưa xác thực"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </UserLayout>
  );
}
