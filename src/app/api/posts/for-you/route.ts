import { validateRequest } from "@/auth"; // Import the function to validate user authentication
import prisma from "@/lib/prisma"; // Import the Prisma client for interacting with the database
import { getPostDataInclude, PostsPage } from "@/lib/types"; // Import necessary types for data structure and relationships
import { NextRequest } from "next/server"; // Import the NextRequest type from Next.js for handling HTTP requests

/**
 * Handler for the GET request to retrieve a paginated list of posts.
 *
 * @param req - The incoming HTTP request object.
 * @returns A JSON response containing the posts and a cursor for pagination.
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

    // Query the database to find posts, ordering by creation date in descending order
    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id), // Include related data based on the user's ID
      orderBy: { createdAt: "desc" }, // Order the posts by the creation date in descending order
      take: pageSize + 1, // Retrieve one extra record to determine if there is a next page
      cursor: cursor ? { id: cursor } : undefined, // Use the cursor for pagination if provided
    });

    // Determine the next cursor for pagination; if there are more posts than the page size, set the next cursor
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    // Prepare the data to be returned, including the posts and the next cursor
    const data: PostsPage = {
      posts: posts.slice(0, pageSize), // Limit the posts to the page size
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
