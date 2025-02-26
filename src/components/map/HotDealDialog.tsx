
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHotDealForm } from './hot-deals/useHotDealForm';
import { HotDealForm } from './hot-deals/HotDealForm';
import { ActiveHotDeals } from './hot-deals/ActiveHotDeals';
import { MAX_DURATION } from './hot-deals/validators';

interface HotDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HotDealDialog = ({ open, onOpenChange }: HotDealDialogProps) => {
  const [activeTab, setActiveTab] = useState("create");

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
  } = useHotDealForm(() => {
    setActiveTab("manage");
    // We don't close the dialog after submission to show the user their new active deal
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Hot Deals</DialogTitle>
          <DialogDescription>
            Create special offers for customers or manage your existing deals.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="create">Create New Deal</TabsTrigger>
            <TabsTrigger value="manage">Manage Active Deals</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
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
          </TabsContent>

          <TabsContent value="manage">
            <ActiveHotDeals onDelete={() => {}} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
