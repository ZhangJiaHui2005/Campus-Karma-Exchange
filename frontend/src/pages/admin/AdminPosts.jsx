import { CalendarDays, Filter, Search, Tag, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

const posts = [
  { id: 1, owner: 'Nguyễn Minh Anh', name: 'Máy tính Casio FX-580VN X', category: 'Dụng cụ học tập', price: 35000, status: 'Đang hiển thị', createdAt: '2026-08-26T09:40:00' },
  { id: 2, owner: 'Lê Hoàng Nam', name: 'Bộ dụng cụ sửa xe đạp', category: 'Dụng cụ', price: 50000, status: 'Đang cho mượn', createdAt: '2026-08-25T16:15:00' },
  { id: 3, owner: 'Phạm Gia Hân', name: 'Sách Giáo trình Marketing', category: 'Sách', price: 20000, status: 'Đang hiển thị', createdAt: '2026-08-25T11:30:00' },
  { id: 4, owner: 'Vũ Khánh Linh', name: 'Tripod điện thoại', category: 'Thiết bị điện tử', price: 30000, status: 'Đã bán', createdAt: '2026-08-24T14:05:00' },
  { id: 5, owner: 'Mai Thanh Thảo', name: 'Loa Bluetooth mini', category: 'Thiết bị điện tử', price: 45000, status: 'Đang hiển thị', createdAt: '2026-08-20T10:20:00' },
];

const formatDate = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const priceFormat = new Intl.NumberFormat('vi-VN');

export default function AdminPosts({ pageTitle }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả loại');
  const [status, setStatus] = useState('Tất cả trạng thái');
  const filteredPosts = useMemo(() => posts.filter((post) => {
    const matchesQuery = `${post.name} ${post.owner}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'));
    return matchesQuery && (category === 'Tất cả loại' || post.category === category) && (status === 'Tất cả trạng thái' || post.status === status);
  }), [query, category, status]);

  return <section>
    <div className="mb-8"><h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2><p className="mt-1 text-sm text-slate-500">Theo dõi các bài đăng sản phẩm của người dùng trong cộng đồng.</p></div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên sản phẩm hoặc người đăng..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500"><Filter size={16} /> Lọc:</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"><option>Tất cả loại</option><option>Dụng cụ học tập</option><option>Dụng cụ</option><option>Sách</option><option>Thiết bị điện tử</option></select><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"><option>Tất cả trạng thái</option><option>Đang hiển thị</option><option>Đang cho mượn</option><option>Đã bán</option><option>Đã ẩn</option></select></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Sản phẩm</th><th className="px-5 py-3 font-semibold">Người đăng</th><th className="px-5 py-3 font-semibold">Loại sản phẩm</th><th className="px-5 py-3 font-semibold">Giá tiền</th><th className="px-5 py-3 font-semibold">Trạng thái</th><th className="px-5 py-3 font-semibold">Thời gian đăng</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredPosts.map((post) => <tr key={post.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-800">{post.name}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-slate-700"><UserRound size={16} className="text-slate-400" />{post.owner}</span></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"><Tag size={13} />{post.category}</span></td><td className="px-5 py-4 font-semibold text-slate-700">{priceFormat.format(post.price)} Karma</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${post.status === 'Đang hiển thị' ? 'bg-emerald-50 text-emerald-700' : post.status === 'Đang cho mượn' ? 'bg-amber-50 text-amber-700' : post.status === 'Đã bán' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>{post.status}</span></td><td className="px-5 py-4 text-slate-600"><span className="inline-flex items-center gap-1.5"><CalendarDays size={15} className="text-slate-400" />{formatDate(post.createdAt)}</span></td></tr>)}{filteredPosts.length === 0 && <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">Không có bài đăng phù hợp.</td></tr>}</tbody></table></div>
      <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">Hiển thị {filteredPosts.length} trên {posts.length} bài đăng</div>
    </section>
  </section>;
}
