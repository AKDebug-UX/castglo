export interface DeliverableUser {
  id: string;
  fullName: string;
  profilePicture?: string;
  role?: string;
}

export interface DeliverableProject {
  id: string;
  title: string;
}

export interface DeliverableEntry {
  id: string;
  userId: string;
  projectId?: string | null;
  title: string;
  role: string;
  productionType?: string;
  description?: string;
  year?: number;
  mediaUrls: string[];
  isPublic?: boolean;
  averageRating?: string | number;
  reviewCount: number;
  createdAt: string;
  user?: DeliverableUser;
  project?: DeliverableProject | null;
  reviews?: DeliverableReview[];
  _count?: {
    reviews: number;
  };
}

export interface DeliverableReview {
  id: string;
  deliverableId?: string;
  reviewerId?: string;
  rating: number;
  comment?: string;
  isVerifiedParticipant?: boolean;
  createdAt: string;
  reviewer: DeliverableUser;
  _count?: {
    flags: number;
  };
}

export const PRODUCTION_TYPES = [
  "Film",
  "TV",
  "Theatre",
  "Commercial",
  "Music Video",
  "Short Film",
  "Web Series",
  "Documentary",
  "Podcast",
  "Photography",
  "Other"
] as const;

export type ProductionType = typeof PRODUCTION_TYPES[number];

export const FLAG_REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "harassment", label: "Harassment or hate speech" },
  { value: "false_information", label: "False or inaccurate information" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "other", label: "Other issue" }
] as const;
