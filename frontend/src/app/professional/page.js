'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  BarChart, 
  MessageSquare,
  Clock,
  Star,
  ArrowLeft
} from 'lucide-react';

export default function ProfessionalDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, isProfessional, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!loading && isAuthenticated && !isProfessional()) {
      // Redirect non-professionals
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, isProfessional, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading professional dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isProfessional()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-teal-600 hover:text-teal-700">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-semibold text-gray-900">Professional Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Dr. {user?.firstName} {user?.lastName}
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
              Professional Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your practice, appointments, and patient communications
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-teal-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Today's Appointments</h3>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Active Patients</h3>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Unread Messages</h3>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-teal-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Sarah Ahmed</p>
                        <p className="text-sm text-gray-600">Anxiety counseling session</p>
                      </div>
                    </div>
                    <span className="text-sm text-teal-600 font-medium">10:00 AM</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Rahman Hassan</p>
                        <p className="text-sm text-gray-600">Depression therapy</p>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">2:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Fatima Khan</p>
                        <p className="text-sm text-gray-600">Family therapy session</p>
                      </div>
                    </div>
                    <span className="text-sm text-purple-600 font-medium">4:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link 
                    href="/professional/appointments" 
                    className="block w-full bg-teal-600 text-white px-4 py-2 rounded-md text-center hover:bg-teal-700 transition-colors"
                  >
                    Manage Schedule
                  </Link>
                  
                  <Link 
                    href="/professional/patients" 
                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                  >
                    View Patients
                  </Link>
                  
                  <Link 
                    href="/professional/messages" 
                    className="block w-full bg-green-600 text-white px-4 py-2 rounded-md text-center hover:bg-green-700 transition-colors"
                  >
                    Messages
                  </Link>
                  
                  <Link 
                    href="/professional/analytics" 
                    className="block w-full bg-purple-600 text-white px-4 py-2 rounded-md text-center hover:bg-purple-700 transition-colors"
                  >
                    Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">New appointment booked by Sarah Ahmed</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Patient message from Rahman Hassan</span>
                  <span className="text-xs text-gray-400">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Session completed with Fatima Khan</span>
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
