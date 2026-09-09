import { Avatar, Badge } from "flowbite-react";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import fallbackImage from "../../assets/hero.png";

const typeMeta = {
  GIVE: { label: "Tặng miễn phí", color: "success" },
  BORROW: { label: "Cho mượn", color: "info" },
  LEND: { label: "Cho mượn", color: "info" },
  SELL: { label: "Trao đổi", color: "warning" },
  EXCHANGE: { label: "Trao đổi", color: "warning" },
};

export default function ItemCard({ item }) {
  const type = typeMeta[item.type] || { label: item.type, color: "gray" };
  const ownerName = item.owner?.full_name || "Thành viên Campus Karma";

  return (
    <Link
      to={`/items/${item.item_id}`}
      aria-label={`Xem chi tiết ${item.title}`}
      className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-xl group-hover:shadow-slate-900/8 dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-slate-700">
        <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={item.image_url || fallbackImage}
            alt={item.title}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImage;
            }}
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <Badge color={type.color} className="shadow-sm backdrop-blur">{type.label}</Badge>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/90 text-slate-800 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 dark:bg-slate-950/85 dark:text-white">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="truncate uppercase tracking-[0.12em]">{item.category?.name || "Khác"}</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-amber-700 dark:text-amber-400">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {Number(item.karma_value || 0).toLocaleString("vi-VN")} Karma
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-display text-xl font-semibold leading-tight text-slate-950 transition group-hover:text-amber-800 dark:text-white dark:group-hover:text-amber-300">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
            {item.description || "Chưa có mô tả cho vật phẩm này."}
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <span className="truncate">{item.location || "Trong khuôn viên trường"}</span>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Avatar
              img={item.owner?.avatar ? (props) => (
                <img {...props} src={item.owner.avatar} alt="" referrerPolicy="no-referrer" />
              ) : undefined}
              placeholderInitials={(ownerName[0] || "U").toUpperCase()}
              rounded
              size="xs"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
              {ownerName}
            </span>
            <span className="text-xs font-bold text-slate-400 transition group-hover:text-slate-700 dark:group-hover:text-slate-200">
              Xem chi tiết
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
