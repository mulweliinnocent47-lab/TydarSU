import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

interface DropZoneProps {
  onFiles: (files: FileList) => void;
  children: React.ReactNode;
  hasFiles: boolean;
}

export function DropZone({ onFiles, children, hasFiles }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current--;
    if (dragCountRef.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCountRef.current = 0;
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="relative flex-1 flex flex-col overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg"
        >
          <div className="text-center">
            <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-foreground font-medium">Drop images here</p>
          </div>
        </motion.div>
      )}

      {!hasFiles ? (
        <div className="flex-1 flex items-center justify-center bg-stage">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
              <Upload className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-5">
              Drag images here or
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 bg-secondary px-5 py-2.5 rounded-md hover:bg-accent transition-all border border-border text-sm font-medium text-foreground active:scale-[0.98]">
              Browse Files
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) onFiles(e.target.files);
                }}
              />
            </label>
            <p className="text-muted-foreground/50 text-xs mt-4">
              JPG, PNG, WebP — up to 20MB
            </p>
          </div>
        </div>
      ) : (
        children
      )}

      {/* Hidden file input for adding more */}
      {hasFiles && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          id="add-more-input"
          onChange={(e) => {
            if (e.target.files) onFiles(e.target.files);
          }}
        />
      )}
    </div>
  );
}
