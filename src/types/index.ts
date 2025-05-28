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
