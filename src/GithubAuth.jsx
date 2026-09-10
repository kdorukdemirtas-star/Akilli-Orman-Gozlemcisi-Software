import { useSignIn } from "@clerk/react";

export function GithubSignIn({ className = "hit ghost" }) {
  const { isLoaded, signIn } = useSignIn();
  if (!isLoaded || !signIn) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        signIn.authenticateWithRedirect({
          strategy: "oauth_github",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        })
      }
    >
      GitHub
    </button>
  );
}
