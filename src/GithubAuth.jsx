import { useClerk } from "@clerk/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function GithubInClerk() {
  const clerk = useClerk();
  const [host, setHost] = useState(null);

  useEffect(() => {
    function pick() {
      const main =
        document.querySelector(".clerk-screen .cl-main") ||
        document.querySelector(".cl-modalContent .cl-main");
      if (!main) {
        setHost(null);
        return;
      }
      let mount = main.querySelector(":scope > .clerk-github-mount");
      if (!mount) {
        mount = document.createElement("div");
        mount.className = "clerk-github-mount";
        main.insertBefore(mount, main.firstChild);
      }
      setHost(mount);
    }
    pick();
    const id = setInterval(pick, 250);
    return () => clearInterval(id);
  }, []);

  if (!host || !clerk.loaded) return null;

  return createPortal(
    <div className="clerk-github">
      <button
        type="button"
        className="hit auth-github"
        onClick={() => {
          const signIn = clerk.client?.signIn;
          if (!signIn) return;
          signIn.authenticateWithRedirect({
            strategy: "oauth_github",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: window.location.pathname || "/",
          });
        }}
      >
        GitHub
      </button>
    </div>,
    host,
  );
}
