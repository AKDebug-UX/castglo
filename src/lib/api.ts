import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `https://castglo-qupm.onrender.com/api/v1`

export const API_ENDPOINTS = {
  ADMIN: {
    USERS: '/admin/users',
    SUSPEND_USER: (userId: string) => `/admin/users/${userId}/suspend`,
    VERIFY_USER: (userId: string) => `/admin/users/${userId}/verify`,
    DELETE_USER: (userId: string) => `/admin/users/${userId}`,
    ACTION_LOGS: '/admin/action-logs',
    ANALYTICS: '/admin/analytics',
    MODERATION: '/admin/moderation',
    UPDATE_MODERATION: (id: string) => `/admin/moderation/${id}`,
    SETTINGS: '/admin/settings',
    SET_FREE_TIER: '/admin/settings/free-tier',
    GRANT_TRIAL: (userId: string) => `/admin/users/${userId}/grant-trial`,
    UNSUSPEND_USER: (userId: string) => `/admin/users/${userId}/unsuspend`,
    LEADS: '/admin/leads',
    SUBSCRIPTIONS: '/admin/subscriptions',
    CASTING_CALLS_PENDING: '/admin/casting-calls/pending',
    APPROVE_CASTING_CALL: (id: string) => `/admin/casting-calls/${id}/approve`,
    REJECT_CASTING_CALL: (id: string) => `/admin/casting-calls/${id}/reject`,
  },
  VERIFICATIONS: {
    SUBMIT: '/blockchain/verify',
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
    PROFESSIONAL_ME: '/bookings/professional/me',
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
    STATS: '/bookings/professional/stats',
    ADMIN_GET_ALL: '/admin/bookings',
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
    GOOGLE: '/auth/google',
    SET_PASSWORD: '/auth/set-password',
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
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    READ_ALL: '/notifications/read-all',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    REGISTER_DEVICE: '/notifications/register-device',
    SEND: '/notifications/send',
  },
  CASTING_CALLS: {
    GET_ALL: '/casting-calls',
    CREATE: '/casting-calls',
    MY_LISTINGS: '/casting-calls/user/my-listings',
    GET_ONE: (id: string) => `/casting-calls/${id}`,
    UPDATE: (id: string) => `/casting-calls/${id}`,
    DELETE: (id: string) => `/casting-calls/${id}`,
    CLOSE: (id: string) => `/casting-calls/${id}/close`,
    BOOST: (id: string) => `/casting-calls/${id}/boost`,
    INSTANT_POST: (id: string) => `/casting-calls/${id}/instant-post`,
  },
  LEADS: {
    CREATE: '/leads',
  },
  PROFILES: {
    ME: '/profiles/me',
    UPDATE_ME: '/profiles/me',
    UPDATE_TALENT: '/profile/me/talent-type',
    UPDATE_PROFESSIONAL: '/profile/me/professional',
    UPDATE_CASTING: '/casting/profile/me',
    ADD_HEADSHOT: '/profiles/me/headshots',
    DELETE_HEADSHOT: (headshotId: string) => `/profiles/me/headshots/${headshotId}`,
    UPLOAD_SHOWREEL: '/profiles/me/showreel',
    ADD_PORTFOLIO: '/portfolio',
    SEARCH: '/profiles/search',
    GET_ONE: (userId: string) => `/profiles/${userId}`,
    COMPLETENESS: '/profiles/me/completeness',
    ACCOUNT: '/profiles/me/account',
    COVER_IMAGE: '/profiles/me/cover-image',
    INTRO_VIDEO: '/profiles/me/intro-video',
    CV: '/profiles/me/cv',
    PORTFOLIO_ME: '/profiles/me/portfolio',
    DELETE_PORTFOLIO_ITEM: (itemId: string) => `/profiles/me/portfolio/${itemId}`,
    PHOTOS: '/profiles/me/photos',
    DELETE_PHOTO: (photoId: string) => `/profiles/me/photos/${photoId}`,
  },
  PORTFOLIO: {
    CREATE: '/portfolio',
    ME: '/portfolio/me',
    UPDATE: (id: string) => `/portfolio/${id}`,
    DELETE: (id: string) => `/portfolio/${id}`,
  },
  PROJECTS: {
    CREATE: '/projects',
    ME: '/projects/me',
    WORKSPACE_PROJECTS: (ownerId: string) => `/workspaces/${ownerId}/projects`,
    GET_ONE: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    ROLES: (id: string) => `/projects/${id}/roles`,
    ROLE_UPDATE: (id: string, roleId: string) => `/projects/${id}/roles/${roleId}`,
    ROLE_DELETE: (id: string, roleId: string) => `/projects/${id}/roles/${roleId}`,
    ROLE_APPLY: (id: string, roleId: string) => `/projects/${id}/roles/${roleId}/apply`,
    ROLE_APPLICANTS: (id: string, roleId: string) => `/projects/${id}/roles/${roleId}/applicants`,
    ROLE_APPLICANT_STATUS: (id: string, roleId: string, applicantId: string) => `/projects/${id}/roles/${roleId}/applicants/${applicantId}/status`,
    ROLE_BULK_ACTION: (id: string, roleId: string) => `/projects/${id}/roles/${roleId}/applicants/bulk-action`,
    ROLE_MATCHES: (id: string, roleId: string) => `/projects/${id}/roles/${roleId}/matches`,
  },
  REFERENCE: {
    ALL: '/reference',
    BY_TYPE: (type: string) => `/reference/${type}`,
  },
  REPORTS: {
    CREATE: '/reports',
  },
  SERVICES: {
    GET_MY_SERVICES: '/services/me',
    CREATE: '/services',
    STATS: '/services/stats',
    UPDATE: (id: string) => `/services/${id}`,
    DELETE: (id: string) => `/services/${id}`,
  },
  SUBSCRIPTIONS: {
    CREATE_CHECKOUT_SESSION: '/subscriptions/create-checkout-session',
    STATUS: '/subscriptions/status',
    PLANS: '/subscriptions/plans',
    QUOTA: '/subscriptions/quota',
    PAYMENT_METHODS: '/subscriptions/payment-methods',
    INVOICES: '/subscriptions/payment-methods',
    CREATE_PORTAL_SESSION: '/subscriptions/customer-portal',
    DELETE_PAYMENT_METHOD: (id: string) => `/subscriptions/payment-methods/${id}`,
    WEBHOOK: '/subscriptions/webhook',
    DETAILS: '/subscriptions/details',
    UPGRADE: '/subscriptions/upgrade',
    CANCEL: '/subscriptions/cancel',
  },
  BLOCKCHAIN: {
    HISTORY: '/blockchain/history',
    VALIDATE: (hash: string) => `/blockchain/validate/${hash}`,
  },
  LEADS_ADMIN: {
    GET_ALL: '/leads/admin/leads',
    GET_ONE: (id: string) => `/leads/admin/leads/${id}`,
    DELETE: (id: string) => `/leads/admin/leads/${id}`,
    CONVERT: (id: string) => `/leads/admin/leads/${id}/convert`,
  },
  COLLABORATORS: {
    INVITE: '/collaborators/invite',
    GET_ALL: '/collaborators',
    GET_ONE: (collaboratorId: string) => `/collaborators/${collaboratorId}`,
    UPDATE: (collaboratorId: string) => `/collaborators/${collaboratorId}`,
    REVOKE: (collaboratorId: string) => `/collaborators/${collaboratorId}/revoke`,
    RESEND: (collaboratorId: string) => `/collaborators/${collaboratorId}/resend`,
    MY_INVITATIONS: '/collaborators/me/invitations',
    MY_COLLABORATIONS: '/collaborators/me/collaborations',
    ACCEPT_INVITATION: '/collaborators/invite/accept',
    DECLINE_INVITATION: '/collaborators/invite/decline',
  },
  TWO_FACTOR_AUTH: {
    ENROL: '/2fa/enrol',
    CONFIRM: '/2fa/confirm',
    DISABLE: '/2fa/disable',
    BACKUP_CODES: '/2fa/backup-codes',
    VERIFY_LOGIN: '/auth/2fa/verify',
    // Legacy — kept for backwards compat with old email-code flow
    VERIFY: '/2fa/verify',
    RESEND: '/2fa/resend',
    STATUS: '/2fa/status',
  },
  USERS: {
    UPDATE_PROFILE: '/user/profile',
    UPDATE_PROFILE_PICTURE: '/users/profile-picture',
    DELETE_ACCOUNT: '/user/account',
    SEARCH: '/users/search',
    GET_ONE: (userId: string) => `/users/${userId}`,
  },
  UPLOAD: {
    IMAGE: '/upload/image',
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
  google: (data) => api.post(API_ENDPOINTS.AUTH.GOOGLE, data),
  setPassword: (data) => api.post(API_ENDPOINTS.AUTH.SET_PASSWORD, data),
};

// --- VERIFICATION ENDPOINTS ---
export const verificationAPI = {
  submit: (formData: FormData) => api.post(API_ENDPOINTS.VERIFICATIONS.SUBMIT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
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
};

// --- NOTIFICATION ENDPOINTS ---
export const notificationAPI = {
  getAll: (params) => api.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, { params }),
  readAll: () => api.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL),
  markRead: (id: string) => api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  registerDevice: (data) => api.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, data),
  send: (data) => api.post(API_ENDPOINTS.NOTIFICATIONS.SEND, data),
};

