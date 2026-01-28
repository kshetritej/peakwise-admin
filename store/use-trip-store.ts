import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { TripFormData } from "@/app/(dash)/types/trip"

interface ImageState {
  selectedFiles: File[]
  previewUrls: string[]
  uploadedUrls: string[]
}

interface TripStore {
  // Step navigation
  currentStep: number
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Form data persistence (for localStorage)
  formData: TripFormData | null
  setFormData: (data: TripFormData) => void

  // Image management
  images: ImageState
  addSelectedFiles: (files: File[]) => void
  removePreview: (index: number) => void
  setUploadedUrls: (urls: string[]) => void
  addUploadedUrls: (urls: string[]) => void
  clearSelectedFiles: () => void
  setPreviewUrls: (urls: string[]) => void

  // Submission state
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
  submitError: string | null
  setSubmitError: (error: string | null) => void

  // Edit mode
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  editId: string | null
  setEditId: (id: string | null) => void

  // Reset
  resetStore: () => void

  _hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
}

const MAX_STEP = 8

const initialState = {
  currentStep: 1,
  formData: null,
  images: { selectedFiles: [], previewUrls: [], uploadedUrls: [] },
  isSubmitting: false,
  submitError: null,
  isEditing: false,
  editId: null,
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Step navigation
      setStep: (step) => set({ currentStep: Math.max(1, Math.min(MAX_STEP, step)) }),
      nextStep: () => set((state) => ({ currentStep: Math.min(MAX_STEP, state.currentStep + 1) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      // Form data
      setFormData: (data) => set({ formData: data }),

      // Image management
      addSelectedFiles: (files) =>
        set((state) => {
          const newPreviews = files.map((f) => URL.createObjectURL(f))
          return {
            images: {
              ...state.images,
              selectedFiles: [...state.images.selectedFiles, ...files],
              previewUrls: [...state.images.previewUrls, ...newPreviews],
            },
          }
        }),
      removePreview: (index) =>
        set((state) => {
          const url = state.images.previewUrls[index]
          if (url?.startsWith("blob:")) {
            URL.revokeObjectURL(url)
          }

          const newPreviewUrls = state.images.previewUrls.filter((_, i) => i !== index)

          if (url?.startsWith("blob:")) {
            const newSelectedFiles = [...state.images.selectedFiles]
            newSelectedFiles.shift()
            return {
              images: {
                ...state.images,
                previewUrls: newPreviewUrls,
                selectedFiles: newSelectedFiles,
              },
            }
          } else {
            return {
              images: {
                ...state.images,
                previewUrls: newPreviewUrls,
                uploadedUrls: state.images.uploadedUrls.filter((u) => u !== url),
              },
            }
          }
        }),
      setUploadedUrls: (urls) =>
        set((state) => ({
          images: { ...state.images, uploadedUrls: urls },
        })),
      addUploadedUrls: (urls) =>
        set((state) => ({
          images: {
            ...state.images,
            uploadedUrls: [...state.images.uploadedUrls, ...urls],
            previewUrls: [...state.images.previewUrls, ...urls],
          },
        })),
      clearSelectedFiles: () =>
        set((state) => ({
          images: { ...state.images, selectedFiles: [] },
        })),
      setPreviewUrls: (urls) =>
        set((state) => ({
          images: { ...state.images, previewUrls: urls },
        })),

      // Submission state
      setIsSubmitting: (value) => set({ isSubmitting: value }),
      setSubmitError: (error) => set({ submitError: error }),

      // Edit mode
      setIsEditing: (value) => set({ isEditing: value }),
      setEditId: (id) => set({ editId: id }),

      // Reset
      resetStore: () =>
        set({
          ...initialState,
          _hasHydrated: get()._hasHydrated,
        }),

      // Hydration
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "trip-form-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        isEditing: state.isEditing,
        editId: state.editId,
        images: {
          selectedFiles: [],
          previewUrls: state.images.uploadedUrls,
          uploadedUrls: state.images.uploadedUrls,
        },
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

export const useHasHydrated = () => useTripStore((state) => state._hasHydrated)
