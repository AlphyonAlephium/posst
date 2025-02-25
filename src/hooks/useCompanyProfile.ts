
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useCompanyProfile = () => {
  const [isCompany, setIsCompany] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check user metadata
          const metadata = user.user_metadata;
          setIsCompany(metadata?.is_company || false);
          setCompanyName(metadata?.company_name || null);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  return { isCompany, companyName, loading };
};
