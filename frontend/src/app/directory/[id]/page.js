'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ArrowLeft, 
  CheckCircle, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  GraduationCap, 
  Award,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function ProfessionalProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const professionalId = params.id;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Access control: Only allow public users, patients, or unauthenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.roles?.includes('PROFESSIONAL')) {
        router.push('/professional/dashboard');
        return;
      }
      if (user.roles?.includes('ADMIN')) {
        router.push('/admin/dashboard');
        return;
      }
    }
  }, [user, isAuthenticated, authLoading, router]);

  // Don't render profile for professionals or admins
  if (!authLoading && isAuthenticated && user) {
    if (user.roles?.includes('PROFESSIONAL') || user.roles?.includes('ADMIN')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              Professional profiles are for patients and public users only.
            </p>
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center mx-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  useEffect(() => {
    if (professionalId) {
      loadProfessionalProfile();
    }
  }, [professionalId]);

  const loadProfessionalProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getProfessionalProfile(professionalId);
      setProfessional(response);
    } catch (error) {
      console.error('Failed to load professional profile:', error);
      if (error.response?.status === 404) {
        setError('Professional not found or not verified.');
      } else {
        setError('Failed to load professional profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const formatProfessionalType = (type) => {
    if (!type) return '';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!professional) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={goBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
            {/* Profile Picture Placeholder */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 lg:mb-0">
              <span className="text-2xl font-semibold text-gray-600">
                {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{professional.name}</h1>
                <CheckCircle className="w-6 h-6 text-green-500 ml-3" title="Verified Professional" />
              </div>
              
              <p className="text-xl text-blue-600 font-medium mb-2">
                {formatProfessionalType(professional.professionalType)}
              </p>
              
              <p className="text-lg text-gray-700 mb-4">{professional.specialization}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{professional.experienceYears} years experience</span>
                </div>
                
                {professional.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{professional.location}</span>
                  </div>
                )}
                
                {professional.verifiedAt && (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Verified {new Date(professional.verifiedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2">
            {/* Education & Qualifications */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education & Qualifications
              </h2>
              
              <div className="space-y-4">
                {professional.education && (
                  <div>
                    <h3 className="font-medium text-gray-900">Education</h3>
                    <p className="text-gray-700">{professional.education}</p>
                  </div>
                )}
                
                {professional.degreeTitle && (
                  <div>
                    <h3 className="font-medium text-gray-900">Degree</h3>
                    <p className="text-gray-700">{professional.degreeTitle}</p>
                  </div>
                )}
                
                {professional.degreeInstitution && (
                  <div>
                    <h3 className="font-medium text-gray-900">Institution</h3>
                    <p className="text-gray-700">{professional.degreeInstitution}</p>
                  </div>
                )}
                
                {professional.affiliation && (
                  <div>
                    <h3 className="font-medium text-gray-900">Current Affiliation</h3>
                    <p className="text-gray-700">{professional.affiliation}</p>
                  </div>
                )}
                
                {professional.bmdcNumber && (
                  <div>
                    <h3 className="font-medium text-gray-900">BMDC Registration</h3>
                    <p className="text-gray-700">{professional.bmdcNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Practice Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Practice Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Specialization</h3>
                  <p className="text-gray-700">{professional.specialization}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Years of Experience</h3>
                  <p className="text-gray-700">{professional.experienceYears} years</p>
                </div>
                
                {professional.languages && professional.languages.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">Languages Spoken</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {professional.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {professional.clinicAddress && (
                  <div>
                    <h3 className="font-medium text-gray-900">Practice Location</h3>
                    <p className="text-gray-700">{professional.clinicAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bio Section (if available in future) */}
            {professional.bio && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{professional.bio}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="space-y-3">
                {professional.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <a
                      href={`mailto:${professional.contactEmail}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {professional.contactEmail}
                    </a>
                  </div>
                )}
                
                {professional.contactPhone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <a
                      href={`tel:${professional.contactPhone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {professional.contactPhone}
                    </a>
                  </div>
                )}
                
                {professional.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{professional.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Book Appointment</h2>
              
              <div className="space-y-4">
                {professional.consultationFee && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-2xl font-bold text-green-600">
                      ৳{professional.consultationFee}
                    </p>
                  </div>
                )}
                
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-md cursor-not-allowed flex items-center justify-center"
                  title="Booking functionality will be available soon"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Booking functionality will be available soon
                </p>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Verified Professional
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                This professional has been verified by our team and meets our quality standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    </div>
  );
}
