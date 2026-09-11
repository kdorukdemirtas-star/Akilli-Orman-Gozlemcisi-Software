import { A11Y_GAPS, A11Y_LEAD, A11Y_SECTIONS } from "./legalPagesCopy.js";
import { LegalNotice } from "./LegalNotice.jsx";

const GAP_COLUMNS = [
  { key: "where", label: "Yer" },
  { key: "gap", label: "Boşluk" },
];

export default function Erisilebilirlik() {
  return (
    <LegalNotice
      title="Erişilebilirlik"
      lead={A11Y_LEAD}
      sections={A11Y_SECTIONS}
      table={{
        sectionId: "bosluk",
        caption: "Bilinen erişilebilirlik boşlukları",
        columns: GAP_COLUMNS,
        rows: A11Y_GAPS,
      }}
    />
  );
}
