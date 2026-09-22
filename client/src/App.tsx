import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { Footer } from "./components/layout/Footer";
import { Topbar } from "./components/layout/Topbar";
import { useAuth } from "./state/auth";
import { useSettings } from "./state/settings";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { ResourcesPage } from "./pages/ResourcesPage.tsx";
import { BookingsPage } from "./pages/BookingsPage.tsx";
import { ReportsPage } from "./pages/ReportsPage.tsx";
import { FavoritesPage } from "./pages/FavoritesPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";
import { TariffsPage } from "./pages/TariffsPage.tsx";
import { AdminPage } from "./pages/AdminPage.tsx";
import { EmptyState } from "./components/ui/EmptyState";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return <>{children}</>;
}

function RequireManager({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const location = useLocation();
  if (!token) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  if (user?.role !== "MANAGER" && user?.role !== "ADMIN") {
    return <Navigate to="/resources" replace />;
  }
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const location = useLocation();
  if (!token) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  if (user?.role !== "ADMIN") {
    return <Navigate to="/resources" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { t } = useSettings();

  return (
    <div className="app">
      <Topbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/resources"
            element={
              <RequireAuth>
                <ResourcesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/favorites"
            element={
              <RequireAuth>
                <FavoritesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/bookings"
            element={
              <RequireAuth>
                <BookingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tariffs"
            element={
              <RequireAuth>
                <TariffsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireManager>
                <ReportsPage />
              </RequireManager>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<EmptyState title={t("common.notFoundTitle")} description={t("common.notFoundDesc")} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
