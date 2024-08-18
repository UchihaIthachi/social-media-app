import { validateRequest } from "@/auth"; // Importing the function to validate user authentication
import prisma from "@/lib/prisma"; // Importing Prisma client for database interactions
import { getPostDataInclude, PostsPage } from "@/lib/types"; // Importing necessary types for data structure and relationships
import { NextRequest } from "next/server"; // Importing the NextRequest type from Next.js for handling incoming requests

/**
 * Handler for the GET request to retrieve a paginated list of posts bookmarked by the logged-in user.
 *
 * @param req - The incoming HTTP request object.
 * @returns A JSON response containing the bookmarked posts and a cursor for pagination.
 */
export async function GET(req: NextRequest) {
  try {
    // Retrieve the 'cursor' parameter from the query string for pagination, or set it to undefined if not provided
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Define the number of posts to retrieve per page
    const pageSize = 10;

    // Validate the request and get the logged-in user
    const { user } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database to find the posts bookmarked by the logged-in user, including the relevant post data
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id, // Filter bookmarks by the logged-in user's ID
      },
      include: {
        post: {
          include: getPostDataInclude(user.id), // Include post data with relationships specific to the user's ID
        },
      },
      orderBy: {
        createdAt: "desc", // Order the bookmarks by the creation date in descending order
      },
      take: pageSize + 1, // Retrieve one extra record to determine if there is a next page
      cursor: cursor ? { id: cursor } : undefined, // Use the cursor for pagination if provided
    });

    // Determine the next cursor for pagination; if there are more bookmarks than the page size, set the next cursor
    const nextCursor =
      bookmarks.length > pageSize ? bookmarks[pageSize].id : null;

    // Prepare the data to be returned, including the posts and the next cursor
    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post), // Map the bookmarks to their respective posts
      nextCursor, // Set the next cursor for pagination
    };

    // Return the data as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // Return a 500 Internal Server Error response in case of an exception
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
