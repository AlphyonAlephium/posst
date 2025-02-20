import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from './FileUpload';
import { UserList } from './UserList';
import { NearbyUser } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, MinusCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

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

interface UpdateWalletBalanceParams {
  p_user_id: string;
  p_amount: number;
  p_description: string;
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
  const [balance, setBalance] = useState<number>(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const { toast } = useToast();

  const totalCost = selectedUserIds.length * COST_PER_RECIPIENT;

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('Fetching balance for user:', user.id);
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching wallet:', error);
        return;
      }

      if (wallet) {
        console.log('Wallet data:', wallet);
        const numericBalance = parseFloat(String(wallet.balance));
        console.log('Parsed balance:', numericBalance);
        setBalance(numericBalance);
      }
    } catch (error) {
      console.error('Error in fetchBalance:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
    }
  }, [isOpen]);

  const handleClose = () => {
    onOpenChange(false);
    onFileSelect(null);
    onUserSelect([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    console.log('Current balance:', balance);
    console.log('Total cost:', totalCost);
    
    if (balance < totalCost) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: `You need $${totalCost.toFixed(2)} to send this file. Your current balance is $${balance.toFixed(2)}. Please add funds to your wallet.`
      });
      return;
    }
    onSend();
  };

  const handleTransaction = async (isTopUp: boolean) => {
    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid amount",
          description: "Please enter a valid positive number"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to perform this action"
        });
        return;
      }

      const { data, error } = await supabase.rpc<boolean, UpdateWalletBalanceParams>(
        'update_wallet_balance',
        { 
          p_user_id: user.id,
          p_amount: isTopUp ? numAmount : -numAmount,
          p_description: isTopUp ? 'Top up' : 'Withdrawal'
        }
      );

      if (error) {
        throw error;
      }

      if (data === false) {
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: "Insufficient funds for withdrawal"
        });
        return;
      }

      await fetchBalance();
      setAmount('');
      toast({
        title: "Success",
        description: `Successfully ${isTopUp ? 'added' : 'withdrew'} $${numAmount.toFixed(2)}`
      });
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: "An error occurred while processing your transaction"
      });
    } finally {
      setIsTopUpOpen(false);
      setIsWithdrawOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send File to Multiple Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span>Your balance:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${balance.toFixed(2)}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setIsTopUpOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Top up
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setIsWithdrawOpen(true)}
                      >
                        <MinusCircle className="h-4 w-4 mr-1" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Cost per recipient:</span>
                  <span>${COST_PER_RECIPIENT.toFixed(2)}</span>
                </div>
                {selectedUserIds.length > 0 && (
                  <div className="flex justify-between font-medium border-t pt-2 mt-2">
                    <span>Total cost ({selectedUserIds.length} recipients):</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                )}
              </div>
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
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!selectedFile || selectedUserIds.length === 0}
              className={balance < totalCost ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              Send to {selectedUserIds.length} User{selectedUserIds.length !== 1 ? 's' : ''} 
              {selectedUserIds.length > 0 && ` ($${totalCost.toFixed(2)})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Top Up Your Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the amount you want to add to your wallet
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAmount('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleTransaction(true)}>
              Top Up
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw from Your Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the amount you want to withdraw from your wallet
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAmount('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleTransaction(false)}>
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
