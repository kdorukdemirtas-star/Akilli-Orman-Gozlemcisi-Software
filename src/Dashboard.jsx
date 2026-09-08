import { useUser } from "@clerk/react";
import { STATION_ID } from "./config.js";
import { Lookout } from "./Lookout.jsx";
import { Shell } from "./SiteNav.jsx";
import { useClerkFlag } from "./clerkFlag.js";
import { stationFromUser } from "./stationBind.js";
import "./site.css";

function BoardLookout({ stationId, lede }) {
  return (
    <Lookout
      stationId={stationId}
      kicker="Pano"
      lede={lede}
    />
  );
}

function SignedBoard() {
  const { isLoaded, user } = useUser();
  const bound = stationFromUser(user);
  const stationId = bound || STATION_ID;
  const lede = bound ? bound : "Eşik: 100 °C ve alev.";
  if (!isLoaded) return <p className="boot" role="status">Pano açılıyor.</p>;
  return <BoardLookout stationId={stationId} lede={lede} />;
}

export default function Dashboard() {
  const clerkOn = useClerkFlag();
  return (
    <Shell product="software" footer={false}>
      {clerkOn ? (
        <SignedBoard />
      ) : (
        <BoardLookout stationId={STATION_ID} lede="Eşik: 100 °C ve alev." />
      )}
    </Shell>
  );
}
