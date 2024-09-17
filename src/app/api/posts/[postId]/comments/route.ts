import { validateRequest } from "@/auth"; // Import the function to validate user authentication.
import prisma from "@/lib/prisma"; // Import the Prisma client instance for database operations.
import { CommentsPage, getCommentDataInclude } from "@/lib/types"; // Import types and utility functions related to comments.
import { NextRequest } from "next/server"; // Import Next.js server request type.

/**
 * Handler function for GET requests to retrieve comments for a specific post.
 * The function performs pagination based on a cursor and returns comments in ascending order by creation date.
 */
export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } }, // Destructure the postId from the request parameters.
) {
  try {
    // Extract the cursor parameter from the URL search parameters.
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Define the number of comments to fetch in each request (pagination size).
    const pageSize = 5;

    // Validate the user authentication using a custom authentication function.
    const { user } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response.
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch comments from the database with pagination.
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: getCommentDataInclude(user.id),
      orderBy: { createdAt: "asc" },
      take: pageSize + 1, // Fetch one extra comment to check if there are more available.
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Determine if there is a next page and set the next cursor.
    const hasNextPage = comments.length > pageSize;
    const nextCursor = hasNextPage ? comments[pageSize].id : null;

    // Prepare the response data.
    const data: CommentsPage = {
      comments: comments.slice(0, pageSize), // Return only the requested page of comments.
      previousCursor: nextCursor, // Use `nextCursor` for pagination.
    };

    // Return the data as a JSON response.
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log the error for server-side debugging.
    console.error("Error fetching comments:", error);

    // Return a 500 Internal Server Error response if an exception occurs.
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
