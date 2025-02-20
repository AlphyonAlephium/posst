
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileUpload } from './FileUpload';
import { UserList } from './UserList';
import { NearbyUser } from './types';
import { useToast } from "@/components/ui/use-toast";
import { WalletBalance } from './WalletBalance';
import { SendFileActions } from './SendFileActions';
import { useWalletBalance } from './useWalletBalance';
import { usePaymentDistribution } from './usePaymentDistribution';

const COST_PER_RECIPIENT = 0.10; // 10 cents per recipient

interface SendFileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nearbyUsers: NearbyUser[];
  selectedUserIds: string[];
  onUserSelect: (userIds: string[]) => void;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onSend: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const SendFileDialog = ({
  isOpen,
  onOpenChange,
  nearbyUsers,
  selectedUserIds,
  onUserSelect,
  selectedFile,
  onFileSelect,
  onSend,
  fileInputRef,
}: SendFileDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { balance, setBalance } = useWalletBalance(isOpen);
  const { handleDistributePayment } = usePaymentDistribution();

  const totalCost = selectedUserIds.length * COST_PER_RECIPIENT;

  const handleClose = () => {
    onOpenChange(false);
    onFileSelect(null);
    onUserSelect([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!balance || balance < totalCost) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: `You need $${totalCost.toFixed(2)} to send this file. Your current balance is $${balance?.toFixed(2) || '0.00'}. Please add funds to your wallet.`
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Process payment for each recipient
      for (const userId of selectedUserIds) {
        await handleDistributePayment(userId, COST_PER_RECIPIENT);
      }
      await onSend();
      
      // Refresh balance after successful send
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (wallet) {
          setBalance(Number(wallet.balance));
        }
      }

      toast({
        title: "Success",
        description: `File sent successfully! 50% of the fee will go to recipients.`
      });
    } catch (error) {
      console.error('Error sending file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send file. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send File to Multiple Users</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <WalletBalance
            balance={balance}
            totalCost={totalCost}
            selectedCount={selectedUserIds.length}
            costPerRecipient={COST_PER_RECIPIENT}
          />

          <UserList
            users={nearbyUsers}
            selectedUserIds={selectedUserIds}
            onUserSelect={onUserSelect}
          />
          <FileUpload
            onFileSelect={onFileSelect}
            fileInputRef={fileInputRef}
          />
          {selectedFile && (
            <p className="text-sm text-primary">
              Selected file: {selectedFile.name}
            </p>
          )}
        </div>
        <DialogFooter>
          <SendFileActions
            onClose={handleClose}
            onSend={handleSend}
            isLoading={isLoading}
            disabled={!selectedFile || selectedUserIds.length === 0 || isLoading}
            selectedCount={selectedUserIds.length}
            totalCost={totalCost}
            insufficientFunds={balance !== null && balance < totalCost}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
