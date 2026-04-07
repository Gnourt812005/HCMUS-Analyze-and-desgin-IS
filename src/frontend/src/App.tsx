import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TestPage } from './pages/TestPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-inter bg-slate-50">
        <Header />

        {/* Main Content Area */}
        <main className="flex-grow pt-24 pb-12">
          <Routes>
            <Route path="/" element={<div className="flex items-center justify-center h-full"><h1 className="text-3xl font-bold text-slate-800">Trang Chủ (Coming Soon)</h1></div>} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
