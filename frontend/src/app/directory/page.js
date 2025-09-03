'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiService } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, MapPin, Clock, Star, User, CheckCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

function DirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // State management
  const [professionals, setProfessionals] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    professionalType: searchParams.get('type') || '',
    specialization: searchParams.get('specialization') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || '',
    minExperience: searchParams.get('minExp') || '',
    maxExperience: searchParams.get('maxExp') || ''
  });
  
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 0,
    size: 12,
    totalPages: 0,
    totalElements: 0
  });
  
  const [filterOptions, setFilterOptions] = useState({
    specializations: [],
    locations: [],
    languages: [],
    professionalTypes: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Access control: Only allow public users, patients, or unauthenticated users
  // Redirect professionals and admins to their respective dashboards
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

  // Don't render directory for professionals or admins
  if (!authLoading && isAuthenticated && user) {
    if (user.roles?.includes('PROFESSIONAL') || user.roles?.includes('ADMIN')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              The professional directory is for patients and public users only.
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

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load professionals when filters or pagination change
  useEffect(() => {
    loadProfessionals();
  }, [filters, pagination.page]);

  const loadFilterOptions = async () => {
    try {
      const response = await apiService.getDirectoryFilters();
      setFilterOptions(response);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadProfessionals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getVerifiedProfessionals(
        pagination.page, 
        pagination.size, 
        filters
      );
      
      setProfessionals(response.content);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      }));
    } catch (error) {
      console.error('Failed to load professionals:', error);
      setError('Failed to load professionals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
    updateURL({ ...filters, [key]: value }, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProfessionals();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    updateURL(filters, newPage);
  };

  const updateURL = (newFilters, page) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.professionalType) params.set('type', newFilters.professionalType);
    if (newFilters.specialization) params.set('specialization', newFilters.specialization);
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.language) params.set('language', newFilters.language);
    if (newFilters.minExperience) params.set('minExp', newFilters.minExperience);
    if (newFilters.maxExperience) params.set('maxExp', newFilters.maxExperience);
    if (page > 0) params.set('page', page);

    router.push(`/directory?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      professionalType: '',
      specialization: '',
      location: '',
      language: '',
      minExperience: '',
      maxExperience: ''
    };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 0 }));
    router.push('/directory');
  };

  const viewProfile = (professionalId) => {
    router.push(`/directory/${professionalId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Verified Mental Health Professionals
              </h1>
              <p className="mt-2 text-gray-600">
                Find qualified and verified mental health professionals in Bangladesh
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {pagination.totalElements} verified professionals
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, specialization, or institution..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Professional Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Type
                </label>
                <select
                  value={filters.professionalType}
                  onChange={(e) => handleFilterChange('professionalType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {filterOptions.professionalTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange('specialization', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Specializations</option>
                  {filterOptions.specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  {filterOptions.locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Languages</option>
                  {filterOptions.languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience Range */}
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Experience:
                </label>
                <input
                  type="number"
                  placeholder="Min years"
                  value={filters.minExperience}
                  onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                  className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max years"
                  value={filters.maxExperience}
                  onChange={(e) => handleFilterChange('maxExperience', e.target.value)}
                  className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading professionals...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && professionals.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No professionals found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Professional Cards Grid */}
        {!loading && !error && professionals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onViewProfile={() => viewProfile(professional.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    index === pagination.page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

// Professional Card Component
function ProfessionalCard({ professional, onViewProfile }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
      <div className="p-6">
        {/* Header with verified badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {professional.name}
              </h3>
              <CheckCircle className="w-5 h-5 text-green-500 ml-2" title="Verified Professional" />
            </div>
            <p className="text-blue-600 font-medium">
              {professional.professionalType?.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Specialization */}
        <div className="mb-3">
          <p className="text-gray-700 font-medium">{professional.specialization}</p>
        </div>

        {/* Experience */}
        <div className="flex items-center mb-3">
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-600 text-sm">
            {professional.experienceYears} years experience
          </span>
        </div>

        {/* Location */}
        {professional.location && (
          <div className="flex items-center mb-3">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600 text-sm">{professional.location}</span>
          </div>
        )}

        {/* Languages */}
        {professional.languages && professional.languages.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {professional.languages.slice(0, 3).map((language, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {language}
                </span>
              ))}
              {professional.languages.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                  +{professional.languages.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onViewProfile}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Profile
          </button>
          <button
            disabled
            className="flex-1 bg-gray-100 text-gray-400 py-2 px-4 rounded-md cursor-not-allowed"
            title="Booking will be available soon"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function DirectoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading directory...</span>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function ProfessionalDirectoryPage() {
  return (
    <Suspense fallback={<DirectoryLoading />}>
      <DirectoryContent />
    </Suspense>
  );
}
