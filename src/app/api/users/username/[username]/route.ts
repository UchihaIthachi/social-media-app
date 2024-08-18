import { validateRequest } from "@/auth"; // Function to validate if the request is authenticated.
import prisma from "@/lib/prisma"; // Prisma client instance for database operations.
import { getUserDataSelect } from "@/lib/types"; // Utility function to specify which user fields to include in the response.

/**
 * Handles the GET request to fetch user data based on their username.
 * @param req - The incoming request object.
 * @param params - Object containing the username parameter from the URL.
 * @returns A JSON response with the user data or an error message.
 */
export async function GET(
  req: Request,
  { params: { username } }: { params: { username: string } },
) {
  try {
    // Validate the request to check if the user is authenticated.
    const { user: loggedInUser } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response.
    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the user from the database using the provided username.
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username, // Ensure case-insensitive comparison.
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(loggedInUser.id), // Select the necessary fields based on the logged-in user's ID.
    });

    // If the user is not found, return a 404 Not Found response.
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the found user data as a JSON response.
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log the error for debugging purposes.
    console.error("Error fetching user data:", error);

    // Return a 500 Internal Server Error response in case of unexpected issues.
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
