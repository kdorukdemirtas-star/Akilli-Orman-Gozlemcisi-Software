import { useClerk } from "@clerk/react";

export function GithubSignIn({ className = "hit ghost" }) {
  const clerk = useClerk();
  return (
    <button
      type="button"
      className={className}
      disabled={!clerk.loaded}
      onClick={() => {
        const signIn = clerk.client?.signIn;
        if (!signIn) return;
        signIn.authenticateWithRedirect({
          strategy: "oauth_github",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      }}
    >
      GitHub
    </button>
  );
}
