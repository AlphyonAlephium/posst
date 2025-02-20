
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useWalletBalance = (isOpen: boolean) => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        setBalance(Number(wallet.balance));
      }
    };

    if (isOpen) {
      fetchBalance();
    }
  }, [isOpen]);

  return { balance, setBalance };
};
