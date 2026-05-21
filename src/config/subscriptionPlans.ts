export const SUBSCRIPTION_PLANS = [
  // TALENT PLANS
  {
    planKey: "talent_free",
    name: "Free",
    category: "talent",
    description: "For talents who want to create a presence and test the platform.",
    pricing: {
      monthly: 0,
      yearly: 0
    },
    features: {
      "Talent Profile": "Basic Profile",
      "Profile Photos": "Up to 3",
      "Showreel / Video Upload": "1 Video",
      "Apply for Casting Calls": "1 per month",
      "AI Matching": "Basic",
      "Digital Casting Card": "Basic",
      "Portfolio Visibility": "Limited",
      "Messaging": "Limited",
      "Application Tracking": "Basic",
      "Verified Badge": "Not Included",
      "Castglo Live": "Limited",
      "Support": "Help Centre"
    }
  },
  {
    planKey: "talent_basic",
    name: "Basic",
    category: "talent",
    description: "Best for emerging talents who want regular opportunities.",
    pricing: {
      monthly: 4.99,
      yearly: 49
    },
    features: {
      "Talent Profile": "Enhanced Profile",
      "Profile Photos": "Up to 10",
      "Showreel / Video Upload": "3 Videos",
      "Apply for Casting Calls": "Up to 20",
      "AI Matching": "Improved Matching",
      "Digital Casting Card": "Professional Casting Card",
      "Portfolio Visibility": "Higher Visibility",
      "Messaging": "Standard Messaging",
      "Application Tracking": "Full Tracking",
      "Verified Badge": "Optional Add-on",
      "Castglo Live": "Basic",
      "Support": "Email Support"
    }
  },
  {
    planKey: "talent_pro",
    name: "Pro",
    category: "talent",
    description: "Best for serious talents who want maximum visibility and priority access.",
    pricing: {
      monthly: 9.99,
      yearly: 99
    },
    features: {
      "Talent Profile": "Premium Profile",
      "Profile Photos": "Unlimited",
      "Showreel / Video Upload": "Unlimited",
      "Apply for Casting Calls": "Unlimited",
      "AI Matching": "Priority AI Matching",
      "Digital Casting Card": "Premium Casting Card",
      "Portfolio Visibility": "Featured Placement",
      "Messaging": "Priority Messaging",
      "Application Tracking": "Full Tracking plus Insights",
      "Verified Badge": "Included",
      "Castglo Live": "Full Access",
      "Support": "Priority support"
    }
  },

  // CASTING DIRECTOR / AGENCY PLANS
  {
    planKey: "director_free",
    name: "Free",
    category: "casting_director",
    description: "For early onboarding and trial.",
    pricing: {
      monthly: 0,
      yearly: 0
    },
    features: {
      "Company Profile": "Basic",
      "Post Casting Calls": "1 Free Trial",
      "Additional Listings": "£19 per listing",
      "Access to Talent Database": "Full Search",
      "AI Talent Matching": "Basic Suggestions",
      "Applicant Management": "Basic",
      "Pre - Audition": "Limited",
      "Shortlisting Tools": "Basic",
      "In-App Messaging": "Limited",
      "Collaborators / Team Members": "1",
      "Casting Call Visibility": "Standard",
      "Verified Badge": "Not Included",
      "Analytics": "Basic",
      "Support": "Help Centre"
    }
  },
  {
    planKey: "director_basic",
    name: "Basic",
    category: "casting_director",
    description: "Best for small agencies and independent casting directors.",
    pricing: {
      monthly: 29,
      yearly: 299
    },
    features: {
      "Company Profile": "Professional",
      "Post Casting Calls": "Up to 5",
      "Additional Listings": "£15 per listing",
      "Access to Talent Database": "Full Search",
      "AI Talent Matching": "Standard Matching",
      "Applicant Management": "Full Applicant dashboard",
      "Pre - Audition": "Included",
      "Shortlisting Tools": "Included",
      "In-App Messaging": "Included",
      "Collaborators / Team Members": "Up to 3 users",
      "Casting Call Visibility": "Boosted",
      "Verified Badge": "Optional Add-on",
      "Analytics": "Listing performance",
      "Support": "Email Support"
    }
  },
  {
    planKey: "director_pro",
    name: "Pro",
    category: "casting_director",
    description: "Best for active agencies, production teams and companies posting regularly.",
    pricing: {
      monthly: 79,
      yearly: 799
    },
    features: {
      "Company Profile": "Premium Profile",
      "Post Casting Calls": "Unlimited",
      "Additional Listings": "Included",
      "Access to Talent Database": "Advanced Search",
      "AI Talent Matching": "Priority AI Matching",
      "Applicant Management": "Advanced Applicant pipeline",
      "Pre - Audition": "Advanced Question Types",
      "Shortlisting Tools": "Advanced Shortlist Folders",
      "In-App Messaging": "Priority Messaging",
      "Collaborators / Team Members": "Up to 10 users",
      "Casting Call Visibility": "Featured Placement",
      "Verified Badge": "Included",
      "Analytics": "Advanced Insights",
      "Support": "Priority Support"
    }
  },

  // INDUSTRY PROFESSIONAL PLANS
  {
    planKey: "professional_free",
    name: "Free",
    category: "industry_professional",
    description: "For professionals who want to be discoverable.",
    pricing: {
      monthly: 0,
      yearly: 0
    },
    features: {
      "Professional Profile": "Basic",
      "Service Listing": "1 Service",
      "Portfolio Photos": "Up to 3",
      "Video Portfolio": "Not Included",
      "Marketplace": "Standard Listing",
      "Receive Enquiries": "Limited",
      "Direct Messaging": "Limited",
      "Availability Calendar": "Not Included",
      "Review / Ratings": "Basic",
      "Verified Badge": "Not Included",
      "Promotional Offers": "Not Included",
      "Analytics": "Not Included",
      "Support": "Help Centre"
    }
  },
  {
    planKey: "professional_basic",
    name: "Basic",
    category: "industry_professional",
    description: "Best for freelancers who want more enquiries and portfolio exposure.",
    pricing: {
      monthly: 7.99,
      yearly: 79
    },
    features: {
      "Professional Profile": "Enhanced Profile",
      "Service Listing": "Up to 5",
      "Portfolio Photos": "Up to 15",
      "Video Portfolio": "Up to 2 videos",
      "Marketplace": "Higher Visibility",
      "Receive Enquiries": "Unlimited",
      "Direct Messaging": "Included",
      "Availability Calendar": "Included",
      "Review / Ratings": "Included",
      "Verified Badge": "Optional Add-on",
      "Promotional Offers": "Included",
      "Analytics": "Basic",
      "Support": "Email Support"
    }
  },
  {
    planKey: "professional_pro",
    name: "Pro",
    category: "industry_professional",
    description: "Best for established professionals who want premium visibility and trust.",
    pricing: {
      monthly: 19.99,
      yearly: 199
    },
    features: {
      "Professional Profile": "Premium Profile",
      "Service Listing": "Unlimited Listing",
      "Portfolio Photos": "Unlimited",
      "Video Portfolio": "Unlimited",
      "Marketplace": "Featured Listing",
      "Receive Enquiries": "Unlimited",
      "Direct Messaging": "Priority Messaging",
      "Availability Calendar": "Included",
      "Review / Ratings": "Featured Testimonials",
      "Verified Badge": "Included",
      "Promotional Offers": "Included",
      "Analytics": "Advanced Insights",
      "Support": "Priority Support"
    }
  }
];

export const ADD_ONS = [
  { name: "Verified Badge", price: "£9.99 one-off", roles: ["talent", "casting_director", "industry_professional"] },
  { name: "Featured Talent Profile", price: "£4.99 for 7 days", roles: ["talent"] },
  { name: "AI Video Feedback Report", price: "£2.99 per report", roles: ["talent", "casting_director"] },
  { name: "Digital Casting Card Export", price: "£1.99", roles: ["talent"] },
  { name: "Professional Portfolio Review", price: "£9.99", roles: ["talent"] },
  { name: "Featured Casting Call", price: "£9.99 for 7 days", roles: ["casting_director"] },
  { name: "Urgent Casting Boost", price: "£14.99", roles: ["casting_director"] }
];

export const LAUNCHING_OFFERS = [
  { role: "Talent", offer: "3 months Pro for £4.99" },
  { role: "Casting Director / Agency", offer: "5 Casting Calls Free" },
  { role: "Industry Professional", offer: "3 months Basic for £4.99" }
];
