// Importing required modules and packages
import { PrismaAdapter } from "@lucia-auth/adapter-prisma"; // Adapter for integrating Prisma with Lucia
import { Google } from "arctic"; // Arctic package for handling OAuth with Google
import { Lucia, Session, User } from "lucia"; // Lucia authentication library
import { cookies } from "next/headers"; // Next.js utility for handling cookies in server-side rendering
import { cache } from "react"; // React's caching utility to optimize expensive calculations
import prisma from "./lib/prisma"; // Importing Prisma client instance for database interaction

// Initializing PrismaAdapter with session and user models
const adapter = new PrismaAdapter(prisma.session, prisma.user);

// Configuring and initializing Lucia authentication library
export const lucia = new Lucia(adapter, {
  // Session cookie configuration
  sessionCookie: {
    expires: false, // Session cookie does not have an expiration by default
    attributes: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    },
  },
  // Defining how user attributes are retrieved from the database
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id, // User's ID
      username: databaseUserAttributes.username, // User's username
      displayName: databaseUserAttributes.displayName, // User's display name
      avatarUrl: databaseUserAttributes.avatarUrl, // User's avatar URL (nullable)
      googleId: databaseUserAttributes.googleId, // User's Google ID (nullable)
    };
  },
});

// Declaring Lucia module extensions for TypeScript
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia; // Registering Lucia type
    DatabaseUserAttributes: DatabaseUserAttributes; // Registering DatabaseUserAttributes type
  }
}

// Defining TypeScript interface for user attributes stored in the database
interface DatabaseUserAttributes {
  id: string; // User ID
  username: string; // Username
  displayName: string; // Display name
  avatarUrl: string | null; // Avatar URL, nullable
  googleId: string | null; // Google ID, nullable
}

// Initializing Google OAuth configuration using Arctic package
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!, // Google OAuth client ID
  process.env.GOOGLE_CLIENT_SECRET!, // Google OAuth client secret
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`, // Callback URL after Google authentication
);

// Function to validate requests by checking the session cookie
export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    // Retrieve the session ID from the cookies
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

    // If session ID is not present, return null for user and session
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    // Validate the session using Lucia
    const result = await lucia.validateSession(sessionId);

    try {
      // If the session is valid and fresh, update the session cookie
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name, // Name of the session cookie
          sessionCookie.value, // Value of the session cookie
          sessionCookie.attributes, // Attributes for cookie settings
        );
      }
      // If the session is invalid, create a blank session cookie to invalidate the session
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name, // Name of the blank session cookie
          sessionCookie.value, // Value of the blank session cookie
          sessionCookie.attributes, // Attributes for cookie settings
        );
      }
    } catch {
      // Error handling can be improved by logging or notifying developers
    }

    // Return the result, containing the user and session if valid, otherwise null
    return result;
  },
);
