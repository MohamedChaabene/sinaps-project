"use client"

import * as React from "react"
import { MessageCircleIcon, MenuIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ConversationSidebar } from "@/components/chat/conversation-sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatThread } from "@/components/chat/chat-thread"
import { MessageComposer } from "@/components/chat/message-composer"
import { SatisfactionDialog } from "@/components/chat/satisfaction-dialog"
import { toast } from "sonner"
import { conversations as initialConversations, type Conversation } from "@/lib/chat-data"

export function SupportChatApp() {
  const [conversations, setConversations] = React.useState<Conversation[]>(initialConversations)
  const [activeId, setActiveId] = React.useState<string | null>(initialConversations[0]?.id ?? null)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [satisfactionOpen, setSatisfactionOpen] = React.useState(false)

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  function handleSelect(id: string) {
    setActiveId(id)
    setSidebarOpen(false)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    )
  }

  function handleSend(text: string) {
    if (!activeConversation) return
    const now = new Date()
    const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              lastMessage: text,
              messages: [
                ...c.messages,
                { id: `m-${Date.now()}`, sender: "client", content: text, time },
              ],
            }
          : c
      )
    )

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `m-${Date.now() + 1}`,
                    sender: "ia",
                    content: "Merci pour votre message ! Je transmets ça à un agent si besoin 🤖",
                    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                  },
                ],
              }
            : c
        )
      )
    }, 900)
  }

  function handleEscalate() {
    if (!activeConversation) return
    toast("Basculement vers un agent humain 👋", {
      description: `${activeConversation.clientName} sera bientôt pris en charge par un conseiller.`,
    })
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, status: "en_attente" as const } : c
      )
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden w-72 shrink-0 border-r border-sidebar-border md:block">
        <ConversationSidebar conversations={conversations} activeId={activeId} onSelect={handleSelect} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fermer la liste des conversations"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar shadow-xl">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(false)} aria-label="Fermer">
                <XIcon />
              </Button>
            </div>
            <ConversationSidebar conversations={conversations} activeId={activeId} onSelect={handleSelect} />
          </div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        {activeConversation ? (
          <>
            <div className="flex items-center gap-2 border-b border-border bg-card px-2 py-2 md:hidden">
              <Button variant="ghost" size="icon-sm" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir la liste des conversations">
                <MenuIcon />
              </Button>
              <span className="font-heading text-sm font-bold">Conversations</span>
            </div>
            <ChatHeader conversation={activeConversation} onEscalate={handleEscalate} />
            <ChatThread conversation={activeConversation} />
            <MessageComposer onSend={handleSend} />
            <div className="flex justify-center border-t border-border bg-card px-4 py-2">
              <button
                type="button"
                onClick={() => setSatisfactionOpen(true)}
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Clôturer la conversation
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleIcon />
                </EmptyMedia>
                <EmptyTitle>Aucune conversation sélectionnée</EmptyTitle>
                <EmptyDescription>
                  Choisissez une conversation dans la liste pour commencer à discuter.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)} className="md:hidden">
                  Voir les conversations
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        )}
      </main>

      {activeConversation && (
        <SatisfactionDialog
          open={satisfactionOpen}
          onOpenChange={setSatisfactionOpen}
          clientName={activeConversation.clientName}
        />
      )}
    </div>
  )
}
