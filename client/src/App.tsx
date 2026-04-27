import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfigProvider } from "@/hooks/use-config";
import NewsTicker from "@/components/NewsTicker";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import BlogDetail from "./pages/BlogDetail.tsx";

import { QuoteProvider, useQuote } from "@/hooks/use-quote";

import QuoteWizard from "@/components/QuoteWizard";
import ChatBot from "@/components/ChatBot";

const GlobalQuoteWizard = () => {
  const { isOpen, closeQuote } = useQuote();
  return <QuoteWizard isOpen={isOpen} onClose={closeQuote} />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider>
      <QuoteProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/blog/:serviceId" element={<BlogDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <NewsTicker />
          <GlobalQuoteWizard />
          <ChatBot />
        </TooltipProvider>
      </QuoteProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
