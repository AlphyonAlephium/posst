import { Car, AlertCircle, Mail, Wallet, FileIcon, Image, CheckCircle2, CircleDot, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

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
  company_name: string;
  feedback?: 'interested' | 'not_interested' | null;
}

// Validate feedback type
const isValidFeedback = (feedback: string | null): feedback is 'interested' | 'not_interested' | null => {
  return feedback === 'interested' || feedback === 'not_interested' || null;
};

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
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

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
        
        setShowFeedback(message.id);
      }
    } catch (error) {
      console.error('Error handling file:', error);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'interested' | 'not_interested') => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ feedback })
        .eq('id', messageId);

      if (error) throw error;

      setShowFeedback(null);
      toast({
        title: "Feedback sent",
        description: "Thank you for your feedback!",
      });

      fetchMessages();
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send feedback. Please try again.",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    return <FileIcon className="h-5 w-5" />;
  };

  const fetchMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      const validatedMessages = receivedMessages.map(msg => ({
        ...msg,
        feedback: isValidFeedback(msg.feedback) ? msg.feedback : null
      }));
      setMessages(validatedMessages);
      setUnreadCount(validatedMessages.filter(msg => !msg.read).length);
    }

    if (sentMessages) {
      const validatedSentMessages = sentMessages.map(msg => ({
        ...msg,
        feedback: isValidFeedback(msg.feedback) ? msg.feedback : null
      }));
      setSentMessages(validatedSentMessages);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        setBalance(wallet.balance);
      }

      await fetchMessages();
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
          fetchMessages();
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
              <div key={message.id}>
                <Card
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
                          {message.company_name}
                        </p>
                      </div>
                    </div>
                    {!message.read && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </Card>
                {showFeedback === message.id && (
                  <div className="flex gap-2 mt-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(message.id, 'interested');
                      }}
                    >
                      <ThumbsUp className="mr-2" />
                      Interested
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(message.id, 'not_interested');
                      }}
                    >
                      <ThumbsDown className="mr-2" />
                      Not Interested
                    </Button>
                  </div>
                )}
              </div>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-2">
                          {message.read ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              {message.feedback && (
                                message.feedback === 'interested' ? (
                                  <ThumbsUp className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ThumbsDown className="h-4 w-4 text-red-500" />
                                )
                              )}
                            </>
                          ) : (
                            <CircleDot className="h-5 w-5 text-gray-400" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {message.read ? (
                              message.feedback ? (
                                `Recipient is ${message.feedback === 'interested' ? 'interested' : 'not interested'}`
                              ) : (
                                'File opened by recipient'
                              )
                            ) : (
                              'Not opened yet'
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
