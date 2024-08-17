import { z } from "zod";

// Define a reusable schema for a required non-empty string
const requiredString = z.string().trim().min(1, "This field cannot be empty");

// Password validation schema enforcing strong password rules
const passwordSchema = z
  .string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character")
  .min(
    1,
    "Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character",
  );

// Schema for validating sign-up form data
export const signUpSchema = z.object({
  // Email must be a non-empty, valid email address
  email: requiredString.email("Invalid email address"),

  // Username must be a non-empty string containing only letters, numbers, hyphens, and underscores
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed",
  ),

  // Password must be a non-empty string with a minimum length of 8 characters
  password: passwordSchema,
});

// Infer a TypeScript type from the sign-up schema
export type SignUpValues = z.infer<typeof signUpSchema>;

// Schema for validating login form data
export const loginSchema = z.object({
  // Username is required
  username: requiredString,

  // Password is required
  password: requiredString,
});

// Infer a TypeScript type from the login schema
export type LoginValues = z.infer<typeof loginSchema>;

// Schema for validating post creation data
export const createPostSchema = z.object({
  // Post content must be a non-empty string
  content: requiredString,

  // mediaIds must be an array of strings with a maximum of 5 elements
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
});

// Schema for validating user profile updates
export const updateUserProfileSchema = z.object({
  // Display name must be a non-empty string
  displayName: requiredString,

  // Bio is an optional string with a maximum length of 1000 characters
  bio: z.string().max(1000, "Must be at most 1000 characters").optional(),
});

// Infer a TypeScript type from the user profile update schema
export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

// Schema for validating comment creation data
export const createCommentSchema = z.object({
  // Comment content must be a non-empty string
  content: requiredString,
});

// No TypeScript type inference is shown here for the comment schema, but it could be done similarly:
// export type CreateCommentValues = z.infer<typeof createCommentSchema>;
