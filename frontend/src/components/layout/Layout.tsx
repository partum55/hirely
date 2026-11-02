// frontend/src/components/layout/Layout.tsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, FileText, MessageSquare, Trophy, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { authService } from '../../services';

export default function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => 
    `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-gradient-to-r from-[#226A74] to-[#226A74] text-white shadow-lg'
        : 'text-slate-700 hover:bg-white/50 hover:text-primary-600'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {import.meta.env.VITE_DEMO && (
        <div className="bg-[#226A74] text-white text-center text-sm py-2 px-4">
          Demo version — data is fake, AI responses are canned, and everything resets on reload.
        </div>
      )}
      <nav className="glass-effect sticky top-0 z-50 border-b border-white/30">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center">
              <img 
                src="logo.png" 
                alt="Hirely" 
                className="h-30 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <Home className="h-5 w-5" />
                <span>{t('Home') ?? 'Home'}</span>
              </Link>
              <Link to="/cv" className={navLinkClass('/cv')}>
                <FileText className="h-5 w-5" />
                <span>{t('nav.cv') ?? 'CV Master'}</span>
              </Link>
              <Link to="/interview" className={navLinkClass('/interview')}>
                <MessageSquare className="h-5 w-5" />
                <span>{t('nav.interview') ?? 'Interview'}</span>
              </Link>
              <Link to="/trainer" className={navLinkClass('/trainer')}>
                <Trophy className="h-5 w-5" />
                <span>{t('nav.trainer') ?? 'Trainer'}</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/settings" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-white/50 transition-all duration-200"
            >
              <SettingsIcon className="h-5 w-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>{t('auth.logout') ?? 'Logout'}</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
