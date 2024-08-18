import { validateRequest } from "@/auth"; // Importing function to validate user authentication
import prisma from "@/lib/prisma"; // Importing Prisma client for database operations
import { LikeInfo } from "@/lib/types"; // Importing LikeInfo type for type safety

/**
 * Handler for the GET request to check if a specific post is liked by the logged-in user and the total number of likes.
 *
 * @param req - The incoming HTTP request object.
 * @param params - The route parameters containing the postId.
 * @returns A JSON response with like information for the post.
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

    // Query the database to find the post and check if the user has liked it
    const post = await prisma.post.findUnique({
      where: { id: postId }, // Filter by post ID
      select: {
        likes: {
          where: {
            userId: loggedInUser.id, // Filter likes by the logged-in user's ID
          },
          select: {
            userId: true, // Select only the userId from the likes table
          },
        },
        _count: {
          select: {
            likes: true, // Count the total number of likes for the post
          },
        },
      },
    });

    // If the post is not found, return a 404 Not Found response
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Construct the response data with like count and whether the user has liked the post
    const data: LikeInfo = {
      likes: post._count.likes, // Total number of likes for the post
      isLikedByUser: !!post.likes.length, // Boolean indicating if the post is liked by the user
    };

    // Return the like information as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // Return a 500 Internal Server Error response in case of an exception
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Handler for the POST request to like a specific post by the logged-in user.
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

    // Query the database to find the post by ID and get the post owner's user ID
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true, // Select only the userId from the post table
      },
    });

    // If the post is not found, return a 404 Not Found response
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Use a transaction to ensure atomicity of the like creation and notification creation
    await prisma.$transaction([
      // Upsert a like for the post by the logged-in user
      prisma.like.upsert({
        where: {
          userId_postId: {
            userId: loggedInUser.id, // Use the logged-in user's ID
            postId, // Use the provided postId from the route parameters
          },
        },
        create: {
          userId: loggedInUser.id, // Create a new like with the user's ID
          postId, // Associate the like with the provided postId
        },
        update: {}, // If the like already exists, no update is necessary
      }),
      // Create a notification for the post owner if the liker is not the post owner
      ...(loggedInUser.id !== post.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id, // The user who liked the post
                recipientId: post.userId, // The owner of the post
                postId, // Associate the notification with the liked post
                type: "LIKE", // Set the notification type to "LIKE"
              },
            }),
          ]
        : []), // If the liker is the post owner, skip notification creation
    ]);

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
 * Handler for the DELETE request to remove a like from a specific post by the logged-in user.
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

    // Query the database to find the post by ID and get the post owner's user ID
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true, // Select only the userId from the post table
      },
    });

    // If the post is not found, return a 404 Not Found response
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Use a transaction to ensure atomicity of the like deletion and notification deletion
    await prisma.$transaction([
      // Delete the like for the post by the logged-in user
      prisma.like.deleteMany({
        where: {
          userId: loggedInUser.id, // Use the logged-in user's ID
          postId, // Use the provided postId from the route parameters
        },
      }),
      // Delete the associated notification if it exists
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id, // The user who liked (and now unliked) the post
          recipientId: post.userId, // The owner of the post
          postId, // Associate the deletion with the liked post
          type: "LIKE", // Set the notification type to "LIKE"
        },
      }),
    ]);

    // Return an empty response indicating success
    return new Response();
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // Return a 500 Internal Server Error response in case of an exception
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
