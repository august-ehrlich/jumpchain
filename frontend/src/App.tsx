import React, { useState } from "react"
import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
import { AppSidebar } from "./components/layout/AppSidebar"
import HomeView from "./components/views/HomeView"
import DocumentListView from "./components/views/DocumentListView"
import { SidebarProvider } from "./components/ui/sidebar"
import { Toaster } from "./components/ui/sonner"

const App = () => {
  const [currentView, setCurrentView] = useState('home');

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        
        <AppSidebar currentView={currentView} setView={setCurrentView} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto">
            {currentView === 'home' && <HomeView />}
            {currentView === 'documents' && <DocumentListView />}
          </main>
          
          <Footer />
        </div>

      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  )
}

export default App