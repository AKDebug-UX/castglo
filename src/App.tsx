import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import TalentProfile from "./pages/TalentProfile";

// Public pages
import Index from "./pages/Index";
import BrowseTalent from "./pages/BrowseTalent";
import SignIn from "./pages/SignIn";
import Join from "./pages/Join";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Help from "./pages/Help";
import FAQ from "./pages/FAQ";
import Guides from "./pages/Guides";
import Careers from "./pages/Careers";
import Hub from "./pages/Hub";
import Chat from "./pages/Chat";
import PublicCastingDetail from "./pages/PublicCasting/PublicCastingDetail";
import PublicCasting from "./pages/PublicCasting";

// Talent Dashboard
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/dashboard/Profile";
import BrowseCast from "./pages/dashboard/BrowseCast";
import CastingDetail from "./pages/dashboard/CastingDetail";
import SubmitAudition from "./pages/dashboard/SubmitAudition";
import Submissions from "./pages/dashboard/Submissions";
import Messages from "./pages/dashboard/Messages";
import Notifications from "./pages/dashboard/Notifications";
import InstantAudition from "./pages/dashboard/InstantAudition";
import Livestream from "./pages/dashboard/Livestream";
import LivestreamsList from "./pages/dashboard/LivestreamsList";
import VerificationProcess from "./pages/dashboard/VerificationProcess";

// Director Dashboard
import { DirectorLayout } from "./components/dashboard/DirectorLayout";
import DirectorDashboard from "./pages/director/DirectorDashboard";
import MyProjects from "./pages/director/MyProjects";
import CreateCasting from "./pages/director/CreateCasting";
import DirectorSubmissions from "./pages/director/DirectorSubmissions";
import DirectorMessages from "./pages/director/DirectorMessages";

// Professional Dashboard
import { AdminLayout } from "./components/dashboard/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ModerationQueue from "./pages/admin/ModerationQueue";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import UsersManagement from "./pages/admin/UsersManagement";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import VerificationManagement from "./pages/admin/VerificationManagement";

// Professional Dashboard
import { ProfessionalLayout } from "./components/dashboard/ProfessionalLayout";
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import ProfessionalProfile from "./pages/professional/ProfessionalProfile";
import ProfessionalServices from "./pages/professional/ProfessionalServices";
import BrowseTalents from "./pages/professional/BrowseTalents";
import ProfessionalBookings from "./pages/professional/ProfessionalBookings";
import ProfessionalMessages from "./pages/professional/ProfessionalMessages";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutPage from './pages/CheckoutPage';
import CommunityGuidelines from './pages/CommunityGuidelines';
import SafetyGuidelines from './pages/SafetyGuidelines';
import CopyrightPolicy from './pages/CopyrightPolicy';
import AntiScamGuidelines from './pages/AntiScamGuidelines';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Elements stripe={stripePromise}>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/browse-talent" element={<BrowseTalent />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/hub" element={<Hub />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/join" element={<Join />} />
              <Route path="/join/:type" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsArticle />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/talent/:id" element={<TalentProfile />} />
              <Route path="/browse-cast" element={<PublicCasting />} />
              <Route path="/browse-cast/:id/submit" element={<SubmitAudition />} />
              <Route path="/cast/:id" element={<PublicCastingDetail />} />
              <Route path="/livestream/:id" element={<Livestream />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/community-guidelines" element={<CommunityGuidelines />} />
              <Route path="/safety-guidelines" element={<SafetyGuidelines />} />
              <Route path="/copyright-policy" element={<CopyrightPolicy />} />
              <Route path="/anti-scam-guidelines" element={<AntiScamGuidelines />} />
              {/* Talent Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["talent"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="browse-cast" element={<BrowseCast />} />
                <Route path="browse-cast/:id" element={<CastingDetail />} />
                <Route path="browse-cast/:id/submit" element={<SubmitAudition />} />
                <Route path="submissions" element={<Submissions />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="livestreams" element={<LivestreamsList />} />
                <Route path="audition" element={<InstantAudition />} />
                <Route path="livestream/:id" element={<Livestream />} />
                <Route path="verification-process" element={<VerificationProcess />} />
              </Route>

              {/* Director Dashboard Routes */}
              <Route
                path="/director"
                element={
                  <ProtectedRoute allowedRoles={["casting_director"]}>
                    <DirectorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DirectorDashboard />} />
                <Route path="projects" element={<MyProjects />} />
                <Route path="projects/:id/edit" element={<CreateCasting />} />
                <Route path="create" element={<CreateCasting />} />
                <Route path="submissions" element={<DirectorSubmissions />} />
                <Route path="submissions/:id" element={<DirectorSubmissions />} />
                <Route path="messages" element={<DirectorMessages />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="livestreams" element={<LivestreamsList />} />
                <Route path="audition" element={<InstantAudition />} />
                <Route path="livestream/:id" element={<Livestream />} />
              </Route>

              {/* Professional Dashboard Routes */}
              <Route
                path="/professional"
                element={
                  <ProtectedRoute allowedRoles={["industry_professional"]}>
                    <ProfessionalLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProfessionalDashboard />} />
                <Route path="profile" element={<ProfessionalProfile />} />
                <Route path="services" element={<ProfessionalServices />} />
                <Route path="talents" element={<BrowseTalents />} />
                <Route path="bookings" element={<ProfessionalBookings />} />
                <Route path="messages" element={<ProfessionalMessages />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              {/* Admin Dashboard Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="moderation" element={<ModerationQueue />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="submissions" element={<AdminSubmissions />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="verification" element={<VerificationManagement />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Elements>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
