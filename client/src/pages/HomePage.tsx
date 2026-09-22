import { Link } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useSettings } from "../state/settings";
import {
  heroCowork1,
  heroCowork2,
  heroCowork3,
  showcaseWorkHours,
  showcaseTeamMeeting,
  showcaseEvent,
} from "../assets/images";
import { FeatureCard } from "../components/home/FeatureCard";
import { ShowcaseCard } from "../components/home/ShowcaseCard";
import "./HomePage.css";

export function HomePage() {
  const { token } = useAuth();
  const { t } = useSettings();

  const steps = [t("home.step1"), t("home.step2"), t("home.step3"), t("home.step4")];

  return (
    <div className="home">
      <section className="homeHero">
        <div className="homeHeroGlow" aria-hidden="true" />
        <div className="homeHeroContent">
          <h1 className="homeTitle">
            {t("home.titleMain")}
            <span className="homeTitleAccent">{t("home.titleAccent")}</span>
          </h1>
          <p className="homeSubtitle">{t("home.subtitle")}</p>
          <div className="homeActions">
            {token ? (
              <>
                <Link className="btn" to="/resources">
                  {t("home.goResources")}
                </Link>
                <Link className="btn btnSecondary" to="/tariffs">
                  {t("nav.tariffs")}
                </Link>
              </>
            ) : (
              <>
                <Link className="btn" to="/login">
                  {t("nav.login")}
                </Link>
                <Link className="btn btnSecondary" to="/register">
                  {t("common.register")}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="homeHeroMedia">
          <div className="mediaGrid">
            <img className="mediaImg floatA" src={heroCowork1} alt={t("home.altCowork")} loading="lazy" />
            <img className="mediaImg floatB" src={heroCowork2} alt={t("home.altMeeting")} loading="lazy" />
            <img className="mediaImg floatC" src={heroCowork3} alt={t("home.altTeam")} loading="lazy" />
          </div>
          <ol className="homeSteps">
            {steps.map((step, i) => (
              <li key={step} className="homeStep">
                <span className="homeStepNum">{i + 1}</span>
                <span className="homeStepText">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="homeSection">
        <div className="sectionHead">
          <h2 className="sectionTitle">{t("home.featuresTitle")}</h2>
          <p className="sectionLead">{t("home.featuresLead")}</p>
        </div>
        <div className="features">
          <FeatureCard index={1} title={t("home.featureFavTitle")} description={t("home.featureFavDesc")} />
          <FeatureCard index={2} title={t("home.featureBookTitle")} description={t("home.featureBookDesc")} />
          <FeatureCard index={3} title={t("home.featureTariffTitle")} description={t("home.featureTariffDesc")} />
        </div>
      </section>

      <section className="homeSection">
        <div className="sectionHead">
          <h2 className="sectionTitle">{t("home.scenariosTitle")}</h2>
          <p className="sectionLead">{t("home.scenariosLead")}</p>
        </div>
        <div className="showcaseGrid">
          <ShowcaseCard
            src={showcaseWorkHours}
            alt={t("home.altDesk")}
            caption={t("home.scenarioDesk")}
            to="/resources?typeCode=DESK"
          />
          <ShowcaseCard
            src={showcaseTeamMeeting}
            alt={t("home.altMeetingRoom")}
            caption={t("home.scenarioMeeting")}
            to="/resources?typeCode=MEETING"
          />
          <ShowcaseCard
            src={showcaseEvent}
            alt={t("home.altEvent")}
            caption={t("home.scenarioEvent")}
            to="/resources?typeCode=EVENT"
          />
        </div>
        <div className="ctaBand">
          <div className="ctaBandText">
            <p className="ctaTitle">{t("home.ctaTitle")}</p>
            <p className="ctaLead">{t("home.ctaLead")}</p>
          </div>
          <Link className="btn ctaBtn" to={token ? "/resources" : "/login"}>
            {token ? t("home.openResources") : t("home.loginContinue")}
          </Link>
        </div>
      </section>
    </div>
  );
}
