
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { HotDeal, HotDealPopupInfo, NearbyUser } from '../types';

export const useMapMarkers = () => {
  const { toast } = useToast();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [activeHotDeal, setActiveHotDeal] = useState<HotDealPopupInfo | null>(null);

  // Function to handle when a marker with an active hot deal is clicked
  const handleHotDealMarkerClick = (dealData: HotDealPopupInfo) => {
    setActiveHotDeal(dealData);
  };

  const handleClosePopup = () => {
    setActiveHotDeal(null);
  };

  const handleMarkerClick = async (userId: string, feature: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if this marker has an active hot deal
    if (feature.properties.has_active_deal) {
      // Create hot deal object from feature properties
      const deal: HotDeal = {
        id: feature.properties.deal_id,
        user_id: userId,
        company_name: feature.properties.company_name,
        title: feature.properties.deal_title,
        description: feature.properties.deal_description,
        image_url: feature.properties.deal_image_url,
        start_time: feature.properties.deal_start_time,
        duration_hours: feature.properties.deal_duration_hours,
        created_at: ''
      };
      
      // Pass coordinates and deal to the handler
      handleHotDealMarkerClick({
        deal,
        coordinates: feature.geometry.coordinates
      });
      return;
    }

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
    activeHotDeal,
    handleMarkerClick,
    handleClosePopup
  };
};
