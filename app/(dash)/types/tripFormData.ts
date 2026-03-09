import { TripDifficulty } from "@/app/(dash)/enums/tripDifficulty.enum";

export interface TripFormData {
  title: string;
  slug: string;
  tripCategoryId?: string;
  tripTypeId?: string;
  cityId?: string;
  difficultyLevel: TripDifficulty;
  regionId?: string;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  maximumAltitude: string;
  accommodations: string;
  guestCapacity: number;
  locations: string;
  inclusions: string;
  exclusions: string;
  meetingPoint: string;
  dropOffPoint: string;
  price: number;
  highlights: string;
  keywords: string;
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    duration: string;
    distance: string;
    ascent: string;
    descent: string;
    meals: string;
    accommodations: string;
  }>;
  additionalInfo: Array<{ title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    featuredMedia?: string;
    schema?: string;
    metaKeywords?: string;
    metaRobots?: string;
    metaAuthor?: string;
  };
}
