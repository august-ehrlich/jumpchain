import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { SidebarTrigger } from "../ui/sidebar"
import { Shield, Settings } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2" />
          
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/50 shadow-sm text-primary">
            <Shield size={18} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            JumpChain
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings size={20} />
          </Button>
          
          <Avatar className="size-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}