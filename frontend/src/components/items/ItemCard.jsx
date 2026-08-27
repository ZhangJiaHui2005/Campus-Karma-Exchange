import { Avatar, Badge, Card } from "flowbite-react";
import { MapPin } from "lucide-react";
import fallbackImage from "../../assets/hero.png";

const typeLabels = {
  GIVE: "Tặng",
  BORROW: "Cho mượn",
  EXCHANGE: "Trao đổi",
};

export default function ItemCard({ item }) {
  return (
    <Card
      className="h-full overflow-hidden border-gray-200 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-700"
      imgAlt={item.title}
      imgSrc={item.image_url || fallbackImage}
    >
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

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {item.karma_value} Karma
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          {item.location || "Trong trường"}
        </span>
      </div>

      <div className="flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
        <Avatar
          img={item.owner.avatar || undefined}
          placeholderInitials={(item.owner.full_name?.[0] || "U").toUpperCase()}
          rounded
          size="sm"
        />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.owner.full_name}</p>
          <p className="text-xs text-gray-500">
            {new Date(item.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>
    </Card>
  );
}
