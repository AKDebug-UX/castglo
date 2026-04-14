# Castglo Technical Architecture Review

This document provides a comprehensive technical breakdown of the Castglo platform's architecture based on the current implementation patterns, API specifications, and cloud deployment indicators.

---

## 1. High-Level System Architecture

The overarching design follows an event-driven, service-oriented architecture (SOA) to ensure scalability between the synchronous transactional operations (profiles, fetching jobs) and heavy asynchronous tasks (media processing, blockchain anchoring, real-time communications).

```mermaid
graph TD
    %% Clients
    subgraph Clients["Client Layer"]
        W[Web Application\nReact/Vite]
        M[Mobile Application\nReact Native/Flutter]
    end

    %% Edge
    CDN[CDN/Edge Server\nVercel Edge]
    W --> CDN
    M --> CDN

    %% API Gateway Layer
    AGW[API Gateway / Load Balancer]
    CDN --> AGW

    %% Core Services
    subgraph Services["Core Backend Services"]
        AuthS[Auth & Profile Service]
        CastS[Casting & Application Service]
        MedS[Media Processing Service]
        NotifS[Notification & WebSocket Service]
        BillS[Payment & Subscription Service]
        ChainS[Blockchain Anchor Service]
    end

    AGW --> AuthS
    AGW --> CastS
    AGW --> MedS
    AGW --> NotifS
    AGW --> BillS
    AGW --> ChainS

    %% Async Communication
    MB[(Message Broker\ne.g., SQS / RabbitMQ)]
    CastS -.->|Application Events| MB
    MedS -.->|Encoding Status| MB
    MB -.->|Trigger| NotifS

    %% Data Layer
    subgraph DataLayer["Data Layer"]
        DB[(Primary Database\nPostgreSQL / MongoDB)]
        RC[(Redis Cache)]
    end

    AuthS --> DB
    CastS --> DB
    BillS --> DB
    ChainS --> DB
    
    AuthS -.-> RC
    NotifS -.-> RC

    %% External Services
    subgraph ThirdParty["External Integrations"]
        S3[(Object Storage\nAWS S3 / Cloudinary)]
        STR[Stripe API]
        AGA[Agora RTC\nVideo/Audio]
        W3[Web3 Provider]
    end

    MedS --> S3
    BillS --> STR
    ChainS --> W3
    W -.->|Direct P2P/Stream| AGA
    NotifS -->|Push APIs| CDN
```

### Key Highlights:
- **Synchronous Workflows:** Core features like updating profiles (`PATCH /profile/me`), fetching jobs, and validating subscriptions happen synchronously with low latency, often leveraging the Redis cache layer.
- **Asynchronous Workflows:** Heavy operations like video uploads for auditions, triggering extensive email rounds (job recs), and anchoring to the blockchain operate through the Message Broker.
- **Real-time Engine:** WebSockets (`socket.io-client` in the frontend) and Agora RTC are heavily utilized for instant communications, messaging, and live auditions.

---

## 2. Cloud Deployment Architecture

Based on the environment configuration (`vercel.json`, `castglo-qupm.onrender.com`), the infrastructure leverages a hybrid PaaS approach. The frontend is heavily optimized at the edge, while backend workloads operate in scalable containerized environments.

```mermaid
graph TD
    subgraph Internet
        User[Users / Devices]
    end
    
    subgraph Frontend["Frontend Hosting (Vercel)"]
        VE[Vercel Edge Network\nGlobal CDN]
        VH[Static Hosting Layer\nSPA Routing]
    end
    
    subgraph Backend["Backend Cloud (Render PaaS)"]
        subgraph WebServices["Web Services (Auto-Scaling)"]
            Node1[Main API Web Service\nInstances: 1-N]
            WS1[WebSocket Service\nInstances: 1-N]
        end
        
        subgraph BackgroundWorkers["Background Workers"]
            WRK1[Media Encoding Worker]
            WRK2[Blockchain & Notifications Cron]
        end
        
        subgraph ManagedData["Managed State"]
            RDB[(Render Database\nPostgreSQL/Mongo)]
            RED[(Render Redis)]
        end
    end
    
    subgraph Storage["Cloud Storage (AWS)"]
        S3Bucket[(AWS S3 Bucket\nMedia & Headshots)]
        CF[CloudFront CDN\nMedia Distribution]
    end
    
    User -->|HTTPS| VE
    VE --> VH
    User -->|API Fetch / WSS| Node1
    User -->|Sockets| WS1
    
    Node1 --> RDB
    Node1 --> RED
    WS1 --> RED
    
    Node1 -.->|Task Queueing| RED
    RED -.->|Pull Tasks| WRK1
    RED -.->|Pull Tasks| WRK2
    
    WRK1 --> S3Bucket
    S3Bucket --> CF
    CF --> User
```

