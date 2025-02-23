
import { supabase } from "@/integrations/supabase/client";

export const usePaymentDistribution = () => {
  const handleDistributePayment = async (userId: string, amount: number): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: success, error } = await supabase.rpc(
      'distribute_payment',
      {
        sender_id: user.id,
        receiver_id: userId,
        total_amount: amount
      } as const
    );

    if (error || !success) {
      return false;
    }

    return true;
  };

  return { handleDistributePayment };
};
