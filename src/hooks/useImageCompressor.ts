import { useState, useCallback, useRef } from "react";
import {
  ImageFile,
  OutputFormat,
  compressImage,
  autoOptimize,
  generateId,
} from "@/lib/image-compress";

export function useImageCompressor() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const processFile = useCallback(
    async (imageFile: ImageFile, q: number, fmt: OutputFormat) => {
      try {
        const { blob, width, height } = await compressImage(
          imageFile.file, q, fmt, imageFile.resizeWidth, imageFile.resizeHeight
        );
        const compressedUrl = URL.createObjectURL(blob);
        return {
          ...imageFile,
          compressedBlob: blob,
          compressedSize: blob.size,
          compressedUrl,
          originalWidth: width,
          originalHeight: height,
          outputFormat: fmt,
        };
      } catch {
        return imageFile;
      }
    },
    []
  );

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const imageFiles = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) return;

      setIsProcessing(true);
      processingRef.current = true;

      const newFiles: ImageFile[] = imageFiles.map((file) => ({
        id: generateId(),
        file,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        compressedBlob: null,
        compressedSize: 0,
        previewUrl: URL.createObjectURL(file),
        compressedUrl: null,
        outputFormat,
        resizeWidth: null,
        resizeHeight: null,
      }));

      const processed = await Promise.all(
        newFiles.map((f) => processFile(f, quality, outputFormat))
      );

      setFiles((prev) => {
        const updated = [...prev, ...processed];
        if (prev.length === 0) setCurrentIndex(0);
        return updated;
      });

      setIsProcessing(false);
      processingRef.current = false;
    },
    [quality, outputFormat, processFile]
  );

  const reprocessAll = useCallback(
    async (q: number, fmt: OutputFormat) => {
      setIsProcessing(true);
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          compressedBlob: null,
          compressedSize: 0,
          compressedUrl: null,
        }))
      );

      setFiles((prev) => {
        Promise.all(prev.map((f) => processFile(f, q, fmt))).then(
          (processed) => {
            setFiles(processed);
            setIsProcessing(false);
          }
        );
        return prev;
      });
    },
    [processFile]
  );

  const updateQuality = useCallback(
    (q: number) => {
      setQuality(q);
      if (files.length > 0) {
        reprocessAll(q, outputFormat);
      }
    },
    [files.length, outputFormat, reprocessAll]
  );

  const updateFormat = useCallback(
    (fmt: OutputFormat) => {
      setOutputFormat(fmt);
      if (files.length > 0) {
        reprocessAll(quality, fmt);
      }
    },
    [files.length, quality, reprocessAll]
  );

  const updateResize = useCallback(
    (id: string, w: number | null, h: number | null) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, resizeWidth: w, resizeHeight: h } : f))
      );
    },
    []
  );

  const reprocessSingle = useCallback(
    async (id: string) => {
      setIsProcessing(true);
      setFiles((prev) => {
        const file = prev.find((f) => f.id === id);
        if (!file) {
          setIsProcessing(false);
          return prev;
        }
        processFile(file, quality, outputFormat).then((processed) => {
          setFiles((p) => p.map((f) => (f.id === id ? processed : f)));
          setIsProcessing(false);
        });
        return prev;
      });
    },
    [quality, outputFormat, processFile]
  );

  const smartOptimize = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const optimized = await Promise.all(
      files.map(async (f) => {
        try {
          const result = await autoOptimize(f.file);
          const compressedUrl = URL.createObjectURL(result.blob);
          return {
            ...f,
            compressedBlob: result.blob,
            compressedSize: result.blob.size,
            compressedUrl,
            originalWidth: result.width,
            originalHeight: result.height,
            outputFormat: result.format,
          };
        } catch {
          return f;
        }
      })
    );

    setFiles(optimized);
    if (optimized.length > 0) {
      setOutputFormat(optimized[0].outputFormat);
      setQuality(80);
    }
    setIsProcessing(false);
  }, [files]);

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const idx = prev.findIndex((f) => f.id === id);
        const next = prev.filter((f) => f.id !== id);
        if (currentIndex >= next.length && next.length > 0) {
          setCurrentIndex(next.length - 1);
        }
        if (idx >= 0) {
          URL.revokeObjectURL(prev[idx].previewUrl);
          if (prev[idx].compressedUrl) URL.revokeObjectURL(prev[idx].compressedUrl!);
        }
        return next;
      });
    },
    [currentIndex]
  );

  const clearAll = useCallback(() => {
    files.forEach((f) => {
      URL.revokeObjectURL(f.previewUrl);
      if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
    });
    setFiles([]);
    setCurrentIndex(0);
  }, [files]);

  const currentFile = files[currentIndex] || null;

  return {
    files,
    currentFile,
    currentIndex,
    setCurrentIndex,
    quality,
    updateQuality,
    outputFormat,
    updateFormat,
    isProcessing,
    addFiles,
    removeFile,
    clearAll,
    updateResize,
    reprocessSingle,
    smartOptimize,
  };
}
