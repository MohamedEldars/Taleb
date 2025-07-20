import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Upload from "@/pages/upload";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/BottomNavigation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen relative">
      {/* Header */}
      {isAuthenticated && (
        <header className="bg-white border-b border-neutral-200 px-4 py-3 sticky top-0 z-50" dir="rtl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-primary">طالب</h1>
              <span className="text-sm text-neutral-500 font-medium">Taleb</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-neutral-600 hover:text-primary transition-colors">
                <i className="fas fa-search text-lg"></i>
              </button>
              <button className="p-2 text-neutral-600 hover:text-primary transition-colors relative">
                <i className="fas fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              <button 
                onClick={() => window.location.href = '/api/logout'}
                className="p-2 text-neutral-600 hover:text-red-500 transition-colors"
              >
                <i className="fas fa-sign-out-alt text-lg"></i>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={isAuthenticated ? "pb-20" : ""}>
        <Switch>
          {isLoading || !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/profile" component={Profile} />
              <Route path="/upload" component={Upload} />
              <Route path="/admin" component={Admin} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* Bottom Navigation */}
      {isAuthenticated && <BottomNavigation />}

      {/* Floating Action Button */}
      {isAuthenticated && (
        <button 
          onClick={() => window.location.href = '/upload'}
          className="fixed bottom-24 right-4 bg-accent text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
        >
          <i className="fas fa-edit text-xl"></i>
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
