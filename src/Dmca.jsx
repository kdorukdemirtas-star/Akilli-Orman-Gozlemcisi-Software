import { DMCA_LEAD, DMCA_SECTIONS } from "./legalPagesCopy.js";
import { LegalNotice } from "./LegalNotice.jsx";

export default function Dmca() {
  return <LegalNotice title="Telif (DMCA)" lead={DMCA_LEAD} sections={DMCA_SECTIONS} />;
}