// --- PROFILE ENDPOINTS ---
export const profileAPI = {
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
  search: (params) => api.get(API_ENDPOINTS.PROFILES.SEARCH, { params }),
  getOne: (userId: string) => api.get(API_ENDPOINTS.PROFILES.GET_ONE(userId)),
  getCompleteness: () => api.get(API_ENDPOINTS.PROFILES.COMPLETENESS),
  updateAccount: (data) => api.patch(API_ENDPOINTS.PROFILES.ACCOUNT, data),
  uploadCoverImage: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.COVER_IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadIntroVideo: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.INTRO_VIDEO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadCv: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.CV, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addPortfolioItem: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.PORTFOLIO_ME, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePortfolioItem: (id: string) => api.delete(API_ENDPOINTS.PROFILES.DELETE_PORTFOLIO_ITEM(id)),
  addPhotos: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.PHOTOS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePhoto: (id: string) => api.delete(API_ENDPOINTS.PROFILES.DELETE_PHOTO(id)),
};

// --- CASTING CALL ENDPOINTS ---
export const castingCallAPI = {
  getAll: (params) => api.get(API_ENDPOINTS.CASTING_CALLS.GET_ALL, { params }),
  create: (data: FormData | any) => api.post(API_ENDPOINTS.CASTING_CALLS.CREATE, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }),
  getMyListings: () => api.get(API_ENDPOINTS.CASTING_CALLS.MY_LISTINGS),
  getOne: (id: string) => api.get(API_ENDPOINTS.CASTING_CALLS.GET_ONE(id)),
  update: (id: string, data: FormData | any) => api.put(API_ENDPOINTS.CASTING_CALLS.UPDATE(id), data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }),
  delete: (id: string) => api.delete(API_ENDPOINTS.CASTING_CALLS.DELETE(id)),
  close: (id: string) => api.put(API_ENDPOINTS.CASTING_CALLS.CLOSE(id)),
  boost: (id: string) => api.post(API_ENDPOINTS.CASTING_CALLS.BOOST(id)),
  instantPost: (id: string) => api.post(API_ENDPOINTS.CASTING_CALLS.INSTANT_POST(id)),
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
  getProfessionalBookings: (params?) => api.get(API_ENDPOINTS.BOOKINGS.PROFESSIONAL_ME, { params }),
  updateStatus: (id: string, status: string) => api.patch(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), { status }),
  getStats: () => api.get(API_ENDPOINTS.BOOKINGS.STATS),
};

