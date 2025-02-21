
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (profile?.email) {
          setUserName(profile.email.split('@')[0]);
        }
      }
    };

    fetchUserProfile();
  }, []);

  return { userName };
};
