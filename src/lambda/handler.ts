import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  try {
    if (path === "/users") {
      switch (method) {
        case "GET":
          return getAllUsers(event);
        case "POST":
          return createUser(event);
        default:
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Unsupported HTTP method for /users path",
            }),
          };
      }
    }

    // Handle /users/{id} path operations
    if (path.startsWith("/users/")) {
      const userId = path.split("/users/")[1];
      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "User ID is required" }),
        };
      }

      switch (method) {
        case "GET":
          return getUser(userId);
        case "PUT":
          return updateUser(event, userId);
        case "DELETE":
          return deleteUser(userId);
        default:
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Unsupported HTTP method for user operations",
            }),
          };
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Not Found" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

async function createUser(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 201,
    body: JSON.stringify({ message: "create user" }),
  };
}

async function getAllUsers(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "fetch all users" }),
  };
}

async function getUser(userId: string): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "fetch single user" }),
  };
}

async function updateUser(
  event: APIGatewayProxyEventV2,
  userId: string
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "update user" }),
  };
}

async function deleteUser(userId: string): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "delete user" }),
  };
}
