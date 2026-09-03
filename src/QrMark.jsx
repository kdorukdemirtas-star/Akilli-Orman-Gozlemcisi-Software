import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QrMark({ href, caption }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !href) return;
    let cancelled = false;
    const scratch = document.createElement("canvas");
    QRCode.toCanvas(scratch, href, {
      width: 168,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#1a2e1c", light: "#ffffff" },
    })
      .then(() => {
        if (cancelled) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = scratch.width;
        canvas.height = scratch.height;
        ctx.drawImage(scratch, 0, 0);
      })
      .catch(() => {
        /* canvas stays blank; operator types the code */
      });
    return () => {
      cancelled = true;
    };
  }, [href]);

  return (
    <div className="qr-mark">
      <canvas
        ref={canvasRef}
        width={168}
        height={168}
        role="img"
        aria-label="Eşleme karekodu"
      />
      {caption ? <p>{caption}</p> : null}
    </div>
  );
}
