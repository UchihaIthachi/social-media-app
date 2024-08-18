import { validateRequest } from "@/auth"; // Function to validate if the request is authenticated.
import prisma from "@/lib/prisma"; // Prisma client instance for database operations.
import streamServerClient from "@/lib/stream"; // Stream client for updating user information.
import { createUploadthing, FileRouter } from "uploadthing/next"; // Uploadthing utilities for file handling.
import { UploadThingError, UTApi } from "uploadthing/server"; // Custom error class and API for file deletion in Uploadthing.

const f = createUploadthing(); // Initialize Uploadthing instance for creating file routers.

/**
 * File router configuration for handling file uploads in different contexts.
 */
export const fileRouter = {
  // Route for uploading avatars.
  avatar: f({
    image: { maxFileSize: "512KB" }, // Restrict file size for avatars to 512KB.
  })
    .middleware(async () => {
      // Middleware to validate the request and check user authentication.
      const { user } = await validateRequest();

      // If the user is not authenticated, throw an unauthorized error.
      if (!user) throw new UploadThingError("Unauthorized");

      // Return the user object to be used in the upload handler.
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Function called when the avatar upload is complete.

      // Extract the old avatar URL from the user metadata.
      const oldAvatarUrl = metadata.user.avatarUrl;

      // If there is an old avatar URL, delete the old file from the server.
      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];

        await new UTApi().deleteFiles(key); // Delete the old file using UploadThing API.
      }

      // Replace the file URL with the app-specific prefix.
      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      // Update the user's avatar URL in both the Prisma database and Stream server.
      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: {
            avatarUrl: newAvatarUrl,
          },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ]);

      // Return the new avatar URL as the result of the upload.
      return { avatarUrl: newAvatarUrl };
    }),

  // Route for uploading attachments such as images and videos.
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 }, // Restrict images to 4MB and a maximum of 5 files.
    video: { maxFileSize: "64MB", maxFileCount: 5 }, // Restrict videos to 64MB and a maximum of 5 files.
  })
    .middleware(async () => {
      // Middleware to validate the request and check user authentication.
      const { user } = await validateRequest();

      // If the user is not authenticated, throw an unauthorized error.
      if (!user) throw new UploadThingError("Unauthorized");

      // Return an empty object since no additional metadata is needed.
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      // Function called when the attachment upload is complete.

      // Create a new media entry in the Prisma database.
      const media = await prisma.media.create({
        data: {
          url: file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
          ),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO", // Determine the media type based on the file MIME type.
        },
      });

      // Return the ID of the newly created media entry.
      return { mediaId: media.id };
    }),
} satisfies FileRouter; // Ensure the object structure matches the FileRouter type.

export type AppFileRouter = typeof fileRouter; // Export the file router type for use elsewhere in the application.
