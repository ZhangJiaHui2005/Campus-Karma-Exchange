import { Avatar, Badge } from "flowbite-react";
import { MapPin, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import fallbackImage from "../../assets/hero.png";

const typeLabels = {
  GIVE: "Tặng",
  LEND: "Cho mượn",
  BORROW: "Cho mượn",
  EXCHANGE: "Trao đổi",
};

const typeColors = {
  GIVE: "success",
  LEND: "info",
  BORROW: "info",
  EXCHANGE: "warning",
};

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/items/${item.item_id}`)}
      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-200"
    >
      {/* Hình ảnh */}
      <div className="relative overflow-hidden h-44 bg-gray-100 dark:bg-gray-700">
        <img
          src={item.image_url || fallbackImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Type badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge color={typeColors[item.type] || "gray"} size="sm">
            {typeLabels[item.type] || item.type}
          </Badge>
        </div>
        {/* Status badge */}
        {item.status !== "AVAILABLE" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">
              Không khả dụng
            </span>
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          {item.category?.name}
        </p>

        {/* Tên */}
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {item.title}
        </h3>

        {/* Mô tả */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-8">
          {item.description || "Chưa có mô tả."}
        </p>

        {/* Karma + Location */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
            <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{item.karma_value} Karma</span>
          </div>
          {item.location && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 max-w-[120px] truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {item.location}
            </span>
          )}
        </div>

        {/* Divider + Owner */}
        <div className="flex items-center gap-2.5 border-t border-gray-100 dark:border-gray-700 pt-3">
          <Avatar
            img={item.owner?.avatar || undefined}
            placeholderInitials={(item.owner?.full_name?.[0] || "U").toUpperCase()}
            rounded
            size="xs"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
              {item.owner?.full_name}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(item.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
          {/* Hover CTA */}
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            Xem →
          </span>
        </div>
      </div>
    </div>
  );
}
