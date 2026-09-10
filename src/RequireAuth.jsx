import { SignIn, useUser } from "@clerk/react";
import { useLocation } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import { clerkAppearance, useClerkFlag } from "./clerkFlag.js";
import "./site.css";

export function RequireAuth({
  children,
  product = "software",
  title,
  lead,
}) {
  if (!useClerkFlag()) {
    return (
      <Shell product={product}>
        <article className="coat-page">
          <header className="coat-hero">
            <div className="coat-hero-copy">
              <h1>{title}</h1>
              <p>
                Oturum için Clerk yayın anahtarı gerekir.
                VITE_CLERK_PUBLISHABLE_KEY yazılmadan bu sayfa açılmaz.
              </p>
            </div>
          </header>
        </article>
      </Shell>
    );
  }
  return (
    <SignedGate product={product} title={title} lead={lead}>
      {children}
    </SignedGate>
  );
}

function SignedGate({ children, product, title, lead }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();
  if (!isLoaded) {
    return (
      <Shell product={product} footer={false}>
        <p className="boot" role="status">
          Hesap okunuyor.
        </p>
      </Shell>
    );
  }
  if (!isSignedIn) {
    return (
      <Shell product={product}>
        <article className="coat-page">
          <header className="coat-hero coat-hero-auth">
            <div className="coat-hero-copy">
              <h1>{title}</h1>
              <p>{lead}</p>
            </div>
            <div className="clerk-screen">
              <SignIn
                routing="hash"
                appearance={clerkAppearance}
                forceRedirectUrl={location.pathname}
                fallbackRedirectUrl={location.pathname}
              />
            </div>
          </header>
        </article>
      </Shell>
    );
  }
  return children;
}
