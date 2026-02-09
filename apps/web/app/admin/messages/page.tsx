"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school-admin/ui";
import { Button, Input } from "@school-admin/ui";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import { formatDate } from "@school-admin/shared/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@school-admin/ui";
import { Label, Select } from "@school-admin/ui";

export default function MessagesPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    fetchThreads();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
      // Mark as read
      apiPut(`/messages/threads/${selectedThread.id}/read`, {}).then(() => {
        fetchThreads();
      });
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      const res = await apiGet<{ data: any[]; pagination: any }>("/messages/threads");
      if (res.success && res.data) {
        setThreads(res.data);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiGet<{ users: any[] }>("/students");
      // In real app, fetch all users (teachers, parents, etc.)
      // For now, just use students endpoint
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const res = await apiGet<{ data: any[] }>(`/messages/threads/${threadId}/messages`);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleCreateThread = async () => {
    if (selectedUserIds.length === 0) {
      alert("Sélectionnez au moins un destinataire");
      return;
    }

    try {
      const res = await apiPost("/messages/threads", {
        participantIds: selectedUserIds,
        type: "DIRECT",
      });

      if (res.success && res.data) {
        setDialogOpen(false);
        setSelectedUserIds([]);
        fetchThreads();
        setSelectedThread(res.data);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      alert("Erreur lors de la création de la conversation");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedThread || !newMessage.trim()) {
      return;
    }

    try {
      const res = await apiPost(`/messages/threads/${selectedThread.id}/messages`, {
        content: newMessage,
      });

      if (res.success) {
        setNewMessage("");
        fetchMessages(selectedThread.id);
        fetchThreads();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erreur lors de l'envoi du message");
    }
  };

  const getThreadTitle = (thread: any) => {
    if (thread.subject) {
      return thread.subject;
    }
    if (thread.type === "DIRECT" && thread.participants) {
      const otherParticipants = thread.participants.filter(
        (p: any) => p.userId !== "current-user-id" // In real app, use actual user ID
      );
      if (otherParticipants.length > 0) {
        return `${otherParticipants[0].user.firstName} ${otherParticipants[0].user.lastName}`;
      }
    }
    return "Conversation";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Messagerie</h1>
          <p className="text-muted-foreground">
            Communiquez avec les autres utilisateurs
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nouvelle conversation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle conversation</DialogTitle>
              <DialogDescription>
                Sélectionnez les destinataires
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Destinataires</Label>
                <Select
                  multiple
                  value={selectedUserIds}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, (option) => option.value);
                    setSelectedUserIds(values);
                  }}
                >
                  {/* In real app, fetch and display all users */}
                  <option value="">Sélectionner des utilisateurs</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateThread}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Threads List */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Chargement...</div>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedThread?.id === thread.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="font-medium">{getThreadTitle(thread)}</div>
                    {thread.messages && thread.messages.length > 0 && (
                      <div className="text-sm text-muted-foreground truncate">
                        {thread.messages[0].content}
                      </div>
                    )}
                    {thread._count?.messages > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        {thread._count.messages} non lu(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedThread ? getThreadTitle(selectedThread) : "Sélectionnez une conversation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedThread ? (
              <div className="flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === "current-user-id" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded ${
                          message.senderId === "current-user-id"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.sender.firstName} {message.sender.lastName}
                        </div>
                        <div>{message.content}</div>
                        <div className="text-xs mt-1 opacity-70">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage}>Envoyer</Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                Sélectionnez une conversation pour commencer
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
