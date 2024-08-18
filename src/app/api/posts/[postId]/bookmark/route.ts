import { validateRequest } from "@/auth"; // Import the function to validate user authentication
import prisma from "@/lib/prisma"; // Import the Prisma client for database interactions
import { BookmarkInfo } from "@/lib/types"; // Import the BookmarkInfo type for type safety

/**
 * Handler for the GET request to check if a specific post is bookmarked by the logged-in user.
 *
 * @param req - The incoming HTTP request object.
 * @param params - The route parameters containing the postId.
 * @returns A JSON response indicating whether the post is bookmarked.
 */
export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the request and get the logged-in user
    const { user: loggedInUser } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database to check if the post is bookmarked by the user
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id, // Use the logged-in user's ID
          postId, // Use the provided postId from the route parameters
        },
      },
    });

    // Construct the response data indicating the bookmark status
    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark, // Convert the bookmark object to a boolean
    };

    // Return the bookmark status as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // Return a 500 Internal Server Error response in case of an exception
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Handler for the POST request to bookmark a specific post for the logged-in user.
 *
 * @param req - The incoming HTTP request object.
 * @param params - The route parameters containing the postId.
 * @returns An empty response indicating success.
 */
export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the request and get the logged-in user
    const { user: loggedInUser } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Prisma's upsert method to create a bookmark if it doesn't exist, or do nothing if it does
    await prisma.bookmark.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.id, // Use the logged-in user's ID
          postId, // Use the provided postId from the route parameters
        },
      },
      create: {
        userId: loggedInUser.id, // Create a new bookmark with the user's ID
        postId, // Associate the bookmark with the provided postId
      },
      update: {}, // If the bookmark already exists, no update is necessary
    });

    // Return an empty response indicating success
    return new Response();
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // Return a 500 Internal Server Error response in case of an exception
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Handler for the DELETE request to remove a bookmark for a specific post by the logged-in user.
 *
 * @param req - The incoming HTTP request object.
 * @param params - The route parameters containing the postId.
 * @returns An empty response indicating success.
 */
export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the request and get the logged-in user
    const { user: loggedInUser } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Prisma to delete the bookmark if it exists for the logged-in user and specified post
    await prisma.bookmark.deleteMany({
      where: {
        userId: loggedInUser.id, // Use the logged-in user's ID
        postId, // Use the provided postId from the route parameters
      },
    });

    // Return an empty response indicating success
    return new Response();
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // Return a 500 Internal Server Error response in case of an exception
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
