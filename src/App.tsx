
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import BusinessProfile from "@/pages/BusinessProfile";
import ViewBusinessProfile from "@/pages/ViewBusinessProfile";
import BusinessesPage from "@/pages/BusinessesPage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/business/edit" element={<BusinessProfile />} />
          <Route path="/business/:businessId" element={<ViewBusinessProfile />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
