'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  Brain, 
  Heart, 
  Settings, 
  Bell,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, isAdmin, isProfessional, isPatient } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-teal-600">
                MindCare Connect
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName}
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-2 text-gray-600">
              {isAdmin() && "Administrator Dashboard - Manage the platform"}
              {isProfessional() && "Professional Dashboard - Manage your practice"}
              {isPatient() && "Your mental health journey dashboard"}
            </p>
          </div>

          {/* Professional Verification Status for Non-Professionals */}
          {!isProfessional() && !isAdmin() && (
            <div className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg shadow p-6 border-l-4 border-teal-400">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Become a Verified Professional
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Are you a mental health professional? Join our platform as a verified practitioner 
                    and help patients on their mental health journey.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/professional/apply"
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                      Apply for Verification
                    </Link>
                    <Link 
                      href="/professional/status"
                      className="px-4 py-2 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
                    >
                      Check Application Status
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Shield className="w-16 h-16 text-teal-400" />
                </div>
              </div>
            </div>
          )}

          {/* Professional Verification Status for Professionals */}
          {isProfessional() && (
            <div className="mb-6 bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-400">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Verified Professional</h3>
                  <p className="text-gray-600">
                    You are a verified mental health professional on our platform.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Status */}
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                {user?.emailVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                )}
                <span className="text-sm">
                  Email {user?.emailVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div className="flex items-center">
                {user?.phoneVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
                )}
                <span className="text-sm">
                  Phone {user?.phoneVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm">Account Status: {user?.status}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isPatient() && (
              <>
                <Link href="/appointments" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-teal-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Appointments</h3>
                      <p className="text-sm text-gray-600">Book or manage sessions</p>
                    </div>
                  </div>
                </Link>

                <Link href="/wellness" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Heart className="w-8 h-8 text-pink-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Wellness Hub</h3>
                      <p className="text-sm text-gray-600">Track mood & journal</p>
                    </div>
                  </div>
                </Link>

                <Link href="/ai-companion" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Brain className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Companion</h3>
                      <p className="text-sm text-gray-600">Get instant support</p>
                    </div>
                  </div>
                </Link>

                <Link href="/community" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Community</h3>
                      <p className="text-sm text-gray-600">Peer support groups</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {isProfessional() && (
              <>
                <Link href="/professional" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-teal-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Professional Portal</h3>
                      <p className="text-sm text-gray-600">Manage your practice</p>
                    </div>
                  </div>
                </Link>

                <Link href="/professional/appointments" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-teal-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">My Schedule</h3>
                      <p className="text-sm text-gray-600">Manage appointments</p>
                    </div>
                  </div>
                </Link>

                <Link href="/professional/patients" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Patients</h3>
                      <p className="text-sm text-gray-600">Patient management</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {isAdmin() && (
              <>
                <Link href="/admin" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-red-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Admin Portal</h3>
                      <p className="text-sm text-gray-600">Platform management</p>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">User Management</h3>
                      <p className="text-sm text-gray-600">Manage all users</p>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/verifications" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Verify Professionals</h3>
                      <p className="text-sm text-gray-600">Approve applications</p>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/professionals" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Professionals Directory</h3>
                      <p className="text-sm text-gray-600">View all verified professionals</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            <Link href="/settings" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-gray-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Settings</h3>
                  <p className="text-sm text-gray-600">Account preferences</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity or Role-specific Content */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isAdmin() && "Platform Overview"}
                {isProfessional() && "Recent Activity"}
                {isPatient() && "Your Mental Health Journey"}
              </h2>
              
              {isPatient() && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Welcome to your mental health dashboard. Here you can track your progress, 
                    book appointments with verified professionals, and access wellness resources.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-medium text-teal-900">Next Appointment</h4>
                      <p className="text-sm text-teal-700 mt-1">No upcoming appointments</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Mood Tracking</h4>
                      <p className="text-sm text-blue-700 mt-1">Start tracking your mood</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900">AI Support</h4>
                      <p className="text-sm text-purple-700 mt-1">Available 24/7</p>
                    </div>
                  </div>
                </div>
              )}

              {isProfessional() && (
                <div>
                  <p className="text-gray-600">
                    Welcome to your professional dashboard. Manage your appointments, 
                    communicate with patients, and track your practice analytics.
                  </p>
                </div>
              )}

              {isAdmin() && (
                <div>
                  <p className="text-gray-600">
                    Administrator dashboard for managing the MindCare Connect platform. 
                    Monitor users, verify professionals, and ensure platform security.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
