
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isCompany, setIsCompany] = useState<boolean>(false);
  const [isService, setIsService] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user is a company or service
          const metadata = user.user_metadata;
          const isCompanyAccount = metadata?.is_company || false;
          const isServiceAccount = metadata?.is_service || false;
          
          setIsCompany(isCompanyAccount);
          setIsService(isServiceAccount);
          
          if (isCompanyAccount && metadata?.company_name) {
            // For company accounts, use the company name
            setUserName(metadata.company_name);
            setCompanyName(metadata.company_name);
          