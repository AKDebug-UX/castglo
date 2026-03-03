# API Integration Status

This project uses a centralized API architecture in `client/src/lib/api.ts`. Below is the status of integration across the application.

## ✅ Completed Integrations

- **Authentication**: Fully integrated in `SignIn.tsx`, `SignUp.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, and `AuthContext.tsx`.
- **Contact/Leads**: Integrated in `Contact.tsx`.
- **Browse Casting Calls**: Fully integrated in `dashboard/BrowseCastings.tsx` with search, filtering (location, genre, status), and real-time loading states.

## 🚧 Remaining Integrations

### Core Functionality
- [ ] **Talent Profile**: Integrate `profileAPI.getMe` and `profileAPI.updateMe` in `dashboard/Profile.tsx`.
- [ ] **Casting Details**: Integrate `castingCallAPI.getOne` in `dashboard/CastingDetail.tsx`.
- [ ] **Audition Submissions**: Integrate `applicationAPI.create` in `dashboard/SubmitAudition.tsx`.
- [ ] **Director Dashboard**: Integrate `castingCallAPI.getMyListings` in `director/DirectorDashboard.tsx`.
- [ ] **Casting Management**: Integrate `applicationAPI.getByCastingCall` in `director/DirectorSubmissions.tsx`.

### Messaging & Social
- [ ] **Messages**: Integrate `applicationAPI.addCommunication` or a dedicated messaging endpoint in `dashboard/Messages.tsx`.
- [ ] **Talent Search**: Integrate `profileAPI.search` in `professional/BrowseTalents.tsx`.

### Admin
- [ ] **User Management**: Integrate `adminAPI.getUsers` and `adminAPI.suspendUser` in `admin/UsersManagement.tsx`.
- [ ] **Analytics**: Integrate `adminAPI.getAnalytics` in `admin/AdminAnalytics.tsx`.

### Subscriptions
- [ ] **Checkout**: Integrate `subscriptionAPI.createCheckoutSession` in `dashboard/Subscription.tsx` (if applicable).
- [ ] **Status**: Integrate `subscriptionAPI.getStatus` in profile/settings pages.

## Usage Guide

To use the API in a new page:

```tsx
import { castingCallAPI } from "@/lib/api";

const fetchData = async () => {
  const response = await castingCallAPI.getAll();
  if (response.data.success) {
    // Handle data
  }
};
```
