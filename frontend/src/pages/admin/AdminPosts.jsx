import {
  CalendarDays,
  Check,
  Filter,
  Search,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  approveAdminBorrowRequest,
  approveAdminItem,
  deleteAdminBorrowRequest,
  deleteAdminItem,
  fetchAdminBorrowRequests,
  fetchAdminItems,
} from "../../services/adminAuthService";

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
const priceFormat = new Intl.NumberFormat("vi-VN");
const statusLabel = (status) =>
  ({
    AVAILABLE: "Đang hiển thị",
    BORROWED: "Đang cho mượn",
    SOLD: "Đã bán",
    HIDDEN: "Đã ẩn",
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
  })[status] || status;

export default function AdminPosts({ pageTitle }) {
  const isBorrowRequests = pageTitle === "Yêu cầu mượn";
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả loại");
  const [status, setStatus] = useState("Tất cả trạng thái");
  useEffect(() => {
    const request = isBorrowRequests
      ? fetchAdminBorrowRequests()
      : fetchAdminItems();
    request
      .then((data) =>
        setPosts(
          isBorrowRequests
            ? (data.requests || []).map((request) => ({
                request_id: request.request_id,
                title: request.item?.title,
                owner: request.borrower,
                category: { name: "Yêu cầu mượn" },
                karma_value: request.item?.karma_value || 0,
                status: request.status,
                created_at: request.created_at,
              }))
            : data.items || [],
        ),
      )
      .catch(() => setPosts([]));
  }, [isBorrowRequests]);

  const approvePost = async (post) => {
    if (isBorrowRequests) await approveAdminBorrowRequest(post.request_id);
    else await approveAdminItem(post.item_id);
    setPosts((current) =>
      current.map((item) =>
        item === post
          ? { ...item, status: isBorrowRequests ? "APPROVED" : "AVAILABLE" }
          : item,
      ),
    );
  };

  const deletePost = async (post) => {
    const label = isBorrowRequests ? "yêu cầu mượn" : "bài đăng";
    if (!window.confirm(`Xóa ${label} này?`)) return;
    if (isBorrowRequests) await deleteAdminBorrowRequest(post.request_id);
    else await deleteAdminItem(post.item_id);
    setPosts((current) => current.filter((item) => item !== post));
  };
  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const matchesQuery = `${post.title} ${post.owner?.full_name || ""}`
          .toLocaleLowerCase("vi")
          .includes(query.toLocaleLowerCase("vi"));
        return (
          matchesQuery &&
          (category === "Tất cả loại" || post.category?.name === category) &&
          (status === "Tất cả trạng thái" ||
            statusLabel(post.status) === status)
        );
      }),
    [query, category, status, posts],
  );

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi các bài đăng sản phẩm của người dùng trong cộng đồng.
        </p>
      </div>
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
              placeholder="Tìm tên sản phẩm hoặc người đăng..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <Filter size={16} /> Lọc:
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option>Tất cả loại</option>
              <option>Dụng cụ học tập</option>
              <option>Dụng cụ</option>
              <option>Sách</option>
              <option>Thiết bị điện tử</option>
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option>Tất cả trạng thái</option>
              <option>
                {isBorrowRequests ? "Chờ duyệt" : "Đang hiển thị"}
              </option>
              {!isBorrowRequests && <option>Chờ duyệt</option>}
              <option>Đang cho mượn</option>
              <option>Đã bán</option>
              <option>Đã ẩn</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Sản phẩm</th>
                <th className="px-5 py-3 font-semibold">Người đăng</th>
                <th className="px-5 py-3 font-semibold">Loại sản phẩm</th>
                <th className="px-5 py-3 font-semibold">Giá tiền</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Thời gian đăng</th>
                <th className="px-5 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPosts.map((post) => (
                <tr
                  key={post.request_id || post.item_id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {post.title}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 text-slate-700">
                      <UserRound size={16} className="text-slate-400" />
                      {post.owner?.full_name || "Không rõ"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      <Tag size={13} />
                      {post.category?.name || "Chưa phân loại"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {priceFormat.format(post.karma_value)} Karma
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {statusLabel(post.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} className="text-slate-400" />
                      {formatDate(post.created_at)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {post.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => approvePost(post)}
                          title="Duyệt"
                          aria-label="Duyệt"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deletePost(post)}
                        title={
                          isBorrowRequests ? "Xóa yêu cầu mượn" : "Xóa bài đăng"
                        }
                        aria-label={
                          isBorrowRequests ? "Xóa yêu cầu mượn" : "Xóa bài đăng"
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-white hover:bg-slate-800"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Không có bài đăng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          Hiển thị {filteredPosts.length} trên {posts.length} bài đăng
        </div>
      </section>
    </section>
  );
}
