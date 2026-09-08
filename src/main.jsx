import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import "leaflet/dist/leaflet.css";
import App from "./App.jsx";
import { clerkPublishableKey } from "./clerkFlag.js";
import { ErrorBoundary } from "./ErrorBoundary.jsx";
import { registerPwa } from "./pwa.js";
import "./index.css";

const clerkKey = clerkPublishableKey();
const tree = (
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {clerkKey ? (
      <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
        {tree}
      </ClerkProvider>
    ) : (
      tree
    )}
  </StrictMode>
);

registerPwa();
