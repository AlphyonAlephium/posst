
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isCompany, setIsCompany] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          
          // Get user metadata and check if user is a company
          const metadata = user.user_metadata;
          const isCompanyAccount = metadata?.is_company === true;
          setIsCompany(isCompanyAccount);
          
          if (isCompanyAccount && metadata?.company_name) {
            // For company accounts, use the company name
            setUserName(metadata.company_name);
          } else {
            // For individual accounts, try to get the profile info
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, company_name, is_company')
              .eq('id', user.id)
              .single();

            if (profile) {
              // If profile has company information, use that
              if (profile.is_company && profile.company_name) {
                setIsCompany(true);
                setUserName(profile.company_name);
              } else if (profile.email) {
                setUserName(profile.email.split('@')[0]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    
    // Set up auth state change listener to keep user profile updated
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchUserProfile();
        } else if (event === 'SIGNED_OUT') {
          setUserName(null);
          setIsCompany(false);
          setUserId(null);
        }
      }
    );

    return () => {
      // Clean up the subscription when the component unmounts
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return { userName, isCompany, userId, loading };
};
