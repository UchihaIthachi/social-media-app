// Importing the kyInstance from a custom utility file for making HTTP requests
import kyInstance from "@/lib/ky";

// Importing the FollowerInfo type, which defines the structure of the follower information
import { FollowerInfo } from "@/lib/types";

// Importing the useQuery hook from React Query for data fetching and caching
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch and manage follower information for a specific user.
 *
 * @param {string} userId - The ID of the user whose follower information is being fetched.
 * @param {FollowerInfo} initialState - The initial state of the follower information, used as a placeholder while data is being fetched.
 * @returns {QueryResult<FollowerInfo>} - The result of the query, including data, loading state, and any errors.
 */
export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  // Using the useQuery hook to fetch follower information for the given userId
  const query = useQuery({
    // The query key is used to uniquely identify the query in the cache
    queryKey: ["follower-info", userId],

    // The query function that fetches the follower information from the API
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),

    // The initial data is provided to immediately show something before the fetch completes
    initialData: initialState,

    // The staleTime is set to Infinity to avoid refetching the data unnecessarily
    staleTime: Infinity,
  });

  // Returning the query result, which includes data, error, loading status, etc.
  return query;
}
