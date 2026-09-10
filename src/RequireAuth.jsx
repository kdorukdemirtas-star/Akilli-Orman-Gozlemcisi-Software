import { SignInButton, SignUpButton, useUser } from "@clerk/react";
import { GithubSignIn } from "./GithubAuth.jsx";
import { Shell } from "./SiteNav.jsx";
import { useClerkFlag } from "./clerkFlag.js";
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
          <header className="coat-hero">
            <div className="coat-hero-copy">
              <h1>{title}</h1>
              <p>{lead}</p>
            </div>
          </header>
          <p className="nav-auth">
            <SignInButton mode="modal">
              <button type="button" className="hit ghost">
                Giriş
              </button>
            </SignInButton>
            <GithubSignIn />
            <SignUpButton mode="modal">
              <button type="button" className="hit">
                Kayıt
              </button>
            </SignUpButton>
          </p>
        </article>
      </Shell>
    );
  }
  return children;
}
