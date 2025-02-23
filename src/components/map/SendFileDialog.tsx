
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from './FileUpload';
import { UserList } from './UserList';
import { NearbyUser } from './types';
import { useToast } from "@/components/ui/use-toast";
import { WalletBalance } from './WalletBalance';
import { SendFileActions } from './SendFileActions';
import { useWalletBalance } from './useWalletBalance';
import { usePaymentDistribution } from './usePaymentDistribution';
import { supabase } from "@/integrations/supabase/client";

const COST_PER_RECIPIENT = 0.10; // 10 cents per recipient

interface SendFileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nearbyUsers: NearbyUser[];
  selectedUserIds: string[];
  onUserSelect: (userIds: string[]) => void;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onSend: (companyName: string) => void;
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
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();
  const { balance, setBalance } = useWalletBalance(isOpen);
  const { handleDistributePayment } = usePaymentDistribution();

  const totalCost = selectedUserIds.length * COST_PER_RECIPIENT;

  const handleClose = () => {
    onOpenChange(false);
    onFileSelect(null);
    onUserSelect([]);
    setCompanyName('');
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

    if (!companyName.trim()) {
      toast({
        variant: "destructive",
        title: "Company name required",
        description: "Please enter a company or service name"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Process payment for each recipient with COST_PER_RECIPIENT
      for (const userId of selectedUserIds) {
        const success = await handleDistributePayment(userId, COST_PER_RECIPIENT);
        if (!success) {
          throw new Error('Payment failed');
        }
      }

      // Call onSend with companyName
      onSend(companyName);
      
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

      handleClose();
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

          <div className="space-y-2">
            <Label htmlFor="companyName">Company or Service Name</Label>
            <Input
              id="companyName"
              placeholder="Enter company or service name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

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
            disabled={!selectedFile || !companyName.trim() || selectedUserIds.length === 0 || isLoading}
            selectedCount={selectedUserIds.length}
            totalCost={totalCost}
            insufficientFunds={balance !== null && balance < totalCost}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
