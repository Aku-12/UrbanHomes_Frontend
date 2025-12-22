import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  LogOut,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { adminApi } from '../../api';
import urbanLogo from '../../assets/urbanlogo.svg';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        const response = await adminApi.getAllBookings({ status: 'pending', limit: 1 });
        setPendingBookingsCount(response.data.total || 0);
      } catch (error) {
        console.error('Failed to fetch pending bookings count:', error);
      }
    };
    fetchPendingBookings();
  }, [location.pathname]);

  const menuItems = [
    {
      section: 'MAIN',
      items: [
        { path: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
      ]
    },
    {
      section: 'MANAGEMENT',
      items: [
        { path: '/admin/rooms', label: 'Manage Rooms', icon: Home },
        { path: '/admin/bookings', label: 'Bookings', icon: Calendar, badge: true },
        { path: '/admin/users', label: 'Users Management', icon: Users },
      ]
    },
    {
      section: 'ACCOUNT',
      items: [
        { path: '/logout', label: 'Logout', icon: LogOut, isLogout: true },
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <Link to="/admin" className="flex items-center gap-3">
            <img src={urbanLogo} alt="Urban Homes" className="h-10" />
            <p className="text-xs text-gray-500 font-semibold">ADMIN PANEL</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <p className="text-xs font-semibold text-gray-400 mb-2 px-3">
                {section.section}
              </p>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;

                  if (item.isLogout) {
                    return (
                      <li key={itemIndex}>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="w-5 h-5 text-orange-500" />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={itemIndex}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                          ${isActive(item.path)
                            ? 'bg-green-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                        {item.badge && pendingBookingsCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {pendingBookingsCount > 99 ? '99+' : pendingBookingsCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rooms, users, bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User profile */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {getInitials(user.firstName || 'Admin')}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
