import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, ShieldCheck, Upload, X, Image as ImageIcon, Youtube, Monitor } from "lucide-react";
import { authAPI, profileAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarUrl, getInitials } from "@/lib/utils";
import { UnifiedTalentProfileForm } from "@/components/profile/UnifiedTalentProfileForm";
import { UNIFIED_FIELD_IDS, validateUnifiedTalentProfile, isMinorFromAgeGroup, UNIFIED_TALENT_PROFILE_FIELD_SPEC } from "@/lib/unifiedTalentProfile";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File; preview: string } | null>(null);
  const [pendingPortfolioPhotos, setPendingPortfolioPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [pendingPortfolioVideos, setPendingPortfolioVideos] = useState<{ file: File; preview: string; name: string }[]>([]);
  const [pendingIntroVideo, setPendingIntroVideo] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  const snakeToCamel = (str: string) => str.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
  const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  const fetchProfileData = async () => {
    try {
      const [authRes, profileRes] = await Promise.all([
        authAPI.getMe().catch(() => ({ data: { success: false } })),
        profileAPI.getMe().catch(() => ({ data: { success: false } })),
      ]);

      let combinedData: any = {};
      if (authRes.data?.success) {
        combinedData = { ...combinedData, ...authRes.data.data };
        // Store the User ID separately so it's not overwritten by the profile _id
        combinedData.userId = authRes.data.data._id || authRes.data.data.id;
      }
      if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

      const tp = combinedData.talentProfile || {};
      const unified = combinedData.unifiedTalentProfile || {};

      // 1. Map root and nested API properties back to unified field IDs
      // Create a flat map of all keys in the response to catch nested data
      const flatData: Record<string, any> = {};
      const flatten = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        Object.entries(obj).forEach(([key, value]) => {
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            flatten(value);
          } else {
            // Priority: Don't overwrite existing flat data with empty values
            if (value !== undefined && value !== null && value !== "" && (!flatData[key] || flatData[key] === "")) {
              flatData[key] = value;
            }
          }
        });
      };
      
      flatten(combinedData);
      
      // Auto-map everything found in flatData to the unified state
      Object.entries(flatData).forEach(([key, value]) => {
        const snakeKey = camelToSnake(key);
        const camelKey = snakeToCamel(key);
        
        // Potential target IDs to check in UNIFIED_FIELD_IDS
        const targets = [key, snakeKey, camelKey];
        
        for (const target of targets) {
          if (UNIFIED_FIELD_IDS.has(target) && value !== undefined && value !== null && value !== "") {
            // Only populate if the unified field is currently empty or missing
            if (!unified[target] || unified[target] === "") {
              if (typeof value === "boolean") {
                unified[target] = value ? "Yes" : "No";
              } else {
                unified[target] = value;
              }
              break; // Found a match, move to next field
            }
          }
        }
      });

      // 2. Explicit mappings for root and special fields (ensures priority for core identity)
      if (!unified.full_name) unified.full_name = combinedData.fullName;
      if (!unified.display_name) unified.display_name = combinedData.stageName || tp.displayName;
      if (!unified.email) unified.email = combinedData.email;
      if (!unified.phone_number) unified.phone_number = combinedData.phone || combinedData.phoneNumber || combinedData.user?.phoneNumber || tp.phoneNumber || tp.phone;

      const addrRaw = combinedData.address || combinedData.user?.address || tp.address || combinedData.location || {};
      if (!unified.address) {
        unified.address = typeof addrRaw === 'string' ? addrRaw : (addrRaw?.fullAddress || addrRaw?.street || "");
      }
      if (!unified.current_city) unified.current_city = tp.currentCity || (typeof addrRaw === 'object' ? addrRaw.city : "") || combinedData.city;
      if (!unified.current_state) unified.current_state = tp.currentState || (typeof addrRaw === 'object' ? addrRaw.state : "");
      if (!unified.current_country) unified.current_country = tp.currentCountry || (typeof addrRaw === 'object' ? addrRaw.country : "") || combinedData.country;
      if (!unified.gender) unified.gender = tp.gender || combinedData.gender;
      if (!unified.primary_talent_type) unified.primary_talent_type = tp.primaryTalentType || combinedData.talentTypes?.[0];
      if (!unified.additional_talent_types) unified.additional_talent_types = tp.additionalTalentTypes || combinedData.talentTypes?.slice(1);
      if (!unified.dateOfBirth) {
        unified.dateOfBirth = tp.dateOfBirth;
      }
      if (unified.dateOfBirth && unified.dateOfBirth.includes('T')) {
        unified.dateOfBirth = unified.dateOfBirth.split('T')[0];
      }
      
      if (!unified.age_group) unified.age_group = tp.ageGroup;
      if (!unified.nationality) unified.nationality = tp.nationality;
      if (!unified.short_bio) unified.short_bio = combinedData.bio || tp.shortBio;
      if (!unified.full_bio) unified.full_bio = tp.fullBio;
      if (!unified.career_goals) unified.career_goals = typeof tp.careerGoals === 'string' ? tp.careerGoals : (Array.isArray(tp.careerGoals) ? tp.careerGoals.join(', ') : "");
      if (!unified.years_of_experience) unified.years_of_experience = tp.yearsOfExperience;
      if (!unified.experience_level) unified.experience_level = tp.experienceLevel;

      if (unified.right_to_work === undefined && tp.rightToWork !== undefined) unified.right_to_work = tp.rightToWork === true || tp.rightToWork === "Yes" ? "Yes" : "No";
      if (unified.valid_passport === undefined && tp.validPassport !== undefined) unified.valid_passport = tp.validPassport === true || tp.validPassport === "Yes" ? "Yes" : "No";
      if (unified.willing_to_travel === undefined && tp.willingToTravel !== undefined) unified.willing_to_travel = tp.willingToTravel === true || tp.willingToTravel === "Yes" ? "Yes" : "No";
      if (unified.international_availability === undefined && tp.internationalAvailability !== undefined) unified.international_availability = tp.internationalAvailability === true || tp.internationalAvailability === "Yes" ? "Yes" : "No";
      if (unified.remote_work_open === undefined && tp.remoteWorkOpen !== undefined) unified.remote_work_open = tp.remoteWorkOpen === true || tp.remoteWorkOpen === "Yes" ? "Yes" : "No";

      if (!unified.languages_spoken) unified.languages_spoken = tp.languages?.performance || combinedData.languages || tp.languagesSpoken;
      if (!unified.fluent_languages) unified.fluent_languages = tp.languages?.fluent || combinedData.fluentLanguages || tp.fluentLanguages;
      if (!unified.natural_accent) unified.natural_accent = combinedData.naturalAccent || tp.naturalAccent;
      if (!unified.additional_accents) unified.additional_accents = tp.accents || [];
      if (!unified.skills) unified.skills = combinedData.skills || tp.skills;
      if (!unified.equipment) unified.equipment = combinedData.equipment || tp.equipment;
      if (!unified.portfolio_url) unified.portfolio_url = tp.portfolioUrl || tp.website || combinedData.portfolioUrl || combinedData.website || combinedData.portfolio?.url;
      if (!unified.social_youtube) unified.social_youtube = tp.youtubeUrl || tp.social_youtube || combinedData.youtubeUrl;
      if (!unified.vimeo_url) unified.vimeo_url = tp.vimeoUrl || tp.vimeo_url || combinedData.vimeoUrl;

      if (tp.actorProfile || tp.actorPerformanceCategory) {
        const ap = tp.actorProfile || {};
        if (!unified.actor_performance_category) unified.actor_performance_category = tp.actorPerformanceCategory || ap.performanceCategory;
        if (!unified.actor_playing_age_range) unified.actor_playing_age_range = tp.actorPlayingAgeRange || ap.playingAgeRange;
        if (unified.actor_training === undefined) {
          const val = tp.actorFormalTraining !== undefined ? tp.actorFormalTraining : ap.formalTraining;
          if (val !== undefined) unified.actor_training = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.actor_training_school) unified.actor_training_school = tp.actorInstitution || ap.institution;
        if (!unified.actor_techniques) unified.actor_techniques = tp.actorTechniques || ap.techniques;
        if (!unified.actor_accents) unified.actor_accents = tp.actorAccents || ap.accents;
        if (!unified.actor_special_skills) unified.actor_special_skills = tp.actorSpecialSkills || ap.specialSkills;
        if (!unified.actor_notable_credits) unified.actor_notable_credits = tp.actorNotableCredits || ap.notableCredits;
        if (!unified.actor_showreel) unified.actor_showreel = tp.actorShowreel || ap.showreel;
        if (!unified.actor_monologue) unified.actor_monologue = tp.actorMonologue || ap.monologue;
        if (!unified.actor_voice_reel) unified.actor_voice_reel = tp.actorVoiceReel || ap.voiceReel;
      }
      if (tp.modelProfile || tp.modelPrimaryCategory) {
        const mp = tp.modelProfile || {};
        if (!unified.model_primary_category) unified.model_primary_category = tp.modelPrimaryCategory || mp.primaryCategory;
        if (!unified.model_additional_categories) unified.model_additional_categories = tp.modelAdditionalCategories || mp.additionalCategories;
        if (!unified.model_chest_bust) unified.model_chest_bust = tp.modelChestBust || mp.chestBust;
        if (!unified.model_waist) unified.model_waist = tp.modelWaist || mp.waist;
        if (!unified.model_hips) unified.model_hips = tp.modelHips || mp.hips;
        if (!unified.model_dress_size) unified.model_dress_size = tp.modelDressSize || mp.dressSize;
        if (!unified.model_shoe_size) unified.model_shoe_size = tp.modelShoeSize || mp.shoeSize;
        if (!unified.model_collar_size) unified.model_collar_size = tp.modelCollarSize || mp.collarSize;
        if (!unified.model_inseam) unified.model_inseam = tp.modelInseam || mp.inseam;
        if (!unified.model_suit_size) unified.model_suit_size = tp.modelSuitSize || mp.suitSize;
        if (unified.model_open_hair_changes === undefined) {
          const val = tp.modelOpenHairChanges !== undefined ? tp.modelOpenHairChanges : mp.openHairChanges;
          if (val !== undefined) unified.model_open_hair_changes = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.model_open_beauty_campaigns === undefined) {
          const val = tp.modelOpenBeautyCampaigns !== undefined ? tp.modelOpenBeautyCampaigns : mp.openBeautyCampaigns;
          if (val !== undefined) unified.model_open_beauty_campaigns = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.model_open_runway === undefined) {
          const val = tp.modelOpenRunway !== undefined ? tp.modelOpenRunway : mp.openRunway;
          if (val !== undefined) unified.model_open_runway = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.model_open_swimwear === undefined) {
          const val = tp.modelOpenSwimwear !== undefined ? tp.modelOpenSwimwear : mp.openSwimwear;
          if (val !== undefined) unified.model_open_swimwear = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.model_open_lingerie === undefined) {
          const val = tp.modelOpenLingerie !== undefined ? tp.modelOpenLingerie : mp.openLingerie;
          if (val !== undefined) unified.model_open_lingerie = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.model_comp_card) unified.model_comp_card = tp.modelCompCard || mp.compCard;
        if (!unified.model_runway_video) unified.model_runway_video = tp.modelRunwayVideo || mp.runwayVideo;
        if (!unified.model_campaign_links) unified.model_campaign_links = tp.modelCampaignLinks || mp.campaignLinks;
      }
      if (tp.singerProfile || tp.singerCategory) {
        const sp = tp.singerProfile || {};
        if (!unified.singer_category) unified.singer_category = tp.singerCategory || sp.category;
        if (!unified.singer_vocal_range) unified.singer_vocal_range = tp.singerVocalRange || sp.vocalRange;
        if (!unified.singer_genres) unified.singer_genres = tp.singerGenres || sp.genres;
        if (unified.singer_can_harmonise === undefined) {
          const val = tp.singerCanHarmonise !== undefined ? tp.singerCanHarmonise : sp.canHarmonise;
          if (val !== undefined) unified.singer_can_harmonise = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.singer_sight_read === undefined) {
          const val = tp.singerSightRead !== undefined ? tp.singerSightRead : sp.sightRead;
          if (val !== undefined) unified.singer_sight_read = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.singer_songwriting === undefined) {
          const val = tp.singerSongwriting !== undefined ? tp.singerSongwriting : sp.songwriting;
          if (val !== undefined) unified.singer_songwriting = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.singer_live_experience === undefined) {
          const val = tp.singerLiveExperience !== undefined ? tp.singerLiveExperience : sp.liveExperience;
          if (val !== undefined) unified.singer_live_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.singer_studio_experience === undefined) {
          const val = tp.singerStudioExperience !== undefined ? tp.singerStudioExperience : sp.studioExperience;
          if (val !== undefined) unified.singer_studio_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.singer_notable_credits) unified.singer_notable_credits = tp.singerNotableCredits || sp.notableCredits;
        if (!unified.singer_vocal_reel) unified.singer_vocal_reel = tp.singerVocalReel || sp.vocalReel;
        if (!unified.singer_performance_video) unified.singer_performance_video = tp.singerPerformanceVideo || sp.performanceVideo;
        if (!unified.singer_original_music_links) unified.singer_original_music_links = tp.singerOriginalMusicLinks || sp.originalMusicLinks;
      }
      if (tp.dancerProfile || tp.dancerPrimaryStyle) {
        const dp = tp.dancerProfile || {};
        if (!unified.dancer_primary_style) unified.dancer_primary_style = tp.dancerPrimaryStyle || dp.primaryStyle;
        if (!unified.dancer_additional_styles) unified.dancer_additional_styles = tp.dancerAdditionalStyles || dp.additionalStyles;
        if (!unified.dancer_training_school) unified.dancer_training_school = tp.dancerTrainingSchool || dp.trainingSchool;
        if (unified.dancer_choreography_experience === undefined) {
          const val = tp.dancerChoreographyExperience !== undefined ? tp.dancerChoreographyExperience : dp.choreographyExperience;
          if (val !== undefined) unified.dancer_choreography_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.dancer_partner_work === undefined) {
          const val = tp.dancerPartnerWork !== undefined ? tp.dancerPartnerWork : dp.partnerWork;
          if (val !== undefined) unified.dancer_partner_work = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.dancer_teaching_experience === undefined) {
          const val = tp.dancerTeachingExperience !== undefined ? tp.dancerTeachingExperience : dp.teachingExperience;
          if (val !== undefined) unified.dancer_teaching_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.dancer_live_experience === undefined) {
          const val = tp.dancerLiveExperience !== undefined ? tp.dancerLiveExperience : dp.liveExperience;
          if (val !== undefined) unified.dancer_live_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.dancer_touring_experience === undefined) {
          const val = tp.dancerTouringExperience !== undefined ? tp.dancerTouringExperience : dp.touringExperience;
          if (val !== undefined) unified.dancer_touring_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.dancer_notable_credits) unified.dancer_notable_credits = tp.dancerNotableCredits || dp.notableCredits;
        if (!unified.dancer_reel) unified.dancer_reel = tp.dancerReel || dp.reel;
        if (!unified.dancer_clips) unified.dancer_clips = tp.dancerClips || dp.clips;
        if (!unified.dancer_choreography_samples) unified.dancer_choreography_samples = tp.dancerChoreographySamples || dp.choreographySamples;
      }
      if (tp.voiceArtistProfile || tp.voiceWorkType) {
        const vap = tp.voiceArtistProfile || {};
        if (!unified.voice_work_type) unified.voice_work_type = tp.voiceWorkType || vap.workType;
        if (!unified.voice_age_range) unified.voice_age_range = tp.voiceAgeRange || vap.ageRange;
        if (!unified.voice_natural_accent) unified.voice_natural_accent = tp.voiceNaturalAccent || vap.naturalAccent;
        if (!unified.voice_performed_accents) unified.voice_performed_accents = tp.voicePerformedAccents || vap.performedAccents;
        if (unified.voice_home_studio === undefined) {
          const val = tp.voiceHomeStudio !== undefined ? tp.voiceHomeStudio : vap.homeStudio;
          if (val !== undefined) unified.voice_home_studio = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.voice_equipment_quality) unified.voice_equipment_quality = tp.voiceEquipmentQuality || vap.equipmentQuality;
        if (unified.voice_remote_recording === undefined) {
          const val = tp.voiceRemoteRecording !== undefined ? tp.voiceRemoteRecording : vap.remoteRecording;
          if (val !== undefined) unified.voice_remote_recording = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.voice_live_directed_sessions === undefined) {
          const val = tp.voiceLiveDirectedSessions !== undefined ? tp.voiceLiveDirectedSessions : vap.liveDirectedSessions;
          if (val !== undefined) unified.voice_live_directed_sessions = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.voice_audio_editing === undefined) {
          const val = tp.voiceAudioEditing !== undefined ? tp.voiceAudioEditing : vap.audioEditing;
          if (val !== undefined) unified.voice_audio_editing = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.voice_languages) unified.voice_languages = tp.voiceLanguages || vap.languages;
        if (!unified.voice_reel) unified.voice_reel = tp.voiceReel || vap.reel;
        if (!unified.voice_character_demo) unified.voice_character_demo = tp.voiceCharacterDemo || vap.characterDemo;
        if (!unified.voice_narration_sample) unified.voice_narration_sample = tp.voiceNarrationSample || vap.narrationSample;
      }
      if (tp.presenterProfile || tp.presenterType) {
        const pp = tp.presenterProfile || {};
        if (!unified.presenter_type) unified.presenter_type = tp.presenterType || pp.presenterType;
        if (!unified.presenter_comfort) unified.presenter_comfort = tp.presenterComfort || pp.comfort;
        if (!unified.presenter_languages) unified.presenter_languages = tp.presenterLanguages || pp.languages;
        if (unified.presenter_broadcast_experience === undefined) {
          const val = tp.presenterBroadcastExperience !== undefined ? tp.presenterBroadcastExperience : pp.broadcastExperience;
          if (val !== undefined) unified.presenter_broadcast_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.presenter_event_experience === undefined) {
          const val = tp.presenterEventExperience !== undefined ? tp.presenterEventExperience : pp.eventExperience;
          if (val !== undefined) unified.presenter_event_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.presenter_notable_clients) unified.presenter_notable_clients = tp.presenterNotableClients || pp.notableClients;
        if (!unified.presenter_reel) unified.presenter_reel = tp.presenterReel || pp.reel;
        if (!unified.presenter_hosting_clips) unified.presenter_hosting_clips = tp.presenterHostingClips || pp.hostingClips;
        if (!unified.presenter_interview_samples) unified.presenter_interview_samples = tp.presenterInterviewSamples || pp.interviewSamples;
      }
      if (tp.extraProfile || tp.extraExperience !== undefined) {
        const ep = tp.extraProfile || {};
        if (unified.extra_experience === undefined) {
          const val = tp.extraExperience !== undefined ? tp.extraExperience : ep.experience;
          if (val !== undefined) unified.extra_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.extra_open_to) unified.extra_open_to = tp.extraOpenTo || ep.openTo;
        if (unified.extra_driving_licence === undefined) {
          const val = tp.extraDrivingLicence !== undefined ? tp.extraDrivingLicence : ep.drivingLicence;
          if (val !== undefined) unified.extra_driving_licence = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.extra_own_vehicle === undefined) {
          const val = tp.extraOwnVehicle !== undefined ? tp.extraOwnVehicle : ep.ownVehicle;
          if (val !== undefined) unified.extra_own_vehicle = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.extra_period_costume === undefined) {
          const val = tp.extraPeriodCostume !== undefined ? tp.extraPeriodCostume : ep.periodCostume;
          if (val !== undefined) unified.extra_period_costume = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.extra_special_look) unified.extra_special_look = tp.extraSpecialLook || ep.specialLook;
        if (unified.extra_uniform_roles === undefined) {
          const val = tp.extraUniformRoles !== undefined ? tp.extraUniformRoles : ep.uniformRoles;
          if (val !== undefined) unified.extra_uniform_roles = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.extra_long_shoot_days === undefined) {
          const val = tp.extraLongShootDays !== undefined ? tp.extraLongShootDays : ep.longShootDays;
          if (val !== undefined) unified.extra_long_shoot_days = val === true || val === "Yes" ? "Yes" : "No";
        }
      }
      if (tp.musicianProfile || tp.musicianPrimaryInstrument) {
        const mup = tp.musicianProfile || {};
        if (!unified.musician_primary_instrument) unified.musician_primary_instrument = tp.musicianPrimaryInstrument || mup.primaryInstrument;
        if (!unified.musician_additional_instruments) unified.musician_additional_instruments = tp.musicianAdditionalInstruments || mup.additionalInstruments;
        if (!unified.musician_genres) unified.musician_genres = tp.musicianGenres || mup.genres;
        if (unified.musician_sight_reading === undefined) {
          const val = tp.musicianSightReading !== undefined ? tp.musicianSightReading : mup.sightReading;
          if (val !== undefined) unified.musician_sight_reading = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.musician_improvisation === undefined) {
          const val = tp.musicianImprovisation !== undefined ? tp.musicianImprovisation : mup.improvisation;
          if (val !== undefined) unified.musician_improvisation = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.musician_live_gig_experience === undefined) {
          const val = tp.musicianLiveGigExperience !== undefined ? tp.musicianLiveGigExperience : mup.liveGigExperience;
          if (val !== undefined) unified.musician_live_gig_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.musician_studio_session_experience === undefined) {
          const val = tp.musicianStudioSessionExperience !== undefined ? tp.musicianStudioSessionExperience : mup.studioSessionExperience;
          if (val !== undefined) unified.musician_studio_session_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.musician_touring_experience === undefined) {
          const val = tp.musicianTouringExperience !== undefined ? tp.musicianTouringExperience : mup.touringExperience;
          if (val !== undefined) unified.musician_touring_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.musician_composition_skills === undefined) {
          const val = tp.musicianCompositionSkills !== undefined ? tp.musicianCompositionSkills : mup.compositionSkills;
          if (val !== undefined) unified.musician_composition_skills = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.musician_notable_credits) unified.musician_notable_credits = tp.musicianNotableCredits || mup.notableCredits;
        if (!unified.musician_reel) unified.musician_reel = tp.musicianReel || mup.reel;
        if (!unified.musician_audio_samples) unified.musician_audio_samples = tp.musicianAudioSamples || mup.audioSamples;
        if (!unified.musician_original_links) unified.musician_original_links = tp.musicianOriginalLinks || mup.originalLinks;
      }
      if (tp.creatorProfile || tp.creatorContentType) {
        const cp = tp.creatorProfile || {};
        if (!unified.creator_content_type) unified.creator_content_type = tp.creatorContentType || cp.contentType;
        if (!unified.creator_platforms) unified.creator_platforms = tp.creatorPlatforms || cp.platforms;
        if (!unified.creator_audience_size) unified.creator_audience_size = tp.creatorAudienceSize || cp.audienceSize;
        if (!unified.creator_engagement_rate) unified.creator_engagement_rate = tp.creatorEngagementRate || cp.engagementRate;
        if (unified.creator_brand_collabs === undefined) {
          const val = tp.creatorBrandCollabs !== undefined ? tp.creatorBrandCollabs : cp.brandCollabs;
          if (val !== undefined) unified.creator_brand_collabs = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.creator_ugc_experience === undefined) {
          const val = tp.creatorUgcExperience !== undefined ? tp.creatorUgcExperience : cp.ugcExperience;
          if (val !== undefined) unified.creator_ugc_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.creator_editing_skills === undefined) {
          const val = tp.creatorEditingSkills !== undefined ? tp.creatorEditingSkills : cp.editingSkills;
          if (val !== undefined) unified.creator_editing_skills = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.creator_livestream_experience === undefined) {
          const val = tp.creatorLivestreamExperience !== undefined ? tp.creatorLivestreamExperience : cp.livestreamExperience;
          if (val !== undefined) unified.creator_livestream_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.creator_niche) unified.creator_niche = tp.creatorNiche || cp.niche;
        if (!unified.creator_reel) unified.creator_reel = tp.creatorReel || cp.reel;
        if (!unified.creator_media_kit) unified.creator_media_kit = tp.creatorMediaKit || cp.mediaKit;
        if (!unified.creator_social_links) unified.creator_social_links = tp.creatorSocialLinks || cp.socialLinks;
        if (!unified.creator_campaign_examples) unified.creator_campaign_examples = tp.creatorCampaignExamples || cp.campaignExamples;
      }
      if (tp.comedianProfile || tp.comedianType) {
        const cop = tp.comedianProfile || {};
        if (!unified.comedian_type) unified.comedian_type = tp.comedianType || cop.type;
        if (unified.comedian_live_experience === undefined) {
          const val = tp.comedianLiveExperience !== undefined ? tp.comedianLiveExperience : cop.liveExperience;
          if (val !== undefined) unified.comedian_live_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.comedian_writing_experience === undefined) {
          const val = tp.comedianWritingExperience !== undefined ? tp.comedianWritingExperience : cop.writingExperience;
          if (val !== undefined) unified.comedian_writing_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.comedian_improv_experience === undefined) {
          const val = tp.comedianImprovExperience !== undefined ? tp.comedianImprovExperience : cop.improvExperience;
          if (val !== undefined) unified.comedian_improv_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.comedian_tv_digital_credits) unified.comedian_tv_digital_credits = tp.comedianTvDigitalCredits || cop.tvDigitalCredits;
        if (unified.comedian_clean_sets === undefined) {
          const val = tp.comedianCleanSets !== undefined ? tp.comedianCleanSets : cop.cleanSets;
          if (val !== undefined) unified.comedian_clean_sets = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.comedian_notable_venues) unified.comedian_notable_venues = tp.comedianNotableVenues || cop.notableVenues;
        if (!unified.comedian_reel) unified.comedian_reel = tp.comedianReel || cop.reel;
        if (!unified.comedian_standup_clip) unified.comedian_standup_clip = tp.comedianStandupClip || cop.standupClip;
        if (!unified.comedian_sketch_samples) unified.comedian_sketch_samples = tp.comedianSketchSamples || cop.sketchSamples;
      }
      if (tp.stuntProfile || tp.stuntSpeciality) {
        const stup = tp.stuntProfile || {};
        if (!unified.stunt_speciality) unified.stunt_speciality = tp.stuntSpeciality || stup.speciality;
        if (!unified.stunt_certifications) unified.stunt_certifications = tp.stuntCertifications || stup.certifications;
        if (!unified.stunt_martial_arts) unified.stunt_martial_arts = tp.stuntMartialArts || stup.martialArts;
        if (unified.stunt_weapons_training === undefined) {
          const val = tp.stuntWeaponsTraining !== undefined ? tp.stuntWeaponsTraining : stup.weaponsTraining;
          if (val !== undefined) unified.stunt_weapons_training = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.stunt_driving_licence_types) unified.stunt_driving_licence_types = tp.stuntDrivingLicenceTypes || stup.drivingLicenceTypes;
        if (unified.stunt_swimming_ability === undefined) {
          const val = tp.stuntSwimmingAbility !== undefined ? tp.stuntSwimmingAbility : stup.swimmingAbility;
          if (val !== undefined) unified.stunt_swimming_ability = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.stunt_rigging_experience === undefined) {
          const val = tp.stuntRiggingExperience !== undefined ? tp.stuntRiggingExperience : stup.riggingExperience;
          if (val !== undefined) unified.stunt_rigging_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (unified.stunt_mocap_experience === undefined) {
          const val = tp.stuntMocapExperience !== undefined ? tp.stuntMocapExperience : stup.mocapExperience;
          if (val !== undefined) unified.stunt_mocap_experience = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.stunt_notable_credits) unified.stunt_notable_credits = tp.stuntNotableCredits || stup.notableCredits;
        if (!unified.stunt_reel) unified.stunt_reel = tp.stuntReel || stup.reel;
        if (!unified.stunt_fight_clips) unified.stunt_fight_clips = tp.stuntFightClips || stup.fightClips;
        if (!unified.stunt_cert_uploads) unified.stunt_cert_uploads = tp.stuntCertUploads || stup.certUploads;
      }
      if (!unified.equipment_summary) unified.equipment_summary = tp.equipmentSummary || tp.equipment;
      if (!unified.editing_software) unified.editing_software = tp.editingSoftware;
      if (!unified.lighting_style) unified.lighting_style = tp.lightingStyle;
      if (!unified.brands_used) unified.brands_used = tp.brandsUsed;
      if (unified.sfx_experience === undefined && tp.sfxExperience !== undefined) unified.sfx_experience = tp.sfxExperience === true || tp.sfxExperience === "Yes" ? "Yes" : "No";
      if (unified.group_booking_available === undefined && tp.groupBookingAvailable !== undefined) unified.group_booking_available = tp.groupBookingAvailable === true || tp.groupBookingAvailable === "Yes" ? "Yes" : "No";
      if (!unified.delivery_mode) unified.delivery_mode = tp.deliveryMode;
      if (!unified.coaching_specialisms) unified.coaching_specialisms = tp.coachingSpecialisms;
      if (!unified.editing_specialisms) unified.editing_specialisms = tp.editingSpecialisms;
      if (!unified.transfer_method) unified.transfer_method = tp.transferMethod;

      if (!unified.business_name) unified.business_name = tp.businessName;
      if (!unified.professional_title) unified.professional_title = tp.professionalTitle;
      if (!unified.prof_experience_level) unified.prof_experience_level = tp.profExperienceLevel;
      if (!unified.prof_years_of_experience) unified.prof_years_of_experience = tp.profYearsOfExperience;
      if (!unified.notable_clients) unified.notable_clients = tp.notableClients;
      if (!unified.notable_projects) unified.notable_projects = tp.notableProjects;
      if (!unified.awards_recognition) unified.awards_recognition = tp.awardsRecognition;
      if (unified.studio_access === undefined && tp.studioAccess !== undefined) unified.studio_access = tp.studioAccess === true || tp.studioAccess === "Yes" ? "Yes" : "No";
      if (!unified.studio_details) unified.studio_details = tp.studioDetails;
      if (unified.insurance_available === undefined && tp.insuranceAvailable !== undefined) unified.insurance_available = tp.insuranceAvailable === true || tp.insuranceAvailable === "Yes" ? "Yes" : "No";
      if (unified.nda_friendly === undefined && tp.ndaFriendly !== undefined) unified.nda_friendly = tp.ndaFriendly === true || tp.ndaFriendly === "Yes" ? "Yes" : "No";
      if (unified.contract_required === undefined && tp.contractRequired !== undefined) unified.contract_required = tp.contractRequired === true || tp.contractRequired === "Yes" ? "Yes" : "No";
      if (!unified.deposit_percent) unified.deposit_percent = tp.depositPercent;
      if (!unified.payment_methods) unified.payment_methods = tp.paymentMethods;
      if (!unified.cancellation_policy) unified.cancellation_policy = tp.cancellationPolicy;
      if (!unified.refund_policy) unified.refund_policy = tp.refundPolicy;
      if (!unified.serves_client_types) unified.serves_client_types = tp.servesClientTypes;
      if (!unified.specific_skills) unified.specific_skills = tp.specificSkills;
      if (unified.testimonials_enabled === undefined && tp.testimonialsEnabled !== undefined) unified.testimonials_enabled = tp.testimonialsEnabled === true || tp.testimonialsEnabled === "Yes" ? "Yes" : "No";
      if (!unified.instagram_url) unified.instagram_url = tp.instagramUrl || tp.social_instagram || combinedData.instagramUrl || combinedData.social_instagram;
      if (!unified.linkedin_url) unified.linkedin_url = tp.linkedinUrl || tp.social_linkedin || tp.social_tiktok || combinedData.linkedinUrl || combinedData.social_linkedin || combinedData.social_tiktok;

      if (tp.appearance) {
        if (!unified.height) unified.height = tp.appearance.height;
        if (!unified.weight) unified.weight = tp.appearance.weight;
        if (!unified.build) unified.build = tp.appearance.build;
        if (!unified.eye_colour) unified.eye_colour = tp.appearance.eyeColour;
        if (!unified.hair_colour) unified.hair_colour = tp.appearance.hairColour;
        if (!unified.hair_length) unified.hair_length = tp.appearance.hairLength;
        if (!unified.skin_tone) unified.skin_tone = tp.appearance.skinTone;
        if (!unified.ethnicity_visible) unified.ethnicity_visible = tp.appearance.ethnicityVisible;
        if (!unified.distinguishing_features) unified.distinguishing_features = tp.appearance.distinguishingFeatures;
        if (unified.visible_tattoos_piercings === undefined && tp.appearance.visibleTattoosPiercings !== undefined) {
          unified.visible_tattoos_piercings = tp.appearance.visibleTattoosPiercings === true || tp.appearance.visibleTattoosPiercings === "Yes" ? "Yes" : "No";
        }
        if (unified.open_to_appearance_changes === undefined && tp.appearance.openToAppearanceChanges !== undefined) {
          unified.open_to_appearance_changes = tp.appearance.openToAppearanceChanges === true || tp.appearance.openToAppearanceChanges === "Yes" ? "Yes" : "No";
        }
        if (!unified.clothing_size_top) unified.clothing_size_top = tp.appearance.clothingSizeTop;
        if (!unified.clothing_size_bottom) unified.clothing_size_bottom = tp.appearance.clothingSizeBottom;
        if (!unified.shoe_size) unified.shoe_size = tp.appearance.shoeSize;
        if (!unified.chest_bust_measurement) unified.chest_bust_measurement = tp.appearance.chestBustMeasurement;
        if (!unified.waist_measurement) unified.waist_measurement = tp.appearance.waistMeasurement;
        if (!unified.hip_measurement) unified.hip_measurement = tp.appearance.hipMeasurement;
        if (!unified.inside_leg_measurement) unified.inside_leg_measurement = tp.appearance.insideLegMeasurement;
      }
      if (tp.availability) {
        if (!unified.availability_type) unified.availability_type = tp.availabilityType || tp.availability.availabilityType;
        if (unified.last_minute_bookings === undefined && (tp.lastMinuteBookings !== undefined || tp.availability.lastMinuteBookings !== undefined)) {
          const val = tp.lastMinuteBookings !== undefined ? tp.lastMinuteBookings : tp.availability.lastMinuteBookings;
          unified.last_minute_bookings = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.notice_required) unified.notice_required = tp.noticeRequired || tp.availability.noticeRequired;
        if (!unified.opportunities_sought) unified.opportunities_sought = tp.opportunitiesSought || tp.availability.opportunitiesSought;
        if (!unified.opportunities_not_accepted) unified.opportunities_not_accepted = tp.opportunitiesNotAccepted || tp.availability.opportunitiesNotAccepted;
      } else if (tp.availabilityType) {
        // Handle flattened availability fields
        if (!unified.availability_type) unified.availability_type = tp.availabilityType;
        if (unified.last_minute_bookings === undefined && tp.lastMinuteBookings !== undefined) {
          unified.last_minute_bookings = tp.lastMinuteBookings === true || tp.lastMinuteBookings === "Yes" ? "Yes" : "No";
        }
        if (!unified.notice_required) unified.notice_required = tp.noticeRequired;
        if (!unified.opportunities_sought) unified.opportunities_sought = tp.opportunitiesSought;
        if (!unified.opportunities_not_accepted) unified.opportunities_not_accepted = tp.opportunitiesNotAccepted;
      }

      if (tp.representation) {
        if (!unified.representation_status) unified.representation_status = tp.representationStatus || tp.representation.status;
        if (!unified.agency_name) unified.agency_name = tp.agencyName || tp.representation.agencyName;
        if (!unified.agency_contact_details) unified.agency_contact_details = tp.agencyContactDetails || tp.representation.agencyContactDetails;
        if (!unified.union_membership) unified.union_membership = tp.unionMembership || tp.representation.unionMembership;
        if (!unified.preferred_contact_method) unified.preferred_contact_method = tp.preferredContactMethod || tp.representation.preferredContactMethod;
      } else if (tp.representationStatus) {
        // Handle flattened representation fields
        if (!unified.representation_status) unified.representation_status = tp.representationStatus;
        if (!unified.agency_name) unified.agency_name = tp.agencyName;
        if (!unified.agency_contact_details) unified.agency_contact_details = tp.agencyContactDetails;
        if (!unified.union_membership) unified.union_membership = tp.unionMembership;
        if (!unified.preferred_contact_method) unified.preferred_contact_method = tp.preferredContactMethod;
      }
      if (tp.bookingPreferences) {
        if (!unified.currency) unified.currency = tp.bookingPreferences.currency;
        if (!unified.expected_rate_range) unified.expected_rate_range = tp.bookingPreferences.expectedRateRange;
        if (!unified.expected_rate_other) unified.expected_rate_other = tp.bookingPreferences.expectedRateOther;
        if (unified.open_to_unpaid === undefined && tp.bookingPreferences.openToUnpaid !== undefined) {
          unified.open_to_unpaid = tp.bookingPreferences.openToUnpaid === true || tp.bookingPreferences.openToUnpaid === "Yes" ? "Yes" : "No";
        }
      }
      if (tp.emergencyContact) {
        if (!unified.emergency_full_name) unified.emergency_full_name = tp.emergencyFullName || tp.emergencyContact.fullName;
        if (!unified.emergency_relationship) unified.emergency_relationship = tp.emergencyRelationship || tp.emergencyContact.relationship;
        if (!unified.emergency_phone) unified.emergency_phone = tp.emergencyPhone || tp.emergencyContact.phone || tp.emergencyContact.phoneNumber;
      } else if (tp.emergencyFullName) {
        if (!unified.emergency_full_name) unified.emergency_full_name = tp.emergencyFullName;
        if (!unified.emergency_relationship) unified.emergency_relationship = tp.emergencyRelationship;
        if (!unified.emergency_phone) unified.emergency_phone = tp.emergencyPhone;
      }
      if (tp.guardianConsent) {
        if (!unified.guardian_full_name) unified.guardian_full_name = tp.guardianFullName || tp.guardianConsent.fullName;
        if (!unified.guardian_relationship) unified.guardian_relationship = tp.guardianRelationship || tp.guardianConsent.relationship;
        if (!unified.guardian_email) unified.guardian_email = tp.guardianEmail || tp.guardianConsent.email;
        if (!unified.guardian_phone) unified.guardian_phone = tp.guardianPhone || tp.guardianConsent.phone;
        if (unified.guardian_consent_checkbox === undefined && (tp.guardianConsentGiven !== undefined || tp.guardianConsent.consentGiven !== undefined)) {
          const val = tp.guardianConsentGiven !== undefined ? tp.guardianConsentGiven : tp.guardianConsent.consentGiven;
          unified.guardian_consent_checkbox = val ? "Yes" : "No";
        }
      } else if (tp.guardianFullName) {
        if (!unified.guardian_full_name) unified.guardian_full_name = tp.guardianFullName;
        if (!unified.guardian_relationship) unified.guardian_relationship = tp.guardianRelationship;
        if (!unified.guardian_email) unified.guardian_email = tp.guardianEmail;
        if (!unified.guardian_phone) unified.guardian_phone = tp.guardianPhone;
        if (unified.guardian_consent_checkbox === undefined && tp.guardianConsentGiven !== undefined) {
          unified.guardian_consent_checkbox = tp.guardianConsentGiven ? "Yes" : "No";
        }
      }

      const existingProfilePhoto =
        combinedData?.profilePicture ||
        combinedData?.talent?.headshots?.[0]?.url ||
        combinedData?.headshots?.[0]?.url;
      if (!unified.profile_photo && existingProfilePhoto) unified.profile_photo = existingProfilePhoto;

      combinedData.unifiedTalentProfile = unified;
      setProfileData(combinedData);
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const unifiedSnapshot = useMemo(() => {
    const unified = profileData?.unifiedTalentProfile || {};
    return { ...profileData, ...unified };
  }, [profileData]);

  const isMinor = useMemo(() => isMinorFromAgeGroup(unifiedSnapshot?.age_group), [unifiedSnapshot?.age_group]);

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file);
    setPendingProfilePhoto({ file, preview });
  };

  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPendingPortfolioPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePendingPortfolioPhoto = (index: number) => {
    setPendingPortfolioPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleIntroVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setPendingIntroVideo(e.target.files[0]);
  };

  const handlePortfolioVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newVideos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setPendingPortfolioVideos((prev) => [...prev, ...newVideos]);
  };

  const removePendingPortfolioVideo = (index: number) => {
    setPendingPortfolioVideos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSaveProfilePhoto = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!pendingProfilePhoto) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("headshot", pendingProfilePhoto.file);

      const profileFormData = new FormData();
      profileFormData.append("profilePicture", pendingProfilePhoto.file);

      await profileAPI.addHeadshot(formData);
      await userAPI.updateProfilePicture(profileFormData);

      setPendingProfilePhoto(null);
      await refreshUser();
      await fetchProfileData();
      toast.success("Profile photo updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile photo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (skipValidation: boolean = false) => {
    if (!profileData) return;

    // 1. Proactive "Healing" of other profiles to prevent validation blockers
    try {
      await profileAPI.updateProfessional({
        fullName: profileData.fullName || user?.fullName,
        displayName: (user as any)?.stageName || profileData.fullName,
        email: user?.email || profileData.email,
        phoneNumber: (user as any)?.phone || profileData.phone || profileData.phoneNumber,
        professionalTitle: "Talent",
        city: (user as any)?.address?.city || profileData.city || "",
        country: (user as any)?.address?.country || profileData.country || "",
        shortBio: profileData.bio || "",
        availabilityType: "Part-time",
        preferredContactMethod: "Castglo",
        bookingMethod: "Direct",
        servesClientTypes: [],
        certifications: "",
        professionalMemberships: ""
      });
    } catch (e) {
      console.warn("Professional healing skipped:", e);
    }

    try {
      await userAPI.updateProfile({
        fullName: profileData.fullName,
        bio: profileData.bio,
        professionalProfile: { certifications: "", professionalMemberships: "" },
        professional_profile: { certifications: "", professional_memberships: "" },
        "professionalProfile.certifications": "",
        "professionalProfile.professionalMemberships": "",
        "professional_profile.certifications": "",
        "professional_profile.professional_memberships": ""
      });
    } catch (e) {
      console.warn("Core profile healing failed:", e);
    }

    setIsSaving(true);
    try {
      const unifiedPayload: any = {
        ...(profileData?.unifiedTalentProfile || {}),
        ...Object.fromEntries(Object.entries(profileData || {}).filter(([key]) => UNIFIED_FIELD_IDS.has(key))),
      };

      const existingProfilePhoto =
        profileData?.profilePicture ||
        profileData?.talent?.headshots?.[0]?.url ||
        profileData?.headshots?.[0]?.url;
      if (!unifiedPayload.profile_photo && existingProfilePhoto) unifiedPayload.profile_photo = existingProfilePhoto;
      if (!unifiedPayload.profile_photo && pendingProfilePhoto) unifiedPayload.profile_photo = "pending_upload";

      if (!skipValidation) {
        const validation = validateUnifiedTalentProfile(unifiedPayload);
        if (!validation.success) {
          const message = validation.error.issues[0]?.message || "Please fix profile validation errors.";
          toast.error(message);
          return;
        }
      }

      if (pendingProfilePhoto) {
        const formData = new FormData();
        formData.append("headshot", pendingProfilePhoto.file);
        const profileFormData = new FormData();
        profileFormData.append("profilePicture", pendingProfilePhoto.file);
        await profileAPI.addHeadshot(formData);
        await userAPI.updateProfilePicture(profileFormData);
        setPendingProfilePhoto(null);
      }

      if (pendingPortfolioPhotos.length > 0) {
        await Promise.all(
          pendingPortfolioPhotos.map(async (photo) => {
            const formData = new FormData();
            formData.append("headshot", photo.file);
            if (photo.caption) {
              formData.append("caption", photo.caption);
            }
            return profileAPI.addHeadshot(formData);
          })
        );
        setPendingPortfolioPhotos([]);
      }

      if (pendingIntroVideo) {
        try {
          const formData = new FormData();
          formData.append("showreel", pendingIntroVideo);
          const uploadRes = await profileAPI.uploadShowreel(formData);
          const url = uploadRes.data?.data?.url || uploadRes.data?.data?.showreelUrl || uploadRes.data?.data?.showreel;
          if (url) {
            unifiedPayload.intro_video = url;
            setProfileData((prev: any) => ({
              ...prev,
              unifiedTalentProfile: { ...(prev?.unifiedTalentProfile || {}), intro_video: url },
            }));
          }
          setPendingIntroVideo(null);
        } catch (e: any) {
          console.error("Video upload error:", e);
          toast.error(e?.response?.data?.message || "Failed to upload introduction video");
          setIsSaving(false);
          return;
        }
      }

      if (pendingPortfolioVideos.length > 0) {
        try {
          const uploadedUrls: any[] = [];
          await Promise.all(
            pendingPortfolioVideos.map(async (vid) => {
              const formData = new FormData();
              formData.append("showreel", vid.file);
              const res = await profileAPI.uploadShowreel(formData);
              const url = res.data?.data?.url || res.data?.data?.showreelUrl || res.data?.data?.showreel;
              if (url) uploadedUrls.push({ url, caption: vid.caption || "" });
            })
          );
          setPendingPortfolioVideos([]);
          if (uploadedUrls.length > 0) {
            setProfileData((prev: any) => ({
              ...prev,
              talent: {
                ...(prev?.talent || {}),
                portfolioVideos: [...(prev?.talent?.portfolioVideos || []), ...uploadedUrls],
              },
            }));
          }
        } catch (e: any) {
          console.error("Portfolio video upload error:", e);
          toast.error("Failed to upload one or more portfolio videos");
        }
      }

      const payload: any = {
        fullName: unifiedPayload.full_name || profileData.fullName,
        email: unifiedPayload.email || profileData.email,
        phoneNumber: unifiedPayload.phone_number || profileData.phoneNumber || profileData.phone,
        ageGroup: unifiedPayload.age_group,
        gender: unifiedPayload.gender,
        currentCity: unifiedPayload.current_city,
        currentCountry: unifiedPayload.current_country,
        primaryTalentType: unifiedPayload.primary_talent_type,
        languagesSpoken: unifiedPayload.languages_spoken || [],

        // Basic Info fields
        displayName: unifiedPayload.display_name,
        address: unifiedPayload.address,
        nationality: unifiedPayload.nationality,
        dateOfBirth: unifiedPayload.dateOfBirth,
        shortBio: unifiedPayload.short_bio || profileData.bio || "",
        fullBio: unifiedPayload.full_bio || "",
        preferredContactMethod: unifiedPayload.preferred_contact_method || "Castglo",
        emergencyContact: {
          fullName: unifiedPayload.emergency_full_name || "",
          relationship: unifiedPayload.emergency_relationship || "",
          phoneNumber: unifiedPayload.emergency_phone || "",
        },
        ...(isMinorFromAgeGroup(unifiedPayload.age_group) ? {
          guardianConsent: {
            fullName: unifiedPayload.guardian_full_name,
            relationship: unifiedPayload.guardian_relationship,
            email: unifiedPayload.guardian_email,
            phone: unifiedPayload.guardian_phone,
            consentGiven: !!(unifiedPayload.guardian_consent_checkbox === "Yes" || unifiedPayload.guardian_consent_checkbox === true),
          }
        } : {}),

        // Professional fields
        fluentLanguages: unifiedPayload.fluent_languages || [],
        naturalAccent: unifiedPayload.natural_accent,
        rightToWork: !!(unifiedPayload.right_to_work === "Yes" || unifiedPayload.right_to_work === true),
        validPassport: !!(unifiedPayload.valid_passport === "Yes" || unifiedPayload.valid_passport === true),
        willingToTravel: !!(unifiedPayload.willing_to_travel === "Yes" || unifiedPayload.willing_to_travel === true),
        internationalAvailability: !!(unifiedPayload.international_availability === "Yes" || unifiedPayload.international_availability === true),
        remoteWorkOpen: !!(unifiedPayload.remote_work_open === "Yes" || unifiedPayload.remote_work_open === true),
        careerGoals: typeof unifiedPayload.career_goals === 'string' ? unifiedPayload.career_goals : (Array.isArray(unifiedPayload.career_goals) ? unifiedPayload.career_goals.join(', ') : ""),
        yearsOfExperience: unifiedPayload.years_of_experience,
        experienceLevel: unifiedPayload.experience_level,
        representationStatus: unifiedPayload.representation_status || "Self-represented",
        agencyName: unifiedPayload.agency_name,
        agencyContactDetails: unifiedPayload.agency_contact_details,
        unionMembership: unifiedPayload.union_membership,
        awardsRecognition: unifiedPayload.awards_recognition,
        openToUnpaid: !!(unifiedPayload.open_to_unpaid === "Yes" || unifiedPayload.open_to_unpaid === true),
        currency: unifiedPayload.currency ? unifiedPayload.currency.split(' ')[0] : undefined,
        expectedRateRange: unifiedPayload.expected_rate_range,
        availabilityType: unifiedPayload.availability_type || "Part-time",
        lastMinuteBookings: !!(unifiedPayload.last_minute_bookings === "Yes" || unifiedPayload.last_minute_bookings === true),
        noticeRequired: unifiedPayload.notice_required,
        opportunitiesSought: unifiedPayload.opportunities_sought || [],
        opportunitiesNotAccepted: unifiedPayload.opportunities_not_accepted || [],
        headshots: profileData?.talent?.headshots,
        portfolioVideos: profileData?.talent?.portfolioVideos,

        // Talent specific details
        actorPerformanceCategory: unifiedPayload.actor_performance_category,
        actorPlayingAgeRange: unifiedPayload.actor_playing_age_range,
        actorFormalTraining: !!(unifiedPayload.actor_training === "Yes" || unifiedPayload.actor_training === true),
        actorInstitution: unifiedPayload.actor_training_school,
        actorTechniques: unifiedPayload.actor_techniques || [],
        actorAccents: unifiedPayload.actor_accents || [],
        actorSpecialSkills: unifiedPayload.actor_special_skills || [],
        actorNotableCredits: unifiedPayload.actor_notable_credits || [],
        actorShowreel: unifiedPayload.actor_showreel,
        actorMonologue: unifiedPayload.actor_monologue,
        actorVoiceReel: unifiedPayload.actor_voice_reel,

        modelPrimaryCategory: unifiedPayload.model_primary_category,
        modelAdditionalCategories: unifiedPayload.model_additional_categories || [],
        modelOpenHairChanges: !!(unifiedPayload.model_open_hair_changes === "Yes" || unifiedPayload.model_open_hair_changes === true),
        modelOpenBeautyCampaigns: !!(unifiedPayload.model_open_beauty_campaigns === "Yes" || unifiedPayload.model_open_beauty_campaigns === true),
        modelOpenRunway: !!(unifiedPayload.model_open_runway === "Yes" || unifiedPayload.model_open_runway === true),
        modelOpenSwimwear: !!(unifiedPayload.model_open_swimwear === "Yes" || unifiedPayload.model_open_swimwear === true),
        modelOpenLingerie: !!(unifiedPayload.model_open_lingerie === "Yes" || unifiedPayload.model_open_lingerie === true),
        modelCompCard: unifiedPayload.model_comp_card,
        modelRunwayVideo: unifiedPayload.model_runway_video,
        modelCampaignLinks: unifiedPayload.model_campaign_links || [],

        singerCategory: unifiedPayload.singer_category,
        singerVocalRange: unifiedPayload.singer_vocal_range,
        singerGenres: unifiedPayload.singer_genres || [],
        singerCanHarmonise: !!(unifiedPayload.singer_can_harmonise === "Yes" || unifiedPayload.singer_can_harmonise === true),
        singerSightRead: !!(unifiedPayload.singer_sight_read === "Yes" || unifiedPayload.singer_sight_read === true),
        singerSongwriting: !!(unifiedPayload.singer_songwriting === "Yes" || unifiedPayload.singer_songwriting === true),
        singerLiveExperience: !!(unifiedPayload.singer_live_experience === "Yes" || unifiedPayload.singer_live_experience === true),
        singerStudioExperience: !!(unifiedPayload.singer_studio_experience === "Yes" || unifiedPayload.singer_studio_experience === true),
        singerNotableCredits: unifiedPayload.singer_notable_credits || [],
        singerVocalReel: unifiedPayload.singer_vocal_reel,
        singerPerformanceVideo: unifiedPayload.singer_performance_video,
        singerOriginalMusicLinks: unifiedPayload.singer_original_music_links || [],

        dancerPrimaryStyle: unifiedPayload.dancer_primary_style,
        dancerAdditionalStyles: unifiedPayload.dancer_additional_styles || [],
        dancerTrainingSchool: unifiedPayload.dancer_training_school,
        dancerChoreographyExperience: !!(unifiedPayload.dancer_choreography_experience === "Yes" || unifiedPayload.dancer_choreography_experience === true),
        dancerPartnerWork: !!(unifiedPayload.dancer_partner_work === "Yes" || unifiedPayload.dancer_partner_work === true),
        dancerTeachingExperience: !!(unifiedPayload.dancer_teaching_experience === "Yes" || unifiedPayload.dancer_teaching_experience === true),
        dancerLiveExperience: !!(unifiedPayload.dancer_live_experience === "Yes" || unifiedPayload.dancer_live_experience === true),
        dancerTouringExperience: !!(unifiedPayload.dancer_touring_experience === "Yes" || unifiedPayload.dancer_touring_experience === true),
        dancerNotableCredits: unifiedPayload.dancer_notable_credits || [],
        dancerReel: unifiedPayload.dancer_reel,
        dancerClips: unifiedPayload.dancer_clips || [],
        dancerChoreographySamples: unifiedPayload.dancer_choreography_samples,

        // Appearance
        appearance: {
          height: unifiedPayload.height,
          weight: unifiedPayload.weight,
          build: unifiedPayload.build,
          hairColour: unifiedPayload.hair_colour,
          hairLength: unifiedPayload.hair_length,
          eyeColour: unifiedPayload.eye_colour,
          skinTone: unifiedPayload.skin_tone,
          ethnicityVisible: unifiedPayload.ethnicity_visible,
          distinguishingFeatures: unifiedPayload.distinguishing_features || [],
          visibleTattoosPiercings: !!(unifiedPayload.visible_tattoos_piercings === "Yes" || unifiedPayload.visible_tattoos_piercings === true),
          openToAppearanceChanges: !!(unifiedPayload.open_to_appearance_changes === "Yes" || unifiedPayload.open_to_appearance_changes === true),
          clothingSizeTop: unifiedPayload.clothing_size_top,
          clothingSizeBottom: unifiedPayload.clothing_size_bottom,
          shoeSize: unifiedPayload.shoe_size,
          chestBustMeasurement: unifiedPayload.chest_bust_measurement,
          waistMeasurement: unifiedPayload.waist_measurement,
          hipMeasurement: unifiedPayload.hip_measurement,
          insideLegMeasurement: unifiedPayload.inside_leg_measurement,
        },

        // Category specific details (Voice Artist, Presenter, etc.)
        voiceWorkType: unifiedPayload.voice_work_type || [],
        voiceAgeRange: unifiedPayload.voice_age_range,
        voiceNaturalAccent: unifiedPayload.voice_natural_accent,
        voicePerformedAccents: unifiedPayload.voice_performed_accents || [],
        voiceHomeStudio: !!(unifiedPayload.voice_home_studio === "Yes" || unifiedPayload.voice_home_studio === true),
        voiceEquipmentQuality: unifiedPayload.voice_equipment_quality,
        voiceRemoteRecording: !!(unifiedPayload.voice_remote_recording === "Yes" || unifiedPayload.voice_remote_recording === true),
        voiceLiveDirectedSessions: !!(unifiedPayload.voice_live_directed_sessions === "Yes" || unifiedPayload.voice_live_directed_sessions === true),
        voiceAudioEditing: !!(unifiedPayload.voice_audio_editing === "Yes" || unifiedPayload.voice_audio_editing === true),
        voiceLanguages: unifiedPayload.voice_languages || [],
        voiceReel: unifiedPayload.voice_reel,
        voiceCharacterDemo: unifiedPayload.voice_character_demo,
        voiceNarrationSample: unifiedPayload.voice_narration_sample,

        presenterType: unifiedPayload.presenter_type,
        presenterComfort: unifiedPayload.presenter_comfort || [],
        presenterLanguages: unifiedPayload.presenter_languages || [],
        presenterBroadcastExperience: !!(unifiedPayload.presenter_broadcast_experience === "Yes" || unifiedPayload.presenter_broadcast_experience === true),
        presenterEventExperience: !!(unifiedPayload.presenter_event_experience === "Yes" || unifiedPayload.presenter_event_experience === true),
        presenterNotableClients: unifiedPayload.presenter_notable_clients,
        presenterReel: unifiedPayload.presenter_reel,
        presenterHostingClips: unifiedPayload.presenter_hosting_clips || [],
        presenterInterviewSamples: unifiedPayload.presenter_interview_samples || [],

        extraExperience: !!(unifiedPayload.extra_experience === "Yes" || unifiedPayload.extra_experience === true),
        extraOpenTo: unifiedPayload.extra_open_to || [],
        extraDrivingLicence: !!(unifiedPayload.extra_driving_licence === "Yes" || unifiedPayload.extra_driving_licence === true),
        extraOwnVehicle: !!(unifiedPayload.extra_own_vehicle === "Yes" || unifiedPayload.extra_own_vehicle === true),
        extraPeriodCostume: !!(unifiedPayload.extra_period_costume === "Yes" || unifiedPayload.extra_period_costume === true),
        extraSpecialLook: unifiedPayload.extra_special_look,
        extraUniformRoles: !!(unifiedPayload.extra_uniform_roles === "Yes" || unifiedPayload.extra_uniform_roles === true),
        extraLongShootDays: !!(unifiedPayload.extra_long_shoot_days === "Yes" || unifiedPayload.extra_long_shoot_days === true),

        musicianPrimaryInstrument: unifiedPayload.musician_primary_instrument,
        musicianAdditionalInstruments: unifiedPayload.musician_additional_instruments || [],
        musicianGenres: unifiedPayload.musician_genres || [],
        musicianSightReading: !!(unifiedPayload.musician_sight_reading === "Yes" || unifiedPayload.musician_sight_reading === true),
        musicianImprovisation: !!(unifiedPayload.musician_improvisation === "Yes" || unifiedPayload.musician_improvisation === true),
        musicianLiveGigExperience: !!(unifiedPayload.musician_live_gig_experience === "Yes" || unifiedPayload.musician_live_gig_experience === true),
        musicianStudioSessionExperience: !!(unifiedPayload.musician_studio_session_experience === "Yes" || unifiedPayload.musician_studio_session_experience === true),
        musicianTouringExperience: !!(unifiedPayload.musician_touring_experience === "Yes" || unifiedPayload.musician_touring_experience === true),
        musicianCompositionSkills: !!(unifiedPayload.musician_composition_skills === "Yes" || unifiedPayload.musician_composition_skills === true),
        musicianNotableCredits: unifiedPayload.musician_notable_credits || [],
        musicianReel: unifiedPayload.musician_reel,
        musicianAudioSamples: unifiedPayload.musician_audio_samples || [],
        musicianOriginalLinks: unifiedPayload.musician_original_links || [],

        creatorContentType: unifiedPayload.creator_content_type || [],
        creatorPlatforms: unifiedPayload.creator_platforms || [],
        creatorAudienceSize: unifiedPayload.creator_audience_size,
        creatorEngagementRate: unifiedPayload.creator_engagement_rate,
        creatorBrandCollabs: !!(unifiedPayload.creator_brand_collabs === "Yes" || unifiedPayload.creator_brand_collabs === true),
        creatorUgcExperience: !!(unifiedPayload.creator_ugc_experience === "Yes" || unifiedPayload.creator_ugc_experience === true),
        creatorEditingSkills: !!(unifiedPayload.creator_editing_skills === "Yes" || unifiedPayload.creator_editing_skills === true),
        creatorLivestreamExperience: !!(unifiedPayload.creator_livestream_experience === "Yes" || unifiedPayload.creator_livestream_experience === true),
        creatorNiche: unifiedPayload.creator_niche,
        creatorReel: unifiedPayload.creator_reel,
        creatorMediaKit: unifiedPayload.creator_media_kit,
        creatorSocialLinks: unifiedPayload.creator_social_links || [],
        creatorCampaignExamples: unifiedPayload.creator_campaign_examples || [],

        comedianType: unifiedPayload.comedian_type || [],
        comedianLiveExperience: !!(unifiedPayload.comedian_live_experience === "Yes" || unifiedPayload.comedian_live_experience === true),
        comedianWritingExperience: !!(unifiedPayload.comedian_writing_experience === "Yes" || unifiedPayload.comedian_writing_experience === true),
        comedianImprovExperience: !!(unifiedPayload.comedian_improv_experience === "Yes" || unifiedPayload.comedian_improv_experience === true),
        comedianTvDigitalCredits: unifiedPayload.comedian_tv_digital_credits || [],
        comedianCleanSets: !!(unifiedPayload.comedian_clean_sets === "Yes" || unifiedPayload.comedian_clean_sets === true),
        comedianNotableVenues: unifiedPayload.comedian_notable_venues || [],
        comedianReel: unifiedPayload.comedian_reel,
        comedianStandupClip: unifiedPayload.comedian_standup_clip,
        comedianSketchSamples: unifiedPayload.comedian_sketch_samples || [],

        stuntSpeciality: unifiedPayload.stunt_speciality || [],
        stuntCertifications: unifiedPayload.stunt_certifications,
        stuntMartialArts: unifiedPayload.stunt_martial_arts,
        stuntWeaponsTraining: !!(unifiedPayload.stunt_weapons_training === "Yes" || unifiedPayload.stunt_weapons_training === true),
        stuntDrivingLicenceTypes: unifiedPayload.stunt_driving_licence_types,
        stuntSwimmingAbility: !!(unifiedPayload.stunt_swimming_ability === "Yes" || unifiedPayload.stunt_swimming_ability === true),
        stuntRiggingExperience: !!(unifiedPayload.stunt_rigging_experience === "Yes" || unifiedPayload.stunt_rigging_experience === true),
        stuntMocapExperience: !!(unifiedPayload.stunt_mocap_experience === "Yes" || unifiedPayload.stunt_mocap_experience === true),
        stuntNotableCredits: unifiedPayload.stunt_notable_credits || [],
        stuntReel: unifiedPayload.stunt_reel,
        stuntFightClips: unifiedPayload.stunt_fight_clips || [],
        stuntCertUploads: unifiedPayload.stunt_cert_uploads || [],

        // Professional Specialisms
        equipmentSummary: (unifiedPayload.equipment_summary || unifiedPayload.equipment) || undefined,
        editingSoftware: unifiedPayload.editing_software || undefined,
        lightingStyle: unifiedPayload.lighting_style || undefined,
        brandsUsed: unifiedPayload.brands_used || undefined,
        sfxExperience: !!(unifiedPayload.sfx_experience === "Yes" || unifiedPayload.sfx_experience === true),
        groupBookingAvailable: !!(unifiedPayload.group_booking_available === "Yes" || unifiedPayload.group_booking_available === true),
        deliveryMode: unifiedPayload.delivery_mode || undefined,
        coachingSpecialisms: unifiedPayload.coaching_specialisms || undefined,
        editingSpecialisms: unifiedPayload.editing_specialisms || undefined,
        transferMethod: unifiedPayload.transfer_method || undefined,

        // Professional Identity & Business
        businessName: unifiedPayload.business_name || undefined,
        professionalTitle: unifiedPayload.professional_title || undefined,
        profExperienceLevel: unifiedPayload.prof_experience_level || undefined,
        profYearsOfExperience: unifiedPayload.prof_years_of_experience || undefined,
        notableClients: unifiedPayload.notable_clients || [],
        notableProjects: unifiedPayload.notable_projects || [],
        studioAccess: !!(unifiedPayload.studio_access === "Yes" || unifiedPayload.studio_access === true),
        studioDetails: unifiedPayload.studio_details || undefined,
        insuranceAvailable: !!(unifiedPayload.insurance_available === "Yes" || unifiedPayload.insurance_available === true),
        ndaFriendly: !!(unifiedPayload.nda_friendly === "Yes" || unifiedPayload.nda_friendly === true),
        contractRequired: !!(unifiedPayload.contract_required === "Yes" || unifiedPayload.contract_required === true),
        depositPercent: Number(unifiedPayload.deposit_percent) || 0,
        paymentMethods: typeof unifiedPayload.payment_methods === 'string' ? [unifiedPayload.payment_methods] : (unifiedPayload.payment_methods || []),
        cancellationPolicy: unifiedPayload.cancellation_policy || undefined,
        refundPolicy: unifiedPayload.refund_policy || undefined,
        servesClientTypes: unifiedPayload.serves_client_types || [],
        specificSkills: unifiedPayload.specific_skills || [],
        testimonialsEnabled: !!(unifiedPayload.testimonials_enabled === "Yes" || unifiedPayload.testimonials_enabled === true),
        instagramUrl: unifiedPayload.instagram_url,
        linkedinUrl: unifiedPayload.linkedin_url,
        portfolioUrl: unifiedPayload.portfolio_url,
      };

      // 2. Sanitize payload: Remove empty arrays and disallowed fields
      Object.keys(payload).forEach(key => {
        if (Array.isArray(payload[key]) && payload[key].length === 0) {
          delete payload[key];
        }
        if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
          delete payload[key];
        }
      });

      // These specific fields MUST NOT be empty arrays per backend validation
      if (!payload.notableClients || payload.notableClients.length === 0) delete payload.notableClients;
      if (!payload.notableProjects || payload.notableProjects.length === 0) delete payload.notableProjects;
      
      // DISALLOWED fields for this specific endpoint (must be updated via /profiles/me or /user/profile)
      delete (payload as any).socialLinks;
      delete (payload as any).unifiedTalentProfile; // The backend might not allow the entire snapshot at the root

      if (activeTab === "summary") {
        return;
      }

      // 1. Update Core Profile & Unified Snapshot (Source of Truth)
      try {
        await profileAPI.updateMe({
          unifiedTalentProfile: unifiedPayload,
          talent: {
            ...(profileData?.talent || {}),
            headshots: profileData?.talent?.headshots,
            portfolioVideos: profileData?.talent?.portfolioVideos,
          },
          socialLinks: unifiedPayload.social_links || []
        });
      } catch (e) {
        console.warn("Core update failed, proceeding with talent update:", e);
      }

      // 2. Update Specialized Talent Fields
      await profileAPI.updateTalent(payload);

      await refreshUser();
      await fetchProfileData();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const completionPercentage = useMemo(() => {
    const unified = profileData?.unifiedTalentProfile || {};
    const coreFields = [
      'full_name', 'email', 'phone_number', 'dateOfBirth', 'age_group',
      'gender', 'nationality', 'current_city', 'current_country',
      'short_bio', 'primary_talent_type', 'profile_photo'
    ];
    const filled = coreFields.filter(f => unified[f] || profileData?.[f]).length;
    return Math.round((filled / coreFields.length) * 100);
  }, [profileData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#009698] to-[#006b6d] p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -m-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -m-12 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <AvatarImage
                src={
                  pendingProfilePhoto?.preview ||
                  profileData?.profilePicture ||
                  profileData?.talent?.headshots?.[0]?.url ||
                  getAvatarUrl(profileData?.fullName)
                }
                className="object-cover"
              />
              <AvatarFallback className="bg-white/20 text-white font-bold text-3xl backdrop-blur-md">
                {getInitials(profileData?.fullName)}
              </AvatarFallback>
            </Avatar>
            {pendingProfilePhoto && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white text-[#009698] hover:bg-gray-100 shadow-xl border-none h-8 px-3 text-xs font-bold animate-in zoom-in-50 duration-300"
                onClick={handleSaveProfilePhoto}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3 mr-1" />
                )}
                Save Photo
              </Button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{profileData?.fullName || "Your Profile"}</h1>
                {profileData?.isVerified && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md px-3 py-1">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Verified
                  </Badge>
                )}
                {isMinor && (
                  <Badge className="bg-orange-400/20 text-orange-100 border-none backdrop-blur-md">
                    Guardian Required
                  </Badge>
                )}
              </div>
              <p className="text-[#e0f1f1] text-lg opacity-90">{profileData?.stageName || "Complete your profile to stand out"}</p>
            </div>

            <div className="space-y-2 max-w-md mx-auto md:mx-0">
              <div className="flex justify-between text-sm font-medium">
                <span>Profile Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button
              size="lg"
              className="w-full bg-white text-[#009698] hover:bg-gray-100 font-bold shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md font-bold"
              asChild
            >
              <Link to={`/talent/${profileData?.userId || profileData?._id || profileData?.id}`}>
                <Monitor className="w-5 h-5 mr-2" />
                View Public Profile
              </Link>
            </Button>
            <p className="text-[10px] text-center text-white/60">Last saved: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <UnifiedTalentProfileForm
        rootData={profileData}
        onChange={setProfileData}
        onSave={handleSave}
        isSaving={isSaving}
        showTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingProfilePhoto={pendingProfilePhoto}
        setPendingProfilePhoto={setPendingProfilePhoto}
        pendingPortfolioPhotos={pendingPortfolioPhotos}
        setPendingPortfolioPhotos={setPendingPortfolioPhotos}
        removePendingPortfolioPhoto={removePendingPortfolioPhoto}
        handlePortfolioSelect={handlePortfolioSelect}
        pendingPortfolioVideos={pendingPortfolioVideos}
        setPendingPortfolioVideos={setPendingPortfolioVideos}
        removePendingPortfolioVideo={removePendingPortfolioVideo}
        handlePortfolioVideoSelect={handlePortfolioVideoSelect}
        pendingIntroVideo={pendingIntroVideo}
        setPendingIntroVideo={setPendingIntroVideo}
        handleIntroVideoSelect={handleIntroVideoSelect}
      />

    </div>
  );
}
