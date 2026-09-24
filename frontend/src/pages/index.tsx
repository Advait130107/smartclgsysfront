import { Link } from "react-router-dom";

const features = [
  ["Academic control", "Courses, subjects and timetables stay organized in one place."],
  ["Attendance & marks", "Track attendance and subject-wise performance without spreadsheet chaos."],
  ["Assignments & materials", "Share study material, collect submissions and keep deadlines visible."],
];

export default function HomePage() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <div className="landing-brand"><span className="landing-logo">SC</span> Smart College System</div>
        <div className="landing-nav-actions"><Link to="/login">Sign in</Link><Link className="landing-outline" to="/register">Student registration</Link></div>
      </nav>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">COLLEGE MANAGEMENT · ALL IN ONE</span>
          <h1>Run your college smarter, <em>not harder.</em></h1>
          <p>A focused digital campus for students, faculty and administrators — from enrollment and attendance to marks, assignments and resources.</p>
          <div className="hero-actions"><Link className="btn landing-primary" to="/login">Open the system →</Link><Link className="landing-text-link" to="/register">Create student account</Link></div>
          <div className="hero-trust"><span>✓ Role-based access</span><span>✓ PostgreSQL powered</span><span>✓ Secure JWT login</span></div>
        </div>
        <div className="hero-visual">
          <div className="dashboard-window">
            <div className="window-top"><span/><span/><span/></div>
            <div className="window-body"><div className="mini-sidebar"><b>SC</b><i/><i/><i/><i/></div><div className="mini-content"><div className="mini-title"/><div className="mini-cards"><i/><i/><i/></div><div className="mini-chart"/><div className="mini-lines"><i/><i/><i/></div></div></div>
          </div>
        </div>
      </section>
      <section className="landing-stats"><div><strong>3</strong><span>User roles</span></div><div><strong>10+</strong><span>Academic modules</span></div><div><strong>24/7</strong><span>Centralized access</span></div><div><strong>1</strong><span>Smart campus hub</span></div></section>
      <section className="feature-section"><div className="section-heading"><span className="eyebrow">BUILT FOR THE CAMPUS</span><h2>Everything your academic workflow needs.</h2></div><div className="feature-grid">{features.map(([title, text], index) => <article key={title}><span className="feature-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <footer className="landing-footer">Smart College System <span>•</span> Academic management made simple.</footer>
    </main>
  );
}
