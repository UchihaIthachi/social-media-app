// Import the Toaster component for displaying toast notifications
import { Toaster } from "@/components/ui/toaster";

// Import necessary modules from UploadThing for server-side rendering
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes"; // ThemeProvider for handling light/dark mode
import localFont from "next/font/local"; // Utility for loading local fonts
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "./api/uploadthing/core"; // File router for handling file uploads
import "./globals.css"; // Global CSS styles
import ReactQueryProvider from "./ReactQueryProvider"; // Import the ReactQueryProvider component

// Load the Geist Sans variable font locally with custom CSS variable for font family
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

// Load the Geist Mono variable font locally with custom CSS variable for font family
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

// Define metadata for the HTML document
export const metadata: Metadata = {
  title: {
    template: "%s | Hbook", // Template for dynamic page titles
    default: "Hbook", // Default title when no template is used
  },
  description: "The social media app for powernerds", // Description for SEO
};

// RootLayout component defines the global layout structure for the app
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set the HTML language attribute to English
    <html lang="en">
      {/* Apply custom fonts via CSS variables in the body element */}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Integrate NextSSRPlugin for UploadThing's server-side rendering */}
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        {/* Wrap the application with React Query and Theme Providers */}
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class" // Attribute to apply theme class to HTML elements
            defaultTheme="system" // Use the system's theme preference by default
            enableSystem // Enable automatic switching based on system theme
            disableTransitionOnChange // Disable transitions during theme change for better UX
          >
            {children}{" "}
            {/* Render the children components within the theme provider */}
          </ThemeProvider>
        </ReactQueryProvider>
        {/* Render the Toaster component for toast notifications */}
        <Toaster />
      </body>
    </html>
  );
}
