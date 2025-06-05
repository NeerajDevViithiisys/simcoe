import React, { useState, useEffect } from 'react';
import { CalculationRow, ClientInfo, getUnitLabel, ServiceType } from '../types';
import { Pencil, Plus } from 'lucide-react';
import { quoteAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/string';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
        };
        event: {
          clearInstanceListeners: (instance: unknown) => void;
        };
      };
    };
  }
}

interface ServiceData {
  serviceType: ServiceType;
  units: number;
  subtotal: number;
  hourlyCrewCharge?: number;
  rate?: number;
  setupMinutes: number;
  perUnitMinutes: number;
  numberOfPersons: number;
  totalTimeMinutes: number;
  totalTimeHours: number;
  calendarSlotHours: number;
  areaSquareFootage?: number;
  numberOfStairs?: number;
  numberOfPosts?: number;
  railingLengthFeet?: number;
  numberOfSpindles?: number;
}

export default function CalculatorView() {
  const { user } = useAuthStore();
  const [caluculationLoading, setCaluculationLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phoneNumber: '',
    otherPhone: '',
    units: '',
    email: '',
    notes: '',
  });
  const [calculations, setCalculations] = useState<CalculationRow[]>([]);
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [discountValue, setDiscountValue] = useState<number | null>(null);

  const [currentCalculation, setCurrentCalculation] = useState<{
    serviceType: ServiceType;
    units: number | '';
    areaSquareFootage?: number | '';
    numberOfStairs?: number | '';
    numberOfPosts?: number | '';
    railingLengthFeet?: number | '';
    numberOfSpindles?: number | '';
  }>({
    serviceType: ServiceType.EXTERIOR_WINDOW_CLEANING,
    units: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDiscountDropdownOpen, setIsDiscountDropdownOpen] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const location = useLocation();
  const fetchQuoteData = location.state;

  // Add this state for tracking touched fields
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setIsLoading(true);
        if (!fetchQuoteData?.id) return;
        const response = await quoteAPI.getQuote(fetchQuoteData?.id);
        if (response.data.length != 0) {
          const quote = response.data;

          setClientInfo({
            firstName: quote.clientInfo.firstName || '',
            lastName: quote.clientInfo.lastName || '',
            address: quote.clientInfo.address || '',
            city: quote.clientInfo.city || '',
            units: quote.clientInfo.units || '',
            province: quote.clientInfo.province || '',
            postalCode: quote.clientInfo.postalCode || '',
            phoneNumber: quote.clientInfo.phoneNumber || '',
            otherPhone: quote.clientInfo.otherPhone || '',
            email: quote.clientInfo.email || '',
            notes: quote.clientInfo.notes || '',
          });

          setCalculations(
            quote.services.map((service: ServiceData) => ({
              ...service,
              serviceType: service.serviceType,
              units: service.units || 0,
              subtotal: service.subtotal || 0,
              rate: service.hourlyCrewCharge || service.rate || 0,
              setupMinutes: service.setupMinutes || 0,
              perUnitMinutes: service.perUnitMinutes || 0,
              numberOfPersons: service.numberOfPersons || 1,
              totalTimeMinutes: service.totalTimeMinutes || 0,
              totalTimeHours: service.totalTimeHours || 0,
              calendarSlotHours: service.calendarSlotHours || 0,
            }))
          );

          setDiscountType(quote.discount.percentage > 0 ? 'PERCENTAGE' : 'FLAT');
          setDiscountValue(
            quote.discount.percentage > 0 ? quote.discount.percentage : quote.discount.flat
          );
        }
      } catch (err) {
        console.error('Error fetching quote:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [fetchQuoteData?.id]);

  // Add Google Places Autocomplete
  useEffect(() => {
    let isScriptLoaded = false;
    let script: HTMLScriptElement | null = null;
    let autocomplete: google.maps.places.Autocomplete | null = null;
    let mounted = true;

    const initializeAutocomplete = () => {
      if (!mounted) return;

      try {
        const input = document.getElementById('address-input') as HTMLInputElement;
        if (!input) {
          console.error('Address input element not found');
          return;
        }

        // Clear any existing autocomplete instance
        if (autocomplete) {
          google.maps.event.clearInstanceListeners(autocomplete);
        }

        // Ensure Google Maps is loaded
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          return;
        }

        autocomplete = new google.maps.places.Autocomplete(input, {
          types: ['address'],
          componentRestrictions: { country: 'ca' },
          fields: ['address_components', 'formatted_address'],
        });

        autocomplete.addListener('place_changed', () => {
          if (!mounted) return;

          const place = autocomplete?.getPlace();
          if (!place || !place.address_components) {
            console.error('Invalid place data received');
            return;
          }

          const addressComponents = place.address_components;
          let streetNumber = '';
          let route = '';
          let city = '';
          let province = '';
          let postalCode = '';

          for (const component of addressComponents) {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              route = component.long_name;
            } else if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              province = component.short_name;
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          }

          const address = `${streetNumber} ${route}`.trim();
          setClientInfo((prev) => ({
            ...prev,
            address,
            city,
            province,
            postalCode,
          }));
        });

        // Add input event listener to handle manual input
        input.addEventListener('input', (e) => {
          if (!mounted) return;
          const target = e.target as HTMLInputElement;
          setClientInfo((prev) => ({
            ...prev,
            address: target.value,
          }));
        });
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
      }
    };

    const loadGoogleMapsScript = () => {
      if (!mounted) return;

      // Check if script is already loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        isScriptLoaded = true;
        // Wait for the next tick to ensure Google Maps is fully initialized
        setTimeout(initializeAutocomplete, 0);
        return;
      }

      // Check if script is already being loaded
      if (isScriptLoaded) {
        return;
      }

      // Create a promise to handle script loading
      const loadScript = new Promise<void>((resolve, reject) => {
        script = document.createElement('script');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error('Google Maps API key not found in environment variables');
          reject(new Error('API key missing'));
          return;
        }

        // Remove loading=async and add callback parameter
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=Function.prototype`;
        script.async = true;
        script.defer = true;

        script.addEventListener('load', () => {
          if (!mounted) return;
          isScriptLoaded = true;
          // Wait for the next tick to ensure Google Maps is fully initialized
          setTimeout(() => {
            if (mounted) resolve();
          }, 0);
        });

        script.addEventListener('error', (error) => {
          isScriptLoaded = false;
          if (mounted) reject(error);
        });

        document.head.appendChild(script);
      });

      // Initialize autocomplete after script loads
      loadScript
        .then(() => {
          if (mounted) {
            initializeAutocomplete();
          }
        })
        .catch((error) => {
          console.error('Failed to load Google Maps script:', error);
        });
    };

    // Delay the script loading slightly to ensure the DOM is ready
    setTimeout(loadGoogleMapsScript, 100);

    return () => {
      mounted = false;
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
        autocomplete = null;
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString();
  };

  const handleEditService = (index: number) => {
    const calculation = calculations[index] as ServiceData;
    setCurrentCalculation({
      serviceType: calculation.serviceType,
      units: calculation.units || '',
      ...(calculation.serviceType === ServiceType.WOOD_POWERWASHING
        ? {
            areaSquareFootage: calculation.areaSquareFootage || '',
            numberOfStairs: calculation.numberOfStairs || '',
            numberOfPosts: calculation.numberOfPosts || '',
            railingLengthFeet: calculation.railingLengthFeet || '',
            numberOfSpindles: calculation.numberOfSpindles || '',
          }
        : {}),
    });
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleCalculationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectServices = [
      currentCalculation.serviceType === ServiceType.WOOD_POWERWASHING
        ? {
            serviceType: currentCalculation.serviceType,
            areaSquareFootage: currentCalculation.areaSquareFootage || 0,
            numberOfStairs: currentCalculation.numberOfStairs || 0,
            numberOfPosts: currentCalculation.numberOfPosts || 0,
            railingLengthFeet: currentCalculation.railingLengthFeet || 0,
            numberOfSpindles: currentCalculation.numberOfSpindles || 0,
          }
        : {
            serviceType: currentCalculation.serviceType,
            units: currentCalculation.units,
          },
    ];

    setCaluculationLoading(true);
    try {
      const result = await quoteAPI.calculate(selectServices);
      const serviceData = result.data.services[0];

      const newRow: CalculationRow = {
        serviceType: currentCalculation.serviceType,
        setupMinutes: serviceData.setupMinutes,
        perUnitMinutes: serviceData.perUnitMinutes,
        hourlyCrewCharge: serviceData.hourlyCrewCharge,
        numberOfPersons: serviceData.numberOfPersons,
        totalTimeMinutes: serviceData.totalTimeMinutes,
        totalTimeHours: serviceData.totalTimeHours,
        calendarSlotHours: serviceData.calendarSlotHours,
        subtotal: serviceData.totalCost,
        ...(currentCalculation.serviceType === ServiceType.WOOD_POWERWASHING
          ? {
              areaSquareFootage: currentCalculation.areaSquareFootage || 0,
              numberOfStairs: currentCalculation.numberOfStairs || 0,
              numberOfPosts: currentCalculation.numberOfPosts || 0,
              railingLengthFeet: currentCalculation.railingLengthFeet || 0,
              numberOfSpindles: currentCalculation.numberOfSpindles || 0,
            }
          : {
              units: currentCalculation.units,
            }),
      };

      if (isEditing && editingIndex !== null) {
        const updatedCalculations = [...calculations];
        updatedCalculations[editingIndex] = newRow;
        setCalculations(updatedCalculations);
      } else {
        setCalculations([...calculations, newRow]);
      }

      setIsEditing(false);
      setEditingIndex(null);
      setCurrentCalculation({
        serviceType: ServiceType.EXTERIOR_WINDOW_CLEANING,
        units: '',
        areaSquareFootage: '',
        numberOfStairs: '',
        numberOfPosts: '',
        railingLengthFeet: '',
        numberOfSpindles: '',
      });
    } catch (error) {
      console.error('Failed to calculate service:', error);
    } finally {
      setCaluculationLoading(false);
    }
  };

  // Add validation function
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required client info fields
    if (!clientInfo.firstName.trim()) errors.push('First Name is required');
    if (!clientInfo.address.trim()) errors.push('Address is required');
    if (!clientInfo.city.trim()) errors.push('City is required');
    if (!clientInfo.province.trim()) errors.push('Province is required');
    if (!clientInfo.postalCode.trim()) errors.push('Postal Code is required');
    if (!clientInfo.phoneNumber.trim()) errors.push('Phone Number is required');
    if (
      (clientInfo.email ?? '').trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email ?? '')
    ) {
      errors.push('Please enter a valid email address');
    }

    // Check if at least one service is added
    if (calculations.length === 0) {
      errors.push('At least one service must be added');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleDeleteService = (index: number) => {
    const updatedCalculations = calculations.filter((_, i) => i !== index);
    setCalculations(updatedCalculations);
  };

  const subtotal = calculations.reduce((sum, calc) => sum + (calc.subtotal ?? 0), 0);
  const discount =
    discountType === 'FLAT' ? discountValue ?? 0 : (subtotal * (discountValue ?? 0)) / 100;
  const tax = (subtotal - discount) * 0.13;
  const total = subtotal - discount + tax;

  const clearFormData = () => {
    setClientInfo({
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      phoneNumber: '',
      otherPhone: '',
      units: '',
      email: '',
      notes: '',
    });
    setCalculations([]);
    setDiscountType('FLAT');
    setDiscountValue(null);
    setCurrentCalculation({
      serviceType: ServiceType.EXTERIOR_WINDOW_CLEANING,
      units: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    clearFormData();
  };

  const SuccessDialog = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        handleDialogClose();
      }, 5000);

      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {fetchQuoteData?.id ? 'Quote Updated!' : 'Quote Created!'}
            </h3>
            <button
              className="px-6 py-1 rounded bg-[#C49C3C] text-white mt-4"
              onClick={handleDialogClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  const submitQuoteData = async () => {
    setIsFormSubmitted(true);
    const validation = validateForm();
    if (!validation.isValid) {
      // Show all validation errors
      validation.errors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    const quoteData = {
      userId: user?.id,
      subtotal: subtotal,
      taxValue: tax,
      total: total,
      services: calculations.map((calc) => ({
        id: calc.id,
        serviceType: calc.serviceType,
        units: calc.units,
        setupMinutes: calc.setupMinutes ?? 0,
        perUnitMinutes: calc.perUnitMinutes ?? 0,
        hourlyCrewCharge: calc.hourlyCrewCharge ?? 0,
        numberOfPersons: calc.numberOfPersons ?? 2,
        totalTimeMinutes: calc.totalTimeMinutes ?? 0,
        totalTimeHours: calc.totalTimeHours ?? 0,
        calendarSlotHours: calc.calendarSlotHours ?? 0,
        totalCost: calc.subtotal ?? 0,
      })),
      discount: {
        flat: discount,
        percentage: discountValue,
      },
      clientInfo: {
        firstName: clientInfo.firstName,
        lastName: clientInfo.lastName,
        address: clientInfo.address,
        city: clientInfo.city,
        province: clientInfo.province,
        postalCode: clientInfo.postalCode,
        phoneNumber: clientInfo.phoneNumber,
        otherPhone: clientInfo.otherPhone,
        notes: clientInfo.notes,
        email: clientInfo.email,
        units: clientInfo.units,
      },
    };

    if (!quoteData.clientInfo.email?.trim()) {
      delete quoteData.clientInfo.email;
    }

    setIsLoading(true);
    try {
      let response;
      if (fetchQuoteData?.id) {
        response = await quoteAPI.updateQuote(fetchQuoteData.id, quoteData);
      } else {
        response = await quoteAPI.create(quoteData);
      }
      console.log('Quote submitted successfully:', response);
      setShowSuccessDialog(true);
      setIsFormSubmitted(false);
      setTouchedFields({});
    } catch (error) {
      console.error('Failed to submit quote:', error);
      toast.error('Failed to submit quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDiscountDropdown = () => {
    setIsDiscountDropdownOpen(!isDiscountDropdownOpen);
  };

  // Update the requiredFieldClass function to consider touched state
  const getInputClassName = (fieldName: string, value: string) => {
    const isEmpty = !value.trim();
    const isTouched = touchedFields[fieldName] || isFormSubmitted;
    const isInvalid = isTouched && isEmpty;

    return `block w-full rounded border ${
      isInvalid ? 'border-red-300 bg-red-50' : 'border-gray-300'
    } px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
      isInvalid ? 'focus:ring-red-500 focus:border-red-500' : ''
    }`;
  };

  return (
    <div className="max-w-md mx-auto">
      {showSuccessDialog && <SuccessDialog />}
      <div className="px-2 flex flex-col gap-3">
        {/* Header Card */}
        <div className="bg-white  p-4 rounded border border-[rgba(0,0,0,.1)]">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-md font-semibold">SHS QUOTE</h1>
            </div>
            <div>
              <p className="text-gray-500 text-sm">{formatDate(new Date())}</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white  px-4 py-6 rounded border border-[rgba(0,0,0,.1)]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500 mb-1">Customer Details</p>
          </div>
          {/* Client Information Form */}
          <div className="space-y-5 border-t border-gray-200 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">First Name*</label>
                <input
                  type="text"
                  name="firstName"
                  value={clientInfo.firstName}
                  onChange={handleInputChange}
                  className={getInputClassName('firstName', clientInfo.firstName)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={clientInfo.lastName}
                  onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Address*</label>
              <input
                id="address-input"
                type="text"
                value={clientInfo.address}
                onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                className={getInputClassName('address', clientInfo.address)}
                placeholder="Start typing to search address..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">City*</label>
              <input
                type="text"
                value={clientInfo.city}
                onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                className={getInputClassName('city', clientInfo.city)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Units</label>
                <input
                  type="text"
                  value={clientInfo.units}
                  onChange={(e) => setClientInfo({ ...clientInfo, units: e.target.value })}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Province*</label>
                <input
                  type="text"
                  value={clientInfo.province}
                  onChange={(e) => setClientInfo({ ...clientInfo, province: e.target.value })}
                  className={getInputClassName('province', clientInfo.province)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Postal Code*</label>
                <input
                  type="text"
                  value={clientInfo.postalCode}
                  onChange={(e) => setClientInfo({ ...clientInfo, postalCode: e.target.value })}
                  className={getInputClassName('postalCode', clientInfo.postalCode)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  value={clientInfo.phoneNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    if (raw.length <= 10) {
                      setClientInfo({ ...clientInfo, phoneNumber: e.target.value });
                    }
                  }}
                  className={getInputClassName('phoneNumber', clientInfo.phoneNumber)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Other Phone</label>
                <input
                  type="tel"
                  value={clientInfo.otherPhone}
                  onChange={(e) => setClientInfo({ ...clientInfo, otherPhone: e.target.value })}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email*</label>
              <input
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                className={getInputClassName('email', clientInfo?.email ?? '')}
              />
            </div>
          </div>
          {/* )} */}
        </div>

        {/* Invoice Items Card */}
        <div className="bg-white  px-4 py-6 rounded border border-[rgba(0,0,0,.1)]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500 mb-1">Services</p>
          </div>

          {/* Service Input Fields - Always visible */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <form onSubmit={handleCalculationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Service Type</label>
                <div className="relative">
                  <div className="relative cursor-pointer" onClick={toggleDropdown}>
                    <div className="block w-full rounded border border-gray-300 px-3 py-2 text-sm flex items-center justify-between">
                      <span>
                        {currentCalculation.serviceType
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/^\w/, (c) => c.toUpperCase())}
                      </span>
                      <svg
                        className="h-5 w-5 text-[#C49C3C]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg py-1 overflow-auto max-h-56">
                        {Object.values(ServiceType).map((type) => (
                          <div
                            key={type}
                            className={`px-4 py-2 cursor-pointer hover:bg-[#C49C3C] hover:text-white transition-colors ${
                              currentCalculation.serviceType === type
                                ? 'bg-[#C49C3C] text-white font-medium'
                                : ''
                            }`}
                            onClick={() => {
                              setCurrentCalculation({ ...currentCalculation, serviceType: type });
                              setIsDropdownOpen(false);
                            }}
                          >
                            {type
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/^\w/, (c) => c.toUpperCase())}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {currentCalculation.serviceType !== ServiceType.WOOD_POWERWASHING ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {getUnitLabel(currentCalculation.serviceType)}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={currentCalculation.units}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = Number(value);
                        if (value === '' || numValue > 0) {
                          setCurrentCalculation({
                            ...currentCalculation,
                            units: value === '' ? '' : numValue,
                          });
                        }
                      }}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder={`Enter ${getUnitLabel(
                        currentCalculation.serviceType
                      ).toLowerCase()}`}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Area Square Footage
                    </label>
                    <input
                      type="number"
                      value={currentCalculation.areaSquareFootage || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = Number(value);
                        if (value === '' || numValue >= 0) {
                          setCurrentCalculation({
                            ...currentCalculation,
                            areaSquareFootage: value === '' ? '' : numValue,
                          });
                        }
                      }}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Enter area square footage"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Number of Stairs
                    </label>
                    <input
                      type="number"
                      value={currentCalculation.numberOfStairs || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = Number(value);
                        if (value === '' || numValue >= 0) {
                          setCurrentCalculation({
                            ...currentCalculation,
                            numberOfStairs: value === '' ? '' : numValue,
                          });
                        }
                      }}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Enter number of stairs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Number of Posts
                    </label>
                    <input
                      type="number"
                      value={currentCalculation.numberOfPosts || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = Number(value);
                        if (value === '' || numValue >= 0) {
                          setCurrentCalculation({
                            ...currentCalculation,
                            numberOfPosts: value === '' ? '' : numValue,
                          });
                        }
                      }}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Enter number of posts"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Railing Length (Feet)
                    </label>
                    <input
                      type="number"
                      value={currentCalculation.railingLengthFeet || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = Number(value);
                        if (value === '' || numValue >= 0) {
                          setCurrentCalculation({
                            ...currentCalculation,
                            railingLengthFeet: value === '' ? '' : numValue,
                          });
                        }
                      }}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Enter railing length"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Number of Spindles
                    </label>
                    <input
                      type="number"
                      value={currentCalculation.numberOfSpindles || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = Number(value);
                        if (value === '' || numValue >= 0) {
                          setCurrentCalculation({
                            ...currentCalculation,
                            numberOfSpindles: value === '' ? '' : numValue,
                          });
                        }
                      }}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Enter number of spindles"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={caluculationLoading}
                  className="px-3 py-1 bg-[#C49C3C] text-white rounded flex items-center
                  focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                  disabled:cursor-not-allowed text-sm"
                >
                  {isEditing ? <Pencil size={18} /> : <Plus size={18} />}
                  {caluculationLoading ? 'Adding...' : ''}
                </button>
              </div>
            </form>
          </div>

          <div className="w-full">
            {calculations.length === 0 ? (
              <div className="flex flex-col items-center justify-center pb-4">
                <p className="text-gray-500 text-md">No services added yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 text-xs text-gray-500 mb-2 border-t border-gray-200 pt-3">
                  <div className="col-span-4">DESCRIPTION</div>
                  <div className="col-span-2 text-right">QTY</div>
                  <div className="col-span-3 text-right">SUBTOTAL</div>
                  <div className="col-span-3 text-right">Action</div>
                </div>
                {calculations.map((calc, index) => (
                  <div key={index} className="grid grid-cols-12 text-sm py-2 group">
                    <div className="col-span-4 line-clamp-2">
                      {calc.serviceType.replace(/_/g, ' ')}
                    </div>
                    <div className="col-span-2 text-right">{calc.units}</div>
                    <div className="col-span-3 text-right">
                      ${formatCurrency(calc.subtotal || 0)}
                    </div>
                    <div className="col-span-3 flex items-start justify-end gap-2">
                      <button
                        onClick={() => handleEditService(index)}
                        className="transition-opacity p-1 hover:bg-gray-100 rounded"
                        title="Edit Service"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#C49C3C]  hover:text-purple-700"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteService(index)}
                        className="transition-opacity p-1 hover:bg-gray-100 rounded"
                        title="Delete Service"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-500 hover:text-red-700"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        {/* add discount */}
        <div className="bg-white  px-4 py-6 rounded border border-[rgba(0,0,0,.1)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 mb-1">Discount</p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-200 py-4">
              <div>
                <div className="relative">
                  <div className="relative cursor-pointer" onClick={toggleDiscountDropdown}>
                    <div className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm flex items-center justify-between">
                      <span>{discountType === 'FLAT' ? 'Flat Amount' : 'Percentage'}</span>
                      <svg
                        className="h-5 w-5 text-[#C49C3C]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {isDiscountDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg py-1 overflow-auto max-h-56">
                        <div
                          className={`px-4 py-2 cursor-pointer hover:bg-[#C49C3C] hover:text-white transition-colors ${
                            discountType === 'FLAT' ? 'bg-[#C49C3C] text-white font-medium' : ''
                          }`}
                          onClick={() => {
                            setDiscountType('FLAT');
                            setIsDiscountDropdownOpen(false);
                          }}
                        >
                          Flat Amount
                        </div>
                        <div
                          className={`px-4 py-2 cursor-pointer hover:bg-[#C49C3C] hover:text-white transition-colors ${
                            discountType === 'PERCENTAGE'
                              ? 'bg-[#C49C3C] text-white font-medium'
                              : ''
                          }`}
                          onClick={() => {
                            setDiscountType('PERCENTAGE');
                            setIsDiscountDropdownOpen(false);
                          }}
                        >
                          Percentage
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={discountValue ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = Number(value);
                    if (value === '' || numValue >= 0) {
                      setDiscountValue(value === '' ? null : numValue);
                    }
                  }}
                  className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  placeholder={discountType === 'FLAT' ? 'Amount' : 'Percentage'}
                />
                {discountType === 'PERCENTAGE' && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* notes Card */}
        <div className="bg-white  px-4 py-6 rounded border border-[rgba(0,0,0,.1)]">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
            </div>

            {/* {clientInfo.notes ? ( */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 mb-1">Add Customer Notes</p>
              <textarea
                value={clientInfo.notes}
                onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>
          </div>
        </div>
        <div className="bg-white  px-4 py-6 rounded border border-[rgba(0,0,0,.1)]">
          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            {/* Discount Form Section */}
            <div className="flex justify-between py-2 text-sm">
              <span>Discount</span>
              <span>${formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>
                TAX
                <span className="ml-2 bg-[#c49c3c] text-white text-xs p-1 rounded">13%</span>
              </span>
              <span>${formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-sm text-gray-800 border-t border-gray-200 mt-2">
              <span>GRAND TOTAL</span>
              <span>$ {formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Card */}
        <div className="bg-white rounded-sm  p-4 rounded md:relative fixed bottom-0 left-0 right-0 border border-[rgba(0,0,0,.1)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold">${formatCurrency(total)}</p>
              <p className="text-xs text-gray-500">Total Amount</p>
            </div>
            <button
              disabled={isLoading}
              className="bg-[#C49C3C] text-white py-2 px-5 rounded font-medium text-sm"
              onClick={() => submitQuoteData()}
            >
              {isLoading ? 'Submit...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
