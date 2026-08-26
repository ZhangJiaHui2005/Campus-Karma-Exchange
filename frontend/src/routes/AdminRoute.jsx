import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

export default function AdminRoute({ children }) {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Đang kiểm tra quyền admin...</div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
