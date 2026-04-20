import { Outlet, Navigate } from 'react-router-dom';
import { CustomerSidebar } from './CustomerSidebar';
import { AuthService } from '../api/AuthService';

export const AccountLayout = () => {
  const isLoggedIn = AuthService.isLoggedIn();
  const canAccessAdmin = AuthService.canAccessAdmin();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-6">
      {!canAccessAdmin && <CustomerSidebar />}
      <main className={canAccessAdmin ? "md:col-span-12 max-w-4xl mx-auto w-full" : "md:col-span-9"}>
        <Outlet />
      </main>
    </div>
  );
};
