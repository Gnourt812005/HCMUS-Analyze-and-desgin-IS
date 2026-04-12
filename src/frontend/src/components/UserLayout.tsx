import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-inter bg-slate-50">
      <Header />
      <main className="flex-grow pt-24 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
