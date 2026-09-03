import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  FileInput,
  Label,
  Select,
  Spinner,
  Textarea,
  TextInput,
} from "flowbite-react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import ItemCard from "../../components/items/ItemCard";
import UserLayout from "../../layouts/UserLayout";
import {
  createItem,
  fetchCategories,
  fetchItems,
} from "../../services/itemService";

const emptyForm = {
  title: "",
  description: "",
  category_id: "",
  karma_value: "",
  type: "GIVE",
  location: "",
  image_url: "",
};

export default function BrowseItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    category_id: "",
    type: "",
    sort: "newest",
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters, page: 1 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const handleImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một tệp hình ảnh.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5 MB.");
      event.target.value = "";
      return;
    }
    setForm((current) => ({ ...current, image_file: file, image_url: "" }));
  };

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetchItems({ ...appliedFilters, limit: 9 })
      .then((data) => {
        setItems(data.items);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [appliedFilters]);

  const handleSearch = (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAppliedFilters({ ...filters, page: 1 });
  };

  const handleCategoryClick = (category_id) => {
    setLoading(true);
    setError("");
    const newFilters = {
      ...filters,
      category_id: String(category_id || ""),
      page: 1,
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  const clearFilters = () => {
    const cleared = { q: "", category_id: "", type: "", sort: "newest" };
    setFilters(cleared);
    setLoading(true);
    setError("");
    setAppliedFilters({ ...cleared, page: 1 });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createItem(form);
      setForm(emptyForm);
      setShowCreate(false);
      setNotice("Đăng vật phẩm thành công. Bài đăng đang chờ admin duyệt.");
      setLoading(true);
      setAppliedFilters((current) => ({
        ...current,
        page: 1,
        refresh: Date.now(),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <section className="pb-12">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Campus Karma Exchange
            </p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Khám phá vật phẩm
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Tìm, lọc và trao đổi đồ dùng với sinh viên trong trường.
            </p>
          </div>
          <Button
            color="success"
            onClick={() => setShowCreate((value) => !value)}
          >
            {showCreate ? (
              <X className="mr-2 h-5 w-5 dark:text-white" />
            ) : (
              <Plus className="mr-2 h-5 w-5 dark:text-white" />
            )}
            <span className="dark:text-white">
              {showCreate ? "Đóng" : "Đăng vật phẩm"}
            </span>
          </Button>
        </div>

        {notice && (
          <Alert
            color="success"
            className="mb-5"
            onDismiss={() => setNotice("")}
          >
            {notice}
          </Alert>
        )}
        {error && (
          <Alert
            color="failure"
            className="mb-5"
            onDismiss={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {showCreate && (
          <Card className="mb-7 border-emerald-200 dark:border-emerald-900">
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Đăng vật phẩm mới
                </h2>
              </div>
              <div>
                <Label htmlFor="title">Tên vật phẩm</Label>
                <TextInput
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  id="category"
                  required
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Hình thức</Label>
                <Select
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="GIVE">Tặng</option>
                  <option value="BORROW">Cho mượn</option>
                  <option value="EXCHANGE">Trao đổi</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="karma">Giá trị Karma</Label>
                <TextInput
                  id="karma"
                  type="number"
                  min="0"
                  required
                  value={form.karma_value}
                  onChange={(e) =>
                    setForm({ ...form, karma_value: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">Địa điểm</Label>
                <TextInput
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="image">URL hình ảnh</Label>
                <TextInput
                  id="image"
                  type="url"
                  value={form.image_url}
                  disabled={Boolean(form.image_file)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image_url: e.target.value,
                      image_file: null,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="image-file">Hoặc chọn ảnh từ máy tính</Label>
                <FileInput
                  id="image-file"
                  accept="image/*"
                  onChange={handleImageFile}
                />
                {form.image_file && (
                  <p className="mt-1 text-xs text-gray-500">
                    Đã chọn: {form.image_file.name}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" color="success" disabled={submitting}>
                  {submitting && <Spinner size="sm" className="mr-2" />}
                  Đăng vật phẩm
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="mb-7">
          <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Từ khóa</Label>
              <TextInput
                id="search"
                icon={Search}
                placeholder="Tên, mô tả hoặc địa điểm..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filter-category">Danh mục</Label>
              <Select
                id="filter-category"
                value={filters.category_id}
                onChange={(e) =>
                  setFilters({ ...filters, category_id: e.target.value })
                }
              >
                <option value="">Tất cả</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-type">Hình thức</Label>
              <Select
                id="filter-type"
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <option value="">Tất cả</option>
                <option value="GIVE">Tặng</option>
                <option value="BORROW">Cho mượn</option>
                <option value="EXCHANGE">Trao đổi</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort">Sắp xếp</Label>
              <Select
                id="sort"
                value={filters.sort}
                onChange={(e) =>
                  setFilters({ ...filters, sort: e.target.value })
                }
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="karma_asc">Karma tăng dần</option>
                <option value="karma_desc">Karma giảm dần</option>
              </Select>
            </div>
            <div className="flex gap-2 lg:col-span-5 lg:justify-end">
              <Button color="light" type="button" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Xóa lọc
              </Button>
              <Button color="success" type="submit" className="dark:text-white">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Áp dụng
              </Button>
            </div>
          </form>
        </Card>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryClick("")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                !appliedFilters.category_id
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900"
                  : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.category_id}
                type="button"
                onClick={() => handleCategoryClick(category.category_id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  appliedFilters.category_id === String(category.category_id)
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900"
                    : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tìm thấy {pagination.total} vật phẩm
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="xl" />
          </div>
        ) : items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.item_id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Không tìm thấy vật phẩm phù hợp.
            </p>
          </Card>
        )}

        {pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              color="light"
              disabled={pagination.page <= 1}
              onClick={() => {
                setLoading(true);
                setAppliedFilters((current) => ({
                  ...current,
                  page: pagination.page - 1,
                }));
              }}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Trang {pagination.page}/{pagination.total_pages}
            </span>
            <Button
              color="light"
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => {
                setLoading(true);
                setAppliedFilters((current) => ({
                  ...current,
                  page: pagination.page + 1,
                }));
              }}
            >
              Sau
            </Button>
          </div>
        )}
      </section>
    </UserLayout>
  );
}
