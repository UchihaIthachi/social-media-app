import { validateRequest } from "@/auth"; // Import the function to validate user authentication.
import prisma from "@/lib/prisma"; // Import the Prisma client instance for database operations.
import { getPostDataInclude, PostsPage } from "@/lib/types"; // Import utility functions and types related to posts.
import { NextRequest } from "next/server"; // Import Next.js server request type.

/**
 * Handler function for GET requests to search for posts.
 * The function performs a search based on query parameters and returns paginated results.
 */
export async function GET(req: NextRequest) {
  try {
    // Extract the search query ("q") from the URL search parameters.
    // If no query is provided, default to an empty string.
    const q = req.nextUrl.searchParams.get("q") || "";

    // Extract the cursor parameter from the URL search parameters.
    // The cursor is used for pagination, allowing the client to fetch the next set of results.
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Modify the search query to use the PostgreSQL full-text search format.
    // The search query string is split by spaces and joined with " & " for AND logic in the search.
    const searchQuery = q.split(" ").join(" & ");

    // Define the number of posts to fetch in each request (pagination size).
    const pageSize = 10;

    // Validate the user authentication using a custom authentication function.
    const { user } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response.
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database to find posts that match the search criteria.
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          // Search posts by content using the formatted search query.
          {
            content: {
              search: searchQuery,
            },
          },
          // Search posts by the display name of the user who created the post.
          {
            user: {
              displayName: {
                search: searchQuery,
              },
            },
          },
          // Search posts by the username of the user who created the post.
          {
            user: {
              username: {
                search: searchQuery,
              },
            },
          },
        ],
      },
      include: getPostDataInclude(user.id), // Include additional data such as likes and comments using a helper function.
      orderBy: { createdAt: "desc" }, // Order posts by creation date in descending order (newest first).
      take: pageSize + 1, // Fetch one more post than the page size to determine if there are more results to paginate.
      cursor: cursor ? { id: cursor } : undefined, // Use the cursor for pagination if provided.
    });

    // Determine the cursor for the next page of results.
    // If more posts were fetched than the page size, set the next cursor to the ID of the last post.
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    // Prepare the response data, slicing the posts array to the page size and including the next cursor.
    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    // Return the response with the posts data as JSON.
    return Response.json(data);
  } catch (error) {
    // Log any errors to the server console for debugging purposes.
    console.error(error);

    // If an error occurs, return a 500 Internal Server Error response.
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
