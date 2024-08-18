// Importing the `StreamChat` class from the Stream Chat SDK
import { StreamChat } from "stream-chat";

// Safely creating a singleton instance of the StreamChat server client
const streamServerClient = (() => {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;
  const apiSecret = process.env.STREAM_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Stream API keys are not set. Please check your environment variables.",
    );
  }

  return StreamChat.getInstance(apiKey, apiSecret);
})();

// Exporting the StreamChat client instance for use in other parts of the application
export default streamServerClient;
