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
import Login from './pages/Login';
import TutorDashboard from './pages/TutorDashboard';
import TutorProfile from './pages/TutorProfile';
import Students from './pages/Students';
import TutorApplication from './pages/TutorApplication';
import ApplicationStatus from './pages/ApplicationStatus';
import Flashcards from './pages/Flashcards';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Accessibility from './pages/Accessibility';
import AdminDashboard from './pages/AdminDashboard';
import Sources from './pages/Sources';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';


function DashboardRouter() {
    const { role } = useAuth();
    return role === 'tutor' ? <TutorDashboard /> : <Dashboard />;
}

function AppContent() {
    const location = useLocation();

    // Pages that should NOT have navbar/footer (standalone pages)
    const standalonePages = ['/quiz', '/problems', '/video', '/lesson', '/login'];
    const isStandalone = standalonePages.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

    return (
      <div className="app">
        {/* Skip link lets keyboard and screen reader users jump past the navbar */}
        <a href="#main-content" className="skip-to-main">Skip to main content</a>
        {!isStandalone && <Navbar />}
        <main id="main-content" className={isStandalone ? "standalone-content" : "main-content"}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><TutorProfile /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute><TutorApplication /></ProtectedRoute>} />
            <Route path="/apply/status" element={<ProtectedRoute><ApplicationStatus /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
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
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
