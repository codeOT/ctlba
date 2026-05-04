"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "date";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
        {label}
      </span>
      <textarea
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-300 bg-white p-4 md:p-5">
      <h3 className="mb-4 border-b border-zinc-200 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-800">
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function FileField({
  label,
  onChange,
}: {
  label: string;
  onChange: (file: File | null) => void;
}) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      onChange(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      window.alert("File must not be more than 10MB.");
      event.target.value = "";
      onChange(null);
      return;
    }

    onChange(file);
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
        {label}
      </span>
      <input
        required
        type="file"
        onChange={handleFileChange}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 file:mr-2 file:mt-1 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white hover:file:bg-zinc-700"
      />
    </label>
  );
}

export function SignatureField({
  label,
  signatureDataUrl,
  onSignatureChange,
}: {
  label: string;
  signatureDataUrl: string;
  onSignatureChange: (signature: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!signatureDataUrl) return;

    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
      ctx.drawImage(image, x, y, width, height);
    };
    image.src = signatureDataUrl;
  }, [signatureDataUrl]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#18181b";
    setIsDrawing(true);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(false);
    onSignatureChange(canvas.toDataURL("image/png"));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange("");
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      window.alert("Signature file must not be more than 10MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      onSignatureChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="md:col-span-2 space-y-3 overflow-hidden rounded-lg border border-zinc-200 p-3">
      <p className="text-sm font-medium text-zinc-700">{label}</p>
      <canvas
        ref={canvasRef}
        width={620}
        height={180}
        className="w-full rounded-md border border-zinc-300 bg-white touch-none"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={endDrawing}
        onPointerLeave={endDrawing}
        onPointerCancel={endDrawing}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={clearSignature}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Clear signature
        </button>
        <label className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100">
          Upload signature
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>
      {signatureDataUrl ? (
        <Image
          src={signatureDataUrl}
          alt="Signature preview"
          width={220}
          height={80}
          unoptimized
          className="h-20 rounded border border-zinc-200 bg-white p-1"
        />
      ) : (
        <p className="text-xs text-zinc-500">
          Draw with mouse/touch or upload an existing signature image.
        </p>
      )}
    </div>
  );
}