// --- SERVICE ENDPOINTS ---
export const serviceAPI = {
  getMyServices: () => api.get(API_ENDPOINTS.SERVICES.GET_MY_SERVICES),
  create: (data) => api.post(API_ENDPOINTS.SERVICES.CREATE, data),
  getStats: () => api.get(API_ENDPOINTS.SERVICES.STATS),
  update: (id: string, data) => api.put(API_ENDPOINTS.SERVICES.UPDATE(id), data),
  delete: (id: string) => api.delete(API_ENDPOINTS.SERVICES.DELETE(id)),
};

// --- SUBSCRIPTION ENDPOINTS ---
export const subscriptionAPI = {
  getPlans: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.PLANS),
  createCheckoutSession: (data) => api.post(API_ENDPOINTS.SUBSCRIPTIONS.CREATE_CHECKOUT_SESSION, data),
  getStatus: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.STATUS),
  getQuota: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.QUOTA),
  getPaymentMethods: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.PAYMENT_METHODS),
  getInvoices: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.INVOICES),
  createPortalSession: () => api.post(API_ENDPOINTS.SUBSCRIPTIONS.CREATE_PORTAL_SESSION),
  deletePaymentMethod: (id: string) => api.delete(API_ENDPOINTS.SUBSCRIPTIONS.DELETE_PAYMENT_METHOD(id)),
  webhook: (data) => api.post(API_ENDPOINTS.SUBSCRIPTIONS.WEBHOOK, data),
  getDetails: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.DETAILS),
  upgrade: (data) => api.post(API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE, data),
  cancel: () => api.post(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL),
};

