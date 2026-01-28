import { TripDifficulty } from "@/app/(dash)/enums/tripDifficulty.enum";
import z from "zod";

const safeString = z
  .union([z.string(), z.array(z.string())])
  .transform((val) => {
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "string") return val;
    return "";
  })
  .catch("");

export const createActivitySchema = z.object({
  title: z.string().min(15, "Title must be at least 15 characters long"),
  slug: z.string("slug is required"),
  tripCategoryId: z.string().nullable().optional(),
  tripTypeId: z.string().nullable().optional(),
  cityId: z.string().nullable().optional(),
  regionId: z.string().nullable().optional(),
  difficultyLevel: z.enum(TripDifficulty).optional(),

  shortDescription: z.string().min(10, "Short description is too short"),
  fullDescription: z.string().min(10, "Full description is too short"),

  duration: z.string(),

  guestCapacity: z
    .number()
    .int()
    .positive("Guest capacity must be a positive integer"),

  itinerary: z
    .array(
      z.object({
        day: z
          .number()
          .int()
          .positive("Day must be a positive integer")
          .optional(),
        title: z.string().min(5, "Itinerary title is too short"),
        description: z.string().min(10, "Itinerary description is too short"),
      }),
    )
    .min(1, "At least one itinerary item is required"),

  meetingPoint: z.string(),
  dropOffPoint: z.string(),

  additionalInfo: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  faqs: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),
  highlights: safeString,
  locations: safeString,
  keywords: safeString,
  inclusions: safeString,
  exclusions: safeString,

  price: z.number().positive("Price must be greater than zero"),
  published: z.boolean().optional().default(false),
  seo: z.object({
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    featuredMedia: z.string().nullable().optional(),
    schema: z.string().nullable().optional(),
    metaKeywords: z.string().nullable().optional(),
    metaRobots: z.string().nullable().optional(),
    metaAuthor: z.string().nullable().optional(),
  }),
});
