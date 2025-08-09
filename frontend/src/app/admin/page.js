'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Shield, 
  BarChart, 
  Settings,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, isAdmin, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!loading && isAuthenticated && !isAdmin()) {
      // Redirect non-admins
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-red-600 hover:text-red-700">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-semibold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Admin: {user?.firstName} {user?.lastName}
              </span>
              <button 
                onClick={logout}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Administrator Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage platform users, verify professionals, and monitor system health
            </p>
          </div>

          {/* System Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Verified Professionals</h3>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pending Verifications</h3>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-teal-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending Professional Verifications */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Pending Professional Verifications
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Dr. Rahman Ahmed</p>
                        <p className="text-sm text-gray-600">Clinical Psychologist - 8 years experience</p>
                        <p className="text-xs text-gray-500">Applied 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Approve
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Dr. Fatima Hassan</p>
                        <p className="text-sm text-gray-600">Psychiatrist - 12 years experience</p>
                        <p className="text-xs text-gray-500">Applied 1 day ago</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Approve
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Sarah Khan</p>
                        <p className="text-sm text-gray-600">Family Therapist - 6 years experience</p>
                        <p className="text-xs text-gray-500">Applied 3 days ago</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Approve
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
                <div className="space-y-3">
                  <Link 
                    href="/admin/users" 
                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                  >
                    Manage Users
                  </Link>
                  
                  <Link 
                    href="/admin/professionals" 
                    className="block w-full bg-green-600 text-white px-4 py-2 rounded-md text-center hover:bg-green-700 transition-colors"
                  >
                    Verify Professionals
                  </Link>
                  
                  <Link 
                    href="/admin/content" 
                    className="block w-full bg-purple-600 text-white px-4 py-2 rounded-md text-center hover:bg-purple-700 transition-colors"
                  >
                    Content Management
                  </Link>
                  
                  <Link 
                    href="/admin/analytics" 
                    className="block w-full bg-teal-600 text-white px-4 py-2 rounded-md text-center hover:bg-teal-700 transition-colors"
                  >
                    System Analytics
                  </Link>

                  <Link 
                    href="/admin/settings" 
                    className="block w-full bg-gray-600 text-white px-4 py-2 rounded-md text-center hover:bg-gray-700 transition-colors"
                  >
                    System Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Professional verification approved: Dr. Rahman Ahmed</span>
                  </div>
                  <span className="text-xs text-gray-400">1 hour ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center">
                    <UserX className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">User account suspended: suspicious activity</span>
                  </div>
                  <span className="text-xs text-gray-400">3 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">New user registration: 15 new patients today</span>
                  </div>
                  <span className="text-xs text-gray-400">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-sm text-gray-600">System backup completed successfully</span>
                  </div>
                  <span className="text-xs text-gray-400">Yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
