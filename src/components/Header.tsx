import { Download, Trash2, Plus, Sun, Moon } from "lucide-react";

interface HeaderProps {
  hasFiles: boolean;
  fileCount: number;
  onDownloadAll: () => void;
  onClearAll: () => void;
  onAddMore: () => void;
  isProcessing: boolean;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Header({ hasFiles, fileCount, onDownloadAll, onClearAll, onAddMore, isProcessing, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 bg-background">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 bg-primary rounded-sm" />
        <h1 className="font-bold tracking-display text-sm uppercase">
          ImageCompress{" "}
          <span className="text-muted-foreground">Pro</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="text-muted-foreground hover:text-foreground transition-colors active:scale-[0.95] p-1.5 rounded-md hover:bg-secondary"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {hasFiles && (
          <>
            <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
              {fileCount} {fileCount === 1 ? "image" : "images"}
            </span>

            <button
              onClick={onAddMore}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
            </button>

            <button
              onClick={onDownloadAll}
              disabled={isProcessing}
              className="bg-foreground text-background px-3 py-1.5 rounded-md text-xs font-medium hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download All (.zip)</span>
              <span className="sm:hidden">ZIP</span>
            </button>

            <button
              onClick={onClearAll}
              className="text-muted-foreground hover:text-destructive text-xs transition-colors active:scale-[0.98]"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
