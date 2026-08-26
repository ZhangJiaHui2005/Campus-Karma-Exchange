import { createContext, useContext, useEffect, useState } from 'react';
import { fetchAdminMe, adminLogout } from '../services/adminAuthService';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminMe();
      setAdmin(data);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAdmin();
  }, []);

  const logout = async () => {
    await adminLogout();
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, setAdmin, loading, logout, refreshAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
