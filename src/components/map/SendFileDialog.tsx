
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
  const [balance, setBalance] = useState<number | null>(null);
  const { toast } = useToast();

  const totalCost = selectedUserIds.length * COST_PER_RECIPIENT;

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
    onSend();
  };

  const handleTopUp = () => {
    // Placeholder for top up functionality
    console.log("Top up clicked");
  };

  const handleWithdraw = () => {
    // Placeholder for withdraw functionality
    console.log("Withdraw clicked");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send File to Multiple Users</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm space-y-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Available Balance:</span>
                    <span className="font-medium text-lg">${balance?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleTopUp}
                    >
                      <Plus className="h-4 w-4" />
                      Top up
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleWithdraw}
                    >
                      <MinusCircle className="h-4 w-4" />
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
            className={balance !== null && balance < totalCost ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            Send to {selectedUserIds.length} User{selectedUserIds.length !== 1 ? 's' : ''} 
            {selectedUserIds.length > 0 && ` ($${totalCost.toFixed(2)})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