### Scaling Profile:
- **Frontend Layer:** Handled entirely by Vercel's Edge CDN. Effectively infinite scaling for static assets.
- **Web API Layer:** Deployed as Render Web Services. Configured for horizontal auto-scaling based on CPU/Memory thresholds and concurrent request loads. Redis manages WebSocket pub/sub sessions across multiple instances.
- **Background Layer:** Background workers run as Render Background Worker instances, decoupled from HTTP traffic, allowing heavy audition conversions or bulk emails to scale independently without bottlenecking the main API.

---

## 3. Data Flow: Talent Applying to a Casting Call

This journey involves user interaction, heavy file uploading, database transactions, background processing, and notifications.

```mermaid
sequenceDiagram
    autonumber
    actor Talent as Talent (Web/Mobile)
    participant API as Castglo API Core
    participant S3 as AWS S3 / Cloudinary
    participant Queue as Message Broker
    participant Worker as Background Media Worker
    participant DB as Postgres/Mongo Database
    participant Notif as Notification Service
    actor Director as Casting Director

    %% Media Upload Phase
    Note over Talent, S3: Phase 1: Media Preparation
    Talent->>API: POST /api/v1/media/presigned-url (Request upload token)
    API->>Talent: Returns secure signed URL
    Talent->>S3: PUT direct file upload (audition_video.mp4)
    S3-->>Talent: 200 OK (Upload Complete)
    
    %% Application Submission Phase
    Note over Talent, DB: Phase 2: Application Transaction
    Talent->>API: POST /api/v1/casting/{id}/apply
    Note right of Talent: Payload includes file keys, profile ID, role applied for
    API->>DB: Verify Talent eligibility & Save Application status (Pending)
    DB-->>API: Application Created
    
    %% Async Processing Phase
    Note over API, Worker: Phase 3: Async Processing & Validation
    API->>Queue: Publish Event: ApplicationSubmitted (AppID, MediaKeys)
    API-->>Talent: 201 Created (Application received, processing...)
    
    Queue-->>Worker: Consume Event: ApplicationSubmitted
    Worker->>S3: Download/Stream media file
    Worker->>Worker: Transcode Video (HLS/Dash), Extract thumbnails, Validate size/type
    Worker->>S3: Upload processed optimized media
    Worker->>DB: Update Application Record (Processed & Visible)
    Worker->>Queue: Publish Event: ApplicationProcessed
    
    %% Notification Phase
    Note over Queue, Director: Phase 4: Delivery & Notifications
    Queue-->>Notif: Consume Event: ApplicationProcessed
    Notif->>Notif: Check Director's notification preferences
    Notif->>DB: Save In-App Notification
    Notif--)Director: Send WebSocket Push: "New Application Received"
    Notif--)Director: Send Email: "Talent X applied for Role Y"
```

### Edge Cases & Error Handling:
1. **Media Upload Fails/Times Out:** The Pre-signed URL approach prevents the Web API from acting as a bottleneck. If direct S3 upload fails, client-side retry logic kicks in with resumable uploads.
2. **Worker Media Transcoding Fails:** If the uploaded file is corrupt, the worker updates the database application status to `Failed_Media`, triggering a WebSocket alert back to the Talent to "Re-upload Audition Media", without crashing the core API workflow.
3. **Database Concurrency:** If multiple talents apply exactly as slots run out (e.g., instant auditions), optimistic locking (`version` fields) on the database ensures consistency, rejecting the overflow with a clean `409 Conflict`.
