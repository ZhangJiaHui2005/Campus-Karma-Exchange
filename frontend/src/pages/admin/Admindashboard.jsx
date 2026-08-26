import {
  Activity,
  ArrowUpRight,
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
import { useLocation } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminActivity from "./AdminActivity";

const summaryCards = [
  {
    label: "Người dùng",
    value: "1,284",
    change: "+12.5%",
    icon: Users,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    label: "Đồ dùng đang cho mượn",
    value: "86",
    change: "+8.2%",
    icon: Box,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Yêu cầu chờ duyệt",
    value: "14",
    change: "Cần xử lý",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    label: "Karma đã luân chuyển",
    value: "24,680",
    change: "+18.4%",
    icon: CircleDollarSign,
    tone: "bg-violet-50 text-violet-600",
  },
];

const requests = [
  {
    borrower: "Nguyễn Minh Anh",
    item: "Máy tính Casio FX-580VN X",
    owner: "Trần Quốc Bảo",
    date: "Hôm nay, 09:40",
    status: "Chờ duyệt",
  },
  {
    borrower: "Lê Hoàng Nam",
    item: "Bộ dụng cụ sửa xe đạp",
    owner: "Phạm Gia Hân",
    date: "Hôm nay, 08:15",
    status: "Đã xác nhận",
  },
  {
    borrower: "Vũ Khánh Linh",
    item: "Sách Giáo trình Marketing",
    owner: "Đỗ Anh Tuấn",
    date: "Hôm qua, 17:20",
    status: "Đã xác nhận",
  },
  {
    borrower: "Ngô Đức Thành",
    item: "Tripod điện thoại",
    owner: "Mai Thanh Thảo",
    date: "Hôm qua, 14:05",
    status: "Đã hủy",
  },
];

const statusStyles = {
  "Chờ duyệt": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Đã xác nhận": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Đã hủy": "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { admin, logout } = useAdmin();
  const adminPath = useLocation().pathname;
  const isUsersPage = adminPath === "/admin/users";
  const isPostsPage =
    adminPath === "/admin/items" || adminPath === "/admin/borrow-requests";
  const isActivityPage = adminPath === "/admin/activity";

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
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
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
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
              aria-label="Thông báo"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>
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
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
                  <ShieldCheck size={18} />
                  Xem báo cáo hệ thống
                </button>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(
                  ({ label, value, change, icon: Icon, tone }) => (
                    <article
                      key={label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}
                        >
                          <Icon size={21} />
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <ArrowUpRight size={14} />
                          {change}
                        </span>
                      </div>
                      <p className="mt-5 text-2xl font-bold tracking-tight">
                        {value}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{label}</p>
                    </article>
                  ),
                )}
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
                        {requests.map((request) => (
                          <tr
                            key={`${request.borrower}-${request.item}`}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold">
                                {request.borrower}
                              </p>
                              <p className="text-xs text-slate-500">
                                Chủ đồ: {request.owner}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {request.item}
                            </td>
                            <td className="px-5 py-4 text-slate-500">
                              {request.date}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[request.status]}`}
                              >
                                {request.status}
                              </span>
                            </td>
                          </tr>
                        ))}
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
