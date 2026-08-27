import { useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Banknote, Check, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { createKarmaTopup } from '../../services/walletService';

const options = [{ amount_vnd: 10000, karma_received: 100 }, { amount_vnd: 20000, karma_received: 200 }, { amount_vnd: 50000, karma_received: 550 }, { amount_vnd: 100000, karma_received: 1200 }, { amount_vnd: 200000, karma_received: 2500 }, { amount_vnd: 500000, karma_received: 5750 },];
const money = new Intl.NumberFormat('vi-VN');

export default function TopUp() {
  const [selected, setSelected] = useState(options[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const data = await createKarmaTopup(selected);
      window.location.assign(data.payment_url);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  return <UserLayout><div className="mx-auto max-w-5xl space-y-8 pb-12"><Link to="/wallet" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft size={16} /> Quay lại Ví Karma</Link><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Add balance</p><h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nạp Karma</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Chọn một mệnh giá. Bạn sẽ được chuyển đến PayOS để hoàn tất thanh toán.</p></div><div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"><div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><Banknote size={20} /></span><div><h2 className="font-bold text-slate-900 dark:text-white">Mệnh giá nạp</h2><p className="text-sm text-slate-500">Tỷ lệ quy đổi có thể thay đổi theo chương trình.</p></div></div><div className="grid gap-3 sm:grid-cols-2">{options.map((option) => <button key={option.amount_vnd} onClick={() => setSelected(option)} className={`relative rounded-xl border p-4 text-left transition ${selected.amount_vnd === option.amount_vnd ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100 dark:bg-emerald-900/20 dark:ring-emerald-900/40' : 'border-slate-200 hover:border-emerald-300 dark:border-slate-600'}`}><span className="block text-lg font-black text-slate-900 dark:text-white">{money.format(option.amount_vnd)} đ</span><span className="mt-1 block text-sm font-semibold text-emerald-700 dark:text-emerald-400">+{money.format(option.karma_received)} Karma</span>{selected.amount_vnd === option.amount_vnd && <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white"><Check size={13} /></span>}</button>)}</div></section><aside className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl"><p className="text-sm font-semibold text-slate-300">Tóm tắt giao dịch</p><div className="mt-7 border-b border-white/10 pb-5"><p className="text-sm text-slate-400">Bạn sẽ nhận</p><p className="mt-1 text-4xl font-black text-lime-300">{money.format(selected.karma_received)} <span className="text-base text-slate-300">Karma</span></p></div><div className="flex items-center justify-between py-5 text-sm"><span className="text-slate-400">Thanh toán</span><span className="font-bold">{money.format(selected.amount_vnd)} đ</span></div>{error && <p className="mb-4 rounded-lg bg-rose-500/15 p-3 text-sm text-rose-200">{error}</p>}<button onClick={submit} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Đang tạo giao dịch...' : 'Tiếp tục với PayOS'} {!loading && <ArrowRight size={17} />}</button><div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-400" /> Giao dịch được xử lý trên cổng PayOS bảo mật.</div></aside></div><div className="flex items-center gap-2 text-sm text-slate-500"><BadgeCheck size={17} className="text-emerald-600" /> Karma chỉ được cộng sau khi PayOS xác nhận thành công.</div></div></UserLayout>;
}