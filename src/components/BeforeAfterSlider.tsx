import { useState, useRef, useCallback } from "react";
import { ImageFile } from "@/lib/image-compress";

interface BeforeAfterSliderProps {
  file: ImageFile;
}

export function BeforeAfterSlider({ file }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  if (!file.compressedUrl) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-full max-h-[65vh] overflow-hidden rounded shadow-2xl cursor-col-resize select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Compressed (bottom layer) */}
      <img
        src={file.compressedUrl}
        alt="Compressed"
        className="block w-full h-auto max-h-[65vh] object-contain"
        draggable={false}
      />

      {/* Original (clipped layer) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={file.previewUrl}
          alt="Original"
          className="block w-full h-auto max-h-[65vh] object-contain"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary-foreground z-10"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary-foreground border-2 border-primary flex items-center justify-center shadow-lg">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 7H1M4 7L2 5M4 7L2 9M10 7H13M10 7L12 5M10 7L12 9" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-background/70 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase tracking-widest text-muted-foreground z-20">
        Original
      </div>
      <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase tracking-widest text-muted-foreground z-20">
        Compressed
      </div>
    </div>
  );
}
