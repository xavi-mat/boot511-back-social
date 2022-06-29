module.exports = {
  "/users": {
    post: {
      tags: ["User's Profile"],
      summary: "Register new user",
      description: "Register a new user with username, email and password",
      operationId: "registerUser",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#components/schemas/UserRegister" }
          }
        }
      },
      responses: {
        201: { description: "User successfully registered" },
        400: { description: "Data required: username, email, password" },
        500: { description: "Internal server error" },
      }
    },
    get: {
      security: [{ ApiKeyAuth: [] }],
      tags: ["User's Profile"],
      summary: "Get all data of logged-in user",
      description: "Get all data of logged-in user",
      operationId: "getUserInfo",
      parameters: [],
      responses: {
        200: { description: "All User's data was obtained", },
        500: { description: "Internal server error" },
      }
    },
    put: {
      security: [{ ApiKeyAuth: [] }],
      tags: ["User's Profile"],
      summary: "Update authenticated user",
      description: "Update authenticated user's data: **username**, **password** and/or **avatar**",
      operationId: "updateUserInfo",
      parameters: [],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description: "Name/alias of user",
                  example: "janedoe",
                  minLength: 3,
                  maxLength: 40
                },
                password: {
                  type: "string",
                  description: "User's password",
                  format: "password",
                },
                avatar: {
                  type: "string",
                  description: "User's avatar image",
                  format: "binary",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User's data was updated" },
        500: { description: "Internal server error" },
      },
    },
  },
  "/users/login": {
    post: {
      tags: ["User's Profile"],
      summary: "Login a user",
      description: "Login a user with credentials (email, password) and get a jwt.",
      operationId: "loginUser",
      parameters: [],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#components/schemas/UserLogin" }
          }
        }
      },
      responses: {
        200: { description: "If email is confirmed, returns the user's data and a jwt used for authentication." },
        400: { description: "Wrong credentials" },
        500: { description: "Internal server error" },
      }
    }
  },
  "/users/confirm/{emailToken}": {
    get: {
      tags: ["User's Profile"],
      summary: "Confirm email",
      description: "Confirm an email address by providing the token sent to the user.",
      operationId: "confirmEmail",
      parameters: [
        {
          name: "emailToken",
          in: "path",
          description: "Token sent to the user",
          required: true,
          schema: {
            type: "string"
          },
        },
      ],
      responses: {
        200: { description: "Email successfully confirmed" },
        400: { description: "Error: confirmEmail-user" },
        500: { description: "Internal server error" },
      },
    }
  },
  "/users/search": {
    get: {
      tags: ["User's actions"],
      summary: "Search by username",
      description: "Search for users by username, case insensitive",
      operationId: "searchUsers",
      parameters: [
        {
          name: "name",
          in: "query",
          description: "Username to search for",
          required: true,
          schema: {
            type: "string"
          },
        },
        {
          name: "page",
          in: "query",
          description: "Page number",
          required: false,
          schema: {
            type: "integer",
          },
        },
        {
          name: "limit",
          in: "query",
          description: "Number of results per page",
          required: false,
          schema: {
            type: "integer",
          },
        },
      ],
      responses: {
        200: { description: "Users found" },
        400: { description: "Error: searchUsers-user" },
        500: { description: "Internal server error" },
      },
    }
  },
  "/users/id/{_id}": {
    get: {
      tags: ["User's actions"],
      summary: "Get public user's info",
      description: "Get public user's info by id: **minimal personal data:** _id, username, avatar; **Title** of posts, **ids** of comments, likes, followers, and following.",
      operationId: "getUserById",
      parameters: [
        {
          name: "_id",
          in: "path",
          description: "User's id",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: { description: "User's data was obtained" },
        400: { description: "Error: getUserById-user" },
        500: { description: "Internal server error" },
      },
    }
  },
  "/users/follow/{_id}": {
    put: {
      security: [{ ApiKeyAuth: [] }],
      tags: ["User's actions"],
      summary: "Follow a user",
      description: "Follow a user by id",
      operationId: "followUser",
      parameters: [
        {
          name: "_id",
          in: "path",
          description: "User's id",
          required: true,
          schema: {
            $ref: "#components/schemas/UserId",
          }
        }
      ],
      responses: {
        200: { description: "User was followed" },
        400: { description: "Error: followUser-user" },
        500: { description: "Internal server error" },
      },
    },
    delete: {
      security: [{ ApiKeyAuth: [] }],
      tags: ["User's actions"],
      summary: "Unfollow a user",
      description: "Stop following a user",
      operationId: "unfollowUser",
      parameters: [
        {
          name: "_id",
          in: "path",
          description: "User's id",
          schema: {
            $ref: "#components/schemas/UserId",
          }
        }
      ],
      responses: {
        200: { description: "Unfollowing user" },
        400: { description: "Error unfollowing used" },
        500: { description: "Internal server error" }
      }
    }
  },
  "/users/delete": {
    delete: {
      security: [{ ApiKeyAuth: [] }],
      tags: ["User's Profile"],
      summary: "Delete user",
      description: "Delete all data of the authenticated user: personal data, posts, comments, likes and following/followers references.",
      operationId: "deleteUser",
      parameters: [],
      responses: {
        200: { description: "User deleted" },
        400: { description: "Bad request" },
        500: { description: "Internal server error" }
      }
    }
  },
  "/users/logout": {
    delete: {
      security: [{ ApiKeyAuth: [] }],
      tags: ["User's Profile"],
      summary: "User's logout",
      description: "User's logout",
      operationId: "logoutUser",
      parameters: [],
      responses: {
        200: { description: "Logged out" },
        400: { description: "Bad request" },
        500: { description: "Internal server error" }
      }
    }
  },
  "/users/clean-all": {
    delete: {
      security: [{ ApiKeyAuth: [] }],
      tags: ["Admin's Power. Database Reset"],
      summary: "Reset Database",
      description: "Admin can delete all database and seed it with new fake random data.",
      operationId: "cleanAll",
      parameters: [],
      responses: {
        200: { description: "Cleaned" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        500: { description: "Internal server error" },
      }
    }
  },
};