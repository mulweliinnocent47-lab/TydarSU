export interface ImageFile {
  id: string;
  file: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  compressedBlob: Blob | null;
  compressedSize: number;
  previewUrl: string;
  compressedUrl: string | null;
  outputFormat: OutputFormat;
  resizeWidth: number | null;
  resizeHeight: number | null;
}

export type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getReduction(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.max(0, Math.round(((original - compressed) / original) * 100));
}

export async function compressImage(
  file: File,
  quality: number,
  format: OutputFormat,
  targetWidth?: number | null,
  targetHeight?: number | null
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width;
      let h = img.height;

      // Resize if dimensions provided
      if (targetWidth && targetHeight && (targetWidth !== w || targetHeight !== h)) {
        w = targetWidth;
        h = targetHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("Canvas context unavailable"));
      }
      // Drawing to canvas strips all EXIF/metadata
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return reject(new Error("Compression failed"));
          resolve({ blob, width: w, height: h });
        },
        format,
        format === "image/png" ? undefined : quality / 100
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/** Smart auto-optimize: picks best format & quality for smallest size */
export async function autoOptimize(
  file: File
): Promise<{ blob: Blob; format: OutputFormat; quality: number; width: number; height: number }> {
  const candidates: { format: OutputFormat; quality: number }[] = [
    { format: "image/webp", quality: 80 },
    { format: "image/webp", quality: 70 },
    { format: "image/jpeg", quality: 80 },
    { format: "image/jpeg", quality: 70 },
  ];

  let best: { blob: Blob; format: OutputFormat; quality: number; width: number; height: number } | null = null;

  for (const c of candidates) {
    const result = await compressImage(file, c.quality, c.format);
    if (!best || result.blob.size < best.blob.size) {
      best = { ...result, format: c.format, quality: c.quality };
    }
  }

  return best!;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}
