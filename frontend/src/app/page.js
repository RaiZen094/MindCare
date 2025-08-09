'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-teal-600">MindCare Connect</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="#services" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                  Services
                </Link>
                <Link href="#professionals" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                  Find Professionals
                </Link>
                <Link href="#wellness" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                  Wellness Hub
                </Link>
                <Link href="#about" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                  About
                </Link>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/dashboard" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    {user?.roles?.includes('PROFESSIONAL') && (
                      <Link href="/professional" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                        Professional Portal
                      </Link>
                    )}
                    {user?.roles?.includes('ADMIN') && (
                      <Link href="/admin" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                        Admin Portal
                      </Link>
                    )}
                    <span className="text-sm text-gray-600">
                      Hello, {user?.firstName}
                      {user?.roles?.includes('PROFESSIONAL') && (
                        <span className="ml-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Professional
                        </span>
                      )}
                      {user?.roles?.includes('ADMIN') && (
                        <span className="ml-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Admin
                        </span>
                      )}
                    </span>
                    <button 
                      onClick={logout}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Mental Health,
              <span className="text-teal-600"> Our Priority</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with verified mental health professionals in Bangladesh. 
              Book secure appointments, access wellness resources, and get AI-powered support 
              to break the stigma and improve mental wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link href="/professionals" className="bg-teal-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors shadow-lg">
                    Find a Professional
                  </Link>
                  <Link href="/dashboard" className="border-2 border-teal-600 text-teal-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-50 transition-colors">
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/register" className="bg-teal-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors shadow-lg">
                    Get Started
                  </Link>
                  <Link href="/ai-assessment" className="border-2 border-teal-600 text-teal-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-50 transition-colors">
                    Try AI Assessment
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Mental Health Support
            </h2>
            <p className="text-lg text-gray-600">
              Breaking barriers to mental healthcare in Bangladesh with technology and compassion
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Consultations</h3>
              <p className="text-gray-600">
                Book in-person or encrypted video consultations with verified psychiatrists and psychologists
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Wellness Companion</h3>
              <p className="text-gray-600">
                Get 24/7 support with PHQ-9, GAD-7 assessments, breathing exercises, and mindfulness guidance
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Wellness Resources</h3>
              <p className="text-gray-600">
                Access articles, videos, mood tracking, journaling tools, and anonymous peer support community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Verification */}
      <section id="professionals" className="py-16 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Verified Mental Health Professionals
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                All our psychiatrists and psychologists are licensed, vetted, and verified. 
                Find specialists based on expertise, language preferences, location, and patient ratings.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Licensed psychiatrists and psychologists
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Specialization in anxiety, depression, PTSD, and more
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Available in Bengali and English
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-teal-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Patient ratings and reviews
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Find Your Mental Health Professional</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Select specialization</option>
                    <option>Anxiety Disorders</option>
                    <option>Depression</option>
                    <option>PTSD</option>
                    <option>Addiction</option>
                    <option>Family Therapy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Select city</option>
                    <option>Dhaka</option>
                    <option>Chittagong</option>
                    <option>Sylhet</option>
                    <option>Online Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Select language</option>
                    <option>Bengali</option>
                    <option>English</option>
                    <option>Both</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors">
                  Search Professionals
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Wellness Hub Preview */}
      <section id="wellness" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Wellness Hub - Your Mental Health Toolkit
            </h2>
            <p className="text-lg text-gray-600">
              Explore resources, track your progress, and connect with others on similar journeys
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Mood Tracking</h3>
              <p className="text-sm text-gray-600">Monitor your daily emotional patterns</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Mindfulness</h3>
              <p className="text-sm text-gray-600">Guided meditation and breathing exercises</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Journaling</h3>
              <p className="text-sm text-gray-600">Private space for reflection and growth</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-sm text-gray-600">Anonymous peer support groups</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take the First Step?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Your mental health journey starts with a single click. We're here to support you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-teal-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Assessment
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors">
              Browse Resources
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">MindCare Connect</h3>
              <p className="text-gray-400">
                Breaking mental health stigma in Bangladesh through accessible, secure, and compassionate care.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Online Consultations</li>
                <li>In-Person Appointments</li>
                <li>AI Assessment</li>
                <li>Wellness Resources</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Emergency</h4>
              <p className="text-gray-400 mb-2">
                If you're experiencing a mental health emergency, please contact:
              </p>
              <p className="text-white font-semibold">National Helpline: 09611677777</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MindCare Connect. All rights reserved. Made with care for Bangladesh.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
