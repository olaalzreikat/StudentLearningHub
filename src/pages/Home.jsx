// Home page — the landing page users see first
import "./Home.css";
import homehero from "../assets/home-hero.jpg";
import hometutor from "../assets/home-tutor.jpg";
import { useNavigate } from "react-router-dom";
import CallToAction from "../components/CallToAction.jsx";

function Home() {
  const navigate = useNavigate();

  // Navigation shortcuts used by buttons
  const actionResources = () => navigate("/resources");
  const actionSchedule  = () => navigate("/schedule");

  return (
    <div className="home-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="home-hero" aria-label="Hero">
        <div className="home-hero-blue">
          <div className="home-hero-text">

            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" aria-hidden="true" />
              Free for all students
            </div>

            <h1>Learning Equals Success</h1>

            <p>
              Equalizer Learning Hub offers classes, quizzes, tutors, and everything you need to master mathematics.
            </p>

            <div className="hero-cta-row">
              <button className="get-started-btn" onClick={actionResources}>
                Get Started Today
                <span className="home-action-arrow" aria-hidden="true">→</span>
              </button>
              <button className="hero-secondary-link" onClick={actionSchedule}>
                Browse tutors
              </button>
            </div>



          </div>
        </div>

        {/* Decorative scroll indicator — hidden from screen readers */}
        <div className="scroll-cue" aria-hidden="true">
          <div className="scroll-cue-line" />
          <div className="scroll-cue-line2" />
        </div>
      </section>

      <div className="home-container">

        {/* ── Steps ────────────────────────────────────────────── */}
        <section className="steps-wrapper" aria-label="How it works">
          <div className="steps-container">
            <p className="section-label">How it works</p>
            <h2>Three steps to success</h2>
            <p className="steps-p">
              A clear path from where you are to where you want to be.
            </p>

            <div className="steps-boxes-container">
              <div className="steps-box">
                <div className="step-icon">1</div>
                <h2>Choose Your Path</h2>
                <p>
                  Browse our library organized by topic and difficulty. Select
                  materials that match your current learning goals.
                </p>
              </div>

              <div className="steps-box">
                <div className="step-icon">2</div>
                <h2>Learn &amp; Practice</h2>
                <p>
                  Watch video tutorials, take interactive quizzes, and schedule
                  live tutoring. Get instant feedback on every problem.
                </p>
              </div>

              <div className="steps-box">
                <div className="step-icon">3</div>
                <h2>Track &amp; Improve</h2>
                <p>
                  Monitor your journey with detailed analytics and personalized
                  recommendations to accelerate your growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tutors ───────────────────────────────────────────── */}
        <div className="tutors-container">
          <div className="home-tutor-image-container">
            <img
              className="home-tutor-image"
              src={hometutor}
              alt="Students studying together"
            />
          </div>

          <div className="tutors-right">
            <p className="section-label">1-on-1 &amp; group sessions</p>
            <h1>Expert tutors, on your schedule</h1>
            <p>
              Hundreds of talented math tutors are available for live sessions,
              group study, and on-demand help whenever you need it.
            </p>
            <button className="home-action-btn" onClick={actionSchedule}>
              Browse Our Tutors →
            </button>
          </div>
        </div>

        {/* ── CTA — original gradient ───────────────────────────── */}
        <div className="cta-container">
          <CallToAction />
          <p>
            Join hundreds of students already improving their grades and
            building lasting confidence in mathematics.
          </p>
          <button className="home-action-btn cta-get-started-btn" onClick={actionResources}>
            Get Started
            <span className="cta-arrows" aria-hidden="true">
              <span className="cta-arrow">›</span>
              <span className="cta-arrow">›</span>
              <span className="cta-arrow">›</span>
            </span>
          </button>
          <div className="cta-small">
            <p>Free for students</p>
            <p>No account required</p>
            <p>Works on any device</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;