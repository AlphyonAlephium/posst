
import React, { useRef, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/map/FileUpload";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";

interface HotDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HotDealDialog = ({ open, onOpenChange }: HotDealDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1); // Default 1 hour
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { userId, userName } = useUserProfile();

  const MAX_DURATION = 5; // Maximum duration in hours

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !startTime || !selectedFile) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields and upload an image"
      });
      return;
    }

    if (duration <= 0 || duration > MAX_DURATION) {
      toast({
        variant: "destructive",
        title: "Invalid duration",
        description: `Duration must be between 1 and ${MAX_DURATION} hours`
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the image file
      const { error: uploadError } = await supabase.storage
        .from('hot-deals')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('hot-deals')
        .getPublicUrl(filePath);

      // Store the hot deal in the database
      const { error: insertError } = await supabase
        .from('hot_deals')
        .insert({
          user_id: userId,
          company_name: userName || 'Unknown Company',
          title,
          description,
          start_time: new Date(startTime).toISOString(),
          duration_hours: duration,
          image_url: publicUrl
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Success!",
        description: "Your hot deal has been created"
      });

      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating hot deal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create hot deal. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setDuration(1);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create a Hot Deal</DialogTitle>
          <DialogDescription>
            Add a special offer for your customers. Deals can last up to 5 hours.
          </DialogDescription>
        </DialogHeader>
        
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
              max={MAX_DURATION}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Maximum duration: {MAX_DURATION} hours
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
