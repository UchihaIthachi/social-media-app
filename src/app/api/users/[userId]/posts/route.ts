// Import necessary functions and modules from local and external libraries
import { validateRequest } from "@/auth"; // Function to validate the incoming request
import prisma from "@/lib/prisma"; // Prisma client instance for database interaction
import { getPostDataInclude, PostsPage } from "@/lib/types"; // Type definitions and utilities
import { NextRequest } from "next/server"; // Type for handling incoming Next.js requests

// Define the GET function to handle incoming GET requests to this API route
export async function GET(
  req: NextRequest, // The incoming request object
  { params: { userId } }: { params: { userId: string } }, // The userId parameter extracted from the route
) {
  try {
    // Get the 'cursor' parameter from the query string (used for pagination), or set it to undefined if not provided
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Define the number of posts to retrieve per page
    const pageSize = 10;

    // Validate the incoming request to ensure the user is authenticated
    const { user } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database to find posts associated with the provided userId
    const posts = await prisma.post.findMany({
      where: { userId }, // Filter posts by the userId
      include: getPostDataInclude(user.id), // Include related data based on the user's id
      orderBy: { createdAt: "desc" }, // Order posts by creation date in descending order
      take: pageSize + 1, // Retrieve one extra post than the page size to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined, // If a cursor is provided, use it to paginate results
    });

    // Determine the cursor for the next page if there are more posts than the page size
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    // Construct the response data, slicing the posts to match the page size and including the next cursor
    const data: PostsPage = {
      posts: posts.slice(0, pageSize), // Only return the number of posts equal to pageSize
      nextCursor, // Include the cursor for the next page if it exists
    };

    // Return the data as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log the error to the server console for debugging
    console.error(error);
    // Return a 500 Internal Server Error response if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