// --- ADMIN ENDPOINTS ---
export const adminAPI = {
  getUsers: (params) => api.get(API_ENDPOINTS.ADMIN.USERS, { params }),
  suspendUser: (id: string, reason: string) => api.put(API_ENDPOINTS.ADMIN.SUSPEND_USER(id), { reason }),
  verifyUser: (id: string) => api.put(API_ENDPOINTS.ADMIN.VERIFY_USER(id)),
  deleteUser: (id: string) => api.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id)),
  getActionLogs: (params) => api.get(API_ENDPOINTS.ADMIN.ACTION_LOGS, { params }),
  getAnalytics: (params?) => api.get(API_ENDPOINTS.ADMIN.ANALYTICS, { params }),
  getModerationQueue: (params?) => api.get(API_ENDPOINTS.ADMIN.MODERATION, { params }),
  updateModerationStatus: (id: string, status: string, notes?: string) => 
    api.patch(`${API_ENDPOINTS.ADMIN.MODERATION}/${id}`, { status, notes }),
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
  updateAdminBookingStatus: (id: string, status: string) => api.patch(API_ENDPOINTS.BOOKINGS.ADMIN_UPDATE_STATUS(id), { status }),
  getAdminBookingStats: () => api.get(API_ENDPOINTS.BOOKINGS.ADMIN_STATS),
  grantTrial: (userId: string, days: number) => 
    api.post(API_ENDPOINTS.ADMIN.GRANT_TRIAL(userId), { days }),
  unsuspendUser: (id: string) => api.put(API_ENDPOINTS.ADMIN.UNSUSPEND_USER(id)),
  getLeads: (params?) => api.get(API_ENDPOINTS.ADMIN.LEADS, { params }),
  getSubscriptions: (params?) => api.get(API_ENDPOINTS.ADMIN.SUBSCRIPTIONS, { params }),
  getPendingCastingCalls: (params?) => api.get(API_ENDPOINTS.ADMIN.CASTING_CALLS_PENDING, { params }),
  approveCastingCall: (id: string) => api.patch(API_ENDPOINTS.ADMIN.APPROVE_CASTING_CALL(id)),
  rejectCastingCall: (id: string) => api.patch(API_ENDPOINTS.ADMIN.REJECT_CASTING_CALL(id)),
};

