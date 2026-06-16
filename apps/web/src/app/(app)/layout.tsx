import { Navbar } from "@/components/navbar";
import { ChatPopover } from "@/components/chat-popover";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
      <ChatPopover />
    </div>
  );
}
