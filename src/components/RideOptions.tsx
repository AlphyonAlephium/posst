import { Car, AlertCircle, Mail, Wallet, FileIcon, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RideOption {
  id: string;
  name: string;
  price: string;
  time: string;
  type: string;
}

interface Message {
  id: string;
  created_at: string;
  read: boolean;
  sender_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
}

const rideOptions: RideOption[] = [
  {
    id: "1",
    name: "UberX",
    price: "$18-22",
    time: "4 min",
    type: "Regular"
  },
  {
    id: "2",
    name: "Uber Black",
    price: "$45-50",
    time: "8 min",
    type: "Premium"
  },
  {
    id: "3",
    name: "Uber XL",
    price: "$28-32",
    time: "6 min",
    type: "Large"
  }
];

export const RideOptions = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [balance, setBalance] = useState<number | null>(null);

  const handleFileClick = async (message: Message) => {
    try {
      const { data } = supabase.storage
        .from('message_attachments')
        .getPublicUrl(message.file_path);

      window.open(data.publicUrl, '_blank');

      if (!message.read) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('id', message.id);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error handling file:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    return <FileIcon className="h-5 w-5" />;
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single() as unknown as { data: { balance: number } | null };

      if (wallet) {
        setBalance(wallet.balance);
      }

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedError) {
        console.error('Error fetching received messages:', receivedError);
        return;
      }

      if (sentError) {
        console.error('Error fetching sent messages:', sentError);
        return;
      }

      if (receivedMessages) {
        setMessages(receivedMessages);
        setUnreadCount(receivedMessages.filter(msg => !msg.read).length);
      }

      if (sentMessages) {
        setSentMessages(sentMessages);
      }
    };

    fetchData();

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6 p-4">
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xl font-semibold text-primary">${balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            View History
          </Badge>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Inbox</h2>
          <Badge variant="secondary" className="rounded-full px-2 py-0.5">
            {unreadCount} new
          </Badge>
        </div>
        <ScrollArea className="h-[150px]">
          <div className="space-y-2 pr-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={cn(
                  "p-3 hover:bg-accent transition-colors cursor-pointer",
                  !message.read && "border-primary/50 bg-primary/5"
                )}
                onClick={() => handleFileClick(message)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      !message.read ? "bg-primary/10" : "bg-muted"
                    )}>
                      {getFileIcon(message.file_type)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                      <p className={cn(
                        "text-sm",
                        !message.read && "font-medium text-primary"
                      )}>
                        {message.file_name}
                      </p>
                    </div>
                  </div>
                  {!message.read && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sent Files</h2>
            <Badge variant="secondary" className="rounded-full px-2 py-0.5">
              {sentMessages.length} files
            </Badge>
          </div>
          <ScrollArea className="h-[150px]">
            <div className="space-y-2 pr-4">
              {sentMessages.map((message) => (
                <Card
                  key={message.id}
                  className="p-3 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleFileClick(message)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getFileIcon(message.file_type)}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm">{message.file_name}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
