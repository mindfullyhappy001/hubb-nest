import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navigation } from "./components/layout/Navigation";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Blog from "./pages/Blog";
import Apps from "./pages/Apps";
import BucketListApp from "./micro-apps/bucket-list/BucketListApp";
import DatingJournalApp from "./micro-apps/dating-journal/DatingJournalApp";
import DatingIdeasApp from "./micro-apps/dating-ideas/DatingIdeasApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/events" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/blog" element={
              <ProtectedRoute>
                <Blog />
              </ProtectedRoute>
            } />
            <Route path="/apps" element={
              <ProtectedRoute>
                <Apps />
              </ProtectedRoute>
            } />
            <Route path="/apps/bucket-list" element={
              <ProtectedRoute>
                <BucketListApp />
              </ProtectedRoute>
            } />
            <Route path="/apps/dating-journal" element={
              <ProtectedRoute>
                <DatingJournalApp />
              </ProtectedRoute>
            } />
            <Route path="/apps/dating-ideas" element={
              <ProtectedRoute>
                <DatingIdeasApp />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
