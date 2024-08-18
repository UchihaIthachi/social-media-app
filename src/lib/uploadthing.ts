// Import necessary types and functions from the application's modules and the UploadThing library
import { AppFileRouter } from "@/app/api/uploadthing/core"; // Import the type definition for the file router from the app's API
import { generateReactHelpers } from "@uploadthing/react"; // Import the function to generate React helpers for file uploads

// Generate React hooks and helper functions for handling file uploads
// The `AppFileRouter` type is used to define the API routes and methods for the upload functionality
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>();

/**
 * `generateReactHelpers` creates React-specific utilities for interacting with file upload routes.
 *
 * `useUploadThing` is a custom hook that provides an interface for uploading files and managing upload state.
 * `uploadFiles` is a function that initiates the file upload process based on the provided API routes.
 *
 * These helpers are typed with `AppFileRouter` to ensure type safety and alignment with the API schema.
 */
