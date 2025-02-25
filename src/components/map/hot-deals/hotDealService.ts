
import { supabase } from "@/integrations/supabase/client";
import type { HotDeal } from "../types";

export const uploadHotDealImage = async (file: File): Promise<string> => {
  // Create a unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload the image file
  const { error: uploadError } = await supabase.storage
    .from('hot-deals')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('hot-deals')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const createHotDeal = async (
  userId: string,
  companyName: string,
  title: string,
  description: string,
  startTime: string,
  durationHours: number,
  imageUrl: string
) => {
  const { error } = await supabase
    .from('hot_deals')
    .insert({
      user_id: userId,
      company_name: companyName || 'Unknown Company',
      title,
      description,
      start_time: new Date(startTime).toISOString(),
      duration_hours: durationHours,
      image_url: imageUrl
    });

  if (error) {
    throw error;
  }
};

export const fetchActiveHotDeals = async (): Promise<HotDeal[]> => {
  const now = new Date().toISOString();
  
  // Fetch deals where the start_time plus duration_hours is greater than the current time
  const { data, error } = await supabase
    .from('hot_deals')
    .select('*')
    .gte(`start_time`, now)
    .order('start_time', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  // Filter deals that belong to the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  return (data as HotDeal[]).filter(deal => deal.user_id === user.id);
};

export const deleteHotDeal = async (dealId: string) => {
  const { error } = await supabase
    .from('hot_deals')
    .delete()
    .eq('id', dealId);
  
  if (error) {
    throw error;
  }
};
