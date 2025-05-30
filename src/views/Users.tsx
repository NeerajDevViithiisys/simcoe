import React, { useEffect, useState } from 'react';
import { User, Pencil, Trash2, X } from 'lucide-react';
import { userAPI } from '../services/api';
import { params } from '../types';
import { toast } from 'react-toastify';
import { validatePhone } from '../utils/string';

interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  metaData: Record<string, unknown>;
}

export const UsersView = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add validation states
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
  }>({});

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
    setIsLoading(true);
    try {
      const response = await userAPI.list(params);
      setUsers(response.data); // Update the quotes state with the fetched data
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      setIsLoading(false);
      // Optionally show error to user
    }
  };

  //Update handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEditing && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        ...formData,
        phoneNumber: '+1' + formData.phoneNumber.replace(/\D/g, ''), // Send only digits
      };

      if (isEditing && currentUser) {
        await userAPI.update(currentUser.id, userData);
        toast.success('User updated successfully');
      } else {
        await userAPI.create(userData);
        toast.success('User created successfully');
      }

      // Refresh users list
      await geUsers();

      // Reset form and close dialog
      setFormData(initialFormData);
      setIsEditing(false);
      setCurrentUser(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
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
          className="flex items-center px-4 py-2 bg-[#C49C3C] text-white rounded "
        >
          <User className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
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
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:border-purple-500`}
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2  focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    if (raw.length <= 10) {
                      setFormData({
                        ...formData,
                        phoneNumber: raw,
                      });
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:border-purple-500`}
                  required
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2  focus:border-purple-500"
                    required
                  />
                </div>
              )}
              {/* // Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#C49C3C] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : isEditing ? (
                  'Update User'
                ) : (
                  'Create User'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="rounded shadow-sm md:p-2 border border-[rgba(0,0,0,.1)]">
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
                      className="text-[#C49C3C] hover:text-purple-900 mr-4"
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

      {/* Load More Section */}
      <div className="flex justify-center py-6">
        {isLoading && (
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-[#C49C3C]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};
