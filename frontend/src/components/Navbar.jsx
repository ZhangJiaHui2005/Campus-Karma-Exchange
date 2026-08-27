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
} from "flowbite-react";
import { Link } from "react-router-dom";
import { Recycle } from "lucide-react";
import { useEffect, useState } from "react";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function NavigationBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user || null);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    // Thẻ header đóng vai trò background full chiều rộng
    <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Container chuẩn Tailwind (tương đương .container của Bootstrap) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar
          fluid
          rounded
          className="bg-transparent dark:bg-transparent px-0 py-3"
        >
          <NavbarBrand as={Link} to="/">
          <div className="inline-flex items-center justify-center w-10 h-10 mr-2 rounded-full overflow-hidden ">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          </NavbarBrand>

          <div className="flex md:order-2">
            {loading ? (
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : user ? (
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <Avatar
                    img={(props) => (
                      <img
                        src={user.avatar || undefined}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        {...props}
                      />
                    )}
                    placeholderInitials={(
                      user.full_name?.charAt(0) || "U"
                    ).toUpperCase()}
                    rounded
                    size="sm"
                  />
                }
              >
                <DropdownHeader>
                  <span className="block text-sm">{user.full_name}</span>
                  <span className="block truncate text-sm font-medium">
                    {user.email}
                  </span>
                </DropdownHeader>
                <DropdownItem as={Link} to="/profile">
                  Profile
                </DropdownItem>
                <DropdownItem as={Link} to="/browse">
                  Browse Items
                </DropdownItem>
                <DropdownItem>Transactions</DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout}>Sign out</DropdownItem>
              </Dropdown>
            ) : (
              <NavbarLink
                as={Link}
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Đăng nhập
              </NavbarLink>
            )}
            <DarkThemeToggle className="ml-3" />
            <NavbarToggle className="ml-3" />
          </div>

          <NavbarCollapse>
            <NavbarLink as={Link} to="/browse">
              Browse Items
            </NavbarLink>
            <NavbarLink as={Link} to="/wallet">
              Wallet
            </NavbarLink>
            <NavbarLink as={Link} to="/membership">
              Membership
            </NavbarLink>
          </NavbarCollapse>
        </Navbar>
      </div>
    </header>
  );
}

export default NavigationBar;
