import { ImageFile } from "@/lib/image-compress";
import { X } from "lucide-react";

interface BatchQueueProps {
  files: ImageFile[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
}

export function BatchQueue({ files, currentIndex, onSelect, onRemove }: BatchQueueProps) {
  if (files.length === 0) return null;

  return (
    <footer className="h-24 border-t border-border bg-card flex items-center px-4 md:px-6 gap-3 overflow-x-auto shrink-0">
      {files.map((item, index) => (
        <div
          key={item.id}
          className={`relative w-16 h-16 shrink-0 rounded-md border-2 cursor-pointer overflow-hidden transition-all group ${
            index === currentIndex
              ? "border-primary scale-105 shadow-lg shadow-primary/20"
              : "border-border opacity-60 hover:opacity-90"
          }`}
          onClick={() => onSelect(index)}
        >
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="absolute top-0.5 right-0.5 w-4 h-4 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-2.5 h-2.5 text-foreground" />
          </button>
        </div>
      ))}

      {/* Add more button */}
      <label className="w-16 h-16 shrink-0 rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors text-muted-foreground hover:text-foreground">
        <span className="text-xl leading-none">+</span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            // Trigger is handled by parent via the add-more-input
            const input = document.getElementById("add-more-input") as HTMLInputElement;
            if (input && e.target.files) {
              // Create a new DataTransfer to merge
              const dt = new DataTransfer();
              Array.from(e.target.files).forEach((f) => dt.items.add(f));
              Object.defineProperty(input, "files", { value: dt.files, writable: true });
              input.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }}
        />
      </label>
    </footer>
  );
}
