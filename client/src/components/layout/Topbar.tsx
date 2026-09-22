import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "../../state/auth";
import { useSettings } from "../../state/settings";
import "./Topbar.css";

export function Topbar() {
  const { user, token, logout } = useAuth();
  const { t } = useSettings();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const canSeeReports = user?.role === "MANAGER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="brand">
          <Link to="/" className="brandLink" onClick={closeMenu}>
            {t("nav.brand")}
          </Link>
        </div>

        <button
          type="button"
          className="navToggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navToggleBar" />
          <span className="navToggleBar" />
          <span className="navToggleBar" />
        </button>
        <nav
          id="main-nav"
          className={`nav${menuOpen ? " navOpen" : ""}`}
          aria-label={t("nav.main")}
        >
          <Link to="/" onClick={closeMenu}>
            {t("nav.home")}
          </Link>
          {token && (
            <>
              <Link to="/resources" onClick={closeMenu}>
                {t("nav.resources")}
              </Link>
              <Link to="/favorites" onClick={closeMenu}>
                {t("nav.favorites")}
              </Link>
              <Link to="/bookings" onClick={closeMenu}>
                {t("nav.bookings")}
              </Link>
              <Link to="/tariffs" onClick={closeMenu}>
                {t("nav.tariffs")}
              </Link>
              <Link to="/profile" onClick={closeMenu}>
                {t("nav.profile")}
              </Link>
            </>
          )}
          {canSeeReports && (
            <Link to="/reports" onClick={closeMenu}>
              {t("nav.reports")}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={closeMenu}>
              {t("nav.admin")}
            </Link>
          )}
          {token ? (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                closeMenu();
                logout();
              }}
            >
              {t("nav.logout")}
            </Button>
          ) : (
            <Link to="/login" onClick={closeMenu}>
              {t("nav.login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
