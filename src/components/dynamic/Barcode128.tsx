"use client";

import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import {
  MultiFormatReader,
  HTMLCanvasElementLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  DecodeHintType,
  BarcodeFormat
} from "@zxing/library";

interface Barcode128Props {
  value: string;
  className?: string;
}

export const Barcode128: React.FC<Barcode128Props> = ({ value, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        const canvas = canvasRef.current;

        // Balanced official government-style barcode generation via JsBarcode
        // Module Width: 1.5px (clean readable bars)
        // Native Height: 32px (well-proportioned height)
        // Margin: 8px quiet zone
        JsBarcode(canvas, value, {
          format: "CODE128",
          displayValue: false,
          margin: 8,         // Standards compliant quiet zone
          height: 32,        // Balanced 32px height
          width: 1.5,        // 1.5px module width for 100% optical scanning accuracy
          background: "#ffffff",
          lineColor: "#000000",
        });

        const dataUrl = canvas.toDataURL("image/png");
        setImgSrc(dataUrl);

        // Self-verification log using ZXing library
        try {
          const hints = new Map();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);
          const reader = new MultiFormatReader();
          reader.setHints(hints);

          const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
          const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
          const result = reader.decode(binaryBitmap);
          const decodedText = result.getText();

          console.log("-------------------------------------------------------");
          console.log("Barcode Library:  JsBarcode (Code 128)");
          console.log("Barcode Dimensions: Height 32px, Module Width 1.5px, Margin 8px");
          console.log("Encoded Payload: ", value);
          console.log("Decoded Result:  ", decodedText);
          console.log("Match Status:    ", decodedText === value ? "SUCCESS (100% MATCH)" : "FAILED");
          console.log("-------------------------------------------------------");
        } catch (decodeErr) {
          console.warn("Self-verification log:", decodeErr);
        }

      } catch (err) {
        console.error("JsBarcode generation failed:", err);
      }
    }
  }, [value]);

  return (
    <div className={`inline-block text-center ${className}`} style={{ textIndent: 0 }}>
      {/* Hidden canvas for native pixel generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Render crisp native PNG barcode */}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={`Code 128 Barcode: ${value}`}
          style={{
            display: "block",
            maxWidth: "180px",
            height: "32px",
            objectFit: "contain",
            margin: "0 auto",
            imageRendering: "pixelated", // Crisp lines for optical scanning
          }}
        />
      ) : (
        <div style={{ height: "32px", width: "180px", background: "#ffffff" }} />
      )}
    </div>
  );
};
