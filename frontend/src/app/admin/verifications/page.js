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
        {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Professional Verification Dashboard
                </h1>
                
                {/* Quick Navigation */}
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => router.push('/admin/professionals')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <span className="mr-2">👥</span>
                    View All Professionals
                  </button>
                  <button
                    onClick={() => router.push('/admin/reference-list')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <span className="mr-2">📋</span>
                    View Reference List
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {statistics.map(([status, count], index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(0);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              
              <button
                onClick={fetchApplications}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* CSV Upload Section */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Reference List Upload</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload a CSV file to create a reference list of pre-approved professionals. 
                  This list will help you verify applications - it does not automatically approve professionals.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Select CSV File
                  </label>
                  {csvFile && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{csvFile.name}</span>
                      <button
                        onClick={handleCsvUpload}
                        disabled={uploadingCsv}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {uploadingCsv ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Upload Status */}
                {showUploadStatus && (
                  <div className={`p-3 rounded-md ${
                    uploadStatus === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {uploadStatus === 'success' ? '✅' : '❌'}
                      </span>
                      <span className="text-sm font-medium">{uploadMessage}</span>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  <p>Upload CSV file with pre-verified professionals.</p>
                  <p>Required columns: email, full_name, professional_type, specialization</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {loadingData ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No applications found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credentials
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.userFullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.professionalType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.specialization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.professionalType === 'PSYCHIATRIST' ? (
                            <span>BMDC: {application.bmdcNumber}</span>
                          ) : (
                            <div>
                              <div>{application.degree}</div>
                              <div className="text-gray-500">{application.degreeInstitution}</div>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.experienceYears} years exp.
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          STATUS_COLORS[application.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedApplication(selectedApplication?.id === application.id ? null : application)}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            {selectedApplication?.id === application.id ? 'Hide' : 'View'}
                          </button>
                          {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
                            <>
                              <button
                                onClick={() => openActionModal(application, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openActionModal(application, 'reject')}
                                className="text-red-600 hover:text-red-900"
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
                      <tr key={`details-${application.id}`}>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                              <p className="text-sm text-gray-600">Email: {application.contactEmail}</p>
                              <p className="text-sm text-gray-600">Phone: {application.contactPhone}</p>
                              {application.clinicAddress && (
                                <p className="text-sm text-gray-600">Address: {application.clinicAddress}</p>
                              )}
                              {application.languagesSpoken && (
                                <p className="text-sm text-gray-600">
                                  Languages: {JSON.parse(application.languagesSpoken).join(', ')}
                                </p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                              <div className="space-y-1">
                                {application.licenseDocumentUrl && (
                                  <div>License: {getDocumentLink(application.licenseDocumentUrl)}</div>
                                )}
                                {application.degreeDocumentUrl && (
                                  <div>Degree: {getDocumentLink(application.degreeDocumentUrl)}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          {application.adminNotes && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                              <p className="text-sm text-gray-600 p-2 bg-white rounded border">
                                {application.adminNotes}
                              </p>
                            </div>
                          )}
                          {application.rejectionReason && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Rejection Reason</h4>
                              <p className="text-sm text-red-600 p-2 bg-red-50 rounded border">
                                {application.rejectionReason}
                              </p>
                            </div>
                          )}
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
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage + 1}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Applicant:</strong> {selectedApplication?.userFullName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Type:</strong> {selectedApplication?.professionalType}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Specialization:</strong> {selectedApplication?.specialization}
                </p>
              </div>

              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Provide a clear reason for rejection..."
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Additional notes for the applicant..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={processing || (actionType === 'reject' && !rejectionReason.trim())}
                  className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Reject')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
