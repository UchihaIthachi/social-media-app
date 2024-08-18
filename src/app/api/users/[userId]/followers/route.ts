import { validateRequest } from "@/auth"; // Function to validate if the request is authenticated.
import prisma from "@/lib/prisma"; // Prisma client instance for database operations.
import { FollowerInfo } from "@/lib/types"; // Type definition for follower information.

/**
 * Handles GET requests to fetch follower information for a user.
 * @param req - The incoming request object.
 * @param params - Object containing the userId parameter from the URL.
 * @returns A JSON response with follower information or an error message.
 */
export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
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

    // Fetch the user and their follower information from the database.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    // If the user is not found, return a 404 Not Found response.
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construct the follower information response.
    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    // Return the follower information as a JSON response.
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log the error for debugging purposes.
    console.error("Error fetching follower information:", error);

    // Return a 500 Internal Server Error response in case of unexpected issues.
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Handles POST requests to follow a user.
 * @param req - The incoming request object.
 * @param params - Object containing the userId parameter from the URL.
 * @returns A response indicating the result of the follow operation.
 */
export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
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

    // Perform a transaction to follow the user and create a notification.
    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        update: {}, // No update operation needed; just ensuring the record exists.
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    // Return an empty response indicating success.
    return new Response(null, { status: 204 }); // 204 No Content is appropriate here.
  } catch (error) {
    // Log the error for debugging purposes.
    console.error("Error following user:", error);

    // Return a 500 Internal Server Error response in case of unexpected issues.
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Handles DELETE requests to unfollow a user.
 * @param req - The incoming request object.
 * @param params - Object containing the userId parameter from the URL.
 * @returns A response indicating the result of the unfollow operation.
 */
export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
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

    // Perform a transaction to unfollow the user and delete related notifications.
    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    // Return an empty response indicating success.
    return new Response(null, { status: 204 }); // 204 No Content is appropriate here.
  } catch (error) {
    // Log the error for debugging purposes.
    console.error("Error unfollowing user:", error);

    // Return a 500 Internal Server Error response in case of unexpected issues.
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
