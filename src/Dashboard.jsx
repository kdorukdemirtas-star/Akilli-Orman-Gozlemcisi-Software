import { STATION_ID } from "./config.js";
import { Lookout } from "./Lookout.jsx";
import { Shell } from "./SiteNav.jsx";
import "./site.css";

export default function Dashboard() {
  return (
    <Shell product="software" footer={false}>
      <Lookout
        stationId={STATION_ID}
        kicker="Pano"
        lede="Eşik: 100 °C ve alev."
      />
    </Shell>
  );
}