// --- LEAD ENDPOINTS ---
export const leadAPI = {
  create: (data) => api.post(API_ENDPOINTS.LEADS.CREATE, data),
};

// --- UPLOAD ENDPOINTS ---
export const uploadAPI = {
  uploadImage: (formData: FormData) => api.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// --- PORTFOLIO ENDPOINTS ---
export const portfolioAPI = {
  create: (data) => api.post(API_ENDPOINTS.PORTFOLIO.CREATE, data),
  getMe: () => api.get(API_ENDPOINTS.PORTFOLIO.ME),
  update: (id: string, data) => api.patch(API_ENDPOINTS.PORTFOLIO.UPDATE(id), data),
  delete: (id: string) => api.delete(API_ENDPOINTS.PORTFOLIO.DELETE(id)),
};

// --- PROJECT ENDPOINTS ---
export const projectAPI = {
  create: (data) => api.post(API_ENDPOINTS.PROJECTS.CREATE, data),
  getMe: (params?) => api.get(API_ENDPOINTS.PROJECTS.ME, { params }),
  getWorkspaceProjects: (ownerId: string, params?) => api.get(API_ENDPOINTS.PROJECTS.WORKSPACE_PROJECTS(ownerId), { params }),
  getOne: (id: string) => api.get(API_ENDPOINTS.PROJECTS.GET_ONE(id)),
  update: (id: string, data) => api.patch(API_ENDPOINTS.PROJECTS.UPDATE(id), data),
  delete: (id: string) => api.delete(API_ENDPOINTS.PROJECTS.DELETE(id)),
  getRoles: (id: string) => api.get(API_ENDPOINTS.PROJECTS.ROLES(id)),
  createRole: (id: string, data) => api.post(API_ENDPOINTS.PROJECTS.ROLES(id), data),
  updateRole: (id: string, roleId: string, data) => api.patch(API_ENDPOINTS.PROJECTS.ROLE_UPDATE(id, roleId), data),
  deleteRole: (id: string, roleId: string) => api.delete(API_ENDPOINTS.PROJECTS.ROLE_DELETE(id, roleId)),
  applyToRole: (id: string, roleId: string, data) => api.post(API_ENDPOINTS.PROJECTS.ROLE_APPLY(id, roleId), data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }),
  getApplicants: (id: string, roleId: string, params?) => api.get(API_ENDPOINTS.PROJECTS.ROLE_APPLICANTS(id, roleId), { params }),
  updateApplicantStatus: (id: string, roleId: string, applicantId: string, data) => api.patch(API_ENDPOINTS.PROJECTS.ROLE_APPLICANT_STATUS(id, roleId, applicantId), data),
  bulkAction: (id: string, roleId: string, data) => api.post(API_ENDPOINTS.PROJECTS.ROLE_BULK_ACTION(id, roleId), data),
  getMatches: (id: string, roleId: string, params?) => api.get(API_ENDPOINTS.PROJECTS.ROLE_MATCHES(id, roleId), { params }),
};

// --- REFERENCE ENDPOINTS ---
export const referenceAPI = {
  getAll: () => api.get(API_ENDPOINTS.REFERENCE.ALL),
  getByType: (type: string) => api.get(API_ENDPOINTS.REFERENCE.BY_TYPE(type)),
};

// --- REPORTS ENDPOINTS ---
export const reportsAPI = {
  create: (data) => api.post(API_ENDPOINTS.REPORTS.CREATE, data),
};

// --- BLOCKCHAIN ENDPOINTS ---
export const blockchainAPI = {
  getHistory: (params?) => api.get(API_ENDPOINTS.BLOCKCHAIN.HISTORY, { params }),
  validate: (hash: string) => api.get(API_ENDPOINTS.BLOCKCHAIN.VALIDATE(hash)),
};

