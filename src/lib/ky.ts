// Importing the `ky` HTTP client for making network requests
import ky from "ky";

// Creating a customized instance of `ky` with additional configuration
const kyInstance = ky.create({
  // Custom parser to automatically convert any JSON field ending in "At" to a Date object
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      // Convert "At" fields to Date objects, useful for handling timestamps from APIs
      if (key.endsWith("At") && typeof value === "string")
        return new Date(value);
      return value; // Return other values unchanged
    }),
  timeout: 10000, // Set a default timeout of 10 seconds for requests
  retry: {
    limit: 3, // Retry failed requests up to 3 times
    methods: ["get", "post"], // Retry only on GET and POST requests
  },
});

// Exporting the customized `ky` instance for use in other parts of the application
export default kyInstance;
