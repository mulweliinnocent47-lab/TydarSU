import { useState } from "react";
import { ImageFile } from "@/lib/image-compress";
import { motion } from "framer-motion";
import { Columns2, Image as ImageIcon } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface ImageStageProps {
  file: ImageFile;
}

export function ImageStage({ file }: ImageStageProps) {
  const [compareMode, setCompareMode] = useState(false);
  const displayUrl = file.compressedUrl || file.previewUrl;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-stage p-6 md:p-12 overflow-hidden relative">
      {/* Toggle compare mode */}
      {file.compressedUrl && (
        <button
          onClick={() => setCompareMode((v) => !v)}
          className={`absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all active:scale-[0.98] ${
            compareMode
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          <Columns2 className="w-3.5 h-3.5" />
          Compare
        </button>
      )}

      <motion.div
        key={file.id + (compareMode ? "-compare" : "")}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-full max-h-full"
      >
        {compareMode && file.compressedUrl ? (
          <BeforeAfterSlider file={file} />
        ) : (
          <>
            <img
              src={displayUrl}
              alt="Compressed preview"
              className="max-w-full max-h-[65vh] object-contain rounded shadow-2xl"
            />
            <div className="absolute bottom-3 left-3 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded border border-border text-[10px] uppercase tracking-widest text-muted-foreground">
              {file.compressedBlob ? "Compressed" : "Processing…"}
            </div>
            {file.originalWidth > 0 && (
              <div className="absolute bottom-3 right-3 bg-background/60 backdrop-blur-md px-3 py-1.5 rounded border border-border text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
                {file.originalWidth}×{file.originalHeight}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
