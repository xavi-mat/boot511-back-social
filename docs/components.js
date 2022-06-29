module.exports = {
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
      },
    },
    schemas: {
      UserRegister: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description: "Name/alias of user. Changeable. Not used for identificacion.",
            example: "janedoe",
            required: true,
            minLength: 3,
            maxLength: 40
          },
          email: {
            type: "string",
            description: "User's email. Used for login. Must be unique.",
            example: "janedoe@email.com",
            required: true,
            format: "email",
          },
          password: {
            type: "string",
            description: "User's password",
            required: true,
            format: "password",
          }
        }
      },
      UserLogin: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "User's email",
            example: "janedoe@email.com",
            required: true,
            format: "email",
          },
          password: {
            type: "string",
            description: "User's password",
            required: true,
            format: "password",
          }
        }
      },
      UserId: {
        type: 'string',
        description: "User Identifier Code. Created by MongoDB",
        example: "629e138db6e9749879d0deaa"
      },
      createPost: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of post",
            required: true,
            example: "Title of post"
          },
          body: {
            type: "string",
            description: "Body of post",
            required: true,
            example: "Body of post. Lorem ipsum..."
          },
          image: {
            type: "string",
            description: "Post image",
            required: false,
            format: "binary",
          },
        }
      },
      createComment: {
        type: "object",
        properties: {
          postId: {
            type: "string",
            description: "Id of commented post",
            required: true,
            example: "629e138fb6e9749879d0dec1"
          },
          text: {
            type: "string",
            description: "Text of comment",
            required: true,
            example: "Text of comment. Lorem ipsum..."
          },
          image: {
            type: "string",
            description: "Comment image",
            required: false,
            format: "binary",
          },
        }
      }
    }
  }
};