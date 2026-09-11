import { EULA_LEAD, EULA_SECTIONS } from "./legalPagesCopy.js";
import { LegalNotice } from "./LegalNotice.jsx";

export default function Eula() {
  return <LegalNotice title="Kullanım şartları" lead={EULA_LEAD} sections={EULA_SECTIONS} />;
}
