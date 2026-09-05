import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Label,
  Select,
  Spinner,
  Textarea,
  TextInput,
} from "flowbite-react";
import { Edit3, PackageOpen, Save, Trash2, X } from "lucide-react";
import UserLayout from "../../layouts/UserLayout";
import {
  deleteItem,
  fetchCategories,
  fetchMyItems,
  updateItem,
} from "../../services/itemService";

const statusMeta = {
  PENDING: { label: "Chờ duyệt", color: "warning" },
  AVAILABLE: { label: "Đang hiển thị", color: "success" },
  SOLD: { label: "Đã bán", color: "gray" },
  REJECTED: { label: "Bị từ chối", color: "failure" },
};

const typeLabels = {
  GIVE: "Tặng",
  BORROW: "Cho mượn",
  SELL: "Bán",
  EXCHANGE: "Bán",
};

export default function MyItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetchMyItems(statusFilter)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const beginEdit = (item) => {
    setEditingId(item.item_id);
    setEditForm({
      title: item.title,
      description: item.description || "",
      category_id: String(item.category_id),
      karma_value: String(item.karma_value),
      type: item.type === "EXCHANGE" ? "SELL" : item.type,
      location: item.location || "",
    });
    setError("");
    setNotice("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = async (event, itemId) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await updateItem(itemId, editForm);
      setItems((current) =>
        current.map((item) => (item.item_id === itemId ? data.item : item)),
      );
      setNotice("Cập nhật vật phẩm thành công.");
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Bạn có chắc muốn xóa vật phẩm này?")) return;

    setError("");
    try {
      await deleteItem(itemId);
      setItems((current) => current.filter((item) => item.item_id !== itemId));
      setNotice("Đã xóa vật phẩm.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <UserLayout>
      <section className="pb-12">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Quản lý bài đăng
            </p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Vật phẩm của tôi
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Theo dõi trạng thái, chỉnh sửa hoặc xóa vật phẩm bạn đã đăng.
            </p>
          </div>

          <div className="w-full sm:w-52">
            <Label htmlFor="status-filter">Trạng thái</Label>
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => {
                setLoading(true);
                setStatusFilter(event.target.value);
              }}
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="AVAILABLE">Đang hiển thị</option>
              <option value="SOLD">Đã bán</option>
              <option value="REJECTED">Bị từ chối</option>
            </Select>
          </div>
        </div>

        {notice && (
          <Alert color="success" className="mb-5" onDismiss={() => setNotice("")}>
            {notice}
          </Alert>
        )}
        {error && (
          <Alert color="failure" className="mb-5" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="xl" />
          </div>
        ) : items.length === 0 ? (
          <Card className="py-12 text-center">
            <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Bạn chưa có vật phẩm ở trạng thái này.
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            {items.map((item) => {
              const status = statusMeta[item.status] || {
                label: item.status,
                color: "gray",
              };

              return (
                <Card key={item.item_id}>
                  {editingId === item.item_id ? (
                    <form
                      onSubmit={(event) => handleSave(event, item.item_id)}
                      className="grid gap-4 md:grid-cols-2"
                    >
                      <div>
                        <Label htmlFor={`title-${item.item_id}`}>Tên vật phẩm</Label>
                        <TextInput
                          id={`title-${item.item_id}`}
                          required
                          value={editForm.title}
                          onChange={(event) =>
                            setEditForm({ ...editForm, title: event.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`category-${item.item_id}`}>Danh mục</Label>
                        <Select
                          id={`category-${item.item_id}`}
                          required
                          value={editForm.category_id}
                          onChange={(event) =>
                            setEditForm({ ...editForm, category_id: event.target.value })
                          }
                        >
                          {categories.map((category) => (
                            <option key={category.category_id} value={category.category_id}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`type-${item.item_id}`}>Hình thức</Label>
                        <Select
                          id={`type-${item.item_id}`}
                          value={editForm.type}
                          onChange={(event) =>
                            setEditForm({ ...editForm, type: event.target.value })
                          }
                        >
                          <option value="GIVE">Tặng</option>
                          <option value="BORROW">Cho mượn</option>
                          <option value="SELL">Bán</option>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`karma-${item.item_id}`}>Giá trị Karma</Label>
                        <TextInput
                          id={`karma-${item.item_id}`}
                          type="number"
                          min="0"
                          required
                          value={editForm.karma_value}
                          onChange={(event) =>
                            setEditForm({ ...editForm, karma_value: event.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`location-${item.item_id}`}>Địa điểm</Label>
                        <TextInput
                          id={`location-${item.item_id}`}
                          value={editForm.location}
                          onChange={(event) =>
                            setEditForm({ ...editForm, location: event.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${item.item_id}`}>Mô tả</Label>
                        <Textarea
                          id={`description-${item.item_id}`}
                          rows={4}
                          value={editForm.description}
                          onChange={(event) =>
                            setEditForm({ ...editForm, description: event.target.value })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2 md:col-span-2">
                        <Button type="button" color="light" onClick={cancelEdit}>
                          <X className="mr-2 h-4 w-4" /> Hủy
                        </Button>
                        <Button type="submit" color="success" disabled={saving}>
                          {saving ? (
                            <Spinner size="sm" className="mr-2" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Lưu
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-5 md:flex-row">
                      <img
                        src={item.image_url || "/logo.png"}
                        alt={item.title}
                        className="h-44 w-full rounded-lg object-cover md:w-56"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge color={status.color}>{status.label}</Badge>
                          <Badge color="gray">{item.category.name}</Badge>
                          <Badge color="info">{typeLabels[item.type] || item.type}</Badge>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {item.description || "Chưa có mô tả."}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <span className="font-semibold text-emerald-600">
                            {item.karma_value} Karma
                          </span>
                          <span className="text-gray-500">
                            {item.location || "Chưa có địa điểm"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 md:flex-col">
                        <Button color="light" onClick={() => beginEdit(item)}>
                          <Edit3 className="mr-2 h-4 w-4" /> Sửa
                        </Button>
                        <Button color="failure" onClick={() => handleDelete(item.item_id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </UserLayout>
  );
}
