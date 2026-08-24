import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Middleware frontend: chặn trang khi chưa đăng nhập (HttpOnly Cookie không đọc được ở client)
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page">
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
