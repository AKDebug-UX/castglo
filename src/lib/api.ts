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
  BLOCKCHAIN: {
    VERIFY: '/blockchain/verify',
    HISTORY: '/blockchain/history',
    VALIDATE: (hash: string) => `/blockchain/validate/${hash}`,
  },
  LIVESTREAM: {
    CREATE: '/livestream',
    GET_ALL: '/livestream',
    GET_ACTIVE: '/livestream',
    START: (id: string) => `/livestream/${id}/start`,
    JOIN: (id: string) => `/livestream/${id}/join`,
    LEAVE: (id: string) => `/livestream/${id}/leave`,
    END: (id: string) => `/livestream/${id}/end`,
  },
  MESSAGING: {
    GET_OR_CREATE_CONVERSATION: '/messaging/conversations',
    GET_MY_CONVERSATIONS: '/messaging/conversations',
    SEND_MESSAGE: '/messaging/messages',
    GET_MESSAGES: (id: string) => `/messaging/conversations/${id}/messages`,
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
    ADD_HEADSHOT: '/profiles/me/headshots',
    DELETE_HEADSHOT: (headshotId: string) => `/profiles/me/headshots/${headshotId}`,
    UPLOAD_SHOWREEL: '/profiles/me/showreel',
    SEARCH: '/profiles/search',
    GET_ONE: (userId: string) => `/profiles/${userId}`,
  },
  SUBSCRIPTIONS: {
    CREATE_CHECKOUT_SESSION: '/subscriptions/create-checkout-session',
    STATUS: '/subscriptions/status',
    DETAILS: '/subscriptions/details',
    UPGRADE: '/subscriptions/upgrade',
    CANCEL: '/subscriptions/cancel',
    WEBHOOK: '/subscriptions/webhook',
    PLANS: '/subscriptions/plans',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPDATE_PROFILE_PICTURE: '/users/profile-picture',
    DELETE_ACCOUNT: '/users/account',
    SEARCH: '/users/search',
    GET_ONE: (userId: string) => `/users/${userId}`,
  },
};

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- USER ENDPOINTS ---
export const userAPI = {
  getProfile: () => api.get(API_ENDPOINTS.USERS.PROFILE),
  updateProfile: (data) => api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
  updateProfilePicture: (formData: FormData) => api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE_PICTURE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAccount: () => api.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT),
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

// --- BLOCKCHAIN ENDPOINTS ---
export const blockchainAPI = {
  verify: (formData: FormData) => api.post(API_ENDPOINTS.BLOCKCHAIN.VERIFY, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: (params) => api.get(API_ENDPOINTS.BLOCKCHAIN.HISTORY, { params }),
  validate: (hash: string) => api.get(API_ENDPOINTS.BLOCKCHAIN.VALIDATE(hash)),
};

// --- LIVESTREAM ENDPOINTS ---
export const livestreamAPI = {
  create: (data) => api.post(API_ENDPOINTS.LIVESTREAM.CREATE, data),
  getAll: (params?: any) => api.get(API_ENDPOINTS.LIVESTREAM.GET_ALL, { params }),
  getActive: () => api.get(API_ENDPOINTS.LIVESTREAM.GET_ACTIVE),
  start: (id: string) => api.post(API_ENDPOINTS.LIVESTREAM.START(id)),
  join: (id: string) => api.post(API_ENDPOINTS.LIVESTREAM.JOIN(id)),
  leave: (id: string) => api.post(API_ENDPOINTS.LIVESTREAM.LEAVE(id)),
  end: (id: string) => api.post(API_ENDPOINTS.LIVESTREAM.END(id)),
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
  updateMe: (data) => api.put(API_ENDPOINTS.PROFILES.UPDATE_ME, data),
  addHeadshot: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.ADD_HEADSHOT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteHeadshot: (id: string) => api.delete(API_ENDPOINTS.PROFILES.DELETE_HEADSHOT(id)),
  uploadShowreel: (formData: FormData) => api.post(API_ENDPOINTS.PROFILES.UPLOAD_SHOWREEL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
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
  create: (data) => api.post(API_ENDPOINTS.APPLICATIONS.CREATE, data),
  getMe: () => api.get(API_ENDPOINTS.APPLICATIONS.ME),
  getByCastingCall: (id: string) => api.get(API_ENDPOINTS.APPLICATIONS.BY_CASTING_CALL(id)),
  getDetails: (id: string) => api.get(API_ENDPOINTS.APPLICATIONS.DETAILS(id)),
  shortlist: (id: string) => api.put(API_ENDPOINTS.APPLICATIONS.SHORTLIST(id)),
  reject: (id: string) => api.put(API_ENDPOINTS.APPLICATIONS.REJECT(id)),
  accept: (id: string) => api.put(API_ENDPOINTS.APPLICATIONS.ACCEPT(id)),
  addCommunication: (id: string, message: string) => api.post(API_ENDPOINTS.APPLICATIONS.COMMUNICATION(id), { message }),
  withdraw: (id: string) => api.delete(API_ENDPOINTS.APPLICATIONS.WITHDRAW(id)),
};

// --- SUBSCRIPTION ENDPOINTS ---
export const subscriptionAPI = {
  getPlans: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.PLANS),
  createCheckoutSession: (data) => api.post(API_ENDPOINTS.SUBSCRIPTIONS.CREATE_CHECKOUT_SESSION, data),
  getStatus: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.STATUS),
  getDetails: () => api.get(API_ENDPOINTS.SUBSCRIPTIONS.DETAILS),
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
  getAnalytics: () => api.get(API_ENDPOINTS.ADMIN.ANALYTICS),
  getLeads: (params) => api.get(API_ENDPOINTS.ADMIN.LEADS, { params }),
};

// --- LEAD ENDPOINTS ---
export const leadAPI = {
  create: (data) => api.post(API_ENDPOINTS.LEADS.CREATE, data),
};

export default api;
