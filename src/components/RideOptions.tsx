import { Car, AlertCircle, Mail, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface RideOption {
  id: string;
  name: string;
  price: string;
  time: string;
  type: string;
}

interface PostboxItem {
  id: string;
  title: string;
  time: string;
  status: "unread" | "read";
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_id: string;
}

const rideOptions: RideOption[] = [{
  id: "1",
  name: "UberX",
  price: "$18-22",
  time: "4 min",
  type: "Regular"
}, {
  id: "2",
  name: "Uber Black",
  price: "$45-50",
  time: "8 min",
  type: "Premium"
}, {
  id: "3",
  name: "Uber XL",
  price: "$28-32",
  time: "6 min",
  type: "Large"
}];

const postboxItems: PostboxItem[] = [{
  id: "1",
  title: "New ride request",
  time: "2 min ago",
  status: "unread"
}, {
  id: "2",
  title: "Payment received",
  time: "1 hour ago",
  status: "read"
}, {
  id: "3",
  title: "Special offer available",
  time: "2 hours ago",
  status: "read"
}];

export const RideOptions = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (messages) {
        setMessages(messages);
        setUnreadCount(messages.filter(msg => !msg.read).length);
      }
    };

    fetchMessages();

    // Subscribe to new messages
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
    <div className="space-y-8 p-4">
      {/* Wallet Balance Section */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-semibold text-primary">$250.00</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            View History
          </Badge>
        </div>
      </Card>

      {/* Ride Options Section */}

      {/* Postbox Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">My posst-box</h2>
          <Badge variant="secondary" className="rounded-full px-2 py-0.5">
            {postboxItems.filter(item => item.status === "unread").length} new
          </Badge>
        </div>
        <div className="space-y-3">
          {postboxItems.map(item => <Card key={item.id} className={cn("p-4 hover:bg-accent transition-colors cursor-pointer", item.status === "unread" && "border-primary/50 bg-primary/5")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={cn("p-2 rounded-full", item.status === "unread" ? "bg-primary/10" : "bg-muted")}>
                    <Mail className={cn("h-5 w-5", item.status === "unread" ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <h3 className={cn("font-medium", item.status === "unread" && "text-primary")}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                {item.status === "unread" && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
            </Card>)}
        </div>
      </div>

      {/* Messages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Inbox</h2>
          <Badge variant="secondary" className="rounded-full px-2 py-0.5">
            {unreadCount} new
          </Badge>
        </div>
        <div className="space-y-3">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={cn(
                "p-4 hover:bg-accent transition-colors cursor-pointer",
                !message.read && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    !message.read ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Mail className={cn(
                      "h-5 w-5",
                      !message.read ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                    <p className={cn(
                      "mt-1",
                      !message.read && "font-medium text-primary"
                    )}>
                      {message.content}
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
      </div>
    </div>
  );
};
