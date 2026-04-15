
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "info": {
      "title": "Castglo API",
      "version": "1.0.0",
      "description": "Castglo - Investor-ready casting marketplace backend API documentation",
      "contact": {
        "name": "Castglo Team",
        "email": "support@castglo.com"
      },
      "license": {
        "name": "MIT"
      }
    },
    "servers": [
      {
        "url": "http://localhost:5000/api/v1",
        "description": "Development Server"
      },
      {
        "url": "https://api.castglo.com/api/v1",
        "description": "Production Server"
      }
    ],
    "components": {
      "securitySchemes": {
        "BearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        },
        "bearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      },
      "schemas": {
        "Error": {
          "type": "object",
          "properties": {
            "success": {
              "type": "boolean",
              "example": false
            },
            "message": {
              "type": "string",
              "example": "Error message"
            }
          }
        },
        "SuccessResponse": {
          "type": "object",
          "properties": {
            "success": {
              "type": "boolean",
              "example": true
            },
            "message": {
              "type": "string",
              "example": "Operation successful"
            },
            "data": {
              "type": "object"
            }
          }
        },
        "User": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "507f1f77bcf86cd799439011"
            },
            "fullName": {
              "type": "string",
              "example": "John Talent"
            },
            "email": {
              "type": "string",
              "example": "john@example.com"
            },
            "role": {
              "type": "string",
              "enum": [
                "talent",
                "casting_director",
                "industry_professional",
                "admin"
              ]
            },
            "phoneNumber": {
              "type": "string",
              "example": "+1234567890"
            },
            "profilePicture": {
              "type": "string",
              "example": "https://res.cloudinary.com/..."
            },
            "emailVerified": {
              "type": "boolean",
              "example": true
            },
            "isSuspended": {
              "type": "boolean",
              "example": false
            },
            "subscriptionStatus": {
              "type": "string",
              "enum": [
                "free",
                "active",
                "cancelled",
                "expired"
              ]
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "CastingCall": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "title": {
              "type": "string",
              "example": "Lead Actor for Indie Film"
            },
            "description": {
              "type": "string"
            },
            "projectName": {
              "type": "string"
            },
            "projectType": {
              "type": "string",
              "enum": [
                "film",
                "tv",
                "commercial",
                "web_series",
                "theater",
                "music_video",
                "other"
              ]
            },
            "status": {
              "type": "string",
              "enum": [
                "open",
                "filled",
                "closed",
                "cancelled"
              ]
            },
            "deadline": {
              "type": "string",
              "format": "date-time"
            },
            "createdBy": {
              "type": "string"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "Application": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "castingCallId": {
              "type": "string"
            },
            "talentId": {
              "type": "string"
            },
            "status": {
              "type": "string",
              "enum": [
                "submitted",
                "viewed",
                "shortlisted",
                "rejected",
                "accepted",
                "withdrawn"
              ]
            },
            "appliedRole": {
              "type": "string"
            },
            "isShortlisted": {
              "type": "boolean"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "DeviceToken": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string"
            },
            "deviceToken": {
              "type": "string"
            },
            "platform": {
              "type": "string",
              "enum": [
                "ios",
                "android",
                "web"
              ]
            }
          }
        },
        "Conversation": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "participants": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "lastMessage": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "Message": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "conversationId": {
              "type": "string"
            },
            "senderId": {
              "type": "string"
            },
            "text": {
              "type": "string"
            },
            "mediaUrl": {
              "type": "string"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "LiveStream": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "title": {
              "type": "string"
            },
            "hostId": {
              "type": "string"
            },
            "status": {
              "type": "string",
              "enum": [
                "scheduled",
                "live",
                "ended"
              ]
            },
            "category": {
              "type": "string",
              "enum": [
                "audition",
                "masterclass",
                "interview",
                "other"
              ]
            },
            "scheduledAt": {
              "type": "string",
              "format": "date-time"
            },
            "viewerCount": {
              "type": "integer"
            }
          }
        },
        "Profile": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "userId": {
              "type": "string"
            },
            "bio": {
              "type": "string"
            },
            "skills": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "experience": {
              "type": "string"
            },
            "isVerified": {
              "type": "boolean"
            },
            "profileCompletion": {
              "type": "number"
            }
          }
        },
        "Subscription": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "userId": {
              "type": "string"
            },
            "planName": {
              "type": "string"
            },
            "status": {
              "type": "string",
              "enum": [
                "free",
                "active",
                "cancelled",
                "expired"
              ]
            },
            "renewalDate": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "Booking": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "clientId": {
              "type": "string"
            },
            "professionalId": {
              "type": "string"
            },
            "serviceId": {
              "type": "string"
            },
            "status": {
              "type": "string",
              "enum": [
                "pending",
                "upcoming",
                "completed",
                "declined",
                "cancelled"
              ]
            },
            "paymentStatus": {
              "type": "string",
              "enum": [
                "pending",
                "paid",
                "failed",
                "refunded"
              ]
            },
            "scheduledAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "Notification": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "userId": {
              "type": "string"
            },
            "title": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "type": {
              "type": "string",
              "enum": [
                "message",
                "casting_invitation",
                "application_update",
                "system_alert"
              ]
            },
            "read": {
              "type": "boolean"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        }
      }
    },
    "paths": {
      "/admin/users": {
        "get": {
          "summary": "Get all users",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "role",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of all users"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "Forbidden - admin only"
            }
          }
        }
      },
      "/admin/users/{userId}/suspend": {
        "put": {
          "summary": "Suspend a user",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "reason"
                  ],
                  "properties": {
                    "reason": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User suspended successfully"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/admin/users/{userId}/unsuspend": {
        "put": {
          "summary": "Unsuspend a user",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "User unsuspended successfully"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/admin/users/{userId}/verify": {
        "put": {
          "summary": "Verify user profile",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "User profile verified successfully"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/admin/users/{userId}": {
        "delete": {
          "summary": "Delete a user",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "User deleted successfully"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/admin/action-logs": {
        "get": {
          "summary": "Get action logs",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "action",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "severity",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of action logs"
            }
          }
        }
      },
      "/admin/analytics": {
        "get": {
          "summary": "Get platform analytics",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "period",
              "schema": {
                "type": "string",
                "enum": [
                  "week",
                  "month",
                  "year"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Platform analytics data"
            }
          }
        }
      },
      "/admin/leads": {
        "get": {
          "summary": "Get leads overview",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of leads"
            }
          }
        }
      },
      "/admin/subscriptions": {
        "get": {
          "summary": "Get subscription overview",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Subscription overview data"
            }
          }
        }
      },
      "/admin/settings": {
        "get": {
          "summary": "Get global platform settings",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Global settings retrieved"
            }
          }
        },
        "patch": {
          "summary": "Update global platform settings",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "maintenanceMode": {
                      "type": "boolean",
                      "example": false
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Global settings updated successfully"
            },
            "400": {
              "description": "Bad request"
            },
            "401": {
              "description": "Not authorized"
            }
          }
        }
      },
      "/admin/settings/free-tier": {
        "post": {
          "summary": "Configure the number of trial days for new users based on their selected role",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "days",
                    "role"
                  ],
                  "properties": {
                    "days": {
                      "type": "number",
                      "description": "Number of trial days"
                    },
                    "role": {
                      "type": "string",
                      "description": "User role (e.g. talent, casting_director)"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Free tier settings updated successfully"
            },
            "400": {
              "description": "Bad request (invalid role or days)"
            }
          }
        }
      },
      "/admin/users/{userId}/grant-trial": {
        "post": {
          "summary": "Grant a free trial to a user",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "days": {
                      "type": "number",
                      "description": "Optional trial duration in days (defaults to system setting)",
                      "example": 14
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Free trial granted successfully"
            },
            "400": {
              "description": "Invalid role or request"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/admin/moderation": {
        "get": {
          "summary": "Get moderation queue for flagged content",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string",
                "default": "pending"
              }
            },
            {
              "in": "query",
              "name": "targetType",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Moderation queue retrieved"
            }
          }
        }
      },
      "/admin/moderation/{id}": {
        "patch": {
          "summary": "Update status of a moderation item",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status"
                  ],
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "approved",
                        "rejected",
                        "escalated"
                      ]
                    },
                    "adminNotes": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Moderation item updated"
            }
          }
        }
      },
      "/admin/verifications": {
        "get": {
          "summary": "List all document verification requests",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string",
                "default": "pending"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Verifications queue retrieved"
            }
          }
        }
      },
      "/admin/verifications/{id}/status": {
        "patch": {
          "summary": "Approve or reject a verification request",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status"
                  ],
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "approved",
                        "rejected"
                      ]
                    },
                    "adminNotes": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Verification status updated"
            }
          }
        }
      },
      "/admin/verifications/stats": {
        "get": {
          "summary": "Summary of verification request counts",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Verification stats retrieved"
            }
          }
        }
      },
      "/admin/submissions": {
        "get": {
          "summary": "Global view of all talent audition submissions",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Submissions retrieved"
            }
          }
        }
      },
      "/admin/submissions/{id}/status": {
        "patch": {
          "summary": "Administrative override for audition status",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status"
                  ],
                  "properties": {
                    "status": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Submission status updated"
            }
          }
        }
      },
      "/admin/submissions/stats": {
        "get": {
          "summary": "Analytics on submission volume",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Submission stats retrieved"
            }
          }
        }
      },
      "/admin/bookings": {
        "get": {
          "summary": "Monitor all service transactions",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "paymentStatus",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Bookings retrieved"
            }
          }
        }
      },
      "/admin/bookings/stats": {
        "get": {
          "summary": "Revenue and volume metrics for bookings",
          "tags": [
            "Admin"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Booking stats retrieved"
            }
          }
        }
      },
      "/applications": {
        "post": {
          "summary": "Submit an application to a casting call",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "castingCallId"
                  ],
                  "properties": {
                    "castingCallId": {
                      "type": "string"
                    },
                    "coverLetter": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Application submitted successfully"
            },
            "400": {
              "description": "Validation error"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/applications/me": {
        "get": {
          "summary": "Get my applications (talent)",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "List of my applications"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/applications/{castingCallId}": {
        "get": {
          "summary": "Get applications for a casting call",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "castingCallId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "List of applications"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/applications/details/{applicationId}": {
        "get": {
          "summary": "Get application details",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "applicationId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Application details"
            },
            "404": {
              "description": "Application not found"
            }
          }
        }
      },
      "/applications/{applicationId}/shortlist": {
        "put": {
          "summary": "Shortlist an application",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "applicationId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Application shortlisted successfully"
            },
            "404": {
              "description": "Application not found"
            }
          }
        }
      },
      "/applications/{applicationId}/reject": {
        "put": {
          "summary": "Reject an application",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "applicationId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Application rejected successfully"
            },
            "404": {
              "description": "Application not found"
            }
          }
        }
      },
      "/applications/{applicationId}/accept": {
        "put": {
          "summary": "Accept an application",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "applicationId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Application accepted successfully"
            },
            "404": {
              "description": "Application not found"
            }
          }
        }
      },
      "/applications/{applicationId}/communication": {
        "post": {
          "summary": "Add communication to application",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "applicationId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "message"
                  ],
                  "properties": {
                    "message": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Communication added successfully"
            },
            "404": {
              "description": "Application not found"
            }
          }
        }
      },
      "/applications/{applicationId}": {
        "delete": {
          "summary": "Withdraw an application",
          "tags": [
            "Applications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "applicationId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Application withdrawn successfully"
            },
            "404": {
              "description": "Application not found"
            }
          }
        }
      },
      "/auth/register": {
        "post": {
          "summary": "Register a new user",
          "tags": [
            "Authentication"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "fullName",
                    "email",
                    "password",
                    "role"
                  ],
                  "properties": {
                    "fullName": {
                      "type": "string",
                      "example": "John Talent"
                    },
                    "email": {
                      "type": "string",
                      "format": "email"
                    },
                    "password": {
                      "type": "string",
                      "format": "password",
                      "minLength": 8
                    },
                    "role": {
                      "type": "string",
                      "enum": [
                        "talent",
                        "casting_director",
                        "industry_professional"
                      ]
                    },
                    "phoneNumber": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User registered successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SuccessResponse"
                  }
                }
              }
            },
            "400": {
              "description": "Validation error"
            },
            "409": {
              "description": "Email already registered"
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "summary": "Login user",
          "tags": [
            "Authentication"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email",
                    "password"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email"
                    },
                    "password": {
                      "type": "string",
                      "format": "password"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Login successful",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SuccessResponse"
                  }
                }
              }
            },
            "401": {
              "description": "Invalid credentials"
            },
            "429": {
              "description": "Account locked due to too many failed attempts"
            }
          }
        }
      },
      "/auth/verify-email": {
        "post": {
          "summary": "Verify email address",
          "tags": [
            "Authentication"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "token"
                  ],
                  "properties": {
                    "token": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Email verified successfully"
            },
            "400": {
              "description": "Invalid or expired token"
            }
          }
        }
      },
      "/auth/forgot-password": {
        "post": {
          "summary": "Request password reset",
          "tags": [
            "Authentication"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password reset email sent"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/auth/reset-password": {
        "post": {
          "summary": "Reset password",
          "tags": [
            "Authentication"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "token",
                    "newPassword",
                    "confirmPassword"
                  ],
                  "properties": {
                    "token": {
                      "type": "string"
                    },
                    "newPassword": {
                      "type": "string",
                      "format": "password"
                    },
                    "confirmPassword": {
                      "type": "string",
                      "format": "password"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password reset successfully"
            },
            "400": {
              "description": "Invalid token or validation error"
            }
          }
        }
      },
      "/auth/change-password": {
        "post": {
          "summary": "Updates the user's password",
          "tags": [
            "Authentication"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "currentPassword",
                    "newPassword"
                  ],
                  "properties": {
                    "currentPassword": {
                      "type": "string"
                    },
                    "newPassword": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password updated"
            }
          }
        }
      },
      "/auth/me": {
        "get": {
          "summary": "Fetches basic user account details",
          "tags": [
            "Authentication"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Current user profile"
            }
          }
        }
      },
      "/auth/resend-verification-email": {
        "post": {
          "summary": "Resend verification email",
          "tags": [
            "Authentication"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "email"
                  ],
                  "properties": {
                    "email": {
                      "type": "string",
                      "format": "email"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Verification email sent"
            },
            "400": {
              "description": "Validation error or email already verified"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/auth/logout": {
        "post": {
          "summary": "Logout user",
          "tags": [
            "Authentication"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Logged out successfully"
            }
          }
        }
      },
      "/auth/google": {
        "post": {
          "summary": "Authenticate with Google (login or register)",
          "tags": [
            "Authentication"
          ],
          "description": "Verify a Google ID token and return a Castglo JWT.\n- If the email already exists, the Google account is linked to that profile.\n- If the email is new, a verified account is created automatically.\n- `role` is optional. Defaults to `talent` if omitted; users can update it on their profile later.\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "idToken"
                  ],
                  "properties": {
                    "idToken": {
                      "type": "string",
                      "description": "The Google ID token received from the frontend Google Sign-In SDK",
                      "example": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
                    },
                    "role": {
                      "type": "string",
                      "enum": [
                        "talent",
                        "casting_director",
                        "industry_professional"
                      ],
                      "description": "Optional role for new users — can be updated on their profile later",
                      "example": "talent"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Authentication successful",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Google authentication successful"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "token": {
                            "type": "string",
                            "description": "Castglo JWT access token"
                          },
                          "user": {
                            "$ref": "#/components/schemas/SuccessResponse"
                          },
                          "isNewUser": {
                            "type": "boolean",
                            "description": "true if this is the first sign-in (account was just created)"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Missing or invalid idToken / invalid role"
            },
            "401": {
              "description": "Google token verification failed"
            },
            "403": {
              "description": "Account suspended"
            }
          }
        }
      },
      "/auth/set-password": {
        "post": {
          "summary": "Set a local password for Google-authenticated accounts (enable dual auth)",
          "tags": [
            "Authentication"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "description": "Allows users who signed up via Google to also enable email/password login.\nOnce set, users can sign in with either Google **or** their email + password.\nThis endpoint is only available to accounts that have a linked Google ID.\nUsers with strictly local accounts should use `/change-password` instead.\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "newPassword",
                    "confirmPassword"
                  ],
                  "properties": {
                    "newPassword": {
                      "type": "string",
                      "format": "password",
                      "minLength": 8,
                      "example": "MySecureP@ss1"
                    },
                    "confirmPassword": {
                      "type": "string",
                      "format": "password",
                      "example": "MySecureP@ss1"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password set — dual auth (Google + local) now enabled"
            },
            "400": {
              "description": "Passwords do not match, too short, or account has no Google link"
            },
            "401": {
              "description": "Unauthorized — JWT required"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/bookings/professional/me": {
        "get": {
          "summary": "Get my bookings (as professional)",
          "tags": [
            "Bookings"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of bookings"
            }
          }
        }
      },
      "/bookings/professional/stats": {
        "get": {
          "summary": "Get booking stats",
          "tags": [
            "Bookings"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Performance statistics"
            }
          }
        }
      },
      "/bookings/{id}": {
        "get": {
          "summary": "Get booking details",
          "tags": [
            "Bookings"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Booking details"
            }
          }
        }
      },
      "/bookings/{id}/status": {
        "patch": {
          "summary": "Update booking status",
          "tags": [
            "Bookings"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status"
                  ],
                  "properties": {
                    "status": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Status updated"
            }
          }
        }
      },
      "/casting-calls": {
        "get": {
          "summary": "Get all casting calls",
          "tags": [
            "Casting Calls"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "search",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "status",
              "schema": {
                "type": "string",
                "enum": [
                  "open",
                  "closed"
                ]
              }
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of casting calls"
            }
          }
        },
        "post": {
          "summary": "Create a new casting call",
          "tags": [
            "Casting Calls"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title",
                    "description",
                    "projectName",
                    "projectType",
                    "deadline"
                  ],
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "projectName": {
                      "type": "string"
                    },
                    "projectType": {
                      "type": "string"
                    },
                    "budget": {
                      "type": "object",
                      "properties": {
                        "min": {
                          "type": "number"
                        },
                        "max": {
                          "type": "number"
                        }
                      }
                    },
                    "location": {
                      "type": "object"
                    },
                    "deadline": {
                      "type": "string",
                      "format": "date-time"
                    },
                    "compensationType": {
                      "type": "string",
                      "enum": [
                        "paid",
                        "unpaid",
                        "expenses",
                        "deferred"
                      ]
                    },
                    "compensationAmount": {
                      "type": "string"
                    },
                    "tags": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "media": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Casting call created successfully"
            },
            "400": {
              "description": "Validation error"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/casting-calls/user/my-listings": {
        "get": {
          "summary": "Get my casting call listings",
          "tags": [
            "Casting Calls"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "My casting calls"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/casting-calls/{id}": {
        "get": {
          "summary": "Get casting call details",
          "tags": [
            "Casting Calls"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Casting call details"
            },
            "404": {
              "description": "Casting call not found"
            }
          }
        },
        "put": {
          "summary": "Update casting call",
          "tags": [
            "Casting Calls"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "open",
                        "filled",
                        "closed",
                        "cancelled"
                      ]
                    },
                    "compensationType": {
                      "type": "string",
                      "enum": [
                        "paid",
                        "unpaid",
                        "expenses",
                        "deferred"
                      ]
                    },
                    "compensationAmount": {
                      "type": "string"
                    },
                    "media": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Casting call updated successfully"
            },
            "404": {
              "description": "Casting call not found"
            }
          }
        },
        "delete": {
          "summary": "Delete casting call",
          "tags": [
            "Casting Calls"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Casting call deleted successfully"
            },
            "404": {
              "description": "Casting call not found"
            }
          }
        }
      },
      "/casting-calls/{id}/close": {
        "put": {
          "summary": "Close a casting call",
          "tags": [
            "Casting Calls"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Casting call closed successfully"
            },
            "404": {
              "description": "Casting call not found"
            }
          }
        }
      },
      "/casting/profile": {
        "post": {
          "summary": "Create a casting profile",
          "tags": [
            "Casting Profile"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "accountType": {
                      "type": "string"
                    },
                    "companyName": {
                      "type": "string"
                    },
                    "industryAreas": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Casting profile created successfully"
            },
            "400": {
              "description": "Casting profile already exists"
            }
          }
        }
      },
      "/casting/profile/me": {
        "get": {
          "summary": "Get user's own casting profile",
          "tags": [
            "Casting Profile"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Successfully retrieved casting profile"
            },
            "404": {
              "description": "Profile not found"
            }
          }
        },
        "patch": {
          "summary": "Update user's casting profile details",
          "tags": [
            "Casting Profile"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "description": "Update payload for casting profile"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Updated casting profile"
            },
            "404": {
              "description": "Profile not found"
            }
          }
        }
      },
      "/leads": {
        "post": {
          "summary": "Create a new lead",
          "tags": [
            "Leads"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "description": "Supports the full lead capture structure including nested\n`basicDetails`, `joiningAs`, role-specific detail objects, and\nconsent. Only `basicDetails.fullName` and `basicDetails.email`\nare strictly required.\n"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Lead created successfully"
            },
            "400": {
              "description": "Validation error"
            }
          }
        }
      },
      "/leads/admin/leads": {
        "get": {
          "summary": "Get all leads (admin only)",
          "tags": [
            "Leads"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              },
              "description": "Page number"
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer"
              },
              "description": "Items per page"
            }
          ],
          "responses": {
            "200": {
              "description": "List of leads"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "Forbidden - admin only"
            }
          }
        }
      },
      "/leads/admin/leads/{id}": {
        "get": {
          "summary": "Get lead details (admin only)",
          "tags": [
            "Leads"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Lead details"
            },
            "404": {
              "description": "Lead not found"
            }
          }
        },
        "delete": {
          "summary": "Delete lead (admin only)",
          "tags": [
            "Leads"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Lead deleted successfully"
            },
            "404": {
              "description": "Lead not found"
            }
          }
        }
      },
      "/leads/admin/leads/{id}/convert": {
        "put": {
          "summary": "Convert lead to registered user (admin only)",
          "tags": [
            "Leads"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "role"
                  ],
                  "properties": {
                    "role": {
                      "type": "string",
                      "enum": [
                        "talent",
                        "casting_director",
                        "industry_professional"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Lead converted successfully"
            },
            "404": {
              "description": "Lead not found"
            }
          }
        }
      },
      "/portfolio": {
        "post": {
          "summary": "Add a new portfolio item",
          "tags": [
            "Portfolio"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title",
                    "itemType",
                    "mediaId",
                    "mediaUrl"
                  ],
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "itemType": {
                      "type": "string"
                    },
                    "mediaId": {
                      "type": "string"
                    },
                    "mediaUrl": {
                      "type": "string"
                    },
                    "featured": {
                      "type": "boolean"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Portfolio item added"
            }
          }
        }
      },
      "/portfolio/me": {
        "get": {
          "summary": "Get own portfolio items",
          "tags": [
            "Portfolio"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Portfolio retrieved"
            }
          }
        }
      },
      "/portfolio/{id}": {
        "patch": {
          "summary": "Update a portfolio item",
          "tags": [
            "Portfolio"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Item updated"
            },
            "404": {
              "description": "Item not found"
            }
          }
        },
        "delete": {
          "summary": "Delete a portfolio item",
          "tags": [
            "Portfolio"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Item deleted"
            },
            "404": {
              "description": "Item not found"
            }
          }
        }
      },
      "/profiles": {
        "post": {
          "summary": "Create a new profile",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "profileType"
                  ],
                  "properties": {
                    "profileType": {
                      "type": "string",
                      "enum": [
                        "talent",
                        "professional"
                      ]
                    },
                    "bio": {
                      "type": "string"
                    },
                    "skills": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "experience": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Profile created successfully"
            },
            "400": {
              "description": "Validation error"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/profiles/me": {
        "get": {
          "summary": "Get my profile",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "User's profile"
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "Profile not found"
            }
          }
        },
        "patch": {
          "summary": "Update my profile",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "bio": {
                      "type": "string"
                    },
                    "skills": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "experience": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Profile updated successfully"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/profile/me/talent-type": {
        "patch": {
          "summary": "Update talent sub-profile and talent-specific metadata",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "appearance": {
                      "type": "object",
                      "properties": {
                        "height": {
                          "type": "number"
                        },
                        "weight": {
                          "type": "number"
                        },
                        "eyeColor": {
                          "type": "string"
                        },
                        "hairColor": {
                          "type": "string"
                        },
                        "ethnicity": {
                          "type": "string"
                        }
                      }
                    },
                    "availability": {
                      "type": "string"
                    },
                    "actingExperience": {
                      "type": "string"
                    },
                    "unionStatus": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Talent profile updated successfully"
            },
            "403": {
              "description": "Only talent accounts can update talent types"
            }
          }
        }
      },
      "/profile/me/professional": {
        "patch": {
          "summary": "Update professional sub-profile data (industry professionals/agencies)",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "companyName": {
                      "type": "string"
                    },
                    "industryAreas": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "servicesOffered": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "yearsInIndustry": {
                      "type": "number"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Professional profile updated successfully"
            },
            "403": {
              "description": "Talent accounts cannot update professional details"
            }
          }
        }
      },
      "/profile/me/completeness": {
        "get": {
          "summary": "Get profile completion score",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Profile completion successfully retrieved"
            }
          }
        }
      },
      "/profiles/me/headshots": {
        "post": {
          "summary": "Add headshot to profile",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "headshot"
                  ],
                  "properties": {
                    "headshot": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/profiles/me/headshots/{headshotId}": {
        "delete": {
          "summary": "Delete headshot",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "headshotId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Headshot deleted successfully"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/profiles/me/showreel": {
        "post": {
          "summary": "Upload showreel video",
          "tags": [
            "Profiles"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "showreel"
                  ],
                  "properties": {
                    "showreel": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Showreel uploaded successfully"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/profiles/search": {
        "get": {
          "summary": "Search profiles",
          "tags": [
            "Profiles"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "profileType",
              "schema": {
                "type": "string"
              }
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Search results"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/profiles/{userId}": {
        "get": {
          "summary": "Get public profile",
          "tags": [
            "Profiles"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Public profile"
            },
            "404": {
              "description": "Profile not found"
            }
          }
        }
      },
      "/projects": {
        "post": {
          "summary": "Create a new project (casting call)",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title"
                  ],
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Project created"
            }
          }
        }
      },
      "/projects/me": {
        "get": {
          "summary": "Get user's own projects",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Projects retrieved"
            }
          }
        }
      },
      "/projects/{id}": {
        "get": {
          "summary": "Get project details",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Project details"
            }
          }
        },
        "patch": {
          "summary": "Update project details",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Project updated"
            }
          }
        },
        "delete": {
          "summary": "Delete a project",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Project deleted"
            }
          }
        }
      },
      "/projects/{id}/roles": {
        "post": {
          "summary": "Add a role to a project",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "201": {
              "description": "Role added"
            }
          }
        }
      },
      "/projects/{id}/roles/{roleId}": {
        "patch": {
          "summary": "Update a role",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "path",
              "name": "roleId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Role updated"
            }
          }
        },
        "delete": {
          "summary": "Delete a role",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "path",
              "name": "roleId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Role deleted"
            }
          }
        }
      },
      "/projects/{id}/roles/{roleId}/applicants": {
        "get": {
          "summary": "Get applicants for a role",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "path",
              "name": "roleId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Applicants retrieved"
            }
          }
        }
      },
      "/projects/{id}/roles/{roleId}/applicants/{applicantId}/status": {
        "patch": {
          "summary": "Update applicant status",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "path",
              "name": "roleId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "path",
              "name": "applicantId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Status updated"
            }
          }
        }
      },
      "/projects/{id}/roles/{roleId}/applicants/bulk-action": {
        "post": {
          "summary": "Perform bulk action on applicants",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "path",
              "name": "roleId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Bulk action executed"
            }
          }
        }
      },
      "/projects/{id}/roles/{roleId}/matches": {
        "get": {
          "summary": "Get matched talent profiles for a role",
          "tags": [
            "Projects"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "path",
              "name": "roleId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Matched talent profiles retrieved"
            }
          }
        }
      },
      "/reference": {
        "get": {
          "summary": "Get all reference data",
          "tags": [
            "Reference Data"
          ],
          "responses": {
            "200": {
              "description": "All reference data retrieved successfully"
            }
          }
        }
      },
      "/reference/{type}": {
        "get": {
          "summary": "Get a specific type of reference data",
          "tags": [
            "Reference Data"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "type",
              "required": true,
              "schema": {
                "type": "string",
                "example": "example"
              },
              "description": "The type of reference data to retrieve (e.g., talent-types, genres)",
              "example": "example"
            }
          ],
          "responses": {
            "200": {
              "description": "Reference data retrieved successfully"
            },
            "404": {
              "description": "Reference type not found"
            }
          }
        }
      },
      "/reports": {
        "post": {
          "summary": "Submit a moderation report",
          "tags": [
            "Reports"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "targetType",
                    "targetId",
                    "reason"
                  ],
                  "properties": {
                    "targetType": {
                      "type": "string",
                      "enum": [
                        "User",
                        "Profile",
                        "CastingCall",
                        "Message",
                        "Application",
                        "Other"
                      ]
                    },
                    "targetId": {
                      "type": "string"
                    },
                    "reason": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Report submitted successfully"
            },
            "400": {
              "description": "Bad request"
            }
          }
        }
      },
      "/services/me": {
        "get": {
          "summary": "Get my services",
          "tags": [
            "Services"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "List of my services"
            }
          }
        }
      },
      "/services/stats": {
        "get": {
          "summary": "Get service stats",
          "tags": [
            "Services"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Service statistics"
            }
          }
        }
      },
      "/services": {
        "post": {
          "summary": "Create a new service",
          "tags": [
            "Services"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title",
                    "description",
                    "price",
                    "duration"
                  ],
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "price": {
                      "type": "number"
                    },
                    "duration": {
                      "type": "number"
                    },
                    "media": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Service created"
            }
          }
        }
      },
      "/services/{id}": {
        "put": {
          "summary": "Update a service",
          "tags": [
            "Services"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "price": {
                      "type": "number"
                    },
                    "duration": {
                      "type": "number"
                    },
                    "media": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      }
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "active",
                        "inactive"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Service updated"
            }
          }
        },
        "delete": {
          "summary": "Delete a service",
          "tags": [
            "Services"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Service deleted"
            }
          }
        }
      },
      "/subscriptions/plans": {
        "get": {
          "summary": "Get all available subscription plans",
          "description": "Returns the full Castglo plan catalogue.\nFilter by role using the optional `role` query parameter.\n\n**Plan categories:**\n- `talent` — Free, Basic (£1.99), Standard (£10.99), Professional (£24.99)\n- `casting_director` — Pay-as-you-go (£9/listing), Basic (£19), Standard (£39), Professional (£69)\n- `agency` — Agency (£99/mo)\n- `enterprise` — Enterprise (custom)\n",
          "tags": [
            "Subscriptions"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "role",
              "schema": {
                "type": "string",
                "enum": [
                  "talent",
                  "casting_director",
                  "agency",
                  "enterprise"
                ]
              },
              "description": "Filter plans to a specific user role / category"
            }
          ],
          "responses": {
            "200": {
              "description": "Plans retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "total": {
                            "type": "integer",
                            "example": 10
                          },
                          "plans": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "planKey": {
                                  "type": "string",
                                  "example": "talent_standard"
                                },
                                "name": {
                                  "type": "string",
                                  "example": "Standard"
                                },
                                "category": {
                                  "type": "string",
                                  "example": "talent"
                                },
                                "pricing": {
                                  "type": "object",
                                  "properties": {
                                    "monthly": {
                                      "type": "number",
                                      "example": 10.99
                                    },
                                    "yearly": {
                                      "type": "number",
                                      "example": 119
                                    },
                                    "currency": {
                                      "type": "string",
                                      "example": "GBP"
                                    }
                                  }
                                },
                                "features": {
                                  "type": "object"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid role parameter"
            }
          }
        }
      },
      "/subscriptions/webhook": {
        "post": {
          "summary": "Stripe webhook endpoint",
          "description": "Receives and processes Stripe events (checkout completed, subscription updated/deleted, payment succeeded).",
          "tags": [
            "Subscriptions"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Webhook processed successfully"
            },
            "500": {
              "description": "Webhook processing failed"
            }
          }
        }
      },
      "/subscriptions/create-checkout-session": {
        "post": {
          "summary": "Create a Stripe checkout session",
          "description": "Initiates a Stripe Checkout flow for the given plan.\nReturns a `url` that the client should redirect to for payment.\nThe free plan cannot be checked out — it is assigned automatically on registration.\n",
          "tags": [
            "Subscriptions"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "planName"
                  ],
                  "properties": {
                    "planName": {
                      "type": "string",
                      "description": "Plan key from the catalogue",
                      "example": "talent_standard",
                      "enum": [
                        "talent_basic",
                        "talent_standard",
                        "talent_professional",
                        "cd_payg",
                        "cd_basic",
                        "cd_standard",
                        "cd_professional",
                        "agency"
                      ]
                    },
                    "billingCycle": {
                      "type": "string",
                      "enum": [
                        "monthly",
                        "yearly"
                      ],
                      "default": "monthly"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Checkout session created",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "sessionId": {
                            "type": "string"
                          },
                          "url": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Validation error (missing planName, invalid plan key)"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/subscriptions/status": {
        "get": {
          "summary": "Get current subscription status",
          "description": "Returns plan key, plan name, category, price, currency, billing cycle and next renewal date.",
          "tags": [
            "Subscriptions"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Subscription status",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "status": {
                            "type": "string",
                            "enum": [
                              "free",
                              "active",
                              "cancelled",
                              "expired"
                            ]
                          },
                          "plan": {
                            "type": "object",
                            "properties": {
                              "key": {
                                "type": "string"
                              },
                              "name": {
                                "type": "string"
                              },
                              "category": {
                                "type": "string"
                              },
                              "price": {
                                "type": "number"
                              },
                              "currency": {
                                "type": "string"
                              }
                            }
                          },
                          "billingCycle": {
                            "type": "string"
                          },
                          "currentPeriodEnd": {
                            "type": "string",
                            "format": "date-time"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/subscriptions/details": {
        "get": {
          "summary": "Get full subscription record details",
          "description": "Returns the complete subscription document including usage counters and feature snapshot.",
          "tags": [
            "Subscriptions"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Subscription details"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/subscriptions/quota": {
        "get": {
          "summary": "Get remaining monthly usage quota",
          "description": "For **Talent** users — returns applications remaining this month.\nFor **Casting Director** users — returns listings remaining this month.\nFor **Agency/Enterprise** — indicates unlimited access.\n",
          "tags": [
            "Subscriptions"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Quota retrieved",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "planName": {
                            "type": "string"
                          },
                          "planCategory": {
                            "type": "string"
                          },
                          "applicationsLeft": {
                            "type": "integer",
                            "nullable": true,
                            "description": "null means unlimited"
                          },
                          "listingsLeft": {
                            "type": "integer",
                            "nullable": true,
                            "description": "null means unlimited or not applicable"
                          },
                          "usageResetDate": {
                            "type": "string",
                            "format": "date-time"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/subscriptions/upgrade": {
        "post": {
          "summary": "Upgrade or change subscription plan",
          "description": "Updates the plan on the subscription record.\nFor Stripe-managed subscriptions, prefer creating a new checkout session.\n",
          "tags": [
            "Subscriptions"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "newPlanName"
                  ],
                  "properties": {
                    "newPlanName": {
                      "type": "string",
                      "example": "talent_professional"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Subscription upgraded successfully"
            },
            "400": {
              "description": "Validation error"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/subscriptions/cancel": {
        "post": {
          "summary": "Cancel current subscription",
          "description": "Cancels the Stripe subscription and marks it as cancelled in the database.",
          "tags": [
            "Subscriptions"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "reason": {
                      "type": "string",
                      "description": "Optional cancellation reason"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Subscription cancelled successfully"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/subscriptions/payment-methods": {
        "get": {
          "summary": "Get saved payment methods",
          "description": "Returns saved card details from Stripe for the authenticated user.",
          "tags": [
            "Subscriptions"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Payment methods retrieved",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "paymentMethods": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "id": {
                                  "type": "string"
                                },
                                "last4": {
                                  "type": "string"
                                },
                                "expMonth": {
                                  "type": "integer"
                                },
                                "expYear": {
                                  "type": "integer"
                                },
                                "brand": {
                                  "type": "string"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/users/profile": {
        "get": {
          "summary": "Get current user profile",
          "tags": [
            "Users"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "User profile details",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SuccessResponse"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/user/profile": {
        "patch": {
          "summary": "Updates core user information",
          "tags": [
            "Users"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "fullName": {
                      "type": "string"
                    },
                    "bio": {
                      "type": "string"
                    },
                    "location": {
                      "type": "string"
                    },
                    "phoneNumber": {
                      "type": "string"
                    },
                    "address": {
                      "type": "string"
                    },
                    "stageName": {
                      "type": "string"
                    },
                    "organisationType": {
                      "type": "string"
                    },
                    "jobTitle": {
                      "type": "string"
                    },
                    "website": {
                      "type": "string"
                    },
                    "professionalLinks": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "notificationSettings": {
                      "type": "object",
                      "properties": {
                        "jobSearchEmail": {
                          "type": "boolean"
                        },
                        "jobRecFrequency": {
                          "type": "string"
                        },
                        "jobPostingAlerts": {
                          "type": "boolean"
                        },
                        "applicationAlerts": {
                          "type": "boolean"
                        },
                        "savedJobsRoundup": {
                          "type": "boolean"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Profile updated successfully"
            }
          }
        }
      },
      "/users/profile-picture": {
        "put": {
          "summary": "Update user profile picture",
          "tags": [
            "Users"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "profilePicture"
                  ],
                  "properties": {
                    "profilePicture": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Profile picture uploaded successfully"
            },
            "400": {
              "description": "Invalid file"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/user/account": {
        "delete": {
          "summary": "Permanently deletes the user's account",
          "tags": [
            "Users"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "password"
                  ],
                  "properties": {
                    "password": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Account deleted successfully"
            }
          }
        }
      },
      "/users/search": {
        "get": {
          "summary": "Search users",
          "tags": [
            "Users"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "query",
              "schema": {
                "type": "string"
              },
              "description": "Search query"
            },
            {
              "in": "query",
              "name": "role",
              "schema": {
                "type": "string"
              },
              "description": "Filter by role"
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Search results"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/users/{userId}": {
        "get": {
          "summary": "Get public user profile",
          "tags": [
            "Users"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Public user profile"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/blockchain/verify": {
        "post": {
          "summary": "Anchors a document to the blockchain for verification",
          "tags": [
            "Blockchain"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "document",
                    "documentType"
                  ],
                  "properties": {
                    "document": {
                      "type": "string",
                      "format": "binary"
                    },
                    "documentType": {
                      "type": "string",
                      "enum": [
                        "identity",
                        "professional",
                        "company"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Document anchored successfully"
            }
          }
        }
      },
      "/blockchain/history": {
        "get": {
          "summary": "Fetches the history of anchored documents",
          "tags": [
            "Blockchain"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "List of anchored documents",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "records": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "_id": {
                                  "type": "string"
                                },
                                "documentName": {
                                  "type": "string"
                                },
                                "documentHash": {
                                  "type": "string"
                                },
                                "createdAt": {
                                  "type": "string",
                                  "format": "date-time"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/blockchain/validate/{hash}": {
        "get": {
          "summary": "Publicly validate a document hash",
          "tags": [
            "Blockchain"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "hash",
              "required": true,
              "schema": {
                "type": "string",
                "example": "example"
              },
              "example": "example"
            }
          ],
          "responses": {
            "200": {
              "description": "Hash validation result"
            },
            "404": {
              "description": "Hash not found"
            }
          }
        }
      },
      "/livestream": {
        "post": {
          "summary": "Create or schedule a livestream",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title"
                  ],
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "category": {
                      "type": "string",
                      "enum": [
                        "audition",
                        "masterclass",
                        "interview",
                        "other"
                      ]
                    },
                    "isRecordingEnabled": {
                      "type": "boolean"
                    },
                    "visibility": {
                      "type": "string",
                      "enum": [
                        "public",
                        "private"
                      ],
                      "default": "public"
                    },
                    "invitedTalents": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "scheduledAt": {
                      "type": "string",
                      "format": "date-time"
                    },
                    "tags": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Stream created"
            }
          }
        },
        "get": {
          "summary": "List all active and scheduled livestreams (Discovery)",
          "tags": [
            "Livestream"
          ],
          "responses": {
            "200": {
              "description": "List of discovery streams"
            }
          }
        }
      },
      "/livestream/me": {
        "get": {
          "summary": "List my created livestreams",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "List of user's streams"
            }
          }
        }
      },
      "/livestream/{id}/messages": {
        "post": {
          "summary": "Post a message to a livestream",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "text"
                  ],
                  "properties": {
                    "text": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Message posted"
            }
          }
        },
        "get": {
          "summary": "Get messages for a livestream",
          "tags": [
            "Livestream"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer"
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of messages"
            }
          }
        }
      },
      "/livestream/{id}/start": {
        "post": {
          "summary": "Start a stream and get publisher tokens (RTC & RTM)",
          "description": "If the user is the host, the stream status is updated to 'live'.\nReturns RTC and RTM tokens for the Agora session.\n",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Stream started and tokens provided"
            }
          }
        }
      },
      "/livestream/{id}/join": {
        "post": {
          "summary": "Join a stream and get viewer tokens (RTC & RTM)",
          "description": "Increments viewer count.\nTalent users joining are automatically promoted to publishers (co-hosts).\n",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Joined stream"
            }
          }
        }
      },
      "/livestream/{id}/leave": {
        "post": {
          "summary": "Leave a live stream",
          "description": "Decrements viewer count or removes from co-hosts list.\n",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Left stream"
            }
          }
        }
      },
      "/livestream/{id}/end": {
        "patch": {
          "summary": "End a live stream",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Stream ended"
            }
          }
        }
      },
      "/livestream/{id}/invite": {
        "post": {
          "summary": "Invite talents to a private or public stream via email",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "emails"
                  ],
                  "properties": {
                    "emails": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Invitations sent successfully"
            }
          }
        }
      },
      "/livestream/{id}/participants": {
        "get": {
          "summary": "Get active participants for a live stream",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "List of active participants"
            }
          }
        }
      },
      "/livestream/{id}/cohost": {
        "post": {
          "summary": "Promote a participant to co-host",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Co-host added"
            }
          }
        }
      },
      "/livestream/{id}/cohost/{userId}": {
        "delete": {
          "summary": "Remove a co-host",
          "tags": [
            "Livestream"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Co-host removed"
            }
          }
        }
      },
      "/messaging/conversations": {
        "post": {
          "summary": "Get or create a conversation",
          "tags": [
            "Messaging"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "participantId"
                  ],
                  "properties": {
                    "participantId": {
                      "type": "string"
                    },
                    "castingCallId": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Conversation retrieved or created"
            }
          }
        },
        "get": {
          "summary": "Get current user's conversations",
          "tags": [
            "Messaging"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "List of conversations"
            }
          }
        }
      },
      "/messaging/messages": {
        "post": {
          "summary": "Send a message in a conversation",
          "tags": [
            "Messaging"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "conversationId",
                    "text"
                  ],
                  "properties": {
                    "conversationId": {
                      "type": "string"
                    },
                    "text": {
                      "type": "string"
                    },
                    "mediaUrl": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Message sent successfully"
            }
          }
        }
      },
      "/messaging/conversations/{id}/messages": {
        "get": {
          "summary": "Get messages for a conversation",
          "tags": [
            "Messaging"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "example": "507f1f77bcf86cd799439011"
            },
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 50
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of messages"
            }
          }
        }
      },
      "/messaging/bulk-message": {
        "post": {
          "summary": "Send a bulk message to multiple recipients (Professional CD only)",
          "tags": [
            "Messaging"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "recipientIds",
                    "text"
                  ],
                  "properties": {
                    "recipientIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    },
                    "text": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Bulk messages queued successfully"
            },
            "403": {
              "description": "Feature not included in your plan"
            }
          }
        }
      },
      "/notifications/register-device": {
        "post": {
          "summary": "Register a device token for push notifications",
          "tags": [
            "Notifications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "deviceToken",
                    "platform"
                  ],
                  "properties": {
                    "deviceToken": {
                      "type": "string",
                      "description": "FCM device token"
                    },
                    "platform": {
                      "type": "string",
                      "enum": [
                        "ios",
                        "android",
                        "web"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Device token registered",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      },
                      "message": {
                        "type": "string"
                      },
                      "data": {
                        "$ref": "#/components/schemas/DeviceToken"
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/notifications/send": {
        "post": {
          "summary": "Send a push notification to a user (admin/internal use)",
          "tags": [
            "Notifications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId",
                    "title",
                    "message",
                    "type"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string"
                    },
                    "title": {
                      "type": "string"
                    },
                    "message": {
                      "type": "string"
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "message",
                        "casting_invitation",
                        "application_update",
                        "system_alert"
                      ]
                    },
                    "metadata": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Notification sent and stored"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/notifications": {
        "get": {
          "summary": "Get notifications for the authenticated user",
          "tags": [
            "Notifications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "query",
              "name": "page",
              "schema": {
                "type": "integer",
                "default": 1
              }
            },
            {
              "in": "query",
              "name": "limit",
              "schema": {
                "type": "integer",
                "default": 20
              }
            }
          ],
          "responses": {
            "200": {
              "description": "List of notifications with pagination"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/notifications/read-all": {
        "patch": {
          "summary": "Mark all notifications as read",
          "tags": [
            "Notifications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "All notifications marked as read"
            },
            "401": {
              "description": "Unauthorized"
            }
          }
        }
      },
      "/notifications/{id}/read": {
        "patch": {
          "summary": "Mark a single notification as read",
          "tags": [
            "Notifications"
          ],
          "security": [
            {
              "BearerAuth": []
            }
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
                "example": "507f1f77bcf86cd799439011"
              },
              "description": "Notification ID",
              "example": "507f1f77bcf86cd799439011"
            }
          ],
          "responses": {
            "200": {
              "description": "Notification marked as read"
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "Notification not found"
            }
          }
        }
      }
    },
    "tags": [
      {
        "name": "Bookings",
        "description": "Booking management for professionals"
      },
      {
        "name": "Casting Profile",
        "description": "Management for Casting Director and Industry Professional profiles"
      },
      {
        "name": "Portfolio",
        "description": "Portfolio management for industry professionals"
      },
      {
        "name": "Projects",
        "description": "Management of casting calls/projects and their roles"
      },
      {
        "name": "Reference Data",
        "description": "Reference data for dropdowns and fixed lists"
      },
      {
        "name": "Services",
        "description": "Professional services management"
      },
      {
        "name": "Subscriptions",
        "description": "Subscription management and plan access"
      },
      {
        "name": "Blockchain",
        "description": "Decentralized-style credential verification and anchoring"
      },
      {
        "name": "Livestream",
        "description": "Real-time video broadcasting for auditions and masterclasses"
      },
      {
        "name": "Messaging",
        "description": "Real-time chat and conversation management"
      },
      {
        "name": "Notifications",
        "description": "Push notification management"
      }
    ]
  },
  "customOptions": {
    "url": "/api-docs.json",
    "displayOperationId": false,
    "docExpansion": "list",
    "filter": true,
    "showRequestHeaders": true
  }
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.preauthorizeApiKey) {
    const key = customOptions.preauthorizeApiKey.authDefinitionKey;
    const value = customOptions.preauthorizeApiKey.apiKeyValue;
    if (!!key && !!value) {
      const pid = setInterval(() => {
        const authorized = ui.preauthorizeApiKey(key, value);
        if(!!authorized) clearInterval(pid);
      }, 500)

    }
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
