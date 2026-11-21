import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleCheck,
  FileText,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { Brand } from "../components/common/UI";
import { useApp } from "../context/AppContext";
import { apiErrorMessage } from "../services/apiClient";

export function LandingPage() {
  const { complaints } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="landing">
      <nav className="public-nav">
        <Brand />
        <div className={`public-links ${menuOpen ? "show" : ""}`}>
          <a href="#how-it-works">How it works</a>
          <a href="#services">Our services</a>
          <Link to="/track">Track a complaint</Link>
          <Link className="mobile-login" to="/login">
            Log in
          </Link>
        </div>
        <div className="nav-right">
          <Link className="login-link" to="/login">
            Log in
          </Link>
          <Link to="/login" className="button button-primary nav-cta">
            Get started <ArrowRight size={16} />
          </Link>
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-tag">
              <span className="live-dot" /> A BETTER WAY TO BE HEARD
            </span>
            <h1>
              Your voice.
              <br />
              <em>Our responsibility.</em>
            </h1>
            <p>
              One simple place to report civic issues, follow their progress,
              and help make your community a better place to live.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary button-large" to="/login">
                Submit a complaint <ArrowRight size={17} />
              </Link>
              <Link className="button button-outline button-large" to="/track">
                Track a complaint <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars">
                <span>AS</span>
                <span>RK</span>
                <span>PM</span>
                <b>+</b>
              </div>
              <p>
                <strong>Built around your community</strong>
                <br />
                Every report helps us do better.
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-map">
              <div className="map-grid" />
              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />
              <div className="map-river" />
              <div className="map-label label-sector">SECTOR 18</div>
              <div className="map-label label-park">CITY PARK</div>
              <div className="map-label label-noida">NOIDA</div>
              <div className="map-pin pin-one">
                <MapPin size={18} fill="currentColor" />
              </div>
              <div className="map-pin pin-two">
                <MapPin size={18} fill="currentColor" />
              </div>
              <div className="map-pin pin-three">
                <MapPin size={18} fill="currentColor" />
              </div>
              <div className="map-legend">
                <span>
                  <i className="green-pin" />
                  Resolved
                </span>
                <span>
                  <i className="orange-pin" />
                  In progress
                </span>
                <span>
                  <i className="red-pin" />
                  New report
                </span>
              </div>
            </div>
            <article className="floating-update">
              <span className="update-check">
                <Check size={14} />
              </span>
              <div>
                <strong>Complaint resolved</strong>
                <small>CMP-2026-004 · 2 hours ago</small>
              </div>
              <span className="update-arrow">
                <ArrowUpRight size={14} />
              </span>
            </article>
            <div className="floating-count">
              <span className="count-icon">
                <CircleCheck size={17} />
              </span>
              <span>
                <strong>
                  {complaints.filter((c) => c.status === "Resolved").length}
                </strong>
                <small>issues resolved this month</small>
              </span>
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="hero-bottomline">
            <span>PUBLIC SERVICES, MOVING FORWARD</span>
            <span>PRAYAGRAJ · NOIDA · GREATER NOIDA</span>
          </div>
        </section>
        <section id="how-it-works" className="how-section section-pad">
          <div className="section-kicker">SIMPLE BY DESIGN</div>
          <div className="section-heading-row">
            <div>
              <h2>
                From report to resolution.
                <br />
                <em>Every step, in the open.</em>
              </h2>
            </div>
            <p>
              No forms to chase. No wondering what happens next. Just a clear
              path from the moment you speak up.
            </p>
          </div>
          <div className="steps-grid">
            {[
              {
                n: "01",
                icon: FileText,
                title: "Tell us what’s wrong",
                body: "Share the issue, add a location and a photo. Our smart system routes it to the right team.",
              },
              {
                n: "02",
                icon: Sparkles,
                title: "Your team gets to work",
                body: "The responsible department picks it up and keeps you posted as work progresses.",
              },
              {
                n: "03",
                icon: CircleCheck,
                title: "See it get resolved",
                body: "Follow every milestone and see the resolution notes when the work is done.",
              },
            ].map(({ n, icon: Icon, title, body }) => (
              <article className="step-card" key={n}>
                <div className="step-top">
                  <span>{n}</span>
                  <Icon size={19} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="step-line" />
              </article>
            ))}
          </div>
        </section>
        <section id="services" className="services-section section-pad">
          <div className="section-kicker">HERE WHEN YOU NEED US</div>
          <div className="section-heading-row">
            <h2>
              Everyday issues.
              <br />
              <em>Real progress.</em>
            </h2>
            <Link className="inline-link" to="/login">
              Report an issue <ArrowRight size={15} />
            </Link>
          </div>
          <div className="category-grid">
            {[
              {
                icon: "01",
                name: "Roads & footpaths",
                detail: "Potholes, broken pavements, unsafe crossings",
                tone: "cat-blue",
              },
              {
                icon: "02",
                name: "Waste management",
                detail: "Missed collections, overflowing bins, litter",
                tone: "cat-green",
              },
              {
                icon: "03",
                name: "Water supply",
                detail: "Leaks, low pressure, supply disruptions",
                tone: "cat-cyan",
              },
              {
                icon: "04",
                name: "Drainage & sewage",
                detail: "Blocked drains, flooding, sewage concerns",
                tone: "cat-purple",
              },
              {
                icon: "05",
                name: "Street lighting",
                detail: "Outages, damaged fixtures, dark streets",
                tone: "cat-orange",
              },
              {
                icon: "06",
                name: "And more",
                detail: "Electricity and other civic concerns",
                tone: "cat-gray",
              },
            ].map((category) => (
              <article className="category-card" key={category.name}>
                <span className={`category-mark ${category.tone}`}>
                  {category.icon}
                </span>
                <h3>{category.name}</h3>
                <p>{category.detail}</p>
                <ArrowUpRight size={15} className="category-arrow" />
              </article>
            ))}
          </div>
        </section>
        <section className="trust-section">
          <div className="trust-copy">
            <span className="section-kicker">A MORE RESPONSIVE CITY</span>
            <h2>
              Good governance
              <br />
              starts with <em>listening.</em>
            </h2>
            <p>
              Every report is a chance to make public services work a little
              better. We bring the right people together, keep the process
              clear, and make progress visible.
            </p>
            <Link to="/login" className="button button-primary">
              Help make a difference <ArrowRight size={16} />
            </Link>
          </div>
          <div className="trust-stats">
            <div>
              <strong>
                24<span>h</span>
              </strong>
              <small>Average first response</small>
              <div className="trust-stat-line">
                <i style={{ width: "78%" }} />
              </div>
            </div>
            <div>
              <strong>
                94<span>%</span>
              </strong>
              <small>Reports routed correctly</small>
              <div className="trust-stat-line">
                <i style={{ width: "94%" }} />
              </div>
            </div>
            <div>
              <strong>
                3<span>×</span>
              </strong>
              <small>More visibility for residents</small>
              <div className="trust-stat-line">
                <i style={{ width: "67%" }} />
              </div>
            </div>
            <span className="trust-note">
              <ShieldCheck size={16} />
              Transparent by default
            </span>
          </div>
        </section>
        <section className="cta-section">
          <div>
            <span className="section-kicker">YOUR COMMUNITY, YOUR VOICE</span>
            <h2>Something needs attention?</h2>
            <p>It only takes a moment to let the right people know.</p>
          </div>
          <Link to="/login" className="button button-white">
            Submit your first report <ArrowRight size={16} />
          </Link>
        </section>
      </main>
      <footer className="public-footer">
        <div>
          <Brand />
          <p>
            Better public services begin with
            <br />a conversation.
          </p>
        </div>
        <div className="footer-links">
          <a href="#how-it-works">How it works</a>
          <a href="#services">Services</a>
          <Link to="/track">Track a complaint</Link>
          <Link to="/login">Log in</Link>
        </div>
        <div className="footer-contact">
          <span>HAVE A QUESTION?</span>
          <a href="mailto:support@civicresolve.in">support@civicresolve.in</a>
          <small>© 2026 CivicResolve · Prayagraj, Uttar Pradesh</small>
        </div>
      </footer>
    </div>
  );
}

