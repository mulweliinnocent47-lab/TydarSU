import { useCallback } from "react";
import JSZip from "jszip";
import { useImageCompressor } from "@/hooks/useImageCompressor";
import { useTheme } from "@/hooks/useTheme";
import { Header } from "@/components/Header";
import { DropZone } from "@/components/DropZone";
import { ImageStage } from "@/components/ImageStage";
import { ControlSidebar } from "@/components/ControlSidebar";
import { BatchQueue } from "@/components/BatchQueue";

const Index = () => {
  const {
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
  } = useImageCompressor();

  const { theme, toggleTheme } = useTheme();

  const handleDownloadSingle = useCallback(() => {
    if (!currentFile?.compressedBlob) return;
    const ext = currentFile.outputFormat === "image/png" ? ".png" : currentFile.outputFormat === "image/webp" ? ".webp" : ".jpg";
    const name = currentFile.file.name.replace(/\.[^.]+$/, "") + "-compressed" + ext;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(currentFile.compressedBlob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [currentFile]);

  const handleDownloadAll = useCallback(async () => {
    const zip = new JSZip();
    files.forEach((item) => {
      if (item.compressedBlob) {
        const ext = item.outputFormat === "image/png" ? ".png" : item.outputFormat === "image/webp" ? ".webp" : ".jpg";
        const name = item.file.name.replace(/\.[^.]+$/, "") + "-compressed" + ext;
        zip.file(name, item.compressedBlob);
      }
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "compressed-images.zip";
    link.click();
    URL.revokeObjectURL(link.href);
  }, [files]);

  const handleAddMore = useCallback(() => {
    const input = document.getElementById("add-more-input") as HTMLInputElement;
    input?.click();
  }, []);

  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Header
        hasFiles={files.length > 0}
        fileCount={files.length}
        onDownloadAll={handleDownloadAll}
        onClearAll={clearAll}
        onAddMore={handleAddMore}
        isProcessing={isProcessing}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <DropZone onFiles={addFiles} hasFiles={files.length > 0}>
          {currentFile && <ImageStage file={currentFile} />}
        </DropZone>

        <ControlSidebar
          currentFile={currentFile}
          quality={quality}
          outputFormat={outputFormat}
          onQualityChange={updateQuality}
          onFormatChange={updateFormat}
          onDownloadSingle={handleDownloadSingle}
          isProcessing={isProcessing}
          onSmartOptimize={smartOptimize}
          onResize={updateResize}
          onReprocessSingle={reprocessSingle}
        />
      </main>

      <BatchQueue
        files={files}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
        onRemove={removeFile}
      />
    </div>
  );
};

export default Index;
