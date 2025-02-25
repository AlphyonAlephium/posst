
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FileUpload } from "@/components/map/FileUpload";

interface HotDealFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (file: File | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  maxDuration: number;
}

export const HotDealForm = ({
  title,
  setTitle,
  description,
  setDescription,
  startTime,
  setStartTime,
  duration,
  setDuration,
  isLoading,
  fileInputRef,
  handleFileSelect,
  handleSubmit,
  onCancel,
  maxDuration
}: HotDealFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., 25% Off All Items"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your special offer"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (hours)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          max={maxDuration}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Maximum duration: {maxDuration} hours
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Deal Image</Label>
        <FileUpload
          onFileSelect={handleFileSelect}
          fileInputRef={fileInputRef}
        />
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Deal"}
        </Button>
      </DialogFooter>
    </form>
  );
};
