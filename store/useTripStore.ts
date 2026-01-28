import { create } from 'zustand';

export type TripData = {
  title: string;
  category: string;
  activityType: string;
  images: string[];
  shortDescription: string;
  fullDescription: string;
  duration: string;
  guestCapacity: string;
  highlights: string[];
  itinerary: Record<string, unknown>;
  inclusions: string;
  exclusions: string[];
  meetingPoint: string;
  dropOffPoint: string;
  whatToBring: string[];
  price: number;
  locations: string[];
  keywords: string[];
  additionalInfo: Record<string, unknown>;
  published: boolean;
};

type TripStore = {
  tripData: TripData;
  currentStep: number;
  updateTripData: (data: Partial<TripData>) => void;
  setStep: (step: number) => void;
  resetTrip: () => void;
};

const initialTripState: TripData = {
  title: '',
  category: '',
  activityType: '',
  images: [],
  shortDescription: '',
  fullDescription: '',
  duration: '',
  guestCapacity: '',
  highlights: [],
  itinerary: {},
  inclusions: '',
  exclusions: [],
  meetingPoint: '',
  dropOffPoint: '',
  whatToBring: [],
  price: 0.00,
  locations: [],
  keywords: [],
  additionalInfo: {},
  published: false,
};

export const useTripStore = create<TripStore>((set) => ({
  tripData: initialTripState,
  currentStep: 1,
  updateTripData: (data) => 
    set((state) => ({ tripData: { ...state.tripData, ...data } })),
  setStep: (step) => set({ currentStep: step }),
  resetTrip: () => set({ tripData: initialTripState, currentStep: 1 }),
}));