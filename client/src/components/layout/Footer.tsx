import { Link } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { useSettings } from "../../state/settings";
import "./Footer.css";

export function Footer() {
  const { token, user } = useAuth();
  const { t } = useSettings();
  const canSeeReports = user?.role === "MANAGER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <div className="siteFooterBrand">
          <Link to="/" className="siteFooterTitle">
            {t("nav.brand")}
          </Link>
          <p className="siteFooterTagline">{t("footer.tagline")}</p>
          <p className="siteFooterCopy">{t("footer.copyright")}</p>
        </div>

        <div className="siteFooterCol">
          <p className="siteFooterHeading">{t("footer.sections")}</p>
          <nav className="siteFooterNav" aria-label={t("footer.sections")}>
            <Link to="/">{t("nav.home")}</Link>
            {token ? (
              <>
                <Link to="/resources">{t("nav.resources")}</Link>
                <Link to="/bookings">{t("nav.bookings")}</Link>
              </>
            ) : (
              <>
                <Link to="/login">{t("nav.login")}</Link>
                <Link to="/register">{t("common.register")}</Link>
              </>
            )}
          </nav>
        </div>

        <div className="siteFooterCol">
          <p className="siteFooterHeading">{t("footer.workPages")}</p>
          <nav className="siteFooterNav" aria-label={t("footer.workPages")}>
            {token ? (
              <>
                <Link to="/favorites">{t("nav.favorites")}</Link>
                <Link to="/tariffs">{t("nav.tariffs")}</Link>
                <Link to="/profile">{t("nav.profile")}</Link>
                {canSeeReports && <Link to="/reports">{t("nav.reports")}</Link>}
                {isAdmin && <Link to="/admin">{t("nav.admin")}</Link>}
              </>
            ) : (
              <span className="siteFooterMuted">{t("footer.loginHint")}</span>
            )}
          </nav>
        </div>

        <div className="siteFooterCol">
          <p className="siteFooterHeading">{t("footer.contacts")}</p>
          <div className="siteFooterContacts">
            <a href="tel:+375291234567">{t("footer.phone")}</a>
            <a href="mailto:info@cowork.local">{t("footer.email")}</a>
            <p className="siteFooterMuted">{t("footer.locations")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
