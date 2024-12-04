const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB clients
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Constants
const TABLE_NAME = "hotel";

// Lambda handler
exports.handler = async (event) => {
  try {
    const httpMethod = event.httpMethod || event.requestContext.http.method;
    const queryStringParameters = event.queryStringParameters;
    const body = event.body;

    console.log("Event:", event);
    console.log("HTTP Method:", httpMethod);
    console.log("Body:", body);
    console.log("Query Parameters:", queryStringParameters);
    const id_query = queryStringParameters?.id;
    const city_query = queryStringParameters?.city;

    switch (httpMethod) {
      case "GET":
        if (id_query) {
          // Retrieve a specific hotel by ID
          const getCommand = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id: Number(id_query) },
          });
          const result = await ddbDocClient.send(getCommand);

          return {
            statusCode: 200,
            body: JSON.stringify(result.Item || { message: "Hotel not found" }),
          };
        }

        // Retrieve all hotels
        const scanCommand = new ScanCommand({ TableName: TABLE_NAME });
        const result = await ddbDocClient.send(scanCommand);
        const filteredItems = result.Items.filter((item) => {
          let matches = true;
          if (city_query) matches = matches && item.city === city_query;
          return matches;
        });
        return {
          statusCode: 200,
          body: JSON.stringify(filteredItems || []),
        };

      case "POST":
        // Add a new hotel
        const { id, name, city, stars } = JSON.parse(body);

        if (!name || !city || !stars) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required fields" }),
          };
        }
        let newID = id ? id : Math.floor(Math.random() * 1000000);
        const putCommand = new PutCommand({
          TableName: TABLE_NAME,
          Item: { id: Number(newID), name, city, stars },
        });
        await ddbDocClient.send(putCommand);

        return {
          statusCode: 201,
          body: JSON.stringify({ message: "Hotel added successfully" }),
        };

      case "DELETE":
        // Delete a hotel by ID
        const { id: deleteId } = queryStringParameters;

        if (!deleteId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing hotel ID" }),
          };
        }

        const deleteCommand = new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id: Number(deleteId) },
        });
        await ddbDocClient.send(deleteCommand);

        return {
          statusCode: 200,
          body: JSON.stringify({ message: "Hotel deleted successfully" }),
        };

      default:
        // Unsupported HTTP method
        return {
          statusCode: 405,
          body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }
  } catch (error) {
    console.error("Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
