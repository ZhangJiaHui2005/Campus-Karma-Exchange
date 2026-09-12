import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  DarkThemeToggle,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Spinner,
  TextInput,
} from "flowbite-react";
import {
  ArrowRight,
  CircleUserRound,
  HandCoins,
  ListChecks,
  PackageOpen,
  Search,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const navItems = [
  { to: "/browse", label: "Khám phá" },
  { to: "/transactions", label: "Giao dịch" },
  { to: "/wallet", label: "Ví Karma" },
  { to: "/membership", label: "Karma Pass" },
];

export function NavigationBar() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRegionRef = useRef(null);
  const mobileInputRef = useRef(null);
  const [query, setQuery] = useState(() =>
    location.pathname === "/browse" ? new URLSearchParams(location.search).get("q") || "" : "",
  );
  const [items, setItems] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    if (!query.trim()) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_URL}/items?q=${encodeURIComponent(query.trim())}&limit=6`,
          { credentials: "include", signal: controller.signal },
        );
        const data = await response.json();
        if (response.ok) {
          setItems(data.items || []);
          setHighlightIndex(0);
        }
      } catch (error) {
        if (error.name !== "AbortError") console.error("Search suggestions error:", error);
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!searchRegionRef.current?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) mobileInputRef.current?.focus();
  }, [mobileSearchOpen]);

  const suggestions = useMemo(() => items.slice(0, 6), [items]);
  const isActive = (path) =>
    path === "/browse"
      ? location.pathname === path || location.pathname.startsWith("/items/")
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const submitSearch = (value = query) => {
    const normalized = value.trim();
    if (!normalized) return;
    setSearchOpen(false);
    setMobileSearchOpen(false);
    navigate(`/browse?q=${encodeURIComponent(normalized)}`);
  };

  const selectSuggestion = (item) => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    navigate(`/items/${item.item_id}`);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const selected = searchOpen ? suggestions[highlightIndex] : null;
      if (selected) selectSuggestion(selected);
      else submitSearch();
      return;
    }
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setHighlightIndex((value) => (value + 1) % suggestions.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchOpen(true);
      setHighlightIndex((value) => (value - 1 + suggestions.length) % suggestions.length);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const searchResults = searchOpen && query.trim() && (
    <div
      role="listbox"
      aria-label="Gợi ý vật phẩm"
      className="liquid-popover absolute inset-x-0 top-full z-50 mt-3 overflow-hidden rounded-3xl p-1.5"
    >
      {searchLoading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm font-semibold text-slate-500">
          <Spinner size="sm" /> Đang tìm trong cộng đồng...
        </div>
      ) : suggestions.length ? (
        <>
          {suggestions.map((item, index) => (
            <button
              key={item.item_id}
              type="button"
              role="option"
              aria-selected={index === highlightIndex}
              onMouseEnter={() => setHighlightIndex(index)}
              onClick={() => selectSuggestion(item)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                index === highlightIndex
                  ? "bg-slate-100 dark:bg-slate-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
              }`}
            >
              <img
                src={item.image_url || "/logo.png"}
                alt=""
                className="h-11 w-11 shrink-0 rounded-lg bg-slate-100 object-cover dark:bg-slate-800"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  {item.category?.name || "Vật phẩm"} · {item.location || "Trong trường"}
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {Number(item.karma_value || 0).toLocaleString("vi-VN")} K
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => submitSearch()}
            className="mt-1 flex w-full items-center justify-between rounded-xl border-t border-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Xem mọi kết quả cho “{query.trim()}”
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      ) : (
        <div className="px-4 py-5 text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-white">Chưa thấy vật phẩm phù hợp</p>
          <button type="button" onClick={() => submitSearch()} className="mt-1 text-sm text-slate-500 underline-offset-4 hover:underline dark:text-slate-400">
            Mở trang tìm kiếm để đổi bộ lọc
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-4 lg:pt-4">
      <div ref={searchRegionRef} className="liquid-island pointer-events-auto mx-auto max-w-7xl rounded-[1.75rem] px-3 sm:px-4">
        <Navbar fluid className="min-h-16 !border-0 !bg-transparent py-2 sm:min-h-18 sm:py-3">
          <NavbarBrand as={Link} to="/" aria-label="Campus Karma Exchange" className="mr-2 min-h-11 shrink-0">
            <span className="liquid-logo grid h-10 w-10 place-items-center overflow-hidden rounded-2xl">
              <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            </span>
            <span className="ml-3 hidden leading-tight sm:block">
              <span className="font-display block text-lg font-semibold text-slate-950 dark:text-white">Campus Karma</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Exchange</span>
            </span>
          </NavbarBrand>

          <div className="relative hidden min-w-0 flex-1 lg:mx-4 lg:block lg:max-w-sm xl:max-w-md">
            <TextInput
              className="liquid-search"
              type="search"
              icon={Search}
              value={query}
              placeholder="Tìm vật phẩm trong trường..."
              aria-label="Tìm vật phẩm"
              aria-expanded={searchOpen}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                setSearchLoading(Boolean(value.trim()));
                if (!value.trim()) setItems([]);
                setSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
            />
            {searchResults}
          </div>

          <div className="flex items-center gap-1.5 md:order-2">
            {user && (
              <Link
                to="/wallet"
                className="liquid-control hidden min-h-11 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-emerald-800 transition sm:inline-flex dark:text-emerald-300"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {Number(user.karma_balance || 0).toLocaleString("vi-VN")}
              </Link>
            )}
            <button
              type="button"
              aria-label={mobileSearchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((value) => !value)}
              className="liquid-icon-button grid h-11 w-11 place-items-center rounded-full text-slate-600 transition lg:hidden dark:text-slate-200"
            >
              {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <DarkThemeToggle aria-label="Chuyển chế độ sáng hoặc tối" className="liquid-icon-button flex h-11 w-11 items-center justify-center rounded-full p-0 text-slate-600 dark:text-slate-200" />
            {loading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            ) : user ? (
              <Dropdown
                arrowIcon={false}
                inline
                aria-label="Mở menu tài khoản"
                label={
                  <Avatar
                    img={user.avatar ? (props) => <img {...props} src={user.avatar} alt="" referrerPolicy="no-referrer" /> : undefined}
                    placeholderInitials={(user.full_name?.charAt(0) || "U").toUpperCase()}
                    rounded
                    size="sm"
                  />
                }
              >
                <DropdownHeader>
                  <span className="block font-bold text-slate-900 dark:text-white">{user.full_name}</span>
                  <span className="block truncate text-xs font-normal text-slate-500">{user.email}</span>
                </DropdownHeader>
                <DropdownItem as={Link} to="/profile" icon={CircleUserRound}>Hồ sơ</DropdownItem>
                <DropdownItem as={Link} to="/my-items" icon={PackageOpen}>Vật phẩm của tôi</DropdownItem>
                <DropdownItem as={Link} to="/transactions" icon={ListChecks}>Giao dịch của tôi</DropdownItem>
                <DropdownItem as={Link} to="/wallet" icon={WalletCards}>Ví Karma</DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout} icon={HandCoins}>Đăng xuất</DropdownItem>
              </Dropdown>
            ) : (
              <Link to="/login" className="liquid-primary inline-flex min-h-11 items-center rounded-full px-5 py-2 text-sm font-bold">
                Đăng nhập
              </Link>
            )}
            <NavbarToggle aria-label="Mở menu chính" className="liquid-icon-button ml-0 rounded-full" />
          </div>

          <NavbarCollapse className="liquid-nav-group">
            {navItems.map((item) => (
              <NavbarLink key={item.to} as={Link} to={item.to} active={isActive(item.to)}>
                {item.label}
              </NavbarLink>
            ))}
          </NavbarCollapse>

          {mobileSearchOpen && (
            <div className="liquid-mobile-search relative order-4 w-full border-t border-white/40 pt-3 dark:border-white/10 lg:hidden">
              <TextInput
                className="liquid-search"
                ref={mobileInputRef}
                type="search"
                icon={Search}
                value={query}
                placeholder="Tìm giáo trình, máy tính, đồ KTX..."
                aria-label="Tìm vật phẩm"
                aria-expanded={searchOpen}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  setSearchLoading(Boolean(value.trim()));
                  if (!value.trim()) setItems([]);
                  setSearchOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
              />
              {searchResults}
            </div>
          )}
        </Navbar>
      </div>
    </header>
  );
}

export default NavigationBar;
