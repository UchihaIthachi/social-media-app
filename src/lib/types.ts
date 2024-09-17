import { Prisma } from "@prisma/client";

/**
 * Constructs a Prisma `select` object to fetch user data with necessary fields.
 * This object specifies which user fields to select and how to filter related data,
 * such as followers, for a given logged-in user.
 *
 * @param loggedInUserId - The ID of the currently logged-in user to filter followers.
 * @returns An object defining the structure of the user data to be selected.
 */
export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true, // Selects the user's unique identifier.
    username: true, // Selects the user's username.
    displayName: true, // Selects the user's display name.
    avatarUrl: true, // Selects the user's avatar URL.
    bio: true, // Selects the user's biography.
    createdAt: true, // Selects the user's account creation date.
    followers: {
      where: {
        followerId: loggedInUserId, // Filters to only include followers of the logged-in user.
      },
      select: {
        followerId: true, // Selects the ID of the follower.
      },
    },
    _count: {
      select: {
        posts: true, // Counts the number of posts by the user.
        followers: true, // Counts the number of followers the user has.
      },
    },
  } satisfies Prisma.UserSelect; // Ensures the object matches Prisma's `UserSelect` type.
}

/**
 * Defines the TypeScript type for user data based on the `getUserDataSelect` function.
 */
export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>; // Derives the type from the `getUserDataSelect` function.
}>;

/**
 * Constructs a Prisma `include` object to fetch post data with related entities.
 * This object specifies which post fields to include and how to include related data,
 * such as user, attachments, likes, and bookmarks.
 *
 * @param loggedInUserId - The ID of the currently logged-in user to filter likes and bookmarks.
 * @returns An object defining the structure of the post data to be included.
 */
export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId), // Includes user data using the `getUserDataSelect` function.
    },
    attachments: true, // Includes attachments (media) related to the post.
    likes: {
      where: {
        userId: loggedInUserId, // Filters to only include likes from the logged-in user.
      },
      select: {
        userId: true, // Selects the ID of the user who liked the post.
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId, // Filters to only include bookmarks from the logged-in user.
      },
      select: {
        userId: true, // Selects the ID of the user who bookmarked the post.
      },
    },
    _count: {
      select: {
        likes: true, // Counts the number of likes on the post.
        comments: true, // Counts the number of comments on the post.
      },
    },
  } satisfies Prisma.PostInclude; // Ensures the object matches Prisma's `PostInclude` type.
}

/**
 * Defines the TypeScript type for post data based on the `getPostDataInclude` function.
 */
export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>; // Derives the type from the `getPostDataInclude` function.
}>;

/**
 * Constructs a Prisma `include` object to fetch comment data with related user data.
 * This object specifies which comment fields to include and how to include related data,
 * such as the user who posted the comment.
 *
 * @param loggedInUserId - The ID of the currently logged-in user to include user data.
 * @returns An object defining the structure of the comment data to be included.
 */
export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId), // Includes user data using the `getUserDataSelect` function.
    },
  } satisfies Prisma.CommentInclude; // Ensures the object matches Prisma's `CommentInclude` type.
}

/**
 * Defines the TypeScript type for comment data based on the `getCommentDataInclude` function.
 */
export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>; // Derives the type from the `getCommentDataInclude` function.
}>;

/**
 * Defines the structure of the page data for comments, including the comments and pagination information.
 */
export interface CommentsPage {
  comments: CommentData[]; // Array of comment data.
  previousCursor: string | null; // Cursor for pagination to fetch previous comments.
}

/**
 * Constructs a Prisma `include` object to fetch notification data with related user and post data.
 * This object specifies which notification fields to include and how to include related data,
 * such as the issuer of the notification and the associated post.
 *
 * @returns An object defining the structure of the notification data to be included.
 */
export const notificationsInclude = {
  issuer: {
    select: {
      username: true, // Selects the username of the notification issuer.
      displayName: true, // Selects the display name of the notification issuer.
      avatarUrl: true, // Selects the avatar URL of the notification issuer.
    },
  },
  post: {
    select: {
      content: true, // Selects the content of the post associated with the notification.
    },
  },
} satisfies Prisma.NotificationInclude; // Ensures the object matches Prisma's `NotificationInclude` type.

/**
 * Defines the TypeScript type for notification data based on the `notificationsInclude` object.
 */
export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude; // Derives the type from the `notificationsInclude` object.
}>;

/**
 * Defines the structure of the page data for notifications, including the notifications and pagination information.
 */
export interface NotificationsPage {
  notifications: NotificationData[]; // Array of notification data.
  nextCursor: string | null; // Cursor for pagination to fetch next notifications.
}

/**
 * Defines the structure of the information about followers for a user.
 */
export interface FollowerInfo {
  followers: number; // Total number of followers.
  isFollowedByUser: boolean; // Indicates whether the logged-in user follows this user.
}

/**
 * Defines the structure of the information about likes for a post.
 */
export interface LikeInfo {
  likes: number; // Total number of likes on the post.
  isLikedByUser: boolean; // Indicates whether the logged-in user has liked this post.
}

/**
 * Defines the structure of the information about bookmarks for a post.
 */
export interface BookmarkInfo {
  isBookmarkedByUser: boolean; // Indicates whether the logged-in user has bookmarked this post.
}

/**
 * Defines the structure of the information about unread notifications.
 */
export interface NotificationCountInfo {
  unreadCount: number; // Total number of unread notifications.
}

/**
 * Defines the structure of the information about unread messages.
 */
export interface MessageCountInfo {
  unreadCount: number; // Total number of unread messages.
}

// export type PostData = {
//   id: string;
//   content: string;
//   createdAt: Date;
//   user: {
//     id: string;
//     username: string;
//     displayName: string;
//     avatarUrl: string | null;
//     bio: string | null;
//     createdAt: Date;
//     followers: { followerId: string }[];
//     _count: {
//       posts: number;
//       followers: number;
//     };
//   };
//   likes: {
//     userId: string;
//   }[];
//   bookmarks: {
//     userId: string;
//   }[];
//   _count: {
//     likes: number;
//     bookmarks: number;
//     comments: number; // Added to support comment count
//   };
//   attachments: {
//     id: string;
//     url: string;
//     type: "IMAGE" | "VIDEO";
//   }[];
// };

// // @/lib/types.ts
// export type Post = {
//   id: string;
//   title: string;
//   content: string;
//   user: {
//     id: string;
//     username: string;
//     displayName: string;
//     avatarUrl: string | null;
//     bio: string | null;
//     createdAt: Date;
//     followers: { followerId: string }[];
//     _count: {
//       posts: number;
//       followers: number;
//     };
//   };
//   likes: {
//     userId: string;
//   }[];
//   bookmarks: {
//     userId: string;
//   }[];
//   _count: {
//     likes: number;
//     bookmarks: number;
//   };
//   attachments: {
//     url: string;
//   }[];
// };

// Update PostsPage if necessary
export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}
