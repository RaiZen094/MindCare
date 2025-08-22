'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../lib/api';
import { useRouter } from 'next/navigation';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  REVOKED: 'bg-gray-100 text-gray-800 border-gray-200'
};

const STATUS_ICONS = {
  PENDING: '⏳',
  UNDER_REVIEW: '👀',
  APPROVED: '✅',
  REJECTED: '❌',
  REVOKED: '🚫'
};

export default function VerificationStatus() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [verification, setVerification] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      fetchVerificationStatus();
    }
  }, [isAuthenticated, loading, router]);

  const fetchVerificationStatus = async () => {
    setLoadingData(true);
    try {
      const response = await apiService.getMyVerificationStatus();
      setVerification(response);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Your application is waiting for initial review by our admin team.';
      case 'UNDER_REVIEW':
        return 'Your application is currently being reviewed by our verification team.';
      case 'APPROVED':
        return 'Congratulations! Your professional verification has been approved.';
      case 'REJECTED':
        return 'Your application was not approved. Please see the details below.';
      case 'REVOKED':
        return 'Your verification has been revoked. Please contact support for more information.';
      default:
        return 'Status unknown.';
    }
  };

  const getDocumentLink = (url) => {
    if (!url) return null;
    const filename = url.split('/').pop();
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-600 hover:text-teal-800 underline"
      >
        {filename}
      </a>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Professional Verification Status
          </h1>
          <p className="text-gray-600">
            Track your professional verification application progress
          </p>
        </div>

        {loadingData ? (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : verification ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`bg-white border-l-4 shadow-lg rounded-lg p-6 ${
              STATUS_COLORS[verification.status]?.replace('bg-', 'border-').replace('100', '400') || 'border-gray-400'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{STATUS_ICONS[verification.status]}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Verification Status: {verification.status.replace('_', ' ')}
                    </h2>
                    <p className="text-gray-600">
                      {getStatusMessage(verification.status)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  STATUS_COLORS[verification.status] || 'bg-gray-100 text-gray-800'
                }`}>
                  {verification.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Application ID:</span>
                  <span className="ml-2 font-mono">{verification.correlationId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <span className="ml-2">{formatDate(verification.createdAt)}</span>
                </div>
                {verification.reviewedAt && (
                  <>
                    <div>
                      <span className="text-gray-500">Reviewed:</span>
                      <span className="ml-2">{formatDate(verification.reviewedAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reviewed by:</span>
                      <span className="ml-2">{verification.reviewedBy}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Application Details */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Professional Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2">{verification.professionalType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Specialization:</span>
                      <span className="ml-2">{verification.specialization}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-2">{verification.experienceYears} years</span>
                    </div>
                    {verification.professionalType === 'PSYCHIATRIST' && verification.bmdcNumber && (
                      <div>
                        <span className="text-gray-500">BMDC Number:</span>
                        <span className="ml-2">{verification.bmdcNumber}</span>
                      </div>
                    )}
                    {verification.professionalType === 'PSYCHOLOGIST' && (
                      <>
                        <div>
                          <span className="text-gray-500">Degree:</span>
                          <span className="ml-2">{verification.degree}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Institution:</span>
                          <span className="ml-2">{verification.degreeInstitution}</span>
                        </div>
                        {verification.psychologyLicenseNumber && (
                          <div>
                            <span className="text-gray-500">License Number:</span>
                            <span className="ml-2">{verification.psychologyLicenseNumber}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2">{verification.contactEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2">{verification.contactPhone}</span>
                    </div>
                    {verification.clinicAddress && (
                      <div>
                        <span className="text-gray-500">Clinic Address:</span>
                        <span className="ml-2">{verification.clinicAddress}</span>
                      </div>
                    )}
                    {verification.languagesSpoken && (
                      <div>
                        <span className="text-gray-500">Languages:</span>
                        <span className="ml-2">
                          {JSON.parse(verification.languagesSpoken).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {verification.licenseDocumentUrl && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">License Document</h4>
                    <div>{getDocumentLink(verification.licenseDocumentUrl)}</div>
                  </div>
                )}
                {verification.degreeDocumentUrl && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Degree Certificate</h4>
                    <div>{getDocumentLink(verification.degreeDocumentUrl)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {verification.adminNotes && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-700">{verification.adminNotes}</p>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {verification.rejectionReason && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{verification.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={fetchVerificationStatus}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Refresh Status
                </button>

                {verification.status === 'REJECTED' && (
                  <button
                    onClick={() => router.push('/professional/apply')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Submit New Application
                  </button>
                )}

                {verification.status === 'APPROVED' && (
                  <button
                    onClick={() => router.push('/professional')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Go to Professional Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* No Application */
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl text-gray-400">📋</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No Verification Application Found
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't submitted a professional verification application yet. 
                Start the process to become a verified professional on our platform.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/professional/apply')}
                className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium"
              >
                Apply for Professional Verification
              </button>
              
              <div className="text-sm text-gray-500">
                <p>Verification allows you to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access professional tools and features</li>
                  <li>Display verified badge on your profile</li>
                  <li>Gain patient trust and credibility</li>
                  <li>Access professional-only content</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
