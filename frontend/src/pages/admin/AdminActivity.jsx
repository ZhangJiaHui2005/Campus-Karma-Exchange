import { useEffect, useState } from "react";
import { fetchAdminActivity } from "../../services/adminAuthService";

const Chart = ({ title, values, dates, color, unit }) => {
  const max = Math.max(...values, 1);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">7 ngày gần nhất</p>
      </div>
      <div className="mt-8 flex h-56 items-end gap-3">
        {values.map((value, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              {value}
            </span>
            <div
              className={`w-full rounded-t-lg ${color}`}
              style={{ height: `${(value / max) * 100}%` }}
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
  useEffect(() => {
    fetchAdminActivity()
      .then((data) => setActivity(data.activity || []))
      .catch(() => setActivity([]));
  }, []);
  const dates = activity.map((day) =>
    new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(
      new Date(day.date),
    ),
  );
  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Hoạt động</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tổng quan về bài đăng và người dùng từ dữ liệu thật.
        </p>
      </div>
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
      </div>
    </section>
  );
}
