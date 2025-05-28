import React, { useEffect, useState } from 'react';
import { User, Pencil, Trash2, X } from 'lucide-react';
import { userAPI } from '../services/api';
import { params } from '../types';

interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  metaData: Record<string, unknown>;
}

export default function UsersView() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const initialFormData = {
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    metaData: {},
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    geUsers();
  }, []);

  const geUsers = async () => {
    const params: params = {
      page: 1,
      limit: 100,
    };
    try {
      const response = await userAPI.list(params);
      setUsers(response.data); // Update the quotes state with the fetched data
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      // Optionally show error to user
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentUser) {
      setUsers(
        users.map((user) => (user.id === currentUser.id ? { ...currentUser, ...formData } : user))
      );
    } else {
      setUsers([...users, { ...formData, id: Date.now().toString() }]);
    }
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentUser(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (user: UserData) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: '',
      metaData: user.metaData || {},
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <div className="md:space-y-8 px-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Users List</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData(initialFormData);
            setIsDialogOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          <User className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl md:p-8 p-4 mx-2 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit User' : 'Create User'}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isEditing ? 'Update User' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow-sm md:p-2">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
