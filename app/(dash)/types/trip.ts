import { z } from "zod"

export const basicInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tripCategoryId: z.string().min(1, "Category is required"),
  tripTypeId: z.string().min(1, "Activity type is required"),
  shortDescription: z.string().min(20, "Must be at least 20 characters"),
  fullDescription: z.string().min(1, "Full description is required"),
})

export const capacityDurationSchema = z.object({
  duration: z.string().min(1, "Duration is required"),
  guestCapacity: z.number().min(1, "At least 1 guest required"),
  locations: z.string().min(1, "At least one location required"),
})

export const itineraryItemSchema = z.object({
  day: z.number(),
  title: z.string().min(1, "Day title is required"),
  description: z.string().min(1, "Description is required"),
})

export const itinerarySchema = z.object({
  itinerary: z.array(itineraryItemSchema).min(1, "At least one day required"),
})

export const inclusionsExclusionsSchema = z.object({
  inclusions: z.string().min(1, "Inclusions are required"),
  exclusions: z.string().min(1, "Exclusions are required"),
})

export const meetingPointsSchema = z.object({
  meetingPoint: z.string().min(1, "Meeting point is required"),
  dropOffPoint: z.string().min(1, "Dropoff point is required"),
})

export const mediaHighlightsSchema = z.object({
  highlights: z.string().min(1, "Highlights are required"),
  keywords: z.string().min(1, "Keywords are required"),
})

export const pricingSchema = z.object({
  price: z.number().min(0.01, "Price must be positive"),
})

export const additionalInfoItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
})

export const additionalInfoSchema = z.object({
  additionalInfo: z.array(additionalInfoItemSchema).min(1, "At least one info item required"),
})

export const tripFormSchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(1, "Title is required"),
  slug: z.string(),
  tripCategoryId: z.string().min(1, "Category is required"),
  tripTypeId: z.string().min(1, "Activity type is required"),
  shortDescription: z.string().min(20, "Must be at least 20 characters"),
  fullDescription: z.string().min(1, "Full description is required"),
  // Step 2: Capacity & Duration
  duration: z.string().min(1, "Duration is required"),
  guestCapacity: z.coerce.number().min(1, "At least 1 guest required"),
  locations: z.string().min(1, "At least one location required"),
  // Step 3: Itinerary
  itinerary: z.array(itineraryItemSchema).min(1, "At least one day required"),
  // Step 4: Inclusions/Exclusions
  inclusions: z.string().min(1, "Inclusions are required"),
  exclusions: z.string().min(1, "Exclusions are required"),
  // Step 5: Meeting Points
  meetingPoint: z.string().min(1, "Meeting point is required"),
  dropOffPoint: z.string().min(1, "Dropoff point is required"),
  // Step 6: Media & Highlights
  highlights: z.string().min(1, "Highlights are required"),
  keywords: z.string().min(1, "Keywords are required"),
  // Step 7: Pricing
  price: z.coerce.number().min(0.01, "Price must be positive"),
  // Step 8: Additional Info
  additionalInfo: z.array(additionalInfoItemSchema).min(1, "At least one info item required"),
})

export type TripFormData = z.infer<typeof tripFormSchema>
export type ItineraryItem = z.infer<typeof itineraryItemSchema>
export type AdditionalInfoItem = z.infer<typeof additionalInfoItemSchema>

export const STEP_FIELDS: Record<number, (keyof TripFormData)[]> = {
  1: ["title", "tripCategoryId", "tripTypeId", "shortDescription", "fullDescription"],
  2: ["duration", "guestCapacity", "locations"],
  3: ["itinerary"],
  4: ["inclusions", "exclusions"],
  5: ["meetingPoint", "dropOffPoint"],
  6: ["highlights", "keywords"],
  7: ["price"],
  8: ["additionalInfo"],
}

export interface Category {
  id: string
  categoryName: string
}

export interface ActivityType {
  id: string
  tripTypeName: string
}
