import { useEffect, useState } from "react";
import { Alert, Avatar, Badge, Button, Card } from "flowbite-react";
import { ArrowLeft, CalendarDays, MapPin, RotateCcw, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import fallbackImage from "../../assets/hero.png";
import UserLayout from "../../layouts/UserLayout";
import { fetchItemById } from "../../services/itemService";

const typeLabels = {
  GIVE: "Tặng",
  BORROW: "Cho mượn",
  LEND: "Cho mượn",
  SELL: "Bán",
  EXCHANGE: "Bán",
};

const statusLabels = {
  AVAILABLE: "Đang có sẵn",
  RESERVED: "Đã được giữ",
  COMPLETED: "Đã hoàn tất",
  UNAVAILABLE: "Không còn khả dụng",
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hasValidId = /^\d+$/.test(id || "");
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(hasValidId);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const pageError = hasValidId ? error : "Mã vật phẩm không hợp lệ.";

  useEffect(() => {
    let active = true;

    if (!hasValidId) return undefined;

    fetchItemById(id)
      .then((data) => {
        if (active) setItem(data.item);
      })
      .catch((err) => {
        if (active) {
          setItem(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hasValidId, id, reloadKey]);

  const retryItem = () => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/browse");
  };

  return (
    <UserLayout>
      <section className="pb-12">
        <Button color="light" onClick={goBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Quay lại danh sách
        </Button>

        {loading ? (
          <div
            className="grid animate-pulse gap-8 lg:grid-cols-2"
            aria-busy="true"
            aria-label="Đang tải chi tiết vật phẩm"
          >
            <div className="aspect-[4/3] rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-5 py-2">
              <div className="h-6 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-7 w-36 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-3 pt-4">
                <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ) : pageError ? (
          <Card className="py-10 text-center">
            <Alert color="failure" className="mx-auto max-w-xl text-left">
              <span className="font-medium">Không thể tải vật phẩm.</span> {pageError}
            </Alert>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button color="failure" onClick={retryItem} disabled={!hasValidId}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Thử lại
              </Button>
              <Button color="light" onClick={() => navigate("/browse")}>Về trang khám phá</Button>
            </div>
          </Card>
        ) : item ? (
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <img
                src={item.image_url || fallbackImage}
                alt={`Ảnh ${item.title}`}
                className="aspect-[4/3] w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </div>

            <Card>
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="success">{typeLabels[item.type] || item.type}</Badge>
                <Badge color="gray">{item.category?.name || "Chưa phân loại"}</Badge>
                {item.status && (
                  <Badge color={item.status === "AVAILABLE" ? "success" : "warning"}>
                    {statusLabels[item.status] || item.status}
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Campus Karma Exchange
                </p>
                <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{item.title}</h1>
                <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {Number(item.karma_value).toLocaleString("vi-VN")} Karma
                </p>
              </div>

              <div className="grid gap-3 border-y border-gray-100 py-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  <span>{item.location || "Trong trường"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  <span>Đăng ngày {new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>

              <section aria-labelledby="item-description">
                <h2 id="item-description" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mô tả vật phẩm
                </h2>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-600 dark:text-gray-300">
                  {item.description || "Người đăng chưa cung cấp mô tả cho vật phẩm này."}
                </p>
              </section>

              <section aria-labelledby="item-owner" className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <h2 id="item-owner" className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <UserRound className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  Người đăng
                </h2>
                <div className="flex items-center gap-3">
                  <Avatar
                    img={item.owner?.avatar ? (props) => (
                      <img
                        {...props}
                        src={item.owner.avatar}
                        alt={`Ảnh đại diện ${item.owner.full_name}`}
                        referrerPolicy="no-referrer"
                      />
                    ) : undefined}
                    placeholderInitials={(item.owner?.full_name?.[0] || "U").toUpperCase()}
                    rounded
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {item.owner?.full_name || "Người dùng"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Thành viên Campus Karma Exchange</p>
                  </div>
                </div>
              </section>
            </Card>
          </div>
        ) : null}
      </section>
    </UserLayout>
  );
}
