
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isCompany, setIsCompany] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user is a company
          const metadata = user.user_metadata;
          const isCompanyAccount = metadata?.is_company || false;
          setIsCompany(isCompanyAccount);
          
          if (isCompanyAccount && metadata?.company_name) {
            // For company accounts, use the company name
            setUserName(metadata.company_name);
            setCompanyName(metadata.company_name);
          } else {
            // For individual accounts, use the email prefix
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', user.id)
              .single();

            if (profile?.email) {
              setUserName(profile.email.split('@')[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  return { userName, isCompany, companyName };
};
