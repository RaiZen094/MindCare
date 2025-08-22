'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../lib/api';
import { useRouter } from 'next/navigation';

const PROFESSIONAL_TYPES = [
  { value: 'PSYCHIATRIST', label: 'Psychiatrist', description: 'BMDC registered medical doctor specializing in mental health' },
  { value: 'PSYCHOLOGIST', label: 'Psychologist', description: 'Licensed mental health professional with psychology degree' }
];

const DEGREES = [
  'MBBS', 'MPhil in Clinical Psychology', 'MSc in Clinical Psychology', 'PhD in Psychology', 
  'MSc in Psychology', 'Masters in Clinical Psychology', 'Other'
];

const INSTITUTIONS = [
  'Dhaka Medical College', 'Chittagong Medical College', 'Sylhet Medical College', 
  'Dhaka University', 'Chittagong University', 'Jahangirnagar University',
  'North South University', 'BRAC University', 'University of Dhaka',
  'National Institute of Mental Health (NIMH)', 'Other'
];

const SPECIALIZATIONS = [
  'Child Psychiatry', 'Adult Psychiatry', 'Geriatric Psychiatry', 'Addiction Psychiatry',
  'Cognitive Behavioral Therapy (CBT)', 'Psychoanalytic Therapy', 'Family Therapy',
  'Couples Therapy', 'Trauma Therapy', 'Anxiety Disorders', 'Depression',
  'PTSD', 'Eating Disorders', 'Personality Disorders', 'Other'
];

const LANGUAGES = [
  'Bangla', 'English', 'Hindi', 'Urdu', 'Arabic', 'Other'
];

