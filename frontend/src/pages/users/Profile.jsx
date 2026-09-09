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
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import UserLayout from "../../layouts/UserLayout";
import { adjustUserLevel } from "../../services/userService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LEVEL_CONFIGS = {
  1: {
    level_id: 1,
    level_name: "Tân thủ",
    min_karma: 0,
    max_karma: 200,
    borrow_limit: 2,
    deposit_discount_pct: 0,
    badgeColor: "gray",
    tag: "TÂN THỦ",
    title: "Tân Thủ Campus",
    motto: "Mỗi hành động nhỏ đều là bước khởi đầu.",
    icon: BookOpen,
    gradient: "from-gray-500 to-gray-700",
  },
  2: {
    level_id: 2,
    level_name: "Tích cực",
    min_karma: 201,
    max_karma: 1000,
    borrow_limit: 5,
    deposit_discount_pct: 20,
    badgeColor: "blue",
    tag: "TÍCH CỰC",
    title: "Tích Cực Xanh",
    motto: "Uy tín được xây từng ngày, từng việc nhỏ.",
    icon: ShieldCheck,
    gradient: "from-blue-500 to-blue-700",
  },
  3: {
    level_id: 3,
    level_name: "Đại sứ Xanh",
    min_karma: 1001,
    max_karma: 999999,
    borrow_limit: 10,
    deposit_discount_pct: 50,
    badgeColor: "emerald",
    tag: "ĐẠI SỨ XANH",
    title: "Đại Sứ Xanh",
    motto: "Lãnh đạo bằng hành động, truyền cảnh bằng sẻ chia.",
    icon: Crown,
    gradient: "from-emerald-500 to-teal-700",
  },
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [levelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionNotification, setActionNotification] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [activeTabLevel, setActiveTabLevel] = useState(1);
  const [customKarmaAmount, setCustomKarmaAmount] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Không thể tải thông tin profile");

      const currentUser = data.user || data.data;
      setUser(currentUser);
      setActiveTabLevel(currentUser.level_id || currentUser.level?.level_id || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
          title = `Chúc mừng! Bạn đã thăng hạng lên cấp "${current_level.level_name}"!`;
        } else if (change_type === "LEVEL_DOWN") {
          type = "warning";
          title = `Cấp độ đã được điều chỉnh xuống "${current_level.level_name}".`;
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
      <UserLayout>
        <div className="profile-liquid mx-auto flex min-h-72 max-w-xl flex-col items-center justify-center gap-3 rounded-[2rem] p-8">
          <Spinner size="xl" />
          <p className="animate-pulse text-sm font-medium text-slate-500 dark:text-slate-400">
            Đang tải dữ liệu hồ sơ sinh viên...
          </p>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="profile-liquid mx-auto max-w-md rounded-[2rem] p-5 sm:p-6">
          <Alert color="failure" icon={AlertTriangle}>
            <span className="font-medium">Lỗi:</span> {error}
          </Alert>
          <div className="mt-4 text-center">
            <Button color="light" onClick={fetchProfileData}>
              Thử lại
            </Button>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!user) return null;

  const currentLevelId = user.level_id || user.level?.level_id || 1;
  const currentLevelInfo = LEVEL_CONFIGS[currentLevelId] || LEVEL_CONFIGS[1];
  const LevelIcon = currentLevelInfo.icon;

  const allLevels = levelStatus?.all_levels || [
    {
      level_id: 1,
      level_name: "Tân thủ",
      min_karma: 0,
      max_karma: 200,
      borrow_limit: 2,
      deposit_discount_pct: 0,
    },
    {
      level_id: 2,
      level_name: "Tích cực",
      min_karma: 201,
      max_karma: 1000,
      borrow_limit: 5,
      deposit_discount_pct: 20,
    },
    {
      level_id: 3,
      level_name: "Đại sứ Xanh",
      min_karma: 1001,
      max_karma: 999999,
      borrow_limit: 10,
      deposit_discount_pct: 50,
    },
  ];

  const progress = levelStatus?.progress || {
    progressPct: Math.min(
      100,
      Math.round(((user.karma_balance || 0) / 200) * 100),
    ),
    karmaNeeded: Math.max(0, 201 - (user.karma_balance || 0)),
    nextLevel: allLevels[1],
    isMaxLevel: currentLevelId === 3,
  };

  const selectedTier =
    allLevels.find((l) => l.level_id === (activeTabLevel || currentLevelId)) ||
    user.level;

  return (
    <UserLayout>
      <div className="mx-auto max-w-6xl space-y-6 pb-12 sm:space-y-8">
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
            className="profile-liquid rounded-2xl shadow-none transition-all duration-300"
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
        <section className="profile-liquid relative overflow-hidden rounded-[2rem]">
          {/* Banner Gradient Phông nền */}
          <div className="profile-liquid-hero editorial-grid relative flex min-h-48 flex-col items-start justify-between gap-6 overflow-hidden p-6 sm:min-h-52 sm:flex-row sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full border-[38px] border-amber-400/10 blur-[1px]" />
            <div className="relative max-w-xl">
              <div className="profile-liquid-soft inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Campus Karma Profile</span>
              </div>
              <p className="mt-5 font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Dấu ấn của bạn trong cộng đồng.
              </p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400">
                Theo dõi uy tín, đặc quyền và những giá trị bạn đã tạo ra tại Campus Karma.
              </p>
            </div>

            <div className="relative flex flex-wrap items-center gap-2">
              <Button
                size="xs"
                color="light"
                onClick={fetchProfileData}
                disabled={actionLoading}
                className="liquid-control !rounded-full !border-white/60 !bg-white/55 text-slate-700 shadow-none dark:!border-white/10 dark:!bg-white/[0.06] dark:text-slate-200"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1 ${actionLoading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
              {import.meta.env.DEV && (
                <Button
                  size="xs"
                  color="light"
                  onClick={() => setShowSimulator(!showSimulator)}
                  className="liquid-control !rounded-full !border-white/60 !bg-white/55 text-slate-700 shadow-none dark:!border-white/10 dark:!bg-white/[0.06] dark:text-slate-200"
                >
                  <SlidersHorizontal className="mr-1 h-3.5 w-3.5 text-amber-700" />
                  {showSimulator ? "Ẩn công cụ test" : "Công cụ test Level"}
                </Button>
              )}
            </div>
          </div>

          {/* Avatar & Thông tin Sinh viên */}
          <div className="px-6 pb-7 pt-0 sm:px-8 sm:pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="relative">
                  <Avatar
                    img={
                      user.avatar
                        ? (props) => (
                            <img
                              {...props}
                              src={user.avatar}
                              alt={`Ảnh đại diện của ${user.full_name}`}
                              referrerPolicy="no-referrer"
                              className={`${props.className || ""} rounded-full object-cover`}
                            />
                          )
                        : undefined
                    }
                    placeholderInitials={(
                      user.full_name?.charAt(0) || "U"
                    ).toUpperCase()}
                    rounded
                    size="xl"
                    className="rounded-full shadow-xl ring-4 ring-white/80 dark:ring-slate-950/80"
                  />
                  {/* Badge icon nhỏ trên avatar */}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
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
                    <span className="profile-liquid-soft rounded-full px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
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
                  className="liquid-control w-full !rounded-full !bg-white/40 sm:w-auto dark:!bg-white/[0.04] hover:!border-red-300 hover:!text-red-600 dark:hover:!border-red-500/40 dark:hover:!bg-red-950/20"
                >
                  <LogOut className="w-4 h-4 mr-2 text-red-500" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- KHU VỰC CHÍNH: VÍ KARMA & HUY HIỆU LEVEL --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* CỘT TRÁI (5/12): THẺ SỐ DƯ KARMA */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <section className="profile-karma-island editorial-grid relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[2rem] p-6 text-white sm:p-7">
              {/* Background watermark icon */}
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <Zap className="w-48 h-48 text-white fill-white" />
              </div>

              {/* Header card ví */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/20 backdrop-blur-md">
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

                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-400/15 px-2.5 py-1 text-[11px] text-emerald-100 backdrop-blur-md">
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
              <div className="z-10 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <Link
                  to="/wallet/topup"
                  className="flex items-center justify-center gap-1.5 rounded-full bg-amber-400 px-3 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-950/20 transition hover:bg-amber-300"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-900 fill-amber-900" />
                  Nạp thêm Karma
                </Link>
                <Link
                  to="/wallet"
                  className="flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Lịch sử nạp
                </Link>
              </div>
            </section>

            {/* Thẻ mô tả công dụng số dư Karma */}
            <aside className="profile-liquid-soft space-y-2 rounded-2xl p-5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Công dụng của Điểm Karma</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-500 dark:text-gray-400 pl-1">
                <li>Dùng để ký quỹ và đặt cọc khi mượn đồ dùng sinh viên.</li>
                <li>Tự động xác định đẳng cấp & quyền hạn mượn đồ.</li>
                <li>
                  Có thể tích lũy thêm thông qua hoàn thành nhiệm vụ & chia sẻ
                  đồ.
                </li>
              </ul>
            </aside>
          </div>

          {/* CỘT PHẢI (7/12): HUY HIỆU LEVEL & TIẾN TRÌNH THĂNG HẠNG */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* THẺ HUY HIỆU LEVEL ĐỘC QUYỀN (Theo đúng Image 2) */}
            <section className="profile-liquid rounded-[2rem] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-900/8 pb-4 dark:border-white/8">
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
              <div className="profile-liquid-soft mt-5 flex flex-col items-center gap-5 rounded-3xl p-5 sm:flex-row">
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
                    <span className="profile-liquid-soft rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      Cấp {currentLevelId}/3
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                    "{currentLevelInfo.motto}"
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    Khoảng điểm cấp độ: {user.level?.min_karma ?? 0} -{" "}
                    {user.level?.max_karma?.toLocaleString("vi-VN") ?? "200"}{" "}
                    Karma
                  </p>
                </div>
              </div>

              {/* THANH TIẾN TRÌNH THĂNG HẠNG (LEVEL PROGRESS BAR) */}
              <div className="mt-6 border-t border-slate-900/8 pt-4 dark:border-white/8">
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
            </section>

            {/* BẢNG ĐẶC QUYỀN CẤP ĐỘ (LEVEL PERKS) */}
            <section className="profile-liquid rounded-[2rem] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-900/8 pb-4 dark:border-white/8 sm:flex-row sm:items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  Đặc Quyền Của Cấp Độ ({user.level?.level_name})
                </h3>

                {/* Tabs chọn xem đặc quyền các cấp độ */}
                <div className="flex flex-wrap items-center justify-end gap-1">
                  {allLevels.map((lvl) => (
                    <button
                      key={lvl.level_id}
                      onClick={() => setActiveTabLevel(lvl.level_id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        (activeTabLevel || currentLevelId) === lvl.level_id
                          ? "bg-emerald-600 text-white font-bold"
                          : "profile-liquid-soft text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-white/10"
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
                <div className="profile-liquid-soft flex flex-col justify-between rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Hạn mức mượn đồ</span>
                  </div>
                  <p className="text-base font-black text-gray-900 dark:text-white">
                    Tối đa {selectedTier?.borrow_limit ?? 2} món
                  </p>
                  <p className="text-[11px] text-gray-400">
                    cùng một thời điểm
                  </p>
                </div>

                {/* Đặc quyền 2: Giảm cọc */}
                <div className="profile-liquid-soft flex flex-col justify-between rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Percent className="w-4 h-4 text-emerald-500" />
                    <span>Ưu đãi tiền cọc</span>
                  </div>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    Giảm {selectedTier?.deposit_discount_pct ?? 0}% cọc
                  </p>
                  <p className="text-[11px] text-gray-400">
                    tiết kiệm điểm đặt cọc
                  </p>
                </div>

                {/* Đặc quyền 3: Quyền chat */}
                <div className="profile-liquid-soft flex flex-col justify-between rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>Quyền nhắn tin (Chat)</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">
                    {(selectedTier?.level_id ?? 1) >= 2 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Mở khóa chat trực tiếp
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">
                        Khóa (Yêu cầu Level 2)
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    trao đổi với người mượn
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* --- BỘ ĐIỀU KHIỂN THỬ NGHIỆM API LÊN/XUỐNG LEVEL (LEVEL SIMULATOR) --- */}
        {import.meta.env.DEV && showSimulator && (
          <section className="profile-liquid overflow-hidden rounded-[2rem] p-6 text-slate-900 dark:text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-indigo-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-base font-black tracking-wide text-slate-950 dark:text-white">
                    Bộ Điều Khiển Thử Nghiệm API Lên / Xuống Level
                    <Badge color="purple" className="text-[10px]">
                      DEV TEST API
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-indigo-200/80">
                    Endpoint:{" "}
                    <code className="rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-indigo-700 dark:bg-black/40 dark:text-indigo-300">
                      POST /api/users/level/adjust
                    </code>{" "}
                    (Tự động tính lên/xuống cấp theo Karma)
                  </p>
                </div>
              </div>

              <div className="profile-liquid-soft rounded-full px-3 py-1 text-xs text-indigo-700 dark:text-indigo-300">
                Trạng thái: <strong>Level {currentLevelId}</strong> (
                {user.level?.level_name}) |{" "}
                <strong>{user.karma_balance} Karma</strong>
              </div>
            </div>

            {/* Các nút bấm kiểm thử API nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
              {/* CỘT 1: HÀNH ĐỘNG NHANH CỘNG / TRỪ KARMA */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-200">
                  1. Thử nghiệm thay đổi Karma (Tự động tính Level)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="xs"
                    color="success"
                    disabled={actionLoading}
                    onClick={() =>
                      handleAdjustLevel({
                        amount: 50,
                        reason: "Test +50 Karma",
                      })
                    }
                    className="font-bold"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
                    +50 Karma
                  </Button>

                  <Button
                    size="xs"
                    color="purple"
                    disabled={actionLoading}
                    onClick={() =>
                      handleAdjustLevel({
                        amount: 250,
                        reason: "Test +250 Karma (Thăng cấp)",
                      })
                    }
                    className="font-bold"
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +250 Karma
                  </Button>

                  <Button
                    size="xs"
                    color="failure"
                    disabled={actionLoading}
                    onClick={() =>
                      handleAdjustLevel({
                        amount: -150,
                        reason: "Test -150 Karma (Hạ cấp)",
                      })
                    }
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
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-200">
                  2. Thử nghiệm trực tiếp Level Up & Down
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    color="light"
                    disabled={actionLoading || currentLevelId >= 3}
                    onClick={() =>
                      handleAdjustLevel({
                        action: "level_up",
                        reason: "Test Level Up",
                      })
                    }
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold"
                  >
                    <ArrowUpCircle className="w-4 h-4 mr-2 text-emerald-400" />
                    Thăng 1 Cấp (Level Up)
                  </Button>

                  <Button
                    color="light"
                    disabled={actionLoading || currentLevelId <= 1}
                    onClick={() =>
                      handleAdjustLevel({
                        action: "level_down",
                        reason: "Test Level Down",
                      })
                    }
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/40 font-bold"
                  >
                    <ArrowDownCircle className="w-4 h-4 mr-2 text-red-400" />
                    Hạ 1 Cấp (Level Down)
                  </Button>
                </div>

                <p className="pt-1 text-[11px] text-slate-500 dark:text-indigo-300/70">
                  Khi tích hợp hệ thống nhiệm vụ (missions), module
                  missions chỉ cần gọi hàm{" "}
                  <code className="font-mono text-amber-700 dark:text-yellow-300">
                    adjustUserKarmaAndLevel()
                  </code>{" "}
                  là level sẽ tự động nhảy tương ứng.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* --- CHỈ SỐ TÀI KHOẢN & BẢO MẬT --- */}
        <Card className="profile-liquid !rounded-[2rem] !border-white/70 !bg-transparent shadow-none dark:!border-white/10">
          <h3 className="border-b border-slate-900/8 pb-3 text-sm font-bold text-slate-900 dark:border-white/8 dark:text-white">
            Thông Tin Tài Khoản & Uy Tín
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="profile-liquid-soft flex items-center justify-between rounded-2xl p-4 sm:justify-start sm:gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Đánh giá uy tín:
              </span>
              <div className="flex items-center gap-1 font-black text-amber-500 text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>5.0 / 5.0</span>
              </div>
            </div>

            <div className="profile-liquid-soft flex items-center justify-between rounded-2xl p-4 sm:justify-start sm:gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Trạng thái:
              </span>
              <Badge color="success">Đang hoạt động</Badge>
            </div>

            <div className="profile-liquid-soft flex items-center justify-between rounded-2xl p-4 sm:justify-start sm:gap-3">
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
