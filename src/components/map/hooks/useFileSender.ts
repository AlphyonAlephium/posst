
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useFileSender = (
  selectedUserIds: string[],
  setSelectedUserIds: (userIds: string[]) => void,
  setIsMessageDialogOpen: (isOpen: boolean) => void
) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSendMessage = async (companyName: string) => {
    if (selectedUserIds.length === 0 || !selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one user and a file to send"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const totalCost = selectedUserIds.length * 0.10;

      // Get current wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single() as unknown as { data: { balance: number } | null };

      if (!wallet || wallet.balance < totalCost) {
        throw new Error('Insufficient funds');
      }

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message_attachments')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Update wallet balance
      const { error: balanceError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - totalCost } as any)
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: -totalCost,
          description: `Sent file to ${selectedUserIds.length} recipients`
        } as any);

      if (transactionError) throw transactionError;

      // Create message records for each selected user
      const messages = selectedUserIds.map(receiverId => ({
        sender_id: user.id,
        receiver_id: receiverId,
        file_path: filePath,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        company_name: companyName
      }));

      const { error: messageError } = await supabase
        .from('messages')
        .insert(messages);

      if (messageError) throw messageError;

      toast({
        title: "Success",
        description: `File sent to ${selectedUserIds.length} user${selectedUserIds.length > 1 ? 's' : ''} for $${totalCost.toFixed(2)}`
      });

      setSelectedFile(null);
      setSelectedUserIds([]);
      setIsMessageDialogOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error && error.message === 'Insufficient funds'
          ? "Insufficient funds. Please add money to your wallet."
          : "Failed to send file. Please try again."
      });
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    fileInputRef,
    handleSendMessage
  };
};
