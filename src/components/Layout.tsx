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
    <div className="flex h-full w-full min-h-screen overflow-hidden font-sans bg-[#f7f7f9] dark:bg-[#1c1917]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/60 dark:border-transparent bg-[#f7f7f9] dark:bg-[#1c1917] z-20">
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
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#FEF2F2] text-[#D7494C] dark:bg-[#302d2a] dark:text-[#e8e3d9]'
                        : 'text-gray-500 dark:text-[#9c9891] hover:bg-gray-50 dark:hover:bg-[#302d2a] hover:text-gray-900 dark:hover:text-[#ede9e3]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`h-4 w-4 transition-colors duration-150 ${isActive ? 'text-[#D7494C] dark:text-[#9c9891]' : 'text-gray-400 dark:text-[#6b6560]'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* User Info & Footer Actions */}
          <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-[#2e2b28]">
            {user && (
              <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#302d2a] border border-gray-100 dark:border-[#3a3733] flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#D7494C] text-white font-bold text-xs flex items-center justify-center">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-xs font-medium text-gray-800 dark:text-[#e8e3d9] truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 dark:text-[#6b6560] truncate">Job Hunter</p>
                </div>
              </div>
            )}




            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 dark:text-[#9c9891] hover:bg-gray-50 dark:hover:bg-[#302d2a] hover:text-gray-700 dark:hover:text-[#e8e3d9] transition-all text-xs font-medium"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="h-3.5 w-3.5 text-[#e05c5f]" />
                    <span>Dark mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>Light mode</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center justify-center p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile & Tablet Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-20 flex items-center justify-between px-4 bg-[#f7f7f9] dark:bg-[#1c1917] border-b border-gray-200/80 dark:border-[#3a3733]">
        <Logo size="sm" showSubtitle={false} />


        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 dark:text-[#b8b3aa] rounded-xl bg-gray-100 dark:bg-[#2e2b28] border border-gray-100 dark:border-[#3a3733]"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-0 top-14 z-20 bg-[#f7f7f9] dark:bg-[#1c1917] border-b border-gray-200/80 dark:border-[#3a3733] p-4 space-y-2 shadow-lg"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FEF2F2] text-[#D7494C] dark:bg-[#D7494C]/15 dark:text-[#e05c5f]'
                      : 'text-gray-600 dark:text-[#9c9891] hover:bg-gray-50 dark:hover:bg-[#302d2a]'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}

              <div className="pt-3 border-t border-gray-100 dark:border-[#3a3733] flex justify-between gap-2">
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
      <main className="flex-1 h-full overflow-y-auto pt-14 lg:pt-0 relative flex flex-col bg-[#f7f7f9] dark:bg-[#1c1917]">
        <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7 flex-1 h-full flex flex-col min-h-0">
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
