import { useState, useEffect } from 'react';
import { Eye, Ban, Check, Download } from 'lucide-react';
import { adminApi } from '../../api';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-600',
    blocked: 'bg-red-100 text-red-600',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-purple-100 text-purple-600',
    landlord: 'bg-blue-100 text-blue-600',
    user: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`text-xs ${styles[role] || styles.user}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

const Avatar = ({ name, color = 'green' }) => {
  const colors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const colorKeys = Object.keys(colors);
  const colorIndex = name ? name.charCodeAt(0) % colorKeys.length : 0;
  const bgColor = colors[colorKeys[colorIndex]];

  return (
    <div className={`w-9 h-9 ${bgColor} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
      {getInitials(name)}
    </div>
  );
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers({ page, limit: 10 });
      setUsers(response.data.users || []);
      setPagination({
        page: response.data.currentPage || 1,
        limit: 10,
        total: response.data.total || 0,
        pages: response.data.totalPages || 0
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user?')) return;

    try {
      await adminApi.blockUser(userId);
      toast.success('User blocked successfully');
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('Failed to block user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminApi.unblockUser(userId);
      toast.success('User unblocked successfully');
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('Failed to unblock user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const handleExport = () => {
    // Create CSV data
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined'];
    const rows = users.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.phone || 'N/A',
      user.role,
      user.status,
      formatDate(user.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-500 mt-1">Admin &gt; Users</p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Users Management</h2>
          <p className="text-gray-500 mt-1">Manage all registered users and their access</p>
        </div>

        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All Users</h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">USER</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">EMAIL</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">PHONE</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">JOINED</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">STATUS</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={`${user.firstName} ${user.lastName}`} />
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <RoleBadge role={user.role} />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <a
                            href={`mailto:${user.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {user.email}
                          </a>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{user.phone || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{formatDate(user.createdAt)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.open(`/admin/users/${user._id}`, '_blank')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="View User"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleBlockUser(user._id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                title="Block User"
                                disabled={user.role === 'admin'}
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnblockUser(user._id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                title="Unblock User"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-100">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  &larr;
                </button>
                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => fetchUsers(i + 1)}
                    className={`w-8 h-8 rounded ${
                      pagination.page === i + 1
                        ? 'bg-green-500 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersManagement;
