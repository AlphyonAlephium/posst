
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { NearbyUser } from '../types';

export const useMarkerClick = () => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { toast } = useToast();

  const handleMarkerClick = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to send messages"
      });
      return;
    }

    if (user.id === userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You cannot send a message to yourself"
      });
      return;
    }

    setSelectedUserIds([userId]);
    setIsMessageDialogOpen(true);
  };

  return {
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    selectedUserIds,
    setSelectedUserIds,
    handleMarkerClick
  };
};
