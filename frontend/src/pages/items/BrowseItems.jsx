import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Plus, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import ItemCard from "../../components/items/ItemCard";
import UserLayout from "../../layouts/UserLayout";
import { createItem, fetchCategories, fetchItems } from "../../services/itemService";

const emptyForm = {
  title: "",
  description: "",
  category_id: "",
  karma_value: "",
  type: "GIVE",
  location: "",
  image_url: "",
};

const defaultFilters = { q: "", category_id: "", type: "", sort: "newest", page: 1 };
const validTypes = new Set(["GIVE", "BORROW", "SELL"]);
const validSorts = new Set(["newest", "oldest", "karma_asc", "karma_desc"]);

const readFilters = (params) => {
  const page = Number.parseInt(params.get("page") || "1", 10);
  const type = params.get("type") || "";
  const sort = params.get("sort") || "newest";

  return {
    q: params.get("q")?.trim() || "",
    category_id: /^\d+$/.test(params.get("category_id") || "")
      ? params.get("category_id")
      : "",
    type: validTypes.has(type) ? type : "",
    sort: validSorts.has(sort) ? sort : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
};

const createFilterParams = (filters) => {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category_id) params.set("category_id", filters.category_id);
  if (filters.type) params.set("type", filters.type);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
};

export default function BrowseItems() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryKey = searchParams.toString();
  const appliedFilters = readFilters(new URLSearchParams(queryKey));
  const [categories, setCategories] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${queryKey}:${reloadKey}`;
  const [itemsState, setItemsState] = useState({
    requestKey: "",
    items: [],
    pagination: { page: 1, total: 0, total_pages: 1 },
    error: "",
  });
  const loading = itemsState.requestKey !== requestKey;
  const { items, pagination, error: itemsError } = itemsState;
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let active = true;
    const currentFilters = readFilters(new URLSearchParams(queryKey));

    fetchItems({ ...currentFilters, limit: 9 })
      .then((data) => {
        if (!active) return;
        setItemsState({
          requestKey,
          items: data.items,
          pagination: data.pagination,
          error: "",
        });
      })
      .catch((err) => {
        if (!active) return;
        setItemsState({
          requestKey,
          items: [],
          pagination: { page: currentFilters.page, total: 0, total_pages: 1 },
          error: err.message,
        });
      });

    return () => {
      active = false;
    };
  }, [queryKey, reloadKey, requestKey]);

  const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSearchParams(createFilterParams({
      q: String(formData.get("q") || "").trim(),
      category_id: String(formData.get("category_id") || ""),
      type: String(formData.get("type") || ""),
      sort: String(formData.get("sort") || "newest"),
      page: 1,
    }));
  };

  const handleCategoryClick = (category_id) => {
    setSearchParams(createFilterParams({
      ...appliedFilters,
      category_id: String(category_id || ""),
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchParams(createFilterParams(defaultFilters));
  };

  const retryItems = () => {
    setReloadKey((value) => value + 1);
  };

  const hasActiveFilters = Boolean(
    appliedFilters.q ||
    appliedFilters.category_id ||
    appliedFilters.type ||
    appliedFilters.sort !== "newest"
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createItem({ ...form, image_file: imageFile });
      setForm(emptyForm);
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview("");
      setShowCreate(false);
      setNotice("Đăng vật phẩm thành công. Bài đăng đang chờ admin duyệt.");
      setSearchParams(createFilterParams({ ...appliedFilters, page: 1 }));
      setReloadKey((value) => value + 1);
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Khám phá vật phẩm</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Tìm, lọc và trao đổi đồ dùng với sinh viên trong trường.
            </p>
          </div>
          <Button color="success" onClick={() => setShowCreate((value) => !value)}>
            {showCreate ? <X className="mr-2 h-5 w-5 dark:text-white" /> : <Plus className="mr-2 h-5 w-5 dark:text-white" />}
            <span className="dark:text-white">{showCreate ? "Đóng" : "Đăng vật phẩm"}</span>
          </Button>
        </div>

        {notice && <Alert color="success" className="mb-5" onDismiss={() => setNotice("")}>{notice}</Alert>}
        {error && <Alert color="failure" className="mb-5" onDismiss={() => setError("")}>{error}</Alert>}

        {showCreate && (
          <Card className="mb-7 border-emerald-200 dark:border-emerald-900">
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Đăng vật phẩm mới</h2>
              </div>
              <div>
                <Label htmlFor="title">Tên vật phẩm</Label>
                <TextInput id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="category">Danh mục</Label>
                <Select id="category" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Hình thức</Label>
                <Select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="GIVE">Tặng</option>
                  <option value="BORROW">Cho mượn</option>
                  <option value="SELL">Bán</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="karma">Giá trị Karma</Label>
                <TextInput id="karma" type="number" min="0" required value={form.karma_value} onChange={(e) => setForm({ ...form, karma_value: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="location">Địa điểm</Label>
                <TextInput id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="image">Ảnh vật phẩm</Label>
                <FileInput
                  id="image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    if (imagePreview) URL.revokeObjectURL(imagePreview);
                    setImageFile(file);
                    setImagePreview(file ? URL.createObjectURL(file) : "");
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">JPG, PNG hoặc WEBP, tối đa 5 MB.</p>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Xem trước vật phẩm"
                    className="mt-3 h-32 w-full rounded-lg object-cover"
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
          <form key={queryKey} onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Từ khóa</Label>
              <TextInput
                id="search"
                name="q"
                icon={Search}
                placeholder="Tên, mô tả hoặc địa điểm..."
                defaultValue={appliedFilters.q}
              />
            </div>
            <div className="lg:hidden">
              <Label htmlFor="filter-category">Danh mục</Label>
              <Select id="filter-category" name="category_id" defaultValue={appliedFilters.category_id}>
                <option value="">Tất cả</option>
                {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-type">Hình thức</Label>
              <Select id="filter-type" name="type" defaultValue={appliedFilters.type}>
                <option value="">Tất cả</option>
                <option value="GIVE">Tặng</option>
                <option value="BORROW">Cho mượn</option>
                <option value="SELL">Bán</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort">Sắp xếp</Label>
              <Select id="sort" name="sort" defaultValue={appliedFilters.sort}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="karma_asc">Karma tăng dần</option>
                <option value="karma_desc">Karma giảm dần</option>
              </Select>
            </div>
            <div className="flex gap-2 lg:col-span-4 lg:justify-end">
              <Button color="light" type="button" onClick={clearFilters}><X className="mr-2 h-4 w-4" />Xóa lọc</Button>
              <Button color="success" type="submit" className="dark:text-white"><SlidersHorizontal className="mr-2 h-4 w-4" />Áp dụng</Button>
            </div>
          </form>
        </Card>

        <div className="mb-6 hidden lg:block">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryClick("")}
              aria-pressed={!appliedFilters.category_id}
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
                aria-pressed={appliedFilters.category_id === String(category.category_id)}
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

        {!loading && !itemsError && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tìm thấy {pagination.total} vật phẩm</p>
          </div>
        )}

        {loading ? (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Đang tải vật phẩm"
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-4 p-5">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2">
                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : itemsError ? (
          <Card className="py-10 text-center">
            <div role="alert" className="mx-auto max-w-lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Không thể tải danh sách vật phẩm
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {itemsError || "Đã xảy ra lỗi khi kết nối với máy chủ."}
              </p>
              <Button color="failure" className="mx-auto mt-5" onClick={retryItems}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Thử lại
              </Button>
            </div>
          </Card>
        ) : items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => <ItemCard key={item.item_id} item={item} />)}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <Search className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {hasActiveFilters ? "Không tìm thấy vật phẩm phù hợp" : "Chưa có vật phẩm nào"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
              {hasActiveFilters
                ? "Hãy thử thay đổi từ khóa, danh mục hoặc hình thức giao dịch."
                : "Hãy trở thành người đầu tiên đăng một vật phẩm để chia sẻ với cộng đồng."}
            </p>
            <Button
              color={hasActiveFilters ? "light" : "success"}
              className="mx-auto mt-5"
              onClick={hasActiveFilters ? clearFilters : () => setShowCreate(true)}
            >
              {hasActiveFilters ? (
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {hasActiveFilters ? "Xóa bộ lọc" : "Đăng vật phẩm đầu tiên"}
            </Button>
          </Card>
        )}

        {pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button color="light" disabled={pagination.page <= 1} onClick={() => setSearchParams(createFilterParams({ ...appliedFilters, page: pagination.page - 1 }))}>Trước</Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Trang {pagination.page}/{pagination.total_pages}</span>
            <Button color="light" disabled={pagination.page >= pagination.total_pages} onClick={() => setSearchParams(createFilterParams({ ...appliedFilters, page: pagination.page + 1 }))}>Sau</Button>
          </div>
        )}
      </section>
    </UserLayout>
  );
}
