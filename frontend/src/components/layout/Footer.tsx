export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card/40">
      <div className="flex flex-col items-center justify-between gap-4 py-5 px-6 md:flex-row">
        
        {/* Branding & Copyright */}
        <div className="flex flex-col items-center gap-1 md:items-start">
          <p className="text-sm font-semibold leading-none text-foreground">
            JumpChain Tracker
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Build your ultimate chain. All rights reserved.
          </p>
        </div>
        
        {/* Mock Links */}
        <div className="flex gap-5 text-sm font-medium text-muted-foreground">
          <a href="https://github.com/august-ehrlich/jumpchain" className="hover:text-primary transition-colors">GitHub</a>
          <a href="#" className="hover:text-primary transition-colors">Discord</a>
          <a href="#" className="hover:text-primary transition-colors">About</a>
        </div>
      </div>
    </footer>
  )
}