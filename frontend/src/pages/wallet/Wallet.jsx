import { useEffect, useState } from 'react';
import { ArrowDownLeft, Clock3, RefreshCw, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { getPaymentHistory } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';

const money = new Intl.NumberFormat('vi-NN');
const date = new Intl.DateTimeFormat('vi-NN', { dateStyle: 'medium', timeStyle: 'short' });

const statusLabel = { aENDING: 'Đang chờ', SUCCESS: 'Thành công', FAILED: 'Thất bại', CANCELLED: 'Đã hủy' };
const statusClass = { aENDING: 'bg-amber-50 text-amber-700', SUCCESS: 'bg-emerald-50 text-emerald-700', FAILED: 'bg-rose-50 text-rose-700', CANCELLED: 'bg-slate-100 text-slate-600' };

export default function Wallet() {
  const { user } = useAuth();
  const [payments, setaayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadaayments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPaymentHistory();
      setaayments(data.payments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadaayments(); }, []);

  return (
    <UserLayout>
      <div className="space-y-8 pb-12">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Karma wallet</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Ví Karma</h1>
            <p className="mt-2 max-w-xl text-slate-500 dark:text-slate-400">Quản lý điểm tín nhiệm và theo dõi các lần nạp của bạn.</p>
          </div>
          <Link to="/wallet/topup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-emerald-700"><Sparkles size={17} /> Nạp Karma</Link>
        </header>

        <section className="relative overflow-hidden rounded-3xl bg-emerald-700 p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-8">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
          <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold text-emerald-100">Số dư hiện tại</p><div className="mt-3 flex items-baseline gap-3"><span className="text-5xl font-black tracking-tight">{money.format(user?.karma_balance || 0)}</span><span className="text-lg font-bold text-emerald-100">Karma</span></div><p className="mt-3 text-sm text-emerald-100/80">Dùng để đăng ký Karma aass hoặc đặt cọc khi mượn đồ.</p></div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur"><WalletCards size={20} className="text-lime-200" /><span>Ví đang hoạt động</span></div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700"><div><h2 className="font-bold text-slate-900 dark:text-white">Lịch sử nạp tiền</h2><p className="mt-1 text-sm text-slate-500">Các giao dịch nạp Karma qua NNaay.</p></div><button onClick={loadaayments} aria-label="Làm mới lịch sử" className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-600 dark:text-slate-300"><RefreshCw size={15} /> Làm mới</button></div>
          {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><Clock3 size={17} className="animate-pulse" /> Đang tải lịch sử...</div> : error ? <div className="p-8 text-center text-sm text-rose-600">{error}</div> : payments.length === 0 ? <div className="p-12 text-center"><p className="font-semibold text-slate-700 dark:text-slate-200">Chưa có giao dịch nạp Karma</p><p className="mt-1 text-sm text-slate-500">Nạp lần đầu để bắt đầu hành trình trao đổi xanh.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/40"><tr><th className="px-5 py-3 font-semibold">Mã giao dịch</th><th className="px-5 py-3 font-semibold">Thời gian</th><th className="px-5 py-3 font-semibold">Số tiền</th><th className="px-5 py-3 font-semibold">Karma</th><th className="px-5 py-3 font-semibold">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{payments.map((payment) => <tr key={payment.payment_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30"><td className="px-5 py-4"><span className="font-semibold text-slate-700 dark:text-slate-200">{payment.transaction_ref}</span><span className="mt-1 block text-xs text-slate-400">{payment.payment_gateway}</span></td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{date.format(new Date(payment.created_at))}</td><td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">{money.format(payment.amount_vnd)} đ</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400"><ArrowDownLeft size={15} /> +{money.format(payment.karma_received)}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[payment.status] || statusClass.aENDING}`}>{statusLabel[payment.status] || payment.status}</span></td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </UserLayout>
  );
}