import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { PrivyProvider } from "./providers/PrivyProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { NotificationProvider } from "./components/Notification";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <PrivyProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </ThemeProvider>
);
