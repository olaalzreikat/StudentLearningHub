// Home page — the landing page users see first
import "./Home.css";
import homehero from "../assets/home-hero.jpg";
import hometutor from "../assets/home-tutor.jpg";
import tutor2 from "../assets/tutor2.jpg";
import tutor3 from "../assets/tutor3.jpg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CallToAction from "../components/CallToAction.jsx";

const TUTOR_IMAGES = [hometutor, tutor2, tutor3];

function Home() {
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveImg(i => (i + 1) % TUTOR_IMAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const container = document.querySelector('.steps-boxes-container');
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          container.querySelectorAll('.steps-box').forEach(b => b.classList.add('visible'));
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Navigation shortcuts used by buttons
  const actionResources = () => navigate("/resources");
  const actionSchedule  = () => navigate("/schedule");

  return (
    <div className="home-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="home-hero" aria-label="Hero">

        {/* Decorative floating math symbols */}
        <div className="hero-symbols" aria-hidden="true">
          <span className="hero-sym" style={{ fontSize:'78px',  top:'10%',    left:'6%',    '--dur':'10s', '--delay':'0s',   '--dy':'-28px', '--r0':'-5deg',  '--r1':'4deg'  }}>π</span>
          <span className="hero-sym" style={{ fontSize:'60px',  top:'18%',    right:'8%',   '--dur':'12s', '--delay':'1.3s', '--dy':'-36px', '--r0':'3deg',   '--r1':'-5deg' }}>∑</span>
          <span className="hero-sym" style={{ fontSize:'96px',  bottom:'16%', left:'11%',   '--dur':'14s', '--delay':'0.7s', '--dy':'-20px', '--r0':'8deg',   '--r1':'-3deg' }}>√</span>
          <span className="hero-sym" style={{ fontSize:'52px',  top:'52%',    right:'13%',  '--dur':'11s', '--delay':'2.1s', '--dy':'-30px', '--r0':'-4deg',  '--r1':'6deg'  }}>∞</span>
          <span className="hero-sym" style={{ fontSize:'68px',  top:'7%',     left:'44%',   '--dur':'9s',  '--delay':'0.9s', '--dy':'-18px', '--r0':'2deg',   '--r1':'-4deg' }}>∫</span>
          <span className="hero-sym" style={{ fontSize:'44px',  bottom:'22%', right:'6%',   '--dur':'13s', '--delay':'1.9s', '--dy':'-34px', '--r0':'-7deg',  '--r1':'3deg'  }}>Δ</span>
          <span className="hero-sym" style={{ fontSize:'56px',  top:'62%',    left:'4%',    '--dur':'10s', '--delay':'3.1s', '--dy':'-24px', '--r0':'5deg',   '--r1':'-2deg' }}>θ</span>
          <span className="hero-sym" style={{ fontSize:'38px',  top:'35%',    right:'3%',   '--dur':'8s',  '--delay':'2.8s', '--dy':'-20px', '--r0':'-3deg',  '--r1':'5deg'  }}>≠</span>
        </div>

        <div className="home-hero-blue">
          <div className="home-hero-text">

            <div className="hero-eyebrow">
              Free for all students
            </div>

            <h1>
              {"Learning Equals Success".split("").map((char, i) =>
                char === " "
                  ? <span key={i} className="hero-letter-space">{' '}</span>
                  : <span key={i} className="hero-letter">{char}</span>
              )}
            </h1>

            <p>
              Equalizer Learning Hub offers classes, quizzes, tutors, and everything you need to master mathematics.
            </p>

            <div className="hero-cta-row">
              <button className="get-started-btn" onClick={actionResources}>
                Get Started Today
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

          {/* Decorative floating math symbols */}
          <div className="steps-syms" aria-hidden="true">
            {/* top-left */}
            <span className="steps-sym" style={{ fontSize:'72px', top:'4%',  left:'2%',  '--dur':'11s', '--delay':'0s',   '--dy':'-24px', '--r0':'-5deg', '--r1':'4deg'  }}>∑</span>
            <span className="steps-sym" style={{ fontSize:'50px', top:'14%', left:'10%', '--dur':'9s',  '--delay':'1.5s', '--dy':'-18px', '--r0':'3deg',  '--r1':'-4deg' }}>×</span>
            <span className="steps-sym" style={{ fontSize:'58px', top:'3%',  left:'18%', '--dur':'13s', '--delay':'0.8s', '--dy':'-28px', '--r0':'6deg',  '--r1':'-3deg' }}>∞</span>
            {/* bottom-right */}
            <span className="steps-sym" style={{ fontSize:'80px', bottom:'6%',  right:'2%',  '--dur':'12s', '--delay':'0.3s', '--dy':'-26px', '--r0':'7deg',  '--r1':'-4deg' }}>π</span>
            <span className="steps-sym" style={{ fontSize:'52px', bottom:'14%', right:'10%', '--dur':'10s', '--delay':'1.7s', '--dy':'-20px', '--r0':'-3deg', '--r1':'6deg'  }}>²</span>
            <span className="steps-sym" style={{ fontSize:'60px', bottom:'3%',  right:'16%', '--dur':'14s', '--delay':'2.5s', '--dy':'-32px', '--r0':'4deg',  '--r1':'-5deg' }}>√</span>
          </div>

          <div className="steps-container">
            <p className="section-label">How it works</p>
            <h2>
              {"Three steps to success".split("").map((char, i) =>
                char === " "
                  ? <span key={i} className="steps-letter-space">{' '}</span>
                  : <span key={i} className="steps-letter">{char}</span>
              )}
            </h2>
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
            {TUTOR_IMAGES.map((src, i) => (
              <img
                key={i}
                className={`home-tutor-image${i === activeImg ? ' active' : ''}`}
                src={src}
                alt="Students studying together"
              />
            ))}
          </div>

          <div className="tutors-right">
            <p className="section-label">1-on-1 &amp; group sessions</p>
            <h1>Expert tutors, on your schedule</h1>
            <p>
              Hundreds of talented math tutors are available for live sessions,
              group study, and on-demand help whenever you need it.
            </p>
            <button className="home-action-btn" onClick={actionSchedule}>
              Browse Our Tutors
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
          </button>
          <div className="cta-small">
            <p>Free for students</p>
            <p>Works on any device</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;