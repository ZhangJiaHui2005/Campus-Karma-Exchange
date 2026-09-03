import {
  Activity,
  Bell,
  Box,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminActivity from "./AdminActivity";
import {
  fetchAdminDashboard,
  fetchAdminPendingApprovals,
  fetchAdminNotifications,
  fetchAdminSystemReport,
} from "../../services/adminAuthService";

const summaryCards = [
  {
    label: "Người dùng",
    key: "total_users",
    icon: Users,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    label: "Đồ dùng đang cho mượn",
    key: "available_items",
    icon: Box,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Yêu cầu chờ duyệt",
    key: "pending_approvals",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600",
    link: "/admin/borrow-requests",
  },
  {
    label: "Karma đã luân chuyển",
    key: "karma_in_circulation",
    icon: CircleDollarSign,
    tone: "bg-violet-50 text-violet-600",
  },
];

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboard, setDashboard] = useState({ stats: {}, recent_items: [] });
  const [notifications, setNotifications] = useState([]);
  const [systemReport, setSystemReport] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState(null);
  const [panel, setPanel] = useState(null);
  const { admin, logout } = useAdmin();
  const adminPath = useLocation().pathname;
  const isUsersPage = adminPath === "/admin/users";
  const isPostsPage =
    adminPath === "/admin/items" || adminPath === "/admin/borrow-requests";
  const isActivityPage = adminPath === "/admin/activity";

  useEffect(() => {
    fetchAdminDashboard()
      .then(setDashboard)
      .catch(() => setDashboard({ stats: {}, recent_items: [] }));
    fetchAdminNotifications()
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  const openSystemReport = async () => {
    setPanel("report");
    try {
      setSystemReport(await fetchAdminSystemReport());
    } catch (error) {
      setSystemReport({
        status: "ERROR",
        checks: [
          { name: "API admin", status: "ERROR", message: error.message },
        ],
      });
    }
  };

  const openPendingApprovals = async (event) => {
    event.preventDefault();
    setPanel("pending");
    try {
      const data = await fetchAdminPendingApprovals();
      setPendingApprovals(data.pending);
    } catch {
      setPendingApprovals({ users: [], items: [], borrow_requests: [] });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {menuOpen && (
        <button
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white py-5 transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          aria-label="Điều hướng quản trị"
          className="h-full w-full [&>div]:bg-transparent [&>div]:p-4"
        >
          <div className="flex items-center justify-between px-2">
            <a
              href="/"
              className="flex items-center gap-3 font-bold text-slate-900"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-lg text-white">
                K
              </span>
              <span>Campus Karma</span>
            </a>
            <button
              className="rounded-lg p-2 text-slate-500 lg:hidden"
              onClick={() => setMenuOpen(false)}
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
          </div>

          <SidebarItems>
            <SidebarItemGroup className="mt-8 border-0 pt-0">
              <a
                href="/admin"
                className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700"
              >
                <LayoutDashboard size={19} />
                Tổng quan
              </a>
              <a
                href="/admin/users"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${isUsersPage ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Users size={19} />
                Người dùng
              </a>
              <a
                href="/admin/items"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${adminPath === "/admin/items" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Box size={19} />
                Đồ dùng
              </a>
              <a
                href="/admin/borrow-requests"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${adminPath === "/admin/borrow-requests" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <PackageCheck size={19} />
                Yêu cầu mượn
              </a>
              <a
                href="/admin/activity"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${isActivityPage ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Activity size={19} />
                Hoạt động
              </a>
            </SidebarItemGroup>
          </SidebarItems>

          <div className="mt-auto rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                {admin?.full_name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {admin?.full_name || "Quản trị viên"}
                </p>
                <p className="text-xs text-slate-500">Quản trị viên</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </Sidebar>
      </aside>

      <main className="min-h-screen lg:pl-72">
        <header className="relative flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                Quản trị hệ thống
              </p>
              <h1 className="text-lg font-bold">Bảng điều khiển</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setPanel(panel === "notifications" ? null : "notifications")
              }
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
              aria-label="Thông báo"
            >
              <Bell size={20} />
              {notifications.some((notification) => !notification.read_at) && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>
            {panel === "notifications" && (
              <div className="absolute right-16 top-16 z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <h3 className="font-bold">Thông báo</h3>
                <div className="mt-3 max-h-72 space-y-3 overflow-y-auto">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.notification_id}
                        className="border-b border-slate-100 pb-3 last:border-0"
                      >
                        <p className="text-sm font-semibold">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {new Intl.DateTimeFormat("vi-VN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(notification.created_at))}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Chưa có thông báo.</p>
                  )}
                </div>
              </div>
            )}
            <div className="hidden h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 sm:grid">
              {admin?.full_name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          {isUsersPage ? (
            <AdminUsers />
          ) : isPostsPage ? (
            <AdminPosts
              pageTitle={
                adminPath === "/admin/items" ? "Đồ dùng" : "Yêu cầu mượn"
              }
            />
          ) : isActivityPage ? (
            <AdminActivity />
          ) : (
            <>
              <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Chào buổi sáng,{" "}
                    {admin?.full_name?.split(" ").at(-1) || "Admin"}!
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Đây là tình hình hoạt động của Campus Karma hôm nay.
                  </p>
                </div>
                <button
                  onClick={openSystemReport}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  <ShieldCheck size={18} />
                  Xem báo cáo hệ thống
                </button>
              </section>

              {panel === "report" && systemReport && (
                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Báo cáo hệ thống</h3>
                      <p
                        className={`mt-1 text-sm font-semibold ${systemReport.status === "OK" ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {systemReport.status === "OK"
                          ? "Hệ thống đang hoạt động ổn định"
                          : "Hệ thống đang gặp trục trặc"}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {systemReport.response_time_ms} ms
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {systemReport.checks.map((check) => (
                      <div
                        key={check.name}
                        className={`rounded-xl border p-3 ${check.status === "OK" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
                      >
                        <p className="text-sm font-semibold">
                          {check.name}:{" "}
                          {check.status === "OK" ? "Ổn định" : "Lỗi"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {check.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {panel === "pending" && pendingApprovals && (
                <section className="mb-6 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Danh sách chờ duyệt</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Tất cả yêu cầu cần admin xử lý
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPanel(null)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      aria-label="Đóng danh sách chờ duyệt"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                      <h4 className="font-semibold text-sky-900">
                        Người dùng ({pendingApprovals.users.length})
                      </h4>
                      <div className="mt-3 space-y-2">
                        {pendingApprovals.users.length ? (
                          pendingApprovals.users.map((user) => (
                            <p
                              key={user.user_id}
                              className="text-sm text-slate-700"
                            >
                              {user.full_name}
                              <span className="block text-xs text-slate-500">
                                {user.email}
                              </span>
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">
                            Không có dữ liệu.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                      <h4 className="font-semibold text-orange-900">
                        Đồ dùng ({pendingApprovals.items.length})
                      </h4>
                      <div className="mt-3 space-y-2">
                        {pendingApprovals.items.length ? (
                          pendingApprovals.items.map((item) => (
                            <p
                              key={item.item_id}
                              className="text-sm text-slate-700"
                            >
                              {item.title}
                              <span className="block text-xs text-slate-500">
                                {item.owner?.full_name || "Không rõ"}
                              </span>
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">
                            Không có dữ liệu.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h4 className="font-semibold text-amber-900">
                        Yêu cầu mượn ({pendingApprovals.borrow_requests.length})
                      </h4>
                      <div className="mt-3 space-y-2">
                        {pendingApprovals.borrow_requests.length ? (
                          pendingApprovals.borrow_requests.map((request) => (
                            <p
                              key={request.request_id}
                              className="text-sm text-slate-700"
                            >
                              {request.item?.title || "Đồ dùng"}
                              <span className="block text-xs text-slate-500">
                                Người mượn:{" "}
                                {request.borrower?.full_name || "Không rõ"}
                              </span>
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">
                            Không có dữ liệu.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(({ label, key, icon: Icon, tone, link }) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <a
                      href={link || "#"}
                      onClick={
                        key === "pending_approvals"
                          ? openPendingApprovals
                          : undefined
                      }
                      className={link ? "block" : "pointer-events-none block"}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}
                        >
                          <Icon size={21} />
                        </span>
                      </div>
                      <p className="mt-5 text-2xl font-bold tracking-tight">
                        {(dashboard.stats[key] || 0).toLocaleString("vi-VN")}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{label}</p>
                      {key === "pending_approvals" && (
                        <p className="mt-2 text-xs text-slate-400">
                          User {dashboard.stats.pending_users || 0} · Đồ dùng{" "}
                          {dashboard.stats.pending_items || 0} · Mượn{" "}
                          {dashboard.stats.pending_requests || 0}
                        </p>
                      )}
                    </a>
                  </article>
                ))}
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-5">
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <h3 className="font-bold">Yêu cầu mượn gần đây</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Cập nhật theo thời gian thực
                      </p>
                    </div>
                    <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                      Xem tất cả
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-semibold">
                            Người mượn
                          </th>
                          <th className="px-5 py-3 font-semibold">Đồ dùng</th>
                          <th className="px-5 py-3 font-semibold">Thời gian</th>
                          <th className="px-5 py-3 font-semibold">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dashboard.recent_items.map((item) => (
                          <tr key={item.item_id} className="hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <p className="font-semibold">
                                {item.owner?.full_name || "Không rõ"}
                              </p>
                              <p className="text-xs text-slate-500">
                                Danh mục:{" "}
                                {item.category?.name || "Chưa phân loại"}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {item.title}
                            </td>
                            <td className="px-5 py-4 text-slate-500">
                              {new Intl.DateTimeFormat("vi-VN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(item.created_at))}
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {dashboard.recent_items.length === 0 && (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-5 py-12 text-center text-slate-500"
                            >
                              Chưa có dữ liệu item.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Hoạt động Karma</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        7 ngày gần nhất
                      </p>
                    </div>
                    <button
                      className="rounded-lg border border-slate-200 p-2 text-slate-500"
                      aria-label="Tìm kiếm hoạt động"
                    >
                      <Search size={17} />
                    </button>
                  </div>
                  <div className="mt-8 flex h-36 items-end justify-between gap-2">
                    {[38, 55, 43, 76, 62, 88, 71].map((height, index) => (
                      <div
                        key={index}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-t-md bg-emerald-500/90"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-slate-400">
                          T{index + 2}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                    <div className="flex gap-3">
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-emerald-600"
                        size={18}
                      />
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">
                          Hệ thống hoạt động ổn định
                        </p>
                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          Không có báo cáo vi phạm cần ưu tiên xử lý.
                        </p>
                      </div>
                      <ChevronRight
                        className="ml-auto mt-1 text-emerald-600"
                        size={18}
                      />
                    </div>
                  </div>
                </article>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
