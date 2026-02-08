import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Send, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const contacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Actor",
    message: "Thank you for the opportu...",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Actor",
    message: "I'm available for the cal...",
    time: "6 hours ago",
    unread: false,
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Actor",
    message: "When can we schedule...",
    time: "1 day ago",
    unread: false,
  },
];

const messages = [
  {
    id: 1,
    sender: "Sarah Johnson",
    content: "Thank you so much for considering me for the lead role!",
    time: "12:53 PM",
    isMe: false,
  },
  {
    id: 2,
    sender: "me",
    content: "Your audition was impressive. We'd like to schedule a callback.",
    time: "12:59 PM",
    isMe: true,
  },
  {
    id: 3,
    sender: "Sarah Johnson",
    content: "That's wonderful news! I'm available anytime next week.",
    time: "1:03 PM",
    isMe: false,
  },
];

export default function DirectorMessages() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Connect with talent and industry professionals</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
              <p className="text-sm text-muted-foreground">Send a message to talent</p>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Recipient</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="michael">Michael Chen</SelectItem>
                    <SelectItem value="emma">Emma Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject</label>
                <Input placeholder="Enter Subject" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Message</label>
                <Textarea rows={4} placeholder="Type your message" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Send Message</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="h-[calc(100%-4rem)]">
        <div className="flex h-full">
          {/* Contacts List */}
          <div className="w-80 border-r border-border flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-2">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                      selectedContact.id === contact.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{contact.name}</p>
                        {contact.unread && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate",
                        selectedContact.id === contact.id 
                          ? "text-primary-foreground/80" 
                          : "text-muted-foreground"
                      )}>
                        {contact.role}
                      </p>
                      <p className={cn(
                        "text-xs truncate mt-1",
                        selectedContact.id === contact.id 
                          ? "text-primary-foreground/60" 
                          : "text-muted-foreground"
                      )}>
                        {contact.message}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedContact.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedContact.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex",
                      message.isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[70%] rounded-lg p-3",
                      message.isMe 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}>
                      <p className="text-sm">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        message.isMe 
                          ? "text-primary-foreground/60" 
                          : "text-muted-foreground"
                      )}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
