'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../lib/api';
import { useRouter } from 'next/navigation';

const PROFESSIONAL_TYPES = {
  PSYCHIATRIST: { label: 'Psychiatrist', color: 'bg-blue-100 text-blue-800', icon: '🧠' },
  PSYCHOLOGIST: { label: 'Psychologist', color: 'bg-green-100 text-green-800', icon: '🧘' }
};

const VERIFICATION_SOURCES = {
  APPLICATION: { label: 'Application', color: 'bg-purple-100 text-purple-800', icon: '📝' },
  CSV_IMPORT: { label: 'CSV Import', color: 'bg-orange-100 text-orange-800', icon: '📊' }
};

export default function ProfessionalsDirectory() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const [professionals, setProfessionals] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      fetchProfessionals();
    }
  }, [isAuthenticated, loading, isAdmin, router, currentPage, searchTerm, selectedType]);

  const fetchProfessionals = async () => {
    setLoadingData(true);
    try {
      const response = await apiService.getAllProfessionals(currentPage, 20, searchTerm, selectedType);
      if (response && response.content) {
        setProfessionals(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setCurrentPage(0); // Reset to first page on filter
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setCurrentPage(0);
  };

  const openProfessionalModal = (professional) => {
    setSelectedProfessional(professional);
    setShowModal(true);
  };

  const closeProfessionalModal = () => {
    setSelectedProfessional(null);
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVerificationSource = (professional) => {
    // Check if this was from CSV import (has admin notes mentioning CSV)
    if (professional.adminNotes && professional.adminNotes.includes('CSV upload')) {
      return VERIFICATION_SOURCES.CSV_IMPORT;
    }
    return VERIFICATION_SOURCES.APPLICATION;
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Verified Professionals Directory
              </h1>
              <p className="text-gray-600">
                {totalElements} verified professionals in the system
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/verifications')}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Back to Verifications
              </button>
              <button
                onClick={fetchProfessionals}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, specialization, or institution..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTypeFilter('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType === '' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => handleTypeFilter('PSYCHIATRIST')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'PSYCHIATRIST' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  🧠 Psychiatrists
                </button>
                <button
                  onClick={() => handleTypeFilter('PSYCHOLOGIST')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType === 'PSYCHOLOGIST' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  🧘 Psychologists
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedType) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Professionals Grid */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {loadingData ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading professionals...</p>
            </div>
          ) : professionals.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Professionals Found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedType 
                  ? 'Try adjusting your search criteria' 
                  : 'No verified professionals in the system yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {professionals.map((professional) => {
                const typeInfo = PROFESSIONAL_TYPES[professional.professionalType];
                const sourceInfo = getVerificationSource(professional);
                
                return (
                  <div 
                    key={professional.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openProfessionalModal(professional)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-2xl">
                          {typeInfo.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {professional.userFullName}
                          </h3>
                          <p className="text-gray-600">{professional.specialization}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${sourceInfo.color}`}>
                              {sourceInfo.icon} {sourceInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-green-600">✅</span>
                          <span className="text-sm text-green-600 font-medium">Verified</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Since {formatDate(professional.verifiedAt || professional.createdAt)}
                        </p>
                        {professional.experienceYears && (
                          <p className="text-sm text-gray-500">
                            {professional.experienceYears} years experience
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Contact:</span>
                        <p className="text-gray-900">{professional.contactEmail}</p>
                        {professional.contactPhone && (
                          <p className="text-gray-900">{professional.contactPhone}</p>
                        )}
                      </div>
                      
                      {professional.degreeInstitution && (
                        <div>
                          <span className="text-gray-500">Institution:</span>
                          <p className="text-gray-900">{professional.degreeInstitution}</p>
                        </div>
                      )}
                      
                      {professional.bmdcNumber && (
                        <div>
                          <span className="text-gray-500">BMDC:</span>
                          <p className="text-gray-900">{professional.bmdcNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                    Showing <span className="font-medium">{currentPage * 20 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min((currentPage + 1) * 20, totalElements)}
                    </span>{' '}
                    of <span className="font-medium">{totalElements}</span> results
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

        {/* Professional Detail Modal */}
        {showModal && selectedProfessional && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Professional Details
                  </h3>
                  <button
                    onClick={closeProfessionalModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                      <p><strong>Name:</strong> {selectedProfessional.userFullName}</p>
                      <p><strong>Email:</strong> {selectedProfessional.userEmail}</p>
                      <p><strong>Contact:</strong> {selectedProfessional.contactEmail}</p>
                      {selectedProfessional.contactPhone && (
                        <p><strong>Phone:</strong> {selectedProfessional.contactPhone}</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Professional Information</h4>
                      <p><strong>Type:</strong> {PROFESSIONAL_TYPES[selectedProfessional.professionalType].label}</p>
                      <p><strong>Specialization:</strong> {selectedProfessional.specialization}</p>
                      {selectedProfessional.experienceYears && (
                        <p><strong>Experience:</strong> {selectedProfessional.experienceYears} years</p>
                      )}
                      {selectedProfessional.bmdcNumber && (
                        <p><strong>BMDC Number:</strong> {selectedProfessional.bmdcNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedProfessional.degreeInstitution && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                      <p><strong>Institution:</strong> {selectedProfessional.degreeInstitution}</p>
                      {selectedProfessional.degreeTitle && (
                        <p><strong>Degree:</strong> {selectedProfessional.degreeTitle}</p>
                      )}
                    </div>
                  )}
                  
                  {selectedProfessional.clinicAddress && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Practice Location</h4>
                      <p>{selectedProfessional.clinicAddress}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Verification Details</h4>
                    <p><strong>Status:</strong> <span className="text-green-600">✅ Verified</span></p>
                    <p><strong>Verified At:</strong> {formatDate(selectedProfessional.verifiedAt || selectedProfessional.createdAt)}</p>
                    <p><strong>Source:</strong> {getVerificationSource(selectedProfessional).label}</p>
                    <p><strong>Application ID:</strong> {selectedProfessional.correlationId}</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={closeProfessionalModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
