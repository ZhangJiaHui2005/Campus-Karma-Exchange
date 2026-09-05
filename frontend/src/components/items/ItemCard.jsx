import { Avatar, Badge } from "flowbite-react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import fallbackImage from "../../assets/hero.png";

const typeLabels = {
  GIVE: "Tặng",
  BORROW: "Cho mượn",
  LEND: "Cho mượn",
  SELL: "Bán",
  EXCHANGE: "Bán",
};

export default function ItemCard({ item }) {
  return (
    <Link
      to={`/items/${item.item_id}`}
      aria-label={`Xem chi tiết ${item.title}`}
      className="block h-full rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 dark:focus-visible:ring-emerald-800"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-emerald-700">
        <img
          src={item.image_url || fallbackImage}
          alt={item.title}
          loading="lazy"
          className="aspect-[4/3] w-full bg-gray-100 object-cover dark:bg-gray-700"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="success">{typeLabels[item.type] || item.type}</Badge>
            <Badge color="gray">{item.category.name}</Badge>
          </div>

          <div>
            <h3 className="line-clamp-1 text-xl font-semibold text-gray-900 dark:text-white">
              {item.title}
            </h3>
            <p className="mt-2 line-clamp-2 min-h-12 text-sm text-gray-600 dark:text-gray-400">
              {item.description || "Chưa có mô tả."}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {Number(item.karma_value).toLocaleString("vi-VN")} Karma
            </span>
            <span className="inline-flex min-w-0 items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.location || "Trong trường"}</span>
            </span>
          </div>

          <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
            <Avatar
              img={item.owner.avatar ? (props) => (
                <img
                  {...props}
                  src={item.owner.avatar}
                  alt={`Ảnh đại diện ${item.owner.full_name}`}
                  referrerPolicy="no-referrer"
                />
              ) : undefined}
              placeholderInitials={(item.owner.full_name?.[0] || "U").toUpperCase()}
              rounded
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.owner.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Xem chi tiết
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
