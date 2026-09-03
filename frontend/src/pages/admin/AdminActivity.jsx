import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { fetchAdminActivity } from "../../services/adminAuthService";

const Chart = ({ title, values, dates, color, unit }) => {
  const numericValues = values.map((value) => Number(value) || 0);
  const max = Math.max(...numericValues, 1);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">7 ngày gần nhất</p>
      </div>
      <div className="relative mt-8 flex h-56 items-end gap-3 border-b border-slate-200 bg-slate-50/50 px-2 pt-4">
        {numericValues.map((value, index) => (
          <div
            key={index}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-xs font-semibold text-slate-600">
              {value}
            </span>
            <div
              className={`w-full rounded-t-lg ${color}`}
              style={{ height: value > 0 ? `${(value / max) * 100}%` : "4px" }}
            />
            <span className="text-xs text-slate-400">{dates[index]}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500">Đơn vị: {unit}</p>
    </article>
  );
};

export default function AdminActivity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadActivity = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminActivity();
      setActivity(data.activity || []);
    } catch (requestError) {
      setActivity([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const dates = activity.map((day) =>
    new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(day.date)),
  );
  const totals = {
    posts: activity.reduce((total, day) => total + (day.posts || 0), 0),
    new_users: activity.reduce((total, day) => total + (day.new_users || 0), 0),
    payments: activity.reduce((total, day) => total + (day.payments || 0), 0),
    borrow_requests: activity.reduce(
      (total, day) => total + (day.borrow_requests || 0),
      0,
    ),
  };

  return (
    <section>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hoạt động</h2>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu thực tế trong 7 ngày gần nhất.
          </p>
        </div>
        <button
          type="button"
          onClick={loadActivity}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>
      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Không thể tải hoạt động: {error}
        </div>
      )}
      {!loading && !error && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Bài đăng", totals.posts],
            ["Người dùng mới", totals.new_users],
            ["Thanh toán", totals.payments],
            ["Yêu cầu mượn", totals.borrow_requests],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-400">
                Tổng 7 ngày gần nhất
              </p>
            </article>
          ))}
        </div>
      )}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Đang tải dữ liệu hoạt động...
        </div>
      ) : (
        !error && (
          <div className="grid gap-6 xl:grid-cols-2">
            <Chart
              title="Biểu đồ bài đăng"
              values={activity.map((day) => day.posts)}
              dates={dates}
              color="bg-emerald-500"
              unit="bài đăng"
            />
            <Chart
              title="Người dùng mới"
              values={activity.map((day) => day.new_users)}
              dates={dates}
              color="bg-violet-500"
              unit="người dùng"
            />
            <Chart
              title="Thanh toán"
              values={activity.map((day) => day.payments || 0)}
              dates={dates}
              color="bg-sky-500"
              unit="giao dịch"
            />
            <Chart
              title="Yêu cầu mượn"
              values={activity.map((day) => day.borrow_requests || 0)}
              dates={dates}
              color="bg-amber-500"
              unit="yêu cầu"
            />
          </div>
        )
      )}
    </section>
  );
}
