'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../lib/api';
import { useRouter } from 'next/navigation';

const TYPE_COLORS = {
  PSYCHIATRIST: 'bg-purple-100 text-purple-800',
  PSYCHOLOGIST: 'bg-blue-100 text-blue-800',
  COUNSELOR: 'bg-green-100 text-green-800',
  THERAPIST: 'bg-yellow-100 text-yellow-800'
};

export default function ReferenceListPage() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const [referenceList, setReferenceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    email: '',
    name: '',
    type: '',
    specialization: ''
  });
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!loading && isAuthenticated && !isAdmin()) {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && isAdmin()) {
      fetchReferenceList();
    }
  }, [isAuthenticated, loading, isAdmin, router]);

  const fetchReferenceList = async () => {
    setLoadingData(true);
    try {
      const response = await apiService.get('/admin/pre-approved-professionals');
      const data = response.data || [];
      setReferenceList(data);
      setFilteredList(data);
    } catch (error) {
      console.error('Error fetching reference list:', error);
      alert('Failed to load reference list');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSearch = () => {
    let filtered = referenceList;

    if (searchFilters.email) {
      filtered = filtered.filter(prof => 
        prof.email.toLowerCase().includes(searchFilters.email.toLowerCase())
      );
    }

    if (searchFilters.name) {
      filtered = filtered.filter(prof => 
        prof.fullName.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    if (searchFilters.type) {
      filtered = filtered.filter(prof => prof.professionalType === searchFilters.type);
    }

    if (searchFilters.specialization) {
      filtered = filtered.filter(prof => 
        prof.specialization.toLowerCase().includes(searchFilters.specialization.toLowerCase())
      );
    }

    setFilteredList(filtered);
  };

  const handleClearFilters = () => {
    setSearchFilters({
      email: '',
      name: '',
      type: '',
      specialization: ''
    });
    setFilteredList(referenceList);
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this professional from the reference list?')) {
      return;
    }

    try {
      await apiService.delete(`/admin/pre-approved-professionals/${id}`);
      await fetchReferenceList(); // Refresh the list
      alert('Professional removed from reference list');
    } catch (error) {
      console.error('Error removing professional:', error);
      alert('Failed to remove professional');
    }
  };

  const showDetails = (professional) => {
    setSelectedProfessional(professional);
    setShowModal(true);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reference List</h1>
              <p className="mt-2 text-gray-600">
                Pre-approved professionals to assist with verification decisions
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/verifications')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Verifications
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchFilters.email}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, email: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchFilters.name}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={searchFilters.type}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="PSYCHIATRIST">Psychiatrist</option>
              <option value="PSYCHOLOGIST">Psychologist</option>
              <option value="COUNSELOR">Counselor</option>
              <option value="THERAPIST">Therapist</option>
            </select>
            <input
              type="text"
              placeholder="Search specialization..."
              value={searchFilters.specialization}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, specialization: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredList.length}</p>
              <p className="text-gray-600">Professionals in Reference List</p>
            </div>
            <div className="text-sm text-gray-500">
              Total: {referenceList.length} professionals
            </div>
          </div>
        </div>

        {/* Reference List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Reference List</h3>
            <p className="text-sm text-gray-600 mt-1">
              Use this list to verify incoming applications
            </p>
          </div>

          {loadingData ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading reference list...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {referenceList.length === 0 ? 'No professionals in reference list yet' : 'No professionals match your search criteria'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Professional
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredList.map((professional) => (
                    <tr key={professional.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {professional.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{professional.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[professional.professionalType] || 'bg-gray-100 text-gray-800'}`}>
                          {professional.professionalType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {professional.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(professional.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => showDetails(professional)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRemove(professional.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedProfessional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProfessional.fullName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProfessional.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Professional Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProfessional.professionalType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProfessional.specialization}</p>
              </div>
              
              {selectedProfessional.licenseNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProfessional.licenseNumber}</p>
                </div>
              )}
              
              {selectedProfessional.bmdcNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">BMDC Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProfessional.bmdcNumber}</p>
                </div>
              )}
              
              {selectedProfessional.institution && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Institution</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProfessional.institution}</p>
                </div>
              )}
              
              {selectedProfessional.yearsOfExperience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProfessional.yearsOfExperience}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Added to Reference List</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedProfessional.uploadedAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Uploaded By</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProfessional.uploadedBy}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
