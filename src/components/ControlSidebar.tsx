import { useState, useEffect } from "react";
import { ImageFile, OutputFormat, formatBytes, getReduction } from "@/lib/image-compress";
import { Download, Image as ImageIcon, Wand2, Lock, Unlock, ShieldCheck } from "lucide-react";

interface ControlSidebarProps {
  currentFile: ImageFile | null;
  quality: number;
  outputFormat: OutputFormat;
  onQualityChange: (q: number) => void;
  onFormatChange: (fmt: OutputFormat) => void;
  onDownloadSingle: () => void;
  isProcessing: boolean;
  onSmartOptimize: () => void;
  onResize: (id: string, w: number | null, h: number | null) => void;
  onReprocessSingle: (id: string) => void;
}

const formats: { value: OutputFormat; label: string }[] = [
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
];

export function ControlSidebar({
  currentFile,
  quality,
  outputFormat,
  onQualityChange,
  onFormatChange,
  onDownloadSingle,
  isProcessing,
  onSmartOptimize,
  onResize,
  onReprocessSingle,
}: ControlSidebarProps) {
  const reduction = currentFile?.compressedBlob
    ? getReduction(currentFile.originalSize, currentFile.compressedSize)
    : 0;

  const [resizeW, setResizeW] = useState("");
  const [resizeH, setResizeH] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const aspectRatio = currentFile && currentFile.originalWidth > 0
    ? currentFile.originalWidth / currentFile.originalHeight
    : 1;

  // Sync resize inputs when file changes
  useEffect(() => {
    if (currentFile && currentFile.originalWidth > 0) {
      setResizeW(String(currentFile.resizeWidth || currentFile.originalWidth));
      setResizeH(String(currentFile.resizeHeight || currentFile.originalHeight));
    }
  }, [currentFile?.id, currentFile?.originalWidth, currentFile?.originalHeight]);

  const handleWidthChange = (val: string) => {
    setResizeW(val);
    if (lockAspect && val) {
      const w = parseInt(val);
      if (!isNaN(w)) setResizeH(String(Math.round(w / aspectRatio)));
    }
  };

  const handleHeightChange = (val: string) => {
    setResizeH(val);
    if (lockAspect && val) {
      const h = parseInt(val);
      if (!isNaN(h)) setResizeW(String(Math.round(h * aspectRatio)));
    }
  };

  const applyResize = () => {
    if (!currentFile) return;
    const w = parseInt(resizeW);
    const h = parseInt(resizeH);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      onResize(currentFile.id, w, h);
      // Trigger reprocess after state update
      setTimeout(() => onReprocessSingle(currentFile.id), 50);
    }
  };

  const resetResize = () => {
    if (!currentFile) return;
    setResizeW(String(currentFile.originalWidth));
    setResizeH(String(currentFile.originalHeight));
    onResize(currentFile.id, null, null);
    setTimeout(() => onReprocessSingle(currentFile.id), 50);
  };

  return (
    <aside className="w-full lg:w-80 border-l border-border bg-background p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
      {/* Smart Optimize */}
      <button
        onClick={onSmartOptimize}
        disabled={isProcessing || !currentFile}
        className="w-full bg-success text-success-foreground py-3 rounded-md font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Wand2 className="w-4 h-4" />
        Smart Auto-Optimize
      </button>

      {/* Quality */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 block">
          Compression
        </label>
        <input
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => onQualityChange(Number(e.target.value))}
          disabled={outputFormat === "image/png"}
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Quality</span>
          <span className="tabular-nums font-medium text-foreground">
            {outputFormat === "image/png" ? "Lossless" : `${quality}%`}
          </span>
        </div>
      </div>

      {/* Format */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 block">
          Output Format
        </label>
        <div className="flex gap-2">
          {formats.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => onFormatChange(fmt.value)}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-all active:scale-[0.98] border ${
                outputFormat === fmt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resize */}
      {currentFile && currentFile.originalWidth > 0 && (
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 block">
            Resize
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={resizeW}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-xs tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="W"
              min={1}
            />
            <button
              onClick={() => setLockAspect((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
            >
              {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <input
              type="number"
              value={resizeH}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-xs tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="H"
              min={1}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={applyResize}
              disabled={isProcessing}
              className="flex-1 py-1.5 rounded-md text-xs font-medium bg-secondary text-foreground border border-border hover:bg-accent transition-all active:scale-[0.98] disabled:opacity-40"
            >
              Apply
            </button>
            <button
              onClick={resetResize}
              disabled={isProcessing}
              className="py-1.5 px-3 rounded-md text-xs text-muted-foreground border border-border hover:text-foreground transition-all active:scale-[0.98] disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Metadata notice */}
      <div className="flex items-start gap-2 bg-card p-3 rounded-md border border-border">
        <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-foreground">Metadata Removed</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            EXIF, GPS & camera data are automatically stripped during compression.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block">
          Stats
        </label>

        {currentFile ? (
          <div className="grid gap-2">
            <div className="bg-card p-3 rounded-md border border-border">
              <div className="text-[10px] text-muted-foreground uppercase">Original</div>
              <div className="text-lg tabular-nums font-medium text-foreground">
                {formatBytes(currentFile.originalSize)}
              </div>
            </div>
            <div className="bg-card p-3 rounded-md border border-border">
              <div className="text-[10px] text-muted-foreground uppercase">Compressed</div>
              <div className="text-lg tabular-nums font-medium text-foreground">
                {currentFile.compressedBlob
                  ? formatBytes(currentFile.compressedSize)
                  : "—"}
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
              <div className="text-[10px] text-primary uppercase">Reduction</div>
              <div className="text-lg tabular-nums font-medium text-primary">
                {currentFile.compressedBlob ? `-${reduction}%` : "—"}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No image selected</p>
          </div>
        )}
      </div>

      {/* Download */}
      <div className="mt-auto">
        <button
          onClick={onDownloadSingle}
          disabled={!currentFile?.compressedBlob || isProcessing}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Image
        </button>
      </div>
    </aside>
  );
}
