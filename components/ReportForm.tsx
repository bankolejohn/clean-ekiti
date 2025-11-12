/**
 * Secure and accessible report form component
 * Handles environmental report submission with validation and error handling
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CreateReportData, ReportCategory, MapCoordinates } from '@/types';
import { REPORT_CATEGORIES, VALIDATION_RULES, FILE_LIMITS } from '@/lib/constants';
import { validateReportData, validateFile, sanitizeString } from '@/lib/validation';
import LoadingSpinner from './LoadingSpinner';

// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import('./LocationPicker'), { 
  ssr: false,
  loading: () => <div className="h-48 md:h-64 bg-gray-200 animate-pulse rounded-lg" />
});

interface ReportFormProps {
  onSubmit: (data: CreateReportData, image?: File) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: Partial<CreateReportData>;
}

interface FormErrors {
  [key: string]: string;
}

export default function ReportForm({ 
  onSubmit, 
  isSubmitting = false, 
  initialData = {} 
}: ReportFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreateReportData>({
    category: 'dumping',
    description: '',
    latitude: 7.6219, // Default to Ado-Ekiti
    longitude: 5.2206,
    location_name: '',
    reporter_email: '',
    ...initialData,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  /**
   * Update form field with validation
   */
  const updateField = useCallback((field: keyof CreateReportData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  /**
   * Handle image file selection with validation
   */
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, image: validation.error! }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImage(file);
    setErrors(prev => ({ ...prev, image: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  /**
   * Remove selected image
   */
  const removeImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Get user's current location
   */
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ 
        ...prev, 
        location: 'Geolocation is not supported by this browser' 
      }));
      return;
    }

    setIsGettingLocation(true);
    setErrors(prev => ({ ...prev, location: '' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateField('latitude', latitude);
        updateField('longitude', longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Unable to get your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location permissions and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please select your location on the map.';
            break;
        }
        
        setErrors(prev => ({ ...prev, location: errorMessage }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [updateField]);

  /**
   * Handle location selection from map
   */
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    updateField('latitude', lat);
    updateField('longitude', lng);
  }, [updateField]);

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const validation = validateReportData(formData);
    
    if (!validation.isValid) {
      const newErrors: FormErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('Category')) newErrors.category = error;
        if (error.includes('coordinates')) newErrors.location = error;
        if (error.includes('Description')) newErrors.description = error;
        if (error.includes('email')) newErrors.reporter_email = error;
      });
      
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  }, [validateForm]);

  /**
   * Confirm and submit the report
   */
  const confirmSubmission = useCallback(async () => {
    setShowConfirmation(false);
    
    try {
      await onSubmit(formData, image || undefined);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to submit report. Please try again.' });
    }
  }, [formData, image, onSubmit]);

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-6">
        {/* Error Summary */}
        {Object.values(errors).filter(Boolean).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.values(errors).filter(Boolean).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Photo Upload */}
        <div className="mb-6">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            Photo (Optional)
          </label>
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept={FILE_LIMITS.ALLOWED_TYPES.join(',')}
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-describedby="image-help"
          />
          <p id="image-help" className="text-xs text-gray-500 mt-1">
            Max size: {FILE_LIMITS.MAX_SIZE / (1024 * 1024)}MB. Supported formats: JPEG, PNG, WebP
          </p>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Issue Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => updateField('category', e.target.value as ReportCategory)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            aria-describedby="category-help"
          >
            {REPORT_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          <p id="category-help" className="text-xs text-gray-500 mt-1">
            Select the type of environmental issue you're reporting
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            maxLength={VALIDATION_RULES.DESCRIPTION_MAX_LENGTH}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Describe the environmental issue in detail..."
            aria-describedby="description-help"
          />
          <p id="description-help" className="text-xs text-gray-500 mt-1">
            {(formData.description || '').length}/{VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters
          </p>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          
          {/* Current Location Display */}
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Selected Location:</p>
                <p className="text-gray-900">
                  {formData.location_name || `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation || isSubmitting}
                className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? 'Getting...' : 'Use My Location'}
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="h-48 md:h-64 border border-gray-300 rounded-lg overflow-hidden">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialPosition={[formData.latitude, formData.longitude]}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click on the map to select the exact location of the issue
          </p>
        </div>

        {/* Email */}
        <div className="mb-6">
          <label htmlFor="reporter_email" className="block text-sm font-medium text-gray-700 mb-2">
            Email (Optional - for updates)
          </label>
          <input
            id="reporter_email"
            type="email"
            value={formData.reporter_email || ''}
            onChange={(e) => updateField('reporter_email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="your@email.com"
            aria-describedby="email-help"
          />
          <p id="email-help" className="text-xs text-gray-500 mt-1">
            We'll send you updates about your report if you provide an email
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isGettingLocation}
          className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            'Review & Submit Report'
          )}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Confirm Your Report</h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close confirmation dialog"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Please review your report details before submitting:
                </p>

                {/* Report Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Issue Type:</span>
                    <span className="ml-2 capitalize">{formData.category.replace('_', ' ')}</span>
                  </div>

                  {formData.description && (
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-gray-600 text-sm">{formData.description}</p>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p className="text-gray-600 text-sm">
                      {formData.location_name || `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`}
                    </p>
                  </div>

                  {imagePreview && (
                    <div>
                      <span className="font-medium text-gray-700">Photo:</span>
                      <img
                        src={imagePreview}
                        alt="Report preview"
                        className="w-full h-32 object-cover rounded-lg mt-2"
                      />
                    </div>
                  )}

                  {formData.reporter_email && (
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-600">{formData.reporter_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmission}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-accent text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Confirm & Submit'
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                By submitting, you confirm this report is accurate and made in good faith.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}