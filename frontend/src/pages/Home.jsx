import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  ChevronRight,
  Crown,
  Dumbbell,
  Gift,
  HandHeart,
  Laptop,
  Package,
  Percent,
  Plus,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Alert, Badge, Button, Progress, Spinner } from "flowbite-react";
import ItemCard from "../components/items/ItemCard";
import { useAuth } from "../context/AuthContext";
import UserLayout from "../layouts/UserLayout";
import { fetchCategories, fetchItems } from "../services/itemService";
import { fetchMyTransactions } from "../services/transactionService";
import { getUserLevelStatus } from "../services/userService";
import { getCurrentMembership } from "../services/walletService";

const categoryIcons = {
  "Sách & tài liệu": BookOpen,
  "Đồ điện tử": Laptop,
  "Quần áo": Shirt,
  "Đồ gia dụng": Package,
  "Thể thao": Dumbbell,
  Khác: Gift,
};

function ItemSection({ eyebrow, title, description, icon: Icon, items, href }) {
  if (!items.length) return null;
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <Link to={href} className="hidden shrink-0 items-center gap-1 text-sm font-bold text-slate-700 hover:text-emerald-700 sm:inline-flex dark:text-slate-200 dark:hover:text-emerald-300">
          Xem tất cả <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => <ItemCard key={item.item_id} item={item} />)}
      </div>
      <Link to={href} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-slate-700 sm:hidden dark:text-slate-200">
        Xem tất cả <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [levelStatus, setLevelStatus] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, itemsData, txData, levelData, membershipData] = await Promise.all([
          fetchCategories(),
          fetchItems({ limit: 12, sort: "newest" }),
          fetchMyTransactions({ limit: 5 }),
          getUserLevelStatus(),
          getCurrentMembership(),
        ]);
        setCategories(categoriesData.categories || []);
        setItems(itemsData.items || []);
        setTransactions(txData.transactions || txData.data || []);
        setLevelStatus(levelData);
        setMembership(membershipData.membership || null);
      } catch (error) {
        console.error("Failed to load home data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const freeItems = items.filter((item) => item.type === "GIVE").slice(0, 4);
  const borrowItems = items.filter((item) => ["BORROW", "LEND"].includes(item.type)).slice(0, 4);
  const latestItems = items.slice(0, 8);
  const pendingTransactions = transactions.filter((transaction) =>
    ["PENDING", "ESCROW_LOCKED", "QR_VERIFIED"].includes(transaction.status),
  );
  const currentLevel = levelStatus?.current_level || user?.level || {
    level_name: "Tân thủ",
    deposit_discount_pct: 0,
  };
  const levelProgress = levelStatus?.progress?.progressPct || 0;
  const firstName = user?.full_name?.trim().split(" ").at(-1) || "bạn";

  if (authLoading || loading) {
    return (
      <UserLayout>
        <div className="flex min-h-[62vh] flex-col items-center justify-center gap-4" aria-busy="true">
          <Spinner size="xl" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Đang chuẩn bị không gian của bạn...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-14 pb-10">
        <section className="editorial-grid relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[52px] border-emerald-400/10" />
          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            <div className="relative p-6 sm:p-10 lg:p-12">
              <Badge color="success" className="mb-6 w-fit">{greeting}, {firstName}</Badge>
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-6xl">
                Chia sẻ trong trường.<br />
                <span className="text-emerald-400">Tạo giá trị cho nhau.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Tìm món đồ bạn cần, trao đi món đồ bạn ít dùng và xây dựng uy tín qua từng giao dịch minh bạch.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/browse" size="lg" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300 focus:ring-emerald-900">
                  Khám phá vật phẩm <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button as={Link} to="/browse?create=1" size="lg" color="light" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                  <Plus className="mr-2 h-5 w-5" aria-hidden="true" /> Đăng vật phẩm
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Email sinh viên xác thực</span>
                <span className="inline-flex items-center gap-2"><QrCode className="h-4 w-4 text-emerald-400" /> Giao nhận bằng QR</span>
                <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-sky-400" /> Cộng đồng trong trường</span>
              </div>
            </div>

            <aside className="relative border-t border-white/10 bg-white/[0.055] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Tổng quan của bạn</p>
              <div className="mt-8">
                <p className="text-sm text-slate-300">Số dư khả dụng</p>
                <p className="mt-1 font-display text-5xl font-semibold">
                  {Number(user?.karma_balance || 0).toLocaleString("vi-VN")}
                  <span className="ml-2 text-base font-sans font-bold text-emerald-400">Karma</span>
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Crown className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  <p className="mt-3 text-xs text-slate-400">Cấp bậc</p>
                  <p className="mt-1 font-bold">{currentLevel.level_name}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Percent className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  <p className="mt-3 text-xs text-slate-400">Ưu đãi cọc</p>
                  <p className="mt-1 font-bold">Giảm {currentLevel.deposit_discount_pct || 0}%</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs font-semibold text-slate-300">
                  <span>Tiến trình cấp độ</span><span>{levelProgress}%</span>
                </div>
                <Progress progress={levelProgress} color="green" size="sm" />
              </div>
              <Link to="/profile" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300">
                Xem hồ sơ tín nhiệm <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </section>

        {pendingTransactions.length > 0 && (
          <Alert color="warning" icon={Bell}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">Bạn có {pendingTransactions.length} giao dịch cần xử lý</p>
                <p className="mt-1 text-sm">
                  Giao dịch “{pendingTransactions[0].item?.title || "vật phẩm"}” đang chờ bước tiếp theo.
                </p>
              </div>
              <Link to="/transactions" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold underline underline-offset-4">
                Xem giao dịch <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Alert>
        )}

        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">Tìm theo nhu cầu</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-950 dark:text-white">Bạn đang cần gì hôm nay?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Package;
              return (
                <Link
                  key={category.category_id}
                  to={`/browse?category_id=${category.category_id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-700"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-emerald-400 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-emerald-400 dark:group-hover:text-slate-950">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-4 block text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <ItemSection eyebrow="Chia sẻ tử tế" title="Góc tặng miễn phí" description="Những món đồ đang chờ một người dùng mới." icon={HandHeart} items={freeItems} href="/browse?type=GIVE" />
        <ItemSection eyebrow="Mượn nhanh" title="Sẵn sàng cho bạn mượn" description="Giải quyết nhu cầu học tập và sinh hoạt ngắn hạn." icon={RefreshCw} items={borrowItems} href="/browse?type=BORROW" />
        <ItemSection eyebrow="Mới trong cộng đồng" title="Vừa được đăng" description="Khám phá những vật phẩm mới nhất từ sinh viên quanh bạn." icon={Sparkles} items={latestItems} href="/browse" />

        <section className="grid overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 lg:grid-cols-[1fr_0.9fr] dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400 text-slate-950">
                <Crown className="h-5 w-5" aria-hidden="true" />
              </span>
              <Badge color="success">{membership ? "Đang hoạt động" : "Dành cho thành viên"}</Badge>
            </div>
            <h2 className="mt-6 font-display text-4xl font-semibold text-slate-950 dark:text-white">Karma Pass</h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-600 dark:text-slate-300">
              Giảm tiền cọc, ưu tiên bài đăng và nhận thêm lớp bảo vệ cho các giao dịch quan trọng.
            </p>
            <Button as={Link} to="/membership" className="mt-7">
              {membership ? "Quản lý gói của bạn" : "Khám phá quyền lợi"}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-3 border-t border-emerald-200 bg-white/55 lg:border-l lg:border-t-0 dark:border-emerald-900/50 dark:bg-slate-900/35">
            {[
              { icon: ShieldCheck, value: "01", label: "Ký quỹ an toàn" },
              { icon: QrCode, value: "02", label: "Quét QR giao nhận" },
              { icon: Wallet, value: "03", label: "Hoàn cọc tự động" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={value} className="flex min-h-44 flex-col justify-between border-r border-emerald-200 p-4 last:border-r-0 sm:p-6 lg:min-h-full lg:border-b-0 dark:border-emerald-900/50">
                <span className="text-xs font-bold tracking-[0.18em] text-emerald-700 dark:text-emerald-400">{value}</span>
                <div>
                  <Icon className="h-5 w-5 text-slate-800 dark:text-slate-200" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
