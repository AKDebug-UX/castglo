import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `https://castglo-qupm.onrender.com/api/v1`

export const API_ENDPOINTS = {
  // ... (keeping existing API_ENDPOINTS as reference but wrapping in the same structure)
  ADMIN: {
    USERS: '/admin/users',
    SUSPEND_USER: (userId: string) => `/admin/users/${userId}/suspend`,
    UNSUSPEND_USER: (userId: string) => `/admin/users/${userId}/unsuspend`,
    VERIFY_USER: (userId: string) => `/admin/users/${userId}/verify`,
    DELETE_USER: (userId: string) => `/admin/users/${userId}`,
    ACTION_LOGS: '/admin/action-logs',
    ANALYTICS: '/admin/analytics',
    LEADS: '/admin/leads',
    SUBSCRIPTIONS: '/admin/subscriptions',
    MODERATION: '/admin/moderation',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    SET_FREE_TIER: '/admin/settings/free-tier',
    GRANT_TRIAL: (userId: string) => `/admin/users/${userId}/grant-trial`,
  },
  VERIFICATIONS: {
    SUBMIT: '/blockchain/verify',
    HISTORY: '/blockchain/history',
    VALIDATE: (hash: string) => `/blockchain/validate/${hash}`,
    GET_ALL: '/admin/verifications',
    UPDATE_STATUS: (id: string) => `/admin/verifications/${id}/status`,
    STATS: '/admin/verifications/stats',
  },
  SUBMISSIONS: {
    GET_ALL: '/admin/submissions',
    GET_ONE: (id: string) => `/admin/submissions/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/submissions/${id}/status`,
    STATS: '/admin/submissions/stats',
  },
  APPLICATIONS: {
    CREATE: '/applications',
    ME: '/applications/me',
    BY_CASTING_CALL: (castingCallId: string) => `/applications/${castingCallId}`,
    DETAILS: (applicationId: string) => `/applications/details/${applicationId}`,
    SHORTLIST: (applicationId: string) => `/applications/${applicationId}/shortlist`,
    REJECT: (applicationId: string) => `/applications/${applicationId}/reject`,
    ACCEPT: (applicationId: string) => `/applications/${applicationId}/accept`,
    COMMUNICATION: (applicationId: string) => `/applications/${applicationId}/communication`,
    WITHDRAW: (applicationId: string) => `/applications/${applicationId}`,
  },
  BOOKINGS: {
    CREATE: '/bookings',
    ME: '/bookings/me',
    PROFESSIONAL_ME: '/bookings/professional/me',
    DETAILS: (id: string) => `/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
    STATS: '/bookings/professional/stats',
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    COMPLETE: (id: string) => `/bookings/${id}/complete`,
    ADMIN_GET_ALL: '/admin/bookings',
    ADMIN_GET_ONE: (id: string) => `/admin/bookings/${id}`,
    ADMIN_UPDATE_STATUS: (id: string) => `/admin/bookings/${id}/status`,
    ADMIN_STATS: '/admin/bookings/stats',
  },
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
    RESEND_VERIFICATION: '/auth/resend-verification-email',
    LOGOUT: '/auth/logout',
  },
  LIVESTREAM: {
    CREATE: '/livestream',
    GET_ALL: '/livestream',
    GET_ACTIVE: '/livestream',
    GET_MY_STREAMS: '/livestream/me',
    POST_MESSAGE: (id: string) => `/livestream/${id}/messages`,
    GET_MESSAGES: (id: string) => `/livestream/${id}/messages`,
    START: (id: string) => `/livestream/${id}/start`,
    JOIN: (id: string) => `/livestream/${id}/join`,
    INVITE: (id: string) => `/livestream/${id}/invite`,
    LEAVE: (id: string) => `/livestream/${id}/leave`,
    END: (id: string) => `/livestream/${id}/end`,
    GET_PARTICIPANTS: (id: string) => `/livestream/${id}/participants`,
    PROMOTE_COHOST: (id: string) => `/livestream/${id}/cohost`,
    REMOVE_COHOST: (id: string, userId: string) => `/livestream/${id}/cohost/${userId}`,
  },
  MESSAGING: {
    GET_OR_CREATE_CONVERSATION: '/messaging/conversations',
    GET_MY_CONVERSATIONS: '/messaging/conversations',
    SEND_MESSAGE: '/messaging/messages',
    GET_MESSAGES: (id: string) => `/messaging/conversations/${id}/messages`,
    BULK_MESSAGE: '/messaging/bulk-message',
  },
  NEWS: {
    GET_ALL: '/news',
    GET_ONE: (id: string) => `/news/${id}`,
    CREATE: '/news',
    UPDATE: (id: string) => `/news/${id}`,
    DELETE: (id: string) => `/news/${id}`,
  },
  NOTIFICATIONS: {
    REGISTER_DEVICE: '/notifications/register-device',
    SEND: '/notifications/send',
    GET_ALL: '/notifications',
    READ_ALL: '/notifications/read-all',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
  CASTING_CALLS: {
    GET_ALL: '/casting-calls',
    CREATE: '/casting-calls',
    MY_LISTINGS: '/casting-calls/user/my-listings',
    GET_ONE: (id: string) => `/casting-calls/${id}`,
    UPDATE: (id: string) => `/casting-calls/${id}`,
    DELETE: (id: string) => `/casting-calls/${id}`,
    CLOSE: (id: string) => `/casting-calls/${id}/close`,
  },
  LEADS: {
    CREATE: '/leads',
    ADMIN_GET_ALL: '/leads/admin/leads',
    ADMIN_GET_ONE: (id: string) => `/leads/admin/leads/${id}`,
    ADMIN_DELETE: (id: string) => `/leads/admin/leads/${id}`,
    ADMIN_CONVERT: (id: string) => `/leads/admin/leads/${id}/convert`,
  },
  PROFILES: {
    CREATE: '/profiles',
    ME: '/profiles/me',
    UPDATE_ME: '/profiles/me',
    UPDATE_TALENT: '/profiles/me/talent-type',
    UPDATE_PROFESSIONAL: '/profiles/me/professional',
    UPDATE_CASTING: '/casting/profile/me',
    ADD_HEADSHOT: '/profiles/me/headshots',
    DELETE_HEADSHOT: (headshotId: string) => `/profiles/me/headshots/${headshotId}`,
    UPLOAD_SHOWREEL: '/profiles/me/showreel',
    ADD_PORTFOLIO: '/profiles/me/portfolio',
    DELETE_PORTFOLIO: (itemId: string) => `/profiles/me/portfolio/${itemId}`,
    UPDATE_ACCOUNT: '/profiles/me/account',
    GET_COMPLETENESS: '/profiles/me/completeness',
    SEARCH: '/profiles/search',
    GET_ONE: (userId: string) => `/profiles/${userId}`,
  },
  SERVICES: {
    GET_ALL: '/services',
    GET_MY_SERVICES: '/services/me',
    CREATE: '/services',
    UPDATE: (id: string) => `/services/${id}`,
    DELETE: (id: string) => `/services/${id}`,
    STATS: '/services/stats',
    SEARCH: '/services/search',
    GET_ONE: (id: string) => `/services/${id}`,
    FEATURED: '/services/featured',
  },
  SUBSCRIPTIONS: {
    CREATE_CHECKOUT_SESSION: '/subscriptions/create-checkout-session',
    STATUS: '/subscriptions/status',
    DETAILS: '/subscriptions/details',
    UPGRADE: '/subscriptions/upgrade',
    CANCEL: '/subscriptions/cancel',
    WEBHOOK: '/subscriptions/webhook',
    PLANS: '/subscriptions/plans',
    QUOTA: '/subscriptions/quota',
    PAYMENT_METHODS: '/subscriptions/payment-methods',
  },
  USERS: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    UPDATE_PROFILE_PICTURE: '/users/profile-picture',
    DELETE_ACCOUNT: '/user/account',
    SEARCH: '/users/search',
    GET_ONE: (userId: string) => `/users/${userId}`,
  },
  PROJECTS: {
    CREATE: '/projects',
    ME: '/projects/me',
    GET_ONE: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    ROLES: (id: string) => `/projects/${id}/roles`,
  },
  PORTFOLIO: {
    ADD: '/portfolio',
    GET_ME: '/portfolio/me',
    UPDATE: (id: string) => `/portfolio/${id}`,
    DELETE: (id: string) => `/portfolio/${id}`,
  },
};

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

// --- USER ENDPOINTS ---
export const userAPI = {
  getProfile: () => api.get(API_ENDPOINTS.USERS.PROFILE),
  updateProfile: (data) => api.patch(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
  updateProfilePicture: (formData: FormData) => api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE_PICTURE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAccount: (data: { password?: string }) => api.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT, { data }),
  search: (params) => api.get(API_ENDPOINTS.USERS.SEARCH, { params }),
  getOne: (userId: string) => api.get(API_ENDPOINTS.USERS.GET_ONE(userId)),
};

// Request interceptor for Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login if necessary or handle session expiration
    }
    return Promise.reject(error);
  }
);

// --- AUTH ENDPOINTS ---
export const authAPI = {
  register: (data) => api.post(API_ENDPOINTS.AUTH.REGISTER, data),
  login: (data) => api.post(API_ENDPOINTS.AUTH.LOGIN, data),
  verifyEmail: (data) => api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data),
  forgotPassword: (data) => api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),
  resetPassword: (data) => api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),
  changePassword: (data) => api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
  getMe: () => api.get(API_ENDPOINTS.AUTH.ME),
  resendVerification: (email: string) => api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email }),
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
};

// --- VERIFICATION ENDPOINTS ---
export const verificationAPI = {
  submit: (formData: FormData) => api.post(API_ENDPOINTS.VERIFICATIONS.SUBMIT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: (params) => api.get(API_ENDPOINTS.VERIFICATIONS.HISTORY, { params }),
  validate: (hash: string) => api.get(API_ENDPOINTS.VERIFICATIONS.VALIDATE(hash)),
};

// --- LIVESTREAM ENDPOINTS ---
export const livestreamAPI = {
  create: (data) => api.post(API_ENDPOINTS.LIVESTREAM.CREATE, data),
  getAll: (params?) => api.get(API_ENDPOINTS.LIVESTREAM.GET_ALL, { params }),
  getActive: () => api.get(API_ENDPOINTS.LIVESTREAM.GET_ACTIVE),
  getMyStreams: () => api.get(API_ENDPOINTS.LIVESTREAM.GET_MY_STREAMS),
  postMessage: (id: string, message: string) => api.post(API_ENDPOINTS.LIVESTREAM.POST_MESSAGE(id), { text: message }),
  getMessages: (id: string) => api.get(API_ENDPOINTS.LIVESTREAM.GET_MESSAGES(id)),
  start: (id: string) => api.post(API_ENDPOINTS.LIVESTREAM.START(id)),
  join: (id: string, hostId?: string) => api.post(
    API_ENDPOINTS.LIVESTREAM.JOIN(id),
    hostId ? { hostId } : undefined,
    {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    }
  ),
  invite: (id: string, emails: string[]) => api.post(API_ENDPOINTS.LIVESTREAM.INVITE(id), { emails }),
  leave: (id: string) => api.post(API_ENDPOINTS.LIVESTREAM.LEAVE(id)),
  end: (id: string) => api.patch(API_ENDPOINTS.LIVESTREAM.END(id)),
  getParticipants: (id: string) => api.get(API_ENDPOINTS.LIVESTREAM.GET_PARTICIPANTS(id)),
  promoteCohost: (id: string, userId: string) => api.post(API_ENDPOINTS.LIVESTREAM.PROMOTE_COHOST(id), { userId }),
  removeCohost: (id: string, userId: string) => api.delete(API_ENDPOINTS.LIVESTREAM.REMOVE_COHOST(id, userId)),
};

// --- MESSAGING ENDPOINTS ---
export const messagingAPI = {
  getOrCreateConversation: (participantId: string, castingCallId?: string) => 
    api.post(API_ENDPOINTS.MESSAGING.GET_OR_CREATE_CONVERSATION, { participantId, castingCallId }),
  getMyConversations: () => api.get(API_ENDPOINTS.MESSAGING.GET_MY_CONVERSATIONS),
  sendMessage: (data: { conversationId: string, text: string, mediaUrl?: string }) => 
    api.post(API_ENDPOINTS.MESSAGING.SEND_MESSAGE, data),
  getMessages: (id: string, params) => api.get(API_ENDPOINTS.MESSAGING.GET_MESSAGES(id), { params }),
  sendBulkMessage: (data: { recipientIds: string[], text: string }) => 
    api.post(API_ENDPOINTS.MESSAGING.BULK_MESSAGE, data),
};

// --- NOTIFICATION ENDPOINTS ---
export const notificationAPI = {
  registerDevice: (data: { deviceToken: string, platform: 'ios' | 'android' | 'web' }) => 
    api.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, data),
  send: (data) => api.post(API_ENDPOINTS.NOTIFICATIONS.SEND, data),
  getAll: (params) => api.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, { params }),
  readAll: () => api.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL),
  markRead: (id: string) => api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
};

// --- PROFILE ENDPOINTS ---
export const profileAPI = {
  create: (data) => api.post(API_ENDPOINTS.PROFILES.CREATE, data),
  getMe: () => api.get(API_ENDPOINTS.PROFILES.ME),
  updateMe: (data) => api.patch(API_ENDPOINTS.PROFILES.UPDATE_ME, data),
  updateTalent: (data) => api.patch(API_ENDPOINTS.PROFILES.UPDATE_TALENT, data),
  updateProfessional: (data) => api.patch(API_ENDPOINTS.PROFILES.UPDATE_PROFESSIONAL, data),
  updateCasting: (data) => api.patch(API_ENDPOINTS.PROFILES.UPDATE_CASTING, data),
  addHeadshot: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.ADD_HEADSHOT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteHeadshot: (id: string) => api.delete(API_ENDPOINTS.PROFILES.DELETE_HEADSHOT(id)),
  uploadShowreel: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.UPLOAD_SHOWREEL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addPortfolio: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.ADD_PORTFOLIO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePortfolio: (id: string) => api.delete(API_ENDPOINTS.PROFILES.DELETE_PORTFOLIO(id)),
  updateAccount: (data) => api.patch(API_ENDPOINTS.PROFILES.UPDATE_ACCOUNT, data),
  getCompleteness: () => api.get(API_ENDPOINTS.PROFILES.GET_COMPLETENESS),
  search: (params) => api.get(API_ENDPOINTS.PROFILES.SEARCH, { params }),
  getOne: (userId: string) => api.get(API_ENDPOINTS.PROFILES.GET_ONE(userId)),
};

// --- CASTING CALL ENDPOINTS ---
export const castingCallAPI = {
  getAll: (params) => api.get(API_ENDPOINTS.CASTING_CALLS.GET_ALL, { params }),
  create: (data) => api.post(API_ENDPOINTS.CASTING_CALLS.CREATE, data),
  getMyListings: () => api.get(API_ENDPOINTS.CASTING_CALLS.MY_LISTINGS),
  getOne: (id: string) => api.get(API_ENDPOINTS.CASTING_CALLS.GET_ONE(id)),
  update: (id: string, data) => api.put(API_ENDPOINTS.CASTING_CALLS.UPDATE(id), data),
  delete: (id: string) => api.delete(API_ENDPOINTS.CASTING_CALLS.DELETE(id)),
  close: (id: string) => api.put(API_ENDPOINTS.CASTING_CALLS.CLOSE(id)),
};

// --- APPLICATION ENDPOINTS ---
export const applicationAPI = {
  create: (data: FormData | any) => api.post(API_ENDPOINTS.APPLICATIONS.CREATE, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }),
  getMe: () => api.get(API_ENDPOINTS.APPLICATIONS.ME),
  getByCastingCall: (id: string) => api.get(API_ENDPOINTS.APPLICATIONS.BY_CASTING_CALL(id)),
  getDetails: (id: string) => api.get(API_ENDPOINTS.APPLICATIONS.DETAILS(id)),
  shortlist: (id: string) => api.put(API_ENDPOINTS.APPLICATIONS.SHORTLIST(id)),
  reject: (id: string) => api.put(API_ENDPOINTS.APPLICATIONS.REJECT(id)),
  accept: (id: string) => api.put(API_ENDPOINTS.APPLICATIONS.ACCEPT(id)),
  update: (id: string, data: any) => api.patch(API_ENDPOINTS.APPLICATIONS.DETAILS(id), data),
  addCommunication: (id: string, message: string) => api.post(API_ENDPOINTS.APPLICATIONS.COMMUNICATION(id), { message }),
  withdraw: (id: string) => api.delete(API_ENDPOINTS.APPLICATIONS.WITHDRAW(id)),
};

// --- BOOKING ENDPOINTS ---
export const bookingAPI = {
  create: (data) => api.post(API_ENDPOINTS.BOOKINGS.CREATE, data),
  getMe: (params?) => api.get(API_ENDPOINTS.BOOKINGS.ME, { params }),
  getProfessionalBookings: (params?) => api.get(API_ENDPOINTS.BOOKINGS.PROFESSIONAL_ME, { params }),
  getDetails: (id: string) => api.get(API_ENDPOINTS.BOOKINGS.DETAILS(id)),
  updateStatus: (id: string, status: string) => api.patch(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), { status }),
  getStats: () => api.get(API_ENDPOINTS.BOOKINGS.STATS),
  cancel: (id: string) => api.post(API_ENDPOINTS.BOOKINGS.CANCEL(id)),
  complete: (id: string) => api.post(API_ENDPOINTS.BOOKINGS.COMPLETE(id)),
};

// --- NEWS ENDPOINTS ---
export const newsAPI = {
  getAll: (params?) => api.get(API_ENDPOINTS.NEWS.GET_ALL, { params }),
  getOne: (id: string) => api.get(API_ENDPOINTS.NEWS.GET_ONE(id)),
  create: (data) => api.post(API_ENDPOINTS.NEWS.CREATE, data),
  update: (id: string, data) => api.put(API_ENDPOINTS.NEWS.UPDATE(id), data),
  delete: (id: string) => api.delete(API_ENDPOINTS.NEWS.DELETE(id)),
};

// --- SERVICE ENDPOINTS ---
export const serviceAPI = {
  getAll: (params?) => api.get(API_ENDPOINTS.SERVICES.GET_ALL, { params }),
  getMyServices: () => api.get(API_ENDPOINTS.SERVICES.GET_MY_SERVICES),
  create: (data) => api.post(API_ENDPOINTS.SERVICES.CREATE, data),
  update: (id: string, data) => api.put(API_ENDPOINTS.SERVICES.UPDATE(id), data),
  delete: (id: string) => api.delete(API_ENDPOINTS.SERVICES.DELETE(id)),
  getStats: () => api.get(API_ENDPOINTS.SERVICES.STATS),
  search: (params) => api.get(API_ENDPOINTS.SERVICES.SEARCH, { params }),
  getOne: (id: string) => api.get(API_ENDPOINTS.SERVICES.GET_ONE(id)),
  getFeatured: () => api.get(API_ENDPOINTS.SERVICES.FEATURED),
};

// --- SUBSCRIPTION ENDPOINTS ---
export const subscriptionAPI = {
  getPlans: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.PLANS),
  createCheckoutSession: (data) => api.post(API_ENDPOINTS.SUBSCRIPTIONS.CREATE_CHECKOUT_SESSION, data),
  getStatus: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.STATUS),
  getDetails: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.DETAILS),
  getQuota: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.QUOTA),
  getPaymentMethods: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.PAYMENT_METHODS),
  upgrade: (data) => api.post(API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE, data),
  cancel: () => api.post(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL),
};

// --- ADMIN ENDPOINTS ---
export const adminAPI = {
  getUsers: (params) => api.get(API_ENDPOINTS.ADMIN.USERS, { params }),
  suspendUser: (id: string, reason: string) => api.put(API_ENDPOINTS.ADMIN.SUSPEND_USER(id), { reason }),
  unsuspendUser: (id: string) => api.put(API_ENDPOINTS.ADMIN.UNSUSPEND_USER(id)),
  verifyUser: (id: string) => api.put(API_ENDPOINTS.ADMIN.VERIFY_USER(id)),
  deleteUser: (id: string) => api.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id)),
  getActionLogs: (params) => api.get(API_ENDPOINTS.ADMIN.ACTION_LOGS, { params }),
  getAnalytics: (params?) => api.get(API_ENDPOINTS.ADMIN.ANALYTICS, { params }),
  getLeads: (params) => api.get(API_ENDPOINTS.ADMIN.LEADS, { params }),
  getLead: (id: string) => api.get(API_ENDPOINTS.LEADS.ADMIN_GET_ONE(id)),
  deleteLead: (id: string) => api.delete(API_ENDPOINTS.LEADS.ADMIN_DELETE(id)),
  convertLead: (id: string, role: string) => api.put(API_ENDPOINTS.LEADS.ADMIN_CONVERT(id), { role }),
  getSubscriptions: (params) => api.get(API_ENDPOINTS.ADMIN.SUBSCRIPTIONS, { params }),
  getModerationQueue: (params?) => api.get(API_ENDPOINTS.ADMIN.MODERATION, { params }),
  updateModerationStatus: (id: string, status: string, notes?: string) => 
    api.patch(`${API_ENDPOINTS.ADMIN.MODERATION}/${id}`, { status, notes }),
  getReports: (params?) => api.get(API_ENDPOINTS.ADMIN.REPORTS, { params }),
  getSettings: () => api.get(API_ENDPOINTS.ADMIN.SETTINGS),
  setFreeTier: (data: { days: number, role: string }) => api.post(API_ENDPOINTS.ADMIN.SET_FREE_TIER, data),
  getVerifications: (params?) => api.get(API_ENDPOINTS.VERIFICATIONS.GET_ALL, { params }),
  updateVerificationStatus: (id: string, status: string, notes?: string) => 
    api.patch(API_ENDPOINTS.VERIFICATIONS.UPDATE_STATUS(id), { status, notes }),
  getVerificationStats: () => api.get(API_ENDPOINTS.VERIFICATIONS.STATS),
  getSubmissions: (params?) => api.get(API_ENDPOINTS.SUBMISSIONS.GET_ALL, { params }),
  updateSubmissionStatus: (id: string, status: string, feedback?: string) => 
    api.patch(API_ENDPOINTS.SUBMISSIONS.UPDATE_STATUS(id), { status, feedback }),
  getSubmissionStats: () => api.get(API_ENDPOINTS.SUBMISSIONS.STATS),
  getAdminBookings: (params?) => api.get(API_ENDPOINTS.BOOKINGS.ADMIN_GET_ALL, { params }),
  getAdminBookingDetails: (id: string) => api.get(API_ENDPOINTS.BOOKINGS.ADMIN_GET_ONE(id)),
  updateAdminBookingStatus: (id: string, status: string) => api.patch(API_ENDPOINTS.BOOKINGS.ADMIN_UPDATE_STATUS(id), { status }),
  getAdminBookingStats: () => api.get(API_ENDPOINTS.BOOKINGS.ADMIN_STATS),
  grantTrial: (userId: string, days: number) => 
    api.post(API_ENDPOINTS.ADMIN.GRANT_TRIAL(userId), { days }),
};

// --- LEAD ENDPOINTS ---
export const leadAPI = {
  create: (data) => api.post(API_ENDPOINTS.LEADS.CREATE, data),
};

// --- PROJECT ENDPOINTS ---
export const projectAPI = {
  create: (data) => api.post(API_ENDPOINTS.PROJECTS.CREATE, data),
  getMe: () => api.get(API_ENDPOINTS.PROJECTS.ME),
  getOne: (id: string) => api.get(API_ENDPOINTS.PROJECTS.GET_ONE(id)),
  update: (id: string, data) => api.patch(API_ENDPOINTS.PROJECTS.UPDATE(id), data),
  delete: (id: string) => api.delete(API_ENDPOINTS.PROJECTS.DELETE(id)),
  addRole: (id: string, data) => api.post(API_ENDPOINTS.PROJECTS.ROLES(id), data),
  getRoles: (id: string) => api.get(API_ENDPOINTS.PROJECTS.ROLES(id)),
};

// --- PORTFOLIO ENDPOINTS ---
export const portfolioAPI = {
  add: (data) => api.post(API_ENDPOINTS.PORTFOLIO.ADD, data),
  getMe: () => api.get(API_ENDPOINTS.PORTFOLIO.GET_ME),
  update: (id: string, data) => api.patch(API_ENDPOINTS.PORTFOLIO.UPDATE(id), data),
  delete: (id: string) => api.delete(API_ENDPOINTS.PORTFOLIO.DELETE(id)),
};

export default api;
