
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { BusinessProfile } from "@/components/map/types";

export const useBusinessProfile = (userId?: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        setLoading(true);
        
        // If no userId provided, get current user
        let targetUserId = userId;
        if (!targetUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            setLoading(false);
            return;
          }
          targetUserId = user.id;
        }
        
        // Fetch business profile
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found error
          throw error;
        }

        if (data) {
          setProfile(data as BusinessProfile);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching business profile:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [userId]);

  return { profile, loading, error };
};
