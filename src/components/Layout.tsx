import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Lightbulb, Settings, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './Button';
import { Logo } from './Logo';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/preparation', icon: Lightbulb, label: 'Preparation' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-[#24252e] bg-white/70 dark:bg-[#0d0e12] backdrop-blur-2xl z-20">
        <div className="flex h-full flex-col justify-between p-4">
          <div>
            {/* Logo */}
            <div className="px-3 py-4 mb-6">
              <Logo size="md" />
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-[#1f202a] dark:text-white border border-slate-900 dark:border-[#2f303d] shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-[#1a1b24]/60 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`h-4.5 w-4.5 transition-transform duration-150 ${isActive ? 'text-white dark:text-white scale-105' : 'text-slate-400 dark:text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* User Info & Footer Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#24252e]">
            {user && (
              <div className="px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-[#16171d] border border-slate-200 dark:border-[#24252e] flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-sm">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{user.email}</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 truncate">Job Hunter</p>
                </div>
              </div>
            )}




            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="flex-1 justify-start rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="mr-2 h-4 w-4 text-indigo-500" />
                    <span className="text-xs">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-4 w-4 text-amber-400" />
                    <span className="text-xs">Light</span>
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex-1 justify-start rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-xs">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-4 bg-white/80 dark:bg-[#050507]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#1f1f23]">
        <Logo size="sm" showSubtitle={false} />


        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-700 dark:text-zinc-200 rounded-xl bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a]"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-16 z-20 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-[#1f1f23] p-4 space-y-3 shadow-2xl"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-[#18181b] dark:text-white border border-slate-900 dark:border-[#27272a]'
                      : 'text-slate-700 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#18181b]'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-slate-200 dark:border-[#1f1f23] flex justify-between gap-2">
              <Button variant="secondary" size="sm" onClick={toggleTheme} className="flex-1">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex-1 text-rose-600 dark:text-rose-400">
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden pt-16 md:pt-0 relative flex flex-col">
        <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 flex-1 h-full flex flex-col min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 h-full flex flex-col min-h-0"
          >
            {children}
          </motion.div>
        </div>
      </main>


    </div>
  );
};
