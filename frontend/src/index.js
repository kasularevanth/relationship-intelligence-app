import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ✅ FIX: Global error handler for unhandled cancellation errors
window.addEventListener("unhandledrejection", (event) => {
  const error = event.reason;

  // Ignore cancellation errors
  if (
    error?.name === "AbortError" ||
    error?.name === "CanceledError" ||
    error?.message?.includes("canceled")
  ) {
    event.preventDefault(); // Prevent the error from being logged
    return;
  }

  // Let other errors be handled normally
  console.error("Unhandled promise rejection:", error);
});

// ✅ FIX: Global error handler for other errors
window.addEventListener("error", (event) => {
  const error = event.error;

  // Ignore cancellation errors
  if (
    error?.name === "AbortError" ||
    error?.name === "CanceledError" ||
    error?.message?.includes("canceled")
  ) {
    event.preventDefault();
    return;
  }
});

// Add Google Fonts dynamically
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="637473573743-gdnnfg3es79073ra3q9r6r4b0mhtah7f.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
