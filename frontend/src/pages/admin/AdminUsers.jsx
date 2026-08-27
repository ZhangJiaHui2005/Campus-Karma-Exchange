import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  Users,
  Ban,
  Trash2,
  Check,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminUsers,
  updateAdminUserBanStatus,
  deleteAdminUser,
  approveAdminUser,
} from "../../services/adminAuthService";

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const displayName = (value = "") =>
  value
    .replace(/^D[\w-]+\s+/i, "")
    .replace(/^D\s+/i, "")
    .trim() || "Người dùng";

export default function AdminUsers() {
  const [userList, setUserList] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tất cả");
  const [karma, setKarma] = useState("Tất cả");
  const [now] = useState(() => Date.now());
  const [actionUserId, setActionUserId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadUsers = () =>
      fetchAdminUsers()
        .then((data) => {
          if (mounted) setUserList(data.users || []);
        })
        .catch(() => {
          if (mounted) setUserList([]);
        });

    loadUsers();
    const intervalId = window.setInterval(loadUsers, 30_000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const toggleBan = async (user) => {
    setActionUserId(user.user_id);
    try {
      const data = await updateAdminUserBanStatus(
        user.user_id,
        user.status !== "BANNED",
      );
      setUserList((current) =>
        current.map((item) =>
          item.user_id === user.user_id
            ? { ...item, status: data.user.status, is_online: false }
            : item,
        ),
      );
    } finally {
      setActionUserId(null);
    }
  };

  const removeUser = async (user) => {
    if (
      !window.confirm(
        `Xóa tài khoản ${user.full_name}? Dữ liệu bài đăng của người dùng cũng sẽ bị xóa.`,
      )
    )
      return;
    setActionUserId(user.user_id);
    try {
      await deleteAdminUser(user.user_id);
      setUserList((current) =>
        current.filter((item) => item.user_id !== user.user_id),
      );
    } finally {
      setActionUserId(null);
    }
  };

  const approveUser = async (user) => {
    setActionUserId(user.user_id);
    try {
      const data = await approveAdminUser(user.user_id);
      setUserList((current) =>
        current.map((item) =>
          item.user_id === user.user_id
            ? { ...item, status: data.user.status }
            : item,
        ),
      );
    } finally {
      setActionUserId(null);
    }
  };

  const filteredUsers = useMemo(
    () =>
      userList.filter((item) => {
        const text =
          `${displayName(item.full_name)} ${item.email}`.toLocaleLowerCase(
            "vi",
          );
        const matchesQuery = text.includes(query.toLocaleLowerCase("vi"));
        const statusLabel =
          item.status === "BANNED"
            ? "Đã bị cấm"
            : item.status === "ACTIVE"
              ? "Hoạt động"
              : item.status === "PENDING"
                ? "Chờ duyệt"
                : "Tạm khóa";
        const matchesStatus = status === "Tất cả" || statusLabel === status;
        const matchesKarma =
          karma === "Tất cả" ||
          (karma === "Dưới 500"
            ? item.karma_balance < 500
            : karma === "500 - 1.000"
              ? item.karma_balance >= 500 && item.karma_balance <= 1000
              : item.karma_balance > 1000);
        return matchesQuery && matchesStatus && matchesKarma;
      }),
    [query, status, karma, userList],
  );

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <a
            href="/admin"
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <ChevronLeft size={17} /> Bảng điều khiển
          </a>
          <h2 className="text-2xl font-bold tracking-tight">Người dùng</h2>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tài khoản, karma và hoạt động đăng bài trong cộng đồng.
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="font-bold">{filteredUsers.length}</span> người dùng
          phù hợp
        </div>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold">{userList.length}</p>
              <p className="text-sm text-slate-500">Tổng người dùng</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <CalendarDays size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold">
                {
                  userList.filter(
                    (item) =>
                      new Date(item.created_at) >= new Date(now - 7 * 86400000),
                  ).length
                }
              </p>
              <p className="text-sm text-slate-500">Tạo tài khoản tuần này</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold">
                {userList.length
                  ? Math.round(
                      userList.reduce(
                        (sum, item) => sum + item.karma_balance,
                        0,
                      ) / userList.length,
                    ).toLocaleString("vi-VN")
                  : 0}
              </p>
              <p className="text-sm text-slate-500">Karma trung bình</p>
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <Filter size={16} /> Lọc:
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option>Tất cả</option>
              <option>Hoạt động</option>
              <option>Chờ duyệt</option>
              <option>Tạm khóa</option>
              <option>Đã bị cấm</option>
            </select>
            <select
              value={karma}
              onChange={(event) => setKarma(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option>Tất cả</option>
              <option>Dưới 500</option>
              <option>500 - 1.000</option>
              <option>Trên 1.000</option>
            </select>
          </div>
        </div>
        <div className="max-h-[min(65vh,620px)] overflow-y-auto">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Người dùng</th>
                <th className="px-5 py-3 font-semibold">Tạo tài khoản</th>
                <th className="px-5 py-3 font-semibold">Bài đăng gần nhất</th>
                <th className="px-5 py-3 font-semibold">Thời gian đăng</th>
                <th className="px-5 py-3 font-semibold">Karma</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((item) => (
                <tr key={item.user_id} className="align-top hover:bg-slate-50">
                  <td className="px-3 py-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                        {displayName(item.full_name).charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {displayName(item.full_name)}
                        </p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600 sm:px-5">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="break-words px-3 py-4 font-medium text-slate-700 sm:px-5">
                    {item._count?.items ? (
                      `${item._count.items} bài đăng`
                    ) : (
                      <span className="font-normal text-slate-400">
                        Chưa có bài đăng
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-600 sm:px-5">
                    {item._count?.items ? "Có dữ liệu" : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 sm:px-5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-semibold text-violet-700">
                      <Sparkles size={14} />
                      {(item.karma_balance || 0).toLocaleString("vi-VN")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 sm:px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "BANNED" ? "bg-rose-50 text-rose-700" : item.is_online ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${item.status === "BANNED" ? "bg-rose-500" : item.is_online ? "bg-emerald-500" : "bg-slate-400"}`}
                      />
                      {item.status === "BANNED"
                        ? "Đã bị cấm"
                        : item.is_online
                          ? "Đang hoạt động"
                          : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-3 py-4 sm:px-5">
                    <div className="flex items-center gap-2">
                      {item.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => approveUser(item)}
                          disabled={actionUserId === item.user_id}
                          title="Duyệt người dùng"
                          aria-label="Duyệt người dùng"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleBan(item)}
                        disabled={actionUserId === item.user_id}
                        title={
                          item.status === "BANNED"
                            ? "Bỏ cấm người dùng"
                            : "Cấm người dùng"
                        }
                        aria-label={
                          item.status === "BANNED"
                            ? "Bỏ cấm người dùng"
                            : "Cấm người dùng"
                        }
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-white disabled:opacity-50 ${item.status === "BANNED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
                      >
                        <Ban size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeUser(item)}
                        disabled={actionUserId === item.user_id}
                        title="Xóa người dùng"
                        aria-label="Xóa người dùng"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <span>
            Hiển thị {filteredUsers.length} trên {userList.length} người dùng
          </span>
          <div className="flex gap-1">
            <button
              className="rounded-lg p-1.5 hover:bg-slate-100"
              aria-label="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="rounded-lg p-1.5 hover:bg-slate-100"
              aria-label="Trang sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
