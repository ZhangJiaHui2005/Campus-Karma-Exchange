import { CalendarDays, ChevronLeft, ChevronRight, Filter, Search, Sparkles, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

const users = [
  { id: 1, name: 'Nguyễn Minh Anh', email: 'minhanh@fpt.edu.vn', createdAt: '2026-08-24T09:40:00', karma: 840, status: 'Hoạt động', post: 'Máy tính Casio FX-580VN X', postedAt: '2026-08-26T09:40:00' },
  { id: 2, name: 'Lê Hoàng Nam', email: 'hoangnam@fpt.edu.vn', createdAt: '2026-08-21T13:20:00', karma: 420, status: 'Hoạt động', post: 'Bộ dụng cụ sửa xe đạp', postedAt: '2026-08-25T16:15:00' },
  { id: 3, name: 'Phạm Gia Hân', email: 'giahan@fpt.edu.vn', createdAt: '2026-08-18T10:05:00', karma: 1260, status: 'Hoạt động', post: 'Sách Giáo trình Marketing', postedAt: '2026-08-25T11:30:00' },
  { id: 4, name: 'Vũ Khánh Linh', email: 'khanhlinh@fpt.edu.vn', createdAt: '2026-08-14T08:30:00', karma: 185, status: 'Mới', post: 'Tripod điện thoại', postedAt: '2026-08-24T14:05:00' },
  { id: 5, name: 'Đỗ Anh Tuấn', email: 'anhtuan@fpt.edu.vn', createdAt: '2026-08-08T15:45:00', karma: 680, status: 'Hoạt động', post: null, postedAt: null },
  { id: 6, name: 'Mai Thanh Thảo', email: 'thanhthao@fpt.edu.vn', createdAt: '2026-08-03T11:15:00', karma: 1100, status: 'Tạm khóa', post: 'Loa Bluetooth mini', postedAt: '2026-08-20T10:20:00' },
];

const formatDate = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function AdminUsers() {
  const [userList, setUserList] = useState(() => {
    const savedStatuses = JSON.parse(localStorage.getItem('admin-user-statuses') || '{}');
    return users.map((item) => ({ ...item, status: savedStatuses[item.id] || item.status }));
  });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Tất cả');
  const [karma, setKarma] = useState('Tất cả');

  const approveUser = (id) => setUserList((current) => {
    const updated = current.map((item) => item.id === id ? { ...item, status: 'Hoạt động' } : item);
    localStorage.setItem('admin-user-statuses', JSON.stringify(Object.fromEntries(updated.map((item) => [item.id, item.status]))));
    return updated;
  });

  const filteredUsers = useMemo(() => userList.filter((item) => {
    const text = `${item.name} ${item.email}`.toLocaleLowerCase('vi');
    const matchesQuery = text.includes(query.toLocaleLowerCase('vi'));
    const matchesStatus = status === 'Tất cả' || item.status === status;
    const matchesKarma = karma === 'Tất cả' || (karma === 'Dưới 500' ? item.karma < 500 : karma === '500 - 1.000' ? item.karma >= 500 && item.karma <= 1000 : item.karma > 1000);
    return matchesQuery && matchesStatus && matchesKarma;
  }), [query, status, karma, userList]);

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <a href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"><ChevronLeft size={17} /> Bảng điều khiển</a>
          <h2 className="text-2xl font-bold tracking-tight">Người dùng</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi tài khoản, karma và hoạt động đăng bài trong cộng đồng.</p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span className="font-bold">{filteredUsers.length}</span> người dùng phù hợp</div>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Users size={20} /></span><div><p className="text-2xl font-bold">{users.length}</p><p className="text-sm text-slate-500">Tổng người dùng</p></div></div></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><CalendarDays size={20} /></span><div><p className="text-2xl font-bold">2</p><p className="text-sm text-slate-500">Tạo tài khoản tuần này</p></div></div></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><Sparkles size={20} /></span><div><p className="text-2xl font-bold">748</p><p className="text-sm text-slate-500">Karma trung bình</p></div></div></article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div>
          <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500"><Filter size={16} /> Lọc:</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"><option>Tất cả</option><option>Hoạt động</option><option>Mới</option><option>Tạm khóa</option></select><select value={karma} onChange={(event) => setKarma(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"><option>Tất cả</option><option>Dưới 500</option><option>500 - 1.000</option><option>Trên 1.000</option></select></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Người dùng</th><th className="px-5 py-3 font-semibold">Tạo tài khoản</th><th className="px-5 py-3 font-semibold">Bài đăng gần nhất</th><th className="px-5 py-3 font-semibold">Thời gian đăng</th><th className="px-5 py-3 font-semibold">Karma</th><th className="px-5 py-3 font-semibold">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{item.name.charAt(0)}</span><div><p className="font-semibold text-slate-800">{item.name}</p><p className="text-xs text-slate-500">{item.email}</p></div></div></td><td className="px-5 py-4 text-slate-600">{formatDate(item.createdAt)}</td><td className="max-w-52 truncate px-5 py-4 font-medium text-slate-700">{item.post || <span className="font-normal text-slate-400">Chưa có bài đăng</span>}</td><td className="px-5 py-4 text-slate-600">{item.postedAt ? formatDate(item.postedAt) : '—'}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-semibold text-violet-700"><Sparkles size={14} />{item.karma.toLocaleString('vi-VN')}</span></td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Mới' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>{item.status}</span></td></tr>)}{filteredUsers.length === 0 && <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">Không tìm thấy người dùng phù hợp.</td></tr>}</tbody></table></div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500"><span>Hiển thị {filteredUsers.length} trên {users.length} người dùng</span><div className="flex gap-1"><button className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Trang trước"><ChevronLeft size={18} /></button><button className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Trang sau"><ChevronRight size={18} /></button></div></div>
      </section>
      {userList.some((item) => item.status === 'Mới') && <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-bold text-amber-900">Tài khoản chờ duyệt</h3><div className="mt-3 flex flex-wrap gap-3">{userList.filter((item) => item.status === 'Mới').map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm"><span className="text-sm font-medium">{item.name}</span><button onClick={() => approveUser(item.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Duyệt người dùng</button></div>)}</div></section>}
    </section>
  );
}
