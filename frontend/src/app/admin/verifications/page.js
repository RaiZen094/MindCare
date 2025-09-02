'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../lib/api';
import { useRouter } from 'next/navigation';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  REVOKED: 'bg-gray-100 text-gray-800'
};

export default function AdminVerificationDashboard() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const [applications, setApplications] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
  const [uploadMessage, setUploadMessage] = useState('');
  const [showUploadStatus, setShowUploadStatus] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!loading && !isAdmin()) {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && isAdmin()) {
      fetchApplications();
      fetchStatistics();
    }
  }, [isAuthenticated, loading, isAdmin, router, currentPage, selectedStatus]);

  const fetchApplications = async () => {
    setLoadingData(true);
    try {
      const response = selectedStatus 
        ? await apiService.getAllVerifications(selectedStatus, currentPage, 10)
        : await apiService.getPendingVerifications(currentPage, 10);
      
      if (response && response.content) {
        setApplications(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await apiService.getVerificationStatistics();
      setStatistics(stats || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const openActionModal = (application, type) => {
    setSelectedApplication(application);
    setActionType(type);
    setActionNotes('');
    setRejectionReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setActionType('');
    setActionNotes('');
    setRejectionReason('');
  };

  const handleAction = async () => {
    if (!selectedApplication) return;

    setProcessing(true);
    try {
      let response;
      if (actionType === 'approve') {
        response = await apiService.approveVerification(selectedApplication.id, actionNotes);
      } else {
        if (!rejectionReason.trim()) {
          alert('Rejection reason is required');
          return;
        }
        response = await apiService.rejectVerification(selectedApplication.id, rejectionReason, actionNotes);
      }

      if (response) {
        await fetchApplications();
        await fetchStatistics();
        closeModal();
      }
    } catch (error) {
      console.error('Error processing application:', error);
      alert('Failed to process application');
    } finally {
      setProcessing(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setUploadingCsv(true);
    setShowUploadStatus(false);
    
    try {
      const response = await apiService.uploadPreVerifiedCSV(csvFile);
      if (response.success) {
        setUploadStatus('success');
        setUploadMessage(`Successfully processed ${response.processedCount || 0} professionals from CSV`);
        setCsvFile(null);
        await fetchApplications();
        await fetchStatistics();
      } else {
        setUploadStatus('error');
        setUploadMessage(response.message || 'Failed to upload CSV');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadStatus('error');
      setUploadMessage('Failed to upload CSV: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingCsv(false);
      setShowUploadStatus(true);
      
      // Hide status message after 5 seconds
      setTimeout(() => {
        setShowUploadStatus(false);
      }, 5000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentLink = (url) => {
    if (!url) return null;
    // Extract filename and create a clickable link
    const filename = url.split('/').pop();
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-600 hover:text-teal-800 underline text-sm"
      >
        View {filename}
      </a>
    );
  };

  const getConfidenceDisplay = (application) => {
    if (!application.aiConfidenceScore && application.aiConfidenceScore !== 0) {
      return (
        <div className="text-center">
          <span className="text-gray-400 text-xs">Processing...</span>
        </div>
      );
    }

    const percentage = Math.round(application.aiConfidenceScore * 100);
    let bgColor, textColor, icon;

    if (percentage >= 80) {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = '🟢';
    } else if (percentage >= 60) {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = '🟡';
    } else {
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = '🔴';
    }

    return (
      <div className="text-center">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
          <span className="mr-1">{icon}</span>
          {percentage}%
        </div>
        {application.aiRecommendation && (
          <div className="text-xs text-gray-500 mt-1 max-w-24">
            {application.aiRecommendation.slice(0, 20)}...
          </div>
        )}
      </div>
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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Professional Verification Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Review and manage professional verification applications with AI-powered assistance
              </p>
            </div>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => router.push('/admin/professionals')}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <span className="mr-2">👥</span>
                All Professionals
              </button>
              <button
                onClick={() => router.push('/admin/reference-list')}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <span className="mr-2">📋</span>
                Reference List
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Dashboard
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {statistics.map(([status, count], index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm font-medium text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </div>
              </div>
            ))}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg shadow-sm border border-green-200">
              <div className="text-2xl font-bold text-green-800">
                {applications.filter(app => app.aiConfidenceScore >= 0.8).length}
              </div>
              <div className="text-sm font-medium text-green-700">High Confidence</div>
              <div className="text-xs text-green-600">≥80%</div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg shadow-sm border border-red-200">
              <div className="text-2xl font-bold text-red-800">
                {applications.filter(app => app.aiConfidenceScore < 0.6).length}
              </div>
              <div className="text-sm font-medium text-red-700">Needs Review</div>
              <div className="text-xs text-red-600">&lt;60%</div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-900 bg-white"
                >
                  <option value="">All Applications</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const sorted = [...applications].sort((a, b) => {
                      const scoreA = a.aiConfidenceScore || 0;
                      const scoreB = b.aiConfidenceScore || 0;
                      return scoreB - scoreA;
                    });
                    setApplications(sorted);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  📊 Sort by Confidence
                </button>
                
                <button
                  onClick={fetchApplications}
                  className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* CSV Upload Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Reference List Upload</h3>
                <p className="text-sm font-medium text-blue-700">
                  Upload CSV file to create a reference list of pre-approved professionals for verification assistance.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center"
                  >
                    📁 Select CSV File
                  </label>
                  
                  {csvFile && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-lg">
                        {csvFile.name}
                      </span>
                      <button
                        onClick={handleCsvUpload}
                        disabled={uploadingCsv}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {uploadingCsv ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>📤 Upload</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Upload Status */}
                {showUploadStatus && (
                  <div className={`p-4 rounded-lg font-medium ${
                    uploadStatus === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">
                        {uploadStatus === 'success' ? '✅' : '❌'}
                      </span>
                      <span>{uploadMessage}</span>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded-lg">
                  <p className="font-medium mb-1">CSV Format Requirements:</p>
                  <p>Required columns: email, full_name, professional_type, specialization</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          {loadingData ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600">There are no verification applications matching your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Applicant Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Professional Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Credentials
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      AI Confidence
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {application.userFullName}
                          </div>
                          <div className="text-sm font-medium text-gray-600">
                            {application.userEmail}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {application.correlationId?.slice(-8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {application.professionalType}
                          </div>
                          <div className="text-sm font-medium text-gray-600">
                            {application.specialization}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {application.experienceYears} years experience
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {application.professionalType === 'PSYCHIATRIST' ? (
                            <>
                              <div className="text-sm font-semibold text-gray-900">
                                BMDC: {application.bmdcNumber}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Licensed Psychiatrist
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm font-semibold text-gray-900">
                                {application.degree}
                              </div>
                              <div className="text-sm font-medium text-gray-600">
                                {application.degreeInstitution}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getConfidenceDisplay(application)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          STATUS_COLORS[application.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(application.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setSelectedApplication(selectedApplication?.id === application.id ? null : application)}
                            className="text-sm font-medium text-teal-600 hover:text-teal-900 px-3 py-1 rounded-md hover:bg-teal-50 transition-colors"
                          >
                            {selectedApplication?.id === application.id ? 'Hide' : 'View'}
                          </button>
                          {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
                            <>
                              <button
                                onClick={() => openActionModal(application, 'approve')}
                                className="text-sm font-medium text-green-600 hover:text-green-900 px-3 py-1 rounded-md hover:bg-green-50 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openActionModal(application, 'reject')}
                                className="text-sm font-medium text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {applications.map((application) => (
                    selectedApplication?.id === application.id && (
                      <tr key={`details-${application.id}`} className="bg-gray-50">
                        <td colSpan="7" className="px-6 py-6">
                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                              Detailed Application Information
                            </h4>
                            
                            <div className="grid lg:grid-cols-3 gap-6">
                              {/* Contact Information */}
                              <div className="bg-blue-50 rounded-lg p-5">
                                <h5 className="font-semibold text-blue-900 mb-4 flex items-center">
                                  📞 Contact Information
                                </h5>
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-sm font-medium text-blue-800">Email:</span>
                                    <p className="text-sm text-blue-700 font-medium">{application.contactEmail}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-blue-800">Phone:</span>
                                    <p className="text-sm text-blue-700 font-medium">{application.contactPhone}</p>
                                  </div>
                                  {application.clinicAddress && (
                                    <div>
                                      <span className="text-sm font-medium text-blue-800">Clinic Address:</span>
                                      <p className="text-sm text-blue-700">{application.clinicAddress}</p>
                                    </div>
                                  )}
                                  {application.languagesSpoken && (
                                    <div>
                                      <span className="text-sm font-medium text-blue-800">Languages:</span>
                                      <p className="text-sm text-blue-700">
                                        {JSON.parse(application.languagesSpoken).join(', ')}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Documents */}
                              <div className="bg-green-50 rounded-lg p-5">
                                <h5 className="font-semibold text-green-900 mb-4 flex items-center">
                                  📄 Submitted Documents
                                </h5>
                                <div className="space-y-3">
                                  {application.licenseDocumentUrl && (
                                    <div>
                                      <span className="text-sm font-medium text-green-800">License Document:</span>
                                      <div className="mt-1">{getDocumentLink(application.licenseDocumentUrl)}</div>
                                    </div>
                                  )}
                                  {application.degreeDocumentUrl && (
                                    <div>
                                      <span className="text-sm font-medium text-green-800">Degree Certificate:</span>
                                      <div className="mt-1">{getDocumentLink(application.degreeDocumentUrl)}</div>
                                    </div>
                                  )}
                                  {!application.licenseDocumentUrl && !application.degreeDocumentUrl && (
                                    <p className="text-sm text-green-600">No documents uploaded</p>
                                  )}
                                </div>
                              </div>

                              {/* AI Verification Assistant */}
                              <div className="bg-purple-50 rounded-lg p-5">
                                <h5 className="font-semibold text-purple-900 mb-4 flex items-center">
                                  🤖 AI Verification Assistant
                                </h5>
                                {(application.aiConfidenceScore || application.aiConfidenceScore === 0) ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-purple-800">Confidence Score:</span>
                                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                        application.aiConfidenceScore >= 0.8 ? 'bg-green-100 text-green-800' :
                                        application.aiConfidenceScore >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {Math.round(application.aiConfidenceScore * 100)}%
                                      </div>
                                    </div>
                                    {application.aiRecommendation && (
                                      <div>
                                        <span className="text-sm font-medium text-purple-800">Recommendation:</span>
                                        <p className="text-sm text-purple-700 mt-1 bg-purple-100 p-3 rounded-md">
                                          {application.aiRecommendation}
                                        </p>
                                      </div>
                                    )}
                                    {application.aiMatchDetails && (
                                      <div>
                                        <span className="text-sm font-medium text-purple-800">Match Details:</span>
                                        <p className="text-sm text-purple-700 mt-1 bg-purple-100 p-3 rounded-md">
                                          {application.aiMatchDetails}
                                        </p>
                                      </div>
                                    )}
                                    {application.aiProcessedAt && (
                                      <div>
                                        <span className="text-sm font-medium text-purple-800">Processed:</span>
                                        <span className="text-sm text-purple-700 ml-2">
                                          {formatDate(application.aiProcessedAt)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                                    <span className="text-sm font-medium text-purple-700">Processing verification...</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Admin Notes and Rejection Reason */}
                            {(application.adminNotes || application.rejectionReason) && (
                              <div className="mt-6 grid md:grid-cols-2 gap-6">
                                {application.adminNotes && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-3">Admin Notes</h5>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <p className="text-sm text-blue-800 font-medium">{application.adminNotes}</p>
                                    </div>
                                  </div>
                                )}
                                {application.rejectionReason && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-3">Rejection Reason</h5>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                      <p className="text-sm text-red-800 font-medium">{application.rejectionReason}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Showing page <span className="font-semibold">{currentPage + 1}</span> of{' '}
                    <span className="font-semibold">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {actionType === 'approve' ? '✅ Approve Application' : '❌ Reject Application'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* Application Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-3">Application Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Applicant:</span>
                    <span className="text-gray-900 font-semibold">{selectedApplication?.userFullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="text-gray-900">{selectedApplication?.professionalType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Specialization:</span>
                    <span className="text-gray-900">{selectedApplication?.specialization}</span>
                  </div>
                </div>
              </div>

              {/* AI Verification Assistant */}
              {(selectedApplication?.aiConfidenceScore || selectedApplication?.aiConfidenceScore === 0) && (
                <div className="mb-6 p-5 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-purple-900 flex items-center">
                      🤖 AI Verification Assistant
                    </h4>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedApplication.aiConfidenceScore >= 0.8 ? 'bg-green-100 text-green-800' :
                      selectedApplication.aiConfidenceScore >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(selectedApplication.aiConfidenceScore * 100)}% Confidence
                    </div>
                  </div>
                  {selectedApplication.aiRecommendation && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-purple-800">Recommendation:</span>
                      <p className="text-sm text-purple-700 mt-1 bg-purple-100 p-3 rounded-md">
                        {selectedApplication.aiRecommendation}
                      </p>
                    </div>
                  )}
                  {selectedApplication.aiMatchDetails && (
                    <div>
                      <span className="text-sm font-medium text-purple-800">Match Details:</span>
                      <p className="text-sm text-purple-700 mt-1 bg-purple-100 p-3 rounded-md">
                        {selectedApplication.aiMatchDetails}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Reason */}
              {actionType === 'reject' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-red-800 mb-3">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base text-gray-900 bg-red-50"
                    placeholder="Please provide a clear and professional reason for rejection. This will be visible to the applicant."
                    required
                  />
                  {rejectionReason.trim() && rejectionReason.length < 10 && (
                    <p className="text-sm text-red-600 mt-2">Please provide a more detailed reason (at least 10 characters)</p>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white"
                  placeholder="Add any internal notes about this decision..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={processing || (actionType === 'reject' && (!rejectionReason.trim() || rejectionReason.length < 10))}
                  className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {processing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    actionType === 'approve' ? '✅ Approve Application' : '❌ Reject Application'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
