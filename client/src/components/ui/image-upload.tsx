import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageBase64: string) => void;
  className?: string;
}

export default function ImageUpload({ currentImage, onImageChange, className = "" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      alert("יש להעלות קובץ תמונה בלבד (JPEG, PNG, או GIF)");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("גודל הקובץ חייב להיות פחות מ-5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative mb-4">
        {preview ? (
          <img 
            src={preview} 
            alt="תמונת פרופיל" 
            className="h-32 w-32 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button 
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        size="sm"
        className="flex items-center"
      >
        <Upload className="mr-2 h-4 w-4" />
        {preview ? "החלף תמונה" : "העלה תמונה"}
      </Button>
    </div>
  );
}