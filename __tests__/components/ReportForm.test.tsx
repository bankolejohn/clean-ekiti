/**
 * Component tests for ReportForm
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportForm from '@/components/ReportForm';
import { CreateReportData } from '@/types';

// Mock dynamic imports
jest.mock('next/dynamic', () => {
  return function mockDynamic(importFunc: any) {
    const Component = importFunc();
    return Component;
  };
});

// Mock LocationPicker component
jest.mock('@/components/LocationPicker', () => {
  return function MockLocationPicker({ onLocationSelect, initialPosition }: any) {
    return (
      <div data-testid="location-picker">
        <button
          onClick={() => onLocationSelect({ latitude: 7.6219, longitude: 5.2206 })}
        >
          Select Location
        </button>
        <span>Initial: {initialPosition[0]}, {initialPosition[1]}</span>
      </div>
    );
  };
});

// Mock LoadingSpinner component
jest.mock('@/components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size, className }: any) {
    return <div data-testid="loading-spinner" className={className}>Loading...</div>;
  };
});

describe('ReportForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: jest.fn(),
      },
      writable: true,
    });
  });

  it('should render form fields correctly', () => {
    render(<ReportForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/photo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/issue category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review & submit report/i })).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);

    // Fill out the form
    await user.selectOptions(screen.getByLabelText(/issue category/i), 'dumping');
    await user.type(screen.getByLabelText(/description/i), 'Test description');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /review & submit report/i }));

    // Confirmation modal should appear
    expect(screen.getByText(/confirm your report/i)).toBeInTheDocument();

    // Confirm submission
    await user.click(screen.getByRole('button', { name: /confirm & submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'dumping',
          description: 'Test description',
          reporter_email: 'test@example.com',
          latitude: 7.6219,
          longitude: 5.2206,
        }),
        undefined
      );
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /review & submit report/i }));

    // Should not show confirmation modal
    expect(screen.queryByText(/confirm your report/i)).not.toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should handle image upload', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/photo/i);

    await user.upload(fileInput, file);

    // Image preview should appear
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });

    // Remove image button should be present
    const removeButton = screen.getByLabelText(/remove image/i);
    expect(removeButton).toBeInTheDocument();

    // Remove the image
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
    });
  });

  it('should validate file size and type', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);

    // Test invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/photo/i);

    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/only jpeg, png, and webp images are allowed/i)).toBeInTheDocument();
    });
  });

  it('should handle location selection', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);

    // Click on location picker
    const selectLocationButton = screen.getByText('Select Location');
    await user.click(selectLocationButton);

    // Location should be updated
    expect(screen.getByText(/7.621900, 5.220600/)).toBeInTheDocument();
  });

  it('should handle geolocation', async () => {
    const mockGetCurrentPosition = jest.fn();
    (global.navigator.geolocation.getCurrentPosition as jest.Mock) = mockGetCurrentPosition;

    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);

    const useLocationButton = screen.getByText(/use my location/i);
    await user.click(useLocationButton);

    expect(mockGetCurrentPosition).toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    const submitButton = screen.getByRole('button', { name: /submitting/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display validation errors', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);

    // Enter invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    
    // Try to submit
    await user.click(screen.getByRole('button', { name: /review & submit report/i }));

    await waitFor(() => {
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
    });
  });

  it('should handle form cancellation', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);

    // Fill out and submit form
    await user.selectOptions(screen.getByLabelText(/issue category/i), 'dumping');
    await user.click(screen.getByRole('button', { name: /review & submit report/i }));

    // Confirmation modal should appear
    expect(screen.getByText(/confirm your report/i)).toBeInTheDocument();

    // Cancel submission
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText(/confirm your report/i)).not.toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should populate initial data', () => {
    const initialData = {
      category: 'flooding' as const,
      description: 'Initial description',
      reporter_email: 'initial@example.com',
    };

    render(<ReportForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByDisplayValue('flooding')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('initial@example.com')).toBeInTheDocument();
  });
});