export default function ProfessionalApplicationPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [applicationData, setApplicationData] = useState({
    professionalType: '',
    bmdcNumber: '',
    degree: '',
    institution: '',
    affiliation: '',
    specialization: '',
    experienceYears: '',
    languagesSpoken: [],
    clinicAddress: '',
    contactEmail: '',
    contactPhone: '',
    licenseDocumentUrl: '',
    degreeDocumentUrl: '',
    additionalDocumentsUrls: ''
  });

  const [currentApplication, setCurrentApplication] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user && isAuthenticated) {
      // Pre-fill contact info from user profile
      setApplicationData(prev => ({
        ...prev,
        contactEmail: user.email || '',
        contactPhone: user.phone || ''
      }));

      // Check for existing application
      fetchApplicationStatus();
    }
  }, [user, isAuthenticated, loading, router]);

  const fetchApplicationStatus = async () => {
    try {
      const response = await apiService.getProfessionalVerificationStatus();
      if (response && typeof response === 'object' && response.id) {
        setCurrentApplication(response);
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLanguageChange = (language) => {
    setApplicationData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(language)
        ? prev.languagesSpoken.filter(l => l !== language)
        : [...prev.languagesSpoken, language]
    }));
  };

  const handleDocumentUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const response = await apiService.uploadDocument(file, documentType);
      if (response.success) {
        setApplicationData(prev => ({
          ...prev,
          [`${documentType}DocumentUrl`]: response.documentUrl
        }));
        setMessage(`${documentType} document uploaded successfully`);
      } else {
        setErrors(prev => ({ ...prev, [documentType]: response.message }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [documentType]: 'Failed to upload document' }));
    } finally {
      setUploadingDoc(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!applicationData.professionalType) {
      newErrors.professionalType = 'Professional type is required';
    }

    if (applicationData.professionalType === 'PSYCHIATRIST' && !applicationData.bmdcNumber) {
      newErrors.bmdcNumber = 'BMDC number is required for psychiatrists';
    } else if (applicationData.professionalType === 'PSYCHIATRIST' && applicationData.bmdcNumber) {
      // Updated regex to allow hyphens and proper BMDC format like BMDC-12345
      const bmdcPattern = /^[A-Za-z0-9-]{6,20}$/;
      if (!bmdcPattern.test(applicationData.bmdcNumber)) {
        newErrors.bmdcNumber = 'BMDC number must be 6-20 characters (letters, numbers, and hyphens allowed). Example: BMDC-12345';
      }
    }

    if (applicationData.professionalType === 'PSYCHOLOGIST') {
      if (!applicationData.degree) {
        newErrors.degree = 'Degree is required for psychologists';
      }
      if (!applicationData.institution) {
        newErrors.institution = 'Institution is required for psychologists';
      }
    }

    if (!applicationData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!applicationData.experienceYears || applicationData.experienceYears < 0) {
      newErrors.experienceYears = 'Valid experience years required';
    }

    if (applicationData.languagesSpoken.length === 0) {
      newErrors.languagesSpoken = 'At least one language is required';
    }

    if (!applicationData.contactEmail) {
      newErrors.contactEmail = 'Contact email is required';
    }

    if (!applicationData.contactPhone) {
      newErrors.contactPhone = 'Contact phone is required';
    }

    if (!applicationData.licenseDocumentUrl) {
      newErrors.license = 'License document is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const submitData = {
        professionalType: applicationData.professionalType,
        bmdcNumber: applicationData.bmdcNumber || null,
        degreeTitle: applicationData.degree || null, // Map degree to degreeTitle
        degreeInstitution: applicationData.institution || null, // Map institution to degreeInstitution
        affiliation: applicationData.affiliation || null,
        specialization: applicationData.specialization,
        experienceYears: parseInt(applicationData.experienceYears),
        languagesSpoken: JSON.stringify(applicationData.languagesSpoken),
        clinicAddress: applicationData.clinicAddress || null,
        contactEmail: applicationData.contactEmail,
        contactPhone: applicationData.contactPhone,
        licenseDocumentUrl: applicationData.licenseDocumentUrl,
        degreeDocumentUrl: applicationData.degreeDocumentUrl || null,
        additionalDocumentsUrls: applicationData.additionalDocumentsUrls || null
      };

      const response = await apiService.submitProfessionalApplication(submitData);
      
      if (response && response.id) {
        setMessage('Application submitted successfully! You will receive an email confirmation.');
        setCurrentApplication(response);
        // Reset form
        setApplicationData({
          professionalType: '',
          bmdcNumber: '',
          degree: '',
          institution: '',
          affiliation: '',
          specialization: '',
          experienceYears: '',
          languagesSpoken: [],
          clinicAddress: '',
          contactEmail: user?.email || '',
          contactPhone: user?.phone || '',
          licenseDocumentUrl: '',
          degreeDocumentUrl: '',
          additionalDocumentsUrls: ''
        });
      } else {
        setMessage('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      setMessage(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Show current application status if exists
  if (currentApplication) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Professional Verification Status
              </h1>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                currentApplication.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                currentApplication.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentApplication.status === 'PENDING' && '⏳ Under Review'}
                {currentApplication.status === 'APPROVED' && '✅ Approved'}
                {currentApplication.status === 'REJECTED' && '❌ Rejected'}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Application ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{currentApplication.correlationId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Professional Type</label>
                  <p className="mt-1 text-sm text-gray-900">{currentApplication.professionalType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <p className="mt-1 text-sm text-gray-900">{currentApplication.specialization}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{currentApplication.experienceYears} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted On</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(currentApplication.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {currentApplication.verifiedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {currentApplication.status === 'APPROVED' ? 'Approved On' : 'Reviewed On'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(currentApplication.verifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {currentApplication.adminNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                  <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                    {currentApplication.adminNotes}
                  </p>
                </div>
              )}

              {currentApplication.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                  <p className="mt-1 text-sm text-red-900 p-3 bg-red-50 rounded-md">
                    {currentApplication.rejectionReason}
                  </p>
                </div>
              )}

              <div className="text-center pt-6">
                {currentApplication.status === 'REJECTED' && (
                  <button
                    onClick={() => setCurrentApplication(null)}
                    className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Submit New Application
                  </button>
                )}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="ml-4 bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Apply for Professional Verification
            </h1>
            <p className="text-lg text-gray-600">
              Join our network of verified mental health professionals
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.firstName + ' ' + user?.lastName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Type *
                  </label>
                  <select
                    name="professionalType"
                    value={applicationData.professionalType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.professionalType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select professional type</option>
                    {PROFESSIONAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.professionalType && (
                    <p className="mt-1 text-sm text-red-600">{errors.professionalType}</p>
                  )}
                  {applicationData.professionalType && (
                    <p className="mt-1 text-sm text-gray-500">
                      {PROFESSIONAL_TYPES.find(t => t.value === applicationData.professionalType)?.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Credentials */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Credentials</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {applicationData.professionalType === 'PSYCHIATRIST' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BMDC Registration Number *
                    </label>
                    <input
                      type="text"
                      name="bmdcNumber"
                      value={applicationData.bmdcNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your BMDC registration number (e.g., BMDC-12345)"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.bmdcNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: BMDC-XXXXX (letters, numbers, and hyphens allowed)
                    </p>
                    {errors.bmdcNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.bmdcNumber}</p>
                    )}
                  </div>
                )}

                {applicationData.professionalType === 'PSYCHOLOGIST' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree *
                      </label>
                      <select
                        name="degree"
                        value={applicationData.degree}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          errors.degree ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select degree</option>
                        {DEGREES.map(degree => (
                          <option key={degree} value={degree}>{degree}</option>
                        ))}
                      </select>
                      {errors.degree && (
                        <p className="mt-1 text-sm text-red-600">{errors.degree}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution *
                      </label>
                      <select
                        name="institution"
                        value={applicationData.institution}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          errors.institution ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select institution</option>
                        {INSTITUTIONS.map(institution => (
                          <option key={institution} value={institution}>{institution}</option>
                        ))}
                      </select>
                      {errors.institution && (
                        <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Affiliation
                      </label>
                      <input
                        type="text"
                        name="affiliation"
                        value={applicationData.affiliation}
                        onChange={handleInputChange}
                        placeholder="Current workplace or affiliation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <select
                    name="specialization"
                    value={applicationData.specialization}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.specialization ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={applicationData.experienceYears}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Years of experience"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.experienceYears ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.experienceYears && (
                    <p className="mt-1 text-sm text-red-600">{errors.experienceYears}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Languages and Contact */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages & Contact Information</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken *
                </label>
                <div className="grid md:grid-cols-3 gap-3">
                  {LANGUAGES.map(language => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applicationData.languagesSpoken.includes(language)}
                        onChange={() => handleLanguageChange(language)}
                        className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{language}</span>
                    </label>
                  ))}
                </div>
                {errors.languagesSpoken && (
                  <p className="mt-1 text-sm text-red-600">{errors.languagesSpoken}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={applicationData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="Professional contact email"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={applicationData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+8801XXXXXXXXX"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinic/Practice Address
                  </label>
                  <textarea
                    name="clinicAddress"
                    value={applicationData.clinicAddress}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Full address of your clinic or practice"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Upload</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Document * 
                    <span className="text-xs text-gray-500">(PDF, JPG, PNG - Max 10MB)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleDocumentUpload(e, 'license')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {applicationData.licenseDocumentUrl && (
                    <p className="mt-1 text-sm text-green-600">✓ License document uploaded</p>
                  )}
                  {errors.license && (
                    <p className="mt-1 text-sm text-red-600">{errors.license}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree Certificate 
                    <span className="text-xs text-gray-500">(PDF, JPG, PNG - Max 10MB)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleDocumentUpload(e, 'degree')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {applicationData.degreeDocumentUrl && (
                    <p className="mt-1 text-sm text-green-600">✓ Degree document uploaded</p>
                  )}
                  {errors.degree && (
                    <p className="mt-1 text-sm text-red-600">{errors.degree}</p>
                  )}
                </div>
              </div>

              {uploadingDoc && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Uploading document...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={submitting || uploadingDoc}
                className="bg-teal-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
