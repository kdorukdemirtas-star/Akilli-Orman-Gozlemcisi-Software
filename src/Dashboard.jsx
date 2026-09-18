import { useUser } from "@clerk/react";
import { STATION_ID } from "./config.js";
import { Lookout } from "./Lookout.jsx";
import { useLang } from "./lang.js";
import { Shell } from "./SiteNav.jsx";
import { useClerkFlag } from "./clerkFlag.js";
import "./site.css";

function BoardLookout({ stationId, lede }) {
  return (
    <Lookout
      stationId={stationId}
      lede={lede}
    />
  );
}

function SignedBoard() {
  const { isLoaded } = useUser();
  const { copy } = useLang();
  if (!isLoaded) return <p className="boot" role="status">{copy.chrome.panoAciliyor}</p>;
  return <BoardLookout stationId={STATION_ID} />;
}

export default function Dashboard() {
  const clerkOn = useClerkFlag();
  return (
    <Shell product="software" footer={false}>
      {clerkOn ? (
        <SignedBoard />
      ) : (
        <BoardLookout stationId={STATION_ID} />
      )}
    </Shell>
  );
}
