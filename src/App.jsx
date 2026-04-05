import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Quiz from './pages/Quiz';
import Problems from './pages/Problems';
import Video from './pages/Video';
import Lesson from './pages/Lesson';


function AppContent() {
    const location = useLocation();

    // Pages that should NOT have navbar/footer (standalone pages)
    const standalonePages = ['/quiz', '/problems', '/video', '/lesson'];
    const isStandalone = standalonePages.includes(location.pathname);

    return (
      <div className="app">
        {/* Skip link — lets keyboard/screen-reader users jump past the navbar */}
        <a href="#main-content" className="skip-to-main">Skip to main content</a>
        {!isStandalone && <Navbar />}
        <main id="main-content" className={isStandalone ? "standalone-content" : "main-content"}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/video" element={<Video />} />
            <Route path="/lesson" element={<Lesson />} />
          </Routes>
        </main>
        {!isStandalone && <Footer />}
      </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
