import { useClerk } from "@clerk/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function GithubInClerk({ area = "page" }) {
  const clerk = useClerk();
  const [host, setHost] = useState(null);
  const selector =
    area === "modal" ? ".cl-modalContent .cl-main" : ".clerk-screen .cl-main";

  useEffect(() => {
    function pick() {
      const main = document.querySelector(selector);
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
  }, [selector]);

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