// --- ADMIN LEADS ENDPOINTS ---
export const adminLeadsAPI = {
  getAll: (params?) => api.get(API_ENDPOINTS.LEADS_ADMIN.GET_ALL, { params }),
  getOne: (id: string) => api.get(API_ENDPOINTS.LEADS_ADMIN.GET_ONE(id)),
  delete: (id: string) => api.delete(API_ENDPOINTS.LEADS_ADMIN.DELETE(id)),
  convert: (id: string) => api.put(API_ENDPOINTS.LEADS_ADMIN.CONVERT(id)),
};

// --- COLLABORATORS ENDPOINTS ---
export const collaboratorAPI = {
  invite: (data: { 
    inviteEmail: string; 
    projectGrants?: Array<{ projectId: string; permissions: string | { role: string } | string[] }>;
    permissions?: string | { role: string } | string[]; 
    projectId?: string 
  }) => 
    api.post(API_ENDPOINTS.COLLABORATORS.INVITE, data),
  getAll: (params?) => api.get(API_ENDPOINTS.COLLABORATORS.GET_ALL, { params }),
  getOne: (collaboratorId: string) => api.get(API_ENDPOINTS.COLLABORATORS.GET_ONE(collaboratorId)),
  updatePermissions: (collaboratorId: string, data: { permissions: string | { role: string } | string[] }) => 
    api.patch(API_ENDPOINTS.COLLABORATORS.UPDATE(collaboratorId), data),
  revoke: (collaboratorId: string) => 
    api.delete(API_ENDPOINTS.COLLABORATORS.REVOKE(collaboratorId)),
  resendInvitation: (collaboratorId: string) => 
    api.post(API_ENDPOINTS.COLLABORATORS.RESEND(collaboratorId)),
  getMyInvitations: (params?) => 
    api.get(API_ENDPOINTS.COLLABORATORS.MY_INVITATIONS, { params }),
  getMyCollaborations: (params?) => 
    api.get(API_ENDPOINTS.COLLABORATORS.MY_COLLABORATIONS, { params }),
  acceptInvitation: (data: string | { invitationId?: string; id?: string; token?: string }) => 
    api.post(API_ENDPOINTS.COLLABORATORS.ACCEPT_INVITATION, typeof data === "string" ? { id: data, invitationId: data, token: data } : data),
  declineInvitation: (data: string | { invitationId?: string; id?: string; token?: string }) => 
    api.post(API_ENDPOINTS.COLLABORATORS.DECLINE_INVITATION, typeof data === "string" ? { id: data, invitationId: data, token: data } : data),
};

export const twoFactorAuthAPI = {
  // ---- TOTP enrolment (authenticated) ----
  enrol: () => api.post(API_ENDPOINTS.TWO_FACTOR_AUTH.ENROL),
  confirm: (token: string) => api.post(API_ENDPOINTS.TWO_FACTOR_AUTH.CONFIRM, { token }),
  disable: (password: string) => api.delete(API_ENDPOINTS.TWO_FACTOR_AUTH.DISABLE, { data: { password } }),
  regenerateBackupCodes: () => api.get(API_ENDPOINTS.TWO_FACTOR_AUTH.BACKUP_CODES),

  // ---- Login 2FA verification (uses tempToken, NO bearer header) ----
  verifyLogin: (tempToken: string, code: string) =>
    api.post(API_ENDPOINTS.TWO_FACTOR_AUTH.VERIFY_LOGIN, { tempToken, code }, {
      headers: { Authorization: '' },
    }),

  // Legacy email-code helpers (retained)
  verify: (data: { code: string; email?: string; password?: string; tempToken?: string }) =>
    api.post(API_ENDPOINTS.TWO_FACTOR_AUTH.VERIFY, data),
  resend: (data?: { email?: string }) => api.post(API_ENDPOINTS.TWO_FACTOR_AUTH.RESEND, data),
  getStatus: () => api.get(API_ENDPOINTS.TWO_FACTOR_AUTH.STATUS),
};

export default api;
