import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import { Loader2 } from "lucide-react";
import { safeLazy as lazy } from "@/lib/lazy-loader";

// Public pages
const Index = lazy(() => import("./pages/Index"));
const BrowseTalent = lazy(() => import("./pages/BrowseTalent"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Join = lazy(() => import("./pages/Join"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const VerificationPending = lazy(() => import("./pages/VerificationPending"));
const NotFound = lazy(() => import("./pages/NotFound"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Help = lazy(() => import("./pages/Help"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Guides = lazy(() => import("./pages/Guides"));
const Careers = lazy(() => import("./pages/Careers"));
const Hub = lazy(() => import("./pages/Hub"));
const Chat = lazy(() => import("./pages/Chat"));
const PublicCastingDetail = lazy(() => import("./pages/PublicCasting/PublicCastingDetail"));
const PublicCasting = lazy(() => import("./pages/PublicCasting"));
const TalentProfile = lazy(() => import("./pages/TalentProfile"));
const ProfessionalPublicProfile = lazy(() => import("./pages/ProfessionalPublicProfile"));
const WhatsNew = lazy(() => import("./pages/WhatsNew"));

// Talent Dashboard
const DashboardLayout = lazy(() => import("./components/dashboard/TalentLayout").then(m => ({ default: m.DashboardLayout })));
const Dashboard = lazy(() => import("./pages/talent/Dashboard"));
const Profile = lazy(() => import("./pages/talent/Profile"));
const BrowseCast = lazy(() => import("./pages/talent/BrowseCast"));
const CastingDetail = lazy(() => import("./pages/talent/CastingDetail"));
const SubmitAudition = lazy(() => import("./pages/talent/SubmitAudition"));
const Submissions = lazy(() => import("./pages/talent/Submissions"));
const Messages = lazy(() => import("./pages/talent/Messages"));
const Notifications = lazy(() => import("./pages/talent/Notifications"));
const InstantAudition = lazy(() => import("./pages/talent/InstantAudition"));
const Livestream = lazy(() => import("./pages/talent/Livestream"));
const LivestreamsList = lazy(() => import("./pages/talent/LivestreamsList"));
const VerificationProcess = lazy(() => import("./pages/talent/VerificationProcess"));
const AccountSettings = lazy(() => import("./pages/talent/AccountSettings"));

// Director Dashboard
const DirectorLayout = lazy(() => import("./components/dashboard/DirectorLayout").then(m => ({ default: m.DirectorLayout })));
const DirectorDashboard = lazy(() => import("./pages/director/DirectorDashboard"));
const DirectorSettings = lazy(() => import("./pages/director/DirectorSettings"));
const MyProjects = lazy(() => import("./pages/director/MyProjects"));
const CreateCasting = lazy(() => import("./pages/director/CreateCasting"));
const DirectorSubmissions = lazy(() => import("./pages/director/DirectorSubmissions"));
const DirectorMessages = lazy(() => import("./pages/director/DirectorMessages"));
const ApplicantsManagement = lazy(() => import("./pages/director/ApplicantsManagement"));
const DirectorRoles = lazy(() => import("./pages/director/DirectorRoles"));
const MatchedTalent = lazy(() => import("./pages/director/MatchedTalent"));
const Collaborators = lazy(() => import("./pages/director/Collaborators"));
const DirectorBilling = lazy(() => import("./pages/director/DirectorBilling"));

// Admin Dashboard
const AdminLayout = lazy(() => import("./components/dashboard/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ModerationQueue = lazy(() => import("./pages/admin/ModerationQueue"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const UsersManagement = lazy(() => import("./pages/admin/UsersManagement"));
const AdminSubmissions = lazy(() => import("./pages/admin/AdminSubmissions"));
const FreeTierManagement = lazy(() => import("./pages/admin/FreeTierManagement"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const VerificationManagement = lazy(() => import("./pages/admin/VerificationManagement"));

// Professional Dashboard
const ProfessionalLayout = lazy(() => import("./components/dashboard/ProfessionalLayout").then(m => ({ default: m.ProfessionalLayout })));
const ProfessionalDashboard = lazy(() => import("./pages/professional/ProfessionalDashboard"));
const ProfessionalProfile = lazy(() => import("./pages/professional/ProfessionalProfile"));
const ProfessionalServices = lazy(() => import("./pages/professional/ProfessionalServices"));
const BrowseTalents = lazy(() => import("./pages/professional/BrowseTalents"));
const ProfessionalBookings = lazy(() => import("./pages/professional/ProfessionalBookings"));
const ProfessionalMessages = lazy(() => import("./pages/professional/ProfessionalMessages"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CommunityGuidelines = lazy(() => import('./pages/CommunityGuidelines'));
const SafetyGuidelines = lazy(() => import('./pages/SafetyGuidelines'));
const CopyrightPolicy = lazy(() => import('./pages/CopyrightPolicy'));
const AntiScamGuidelines = lazy(() => import('./pages/AntiScamGuidelines'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
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
              <Route path="/verification-pending" element={<VerificationPending />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsArticle />} />
              <Route path="/whats-new" element={<WhatsNew />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/talent/:id" element={<TalentProfile />} />
              <Route path="/professional/:id" element={<ProfessionalPublicProfile />} />
              <Route path="/browse-cast" element={<PublicCasting />} />
              <Route path="/browse-cast/:id/submit" element={<SubmitAudition />} />
              <Route path="/cast/:id" element={<PublicCastingDetail />} />
              <Route path="/livestream/:id" element={<Livestream />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/community-guidelines" element={<CommunityGuidelines />} />
              <Route path="/safety-guidelines" element={<SafetyGuidelines />} />
              <Route path="/copyright-policy" element={<CopyrightPolicy />} />
              <Route path="/anti-scam-guidelines" element={<AntiScamGuidelines />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              {/* Talent Dashboard Routes */}
              <Route
                path="/talent"
                element={
                  <ProtectedRoute allowedRoles={["talent"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="account-settings" element={<AccountSettings />} />
                <Route path="browse-cast" element={<BrowseCast />} />
                <Route path="browse-cast/:id" element={<CastingDetail />} />
                <Route path="browse-cast/:id/submit" element={<SubmitAudition />} />
                <Route path="submissions" element={<Submissions />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="audition" element={<LivestreamsList />} />
                <Route path="create-audition" element={<InstantAudition />} />
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
                <Route path="settings" element={<DirectorSettings />} />
                <Route path="projects" element={<MyProjects />} />
                <Route path="projects/:id/edit" element={<CreateCasting />} />
                <Route path="create" element={<CreateCasting />} />
                <Route path="submissions" element={<DirectorSubmissions />} />
                <Route path="submissions/:id" element={<DirectorSubmissions />} />
                <Route path="applicants" element={<ApplicantsManagement />} />
                <Route path="roles" element={<DirectorRoles />} />
                <Route path="matched" element={<MatchedTalent />} />
                <Route path="collaborators" element={<Collaborators />} />
                <Route path="billing" element={<DirectorBilling />} />
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
                <Route path="free-tier" element={<FreeTierManagement />} />
                <Route path="submissions" element={<AdminSubmissions />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="verification" element={<VerificationManagement />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
