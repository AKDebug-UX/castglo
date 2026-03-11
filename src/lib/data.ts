import talentMichael from "@/assets/talent-michael.jpg";
import talentTom from "@/assets/talent-tom.jpg";
import talentSarah from "@/assets/talent-sarah.jpg";
import newsProduction from "@/assets/news-production.jpg";
import newsAudition from "@/assets/news-audition.jpg";
import castingCommercial from "@/assets/casting-commercial.jpg";
import castingIndie from "@/assets/casting-indie-drama.jpg";

export const MOCK_CASTINGS = [
  {
    _id: "mock-1",
    title: "Lead Actor for Indie Film",
    location: "Los Angeles, CA",
    category: "Film",
    description: "Looking for a versatile actor for an upcoming independent drama production.",
    deadline: "2026-05-15",
    image: castingIndie,
  },
  {
    _id: "mock-2",
    title: "Commercial Voice Talent",
    location: "Remote",
    category: "Commercial",
    description: "Seeking a professional voice-over artist for a national television commercial.",
    deadline: "2026-04-30",
    image: castingCommercial,
  },
  {
    _id: "mock-3",
    title: "Stage Performer",
    location: "New York, NY",
    category: "Theater",
    description: "Experienced stage performer needed for a contemporary play off-Broadway.",
    deadline: "2026-06-01",
    image: newsProduction,
  },
  {
    _id: "mock-4",
    title: "Feature Film Extra",
    location: "London, UK",
    category: "Film",
    description: "Background performers needed for a high-budget feature film production.",
    deadline: "2026-03-25",
    image: newsAudition,
  }
];

export const MOCK_TALENTS = [
  {
    _id: "mock-t1",
    userId: "mock-t1",
    fullName: "Michael Chen",
    category: "Actor",
    subCategory: "Comedy • Drama",
    profilePicture: talentMichael,
    rating: 4.8,
  },
  {
    _id: "mock-t2",
    userId: "mock-t2",
    fullName: "Tom Andy",
    category: "Model",
    subCategory: "Fashion • Commercial",
    profilePicture: talentTom,
    rating: 4.9,
  },
  {
    _id: "mock-t3",
    userId: "mock-t3",
    fullName: "Sarah Johnson",
    category: "Voice Artist",
    subCategory: "Animation • Narration",
    profilePicture: talentSarah,
    rating: 5.0,
  },
  {
    _id: "mock-t4",
    userId: "mock-t4",
    fullName: "Emily Davis",
    category: "Dancer",
    subCategory: "Contemporary • Ballet",
    profilePicture: talentSarah,
    rating: 4.7,
  }
];