export function LoginPage() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = isRegistering
        ? await register({ name, phone, email, password })
        : await login({ email, password });
      navigate(`/${user.role}/dashboard`);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Brand />
        <Link to="/" className="text-button">
          Back to home <ArrowRight size={15} />
        </Link>
      </header>
      <div className="auth-main">
        <section className="auth-intro">
          <span className="hero-tag">
            <span className="live-dot" /> CIVIC SERVICES, CONNECTED
          </span>
          <h1>
            Good to have
            <br />
            <em>you here.</em>
          </h1>
          <p>
            Sign in to report an issue, check on a request, or help your
            community move forward.
          </p>
          <div className="auth-points">
            <span>
              <Check size={15} /> Follow your complaint, step by step
            </span>
            <span>
              <Check size={15} /> Get updates from the right department
            </span>
            <span>
              <Check size={15} /> Be part of a more responsive city
            </span>
          </div>
          <div className="auth-mini-stat">
            <Timer size={18} />
            <span>
              <strong>Every voice deserves a response.</strong>
              <small>We make sure your report reaches the right team.</small>
            </span>
          </div>
        </section>
        <section className="login-card">
          <span className="eyebrow">{isRegistering ? "GET STARTED" : "WELCOME BACK"}</span>
          <h2>{isRegistering ? "Create a citizen account" : "Sign in to CivicResolve"}</h2>
          <p className="login-subtitle">
            {isRegistering ? "Create an account to submit and track civic reports." : "Use your account to continue to your workspace."}
          </p>
          <form onSubmit={submit} className="login-form">
            {isRegistering && <>
              <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} placeholder="Your full name" /></label>
              <label>Phone number <span className="optional-label">Optional</span><input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="Your phone number" /></label>
            </>}
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegistering ? "At least 8 characters" : "Enter your password"}
                minLength={isRegistering ? 8 : undefined}
              />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button className="button button-primary login-submit" disabled={busy}>
              {busy ? "Please wait…" : isRegistering ? "Create account" : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>
          <p className="demo-copy">
            {isRegistering ? "Already have an account?" : "New to CivicResolve?"}{" "}
            <button type="button" className="text-button" onClick={() => { setIsRegistering((value) => !value); setError(""); }}>
              {isRegistering ? "Sign in" : "Create a citizen account"}
            </button>
          </p>
          <p className="auth-legal">
            By continuing, you agree to our{" "}
            <a href="mailto:support@civicresolve.in">Terms of Service</a> and{" "}
            <a href="mailto:support@civicresolve.in">Privacy Policy</a>.
          </p>
        </section>
      </div>
      <footer className="auth-footer">
        <span>© 2026 CivicResolve</span>
        <span>Public services, moving forward.</span>
      </footer>
    </div>
  );
}
