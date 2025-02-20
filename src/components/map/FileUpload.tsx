
import React from 'react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './types';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileUpload = ({ onFileSelect, fileInputRef }: FileUploadProps) => {
  const { toast } = useToast();

  const validateFile = (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or PDF file"
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 5MB"
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    } else {
      event.target.value = '';
      onFileSelect(null);
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.pdf"
        onChange={handleFileChange}
        className="cursor-pointer"
      />
      <p className="text-sm text-muted-foreground">
        Accepted formats: JPG, PNG, GIF, PDF (Max 5MB)
      </p>
    </div>
  );
};
