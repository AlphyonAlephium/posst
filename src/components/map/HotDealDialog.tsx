
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useHotDealForm } from './hot-deals/useHotDealForm';
import { HotDealForm } from './hot-deals/HotDealForm';
import { MAX_DURATION } from './hot-deals/validators';

interface HotDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HotDealDialog = ({ open, onOpenChange }: HotDealDialogProps) => {
  const {
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
    handleSubmit
  } = useHotDealForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create a Hot Deal</DialogTitle>
          <DialogDescription>
            Add a special offer for your customers. Deals can last up to {MAX_DURATION} hours.
          </DialogDescription>
        </DialogHeader>
        
        <HotDealForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          startTime={startTime}
          setStartTime={setStartTime}
          duration={duration}
          setDuration={setDuration}
          isLoading={isLoading}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          handleSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          maxDuration={MAX_DURATION}
        />
      </DialogContent>
    </Dialog>
  );
};
