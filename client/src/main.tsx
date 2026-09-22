import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./styles/utilities.css";
import "./styles/responsive.css";
import "./components/ui/Button.css";
import App from "./App.tsx";
import { AuthProvider } from "./state/auth.tsx";
import { SettingsProvider } from "./state/settings.tsx";
import { ToastProvider } from "./components/ui/Toast.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
