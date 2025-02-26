import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { NearbyUser } from '../types';

export const useMarkerClick = () => {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMarkerClick = async (userId: string, isCompany: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to interact with users"
      });
      return;
    }

    if (user.id === userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You cannot interact with yourself"
      });
      return;
    }

    if (isCompany) {
      navigate(`/business/${userId}`);
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
