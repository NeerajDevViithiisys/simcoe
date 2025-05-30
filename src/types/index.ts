export enum ServiceType {
  EXTERIOR_WINDOW_CLEANING = 'EXTERIOR_WINDOW_CLEANING',
  INTERIOR_WINDOW_CLEANING = 'INTERIOR_WINDOW_CLEANING',
  EXTERIOR_GUTTER_CLEANING = 'EXTERIOR_GUTTER_CLEANING',
  INTERIOR_GUTTER_CLEANING = 'INTERIOR_GUTTER_CLEANING',
  WOOD_POWERWASHING = 'WOOD_POWERWASHING',
  CONCRETE_POWERWASHING = 'CONCRETE_POWERWASHING',
  SIDING_POWERWASHING = 'SIDING_POWERWASHING',
  ROOF_MOSS_REMOVAL = 'ROOF_MOSS_REMOVAL',
  HOUSE_SOFTWASHING = 'HOUSE_SOFTWASHING',
}

export enum QuoteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface ServiceRequest {
  serviceType: ServiceType;
  units: number;
  setupMinutes?: number;
  perUnitMinutes?: number;
  hourlyCrewCharge?: number;
  numberOfPersons?: number;
  discountType?: 'FLAT' | 'PERCENTAGE';
  discountValue?: number;
}

export interface ServiceCalculation {
  serviceType: ServiceType;
  numberOfUnits: number;
  numberOfPersons: number;
  setupMinutes: number;
  perUnitMinutes: number;
  hourlyCrewCharge: number;
  totalTimeMinutes: number;
  totalTimeHours: number;
  calendarSlotHours: number;
  subtotal: number;
  discount: number;
  tax: number;
  totalCost: number;
}

export interface params {
  page: number;
  limit: number;
  search?: string;
  userId?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  metaData: Record<string, unknown>;
}

export const formatServiceType = (type: string) => {
  if (!type) return '';
  return type
    .toLowerCase() // Make it all lowercase first
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char: string) => char.toUpperCase()); // Capitalize each word
};

// Add a function to get the unit label based on service type
export const getUnitLabel = (serviceType: ServiceType): string => {
  const unitLabels: Record<ServiceType, string> = {
    EXTERIOR_WINDOW_CLEANING: 'Window Panes',
    INTERIOR_WINDOW_CLEANING: 'Window Panes',
    EXTERIOR_GUTTER_CLEANING: 'LNFT',
    INTERIOR_GUTTER_CLEANING: 'LNFT',
    WOOD_POWERWASHING: 'Per Feet posts',
    CONCRETE_POWERWASHING: 'Area Sqft',
    SIDING_POWERWASHING: 'Area Sqft',
    ROOF_MOSS_REMOVAL: 'Area Square Footage',
    HOUSE_SOFTWASHING: 'Area Square Footage',
  };

  return unitLabels[serviceType] || 'Units';
};

export interface ClientInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phoneNumber: string;
  otherPhone?: string;
  email?: string;
  notes?: string;
}

export interface CalculationRow {
  serviceType: ServiceType;
  units: number;
  rate?: number;
  subtotal?: number;
  setupMinutes?: number;
  perUnitMinutes?: number;
  hourlyCrewCharge?: number;
  numberOfPersons?: number;
  totalTimeMinutes?: number;
  totalTimeHours?: number;
  calendarSlotHours?: number;
  totalCost?: number;
}
