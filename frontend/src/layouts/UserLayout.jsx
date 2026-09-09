import { NavigationBar } from "../components/Navbar";
import UserFooter from "../components/UserFooter";
import { ThemeProvider } from "flowbite-react";
import { userTheme } from "../theme/userTheme";

export default function UserLayout({ children }) {
  return (
    <ThemeProvider theme={userTheme}>
      <div className="user-shell flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <a href="#main-content" className="skip-link">Đi đến nội dung chính</a>
        <NavigationBar />
        <main id="main-content" tabIndex="-1" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-4 pt-8 outline-none sm:px-6 sm:pt-10 lg:px-8">
          {children}
        </main>
        <UserFooter />
      </div>
    </ThemeProvider>
  );
}
