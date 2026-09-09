import { Navigate } from 'react-router-dom';
import { Spinner, ThemeProvider } from 'flowbite-react';
import { useAuth } from '../context/AuthContext';
import { userTheme } from '../theme/userTheme';

// Middleware frontend: chặn trang khi chưa đăng nhập (HttpOnly Cookie không đọc được ở client)
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemeProvider theme={userTheme}>
        <div className="user-auth flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950" aria-busy="true">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 dark:bg-white">
            <img src="/logo.png" alt="" className="h-11 w-11 object-contain" />
          </span>
          <Spinner size="lg" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Đang xác thực phiên đăng nhập...</p>
        </div>
      </ThemeProvider>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
