import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Send, Users, FileText, BarChart3, CreditCard,
  Settings, LogOut, Bell, Building2,
} from 'lucide-react';
import { useAuth } from '../state/auth';

type NavItem = { label: string; to: string; icon: typeof LayoutDashboard };

const NAV: NavItem[] = [
  { label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard },
  { label: 'Compose',    to: '/compose',    icon: Send },
  { label: 'Templates',  to: '/templates',  icon: FileText },
  { label: 'Contacts',   to: '/contacts',   icon: Users },
  { label: 'Logs',       to: '/logs',       icon: BarChart3 },
  { label: 'Billing',    to: '/billing',    icon: CreditCard },
  { label: 'Settings',   to: '/settings',   icon: Settings },
];

/**
 * App shell — sidebar + main content area.
 * Renders nothing when there's no user (children get to handle public routes).
 */
export default function Layout({ children }: { children: ReactNode }) {
  const { user, activeMembership, logout } = useAuth();
  const org = activeMembership?.org;
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Code Red SMS" className="w-8 h-8 object-contain" />
            <div>
              <div className="font-semibold text-sm">Code Red SMS</div>
              {org && <div className="text-xs opacity-70">{org.name}</div>}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/10">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5"
            onClick={() => navigate('/settings/profile')}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
              {user?.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.displayName}</div>
              <div className="text-xs opacity-60 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
