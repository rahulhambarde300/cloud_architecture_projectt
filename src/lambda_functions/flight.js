const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "flight";

exports.handler = async (event) => {
  try {
    const httpMethod = event.httpMethod || event.requestContext.http.method;
    const queryStringParameters = event.queryStringParameters;
    const body = event.body;

    console.log(event, httpMethod, body, queryStringParameters);
    const id_query = queryStringParameters?.id;
    const from_query = queryStringParameters?.from;
    const to_query = queryStringParameters?.to;

    if (httpMethod === "GET") {
      if (id_query) {
        const getCommand = new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: Number(id_query) },
        });

        const result = await ddbDocClient.send(getCommand);
        return {
          statusCode: 200,
          body: JSON.stringify(result.Item || { message: "Flight not found" }),
        };
      }

      const scanCommand = new ScanCommand({ TableName: TABLE_NAME });
      const result = await ddbDocClient.send(scanCommand);
      const filteredItems = result.Items.filter((item) => {
        let matches = true;
        if (from_query) matches = matches && item.from === from_query;
        if (to_query) matches = matches && item.to === to_query;
        return matches;
      });
      return {
        statusCode: 200,
        body: JSON.stringify(filteredItems || []),
      };
    } else if (httpMethod === "POST") {
      const { id, from, to, date } = JSON.parse(body);

      if (!id || !from || !to || !date) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Missing required fields" }),
        };
      }

      const putCommand = new PutCommand({
        TableName: TABLE_NAME,
        Item: { id: Number(id), from, to, date },
      });

      await ddbDocClient.send(putCommand);
      return {
        statusCode: 201,
        body: JSON.stringify({ message: "Flight added successfully" }),
      };
    } else if (httpMethod === "DELETE") {
      const { id } = queryStringParameters;

      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Missing flight ID" }),
        };
      }

      const deleteCommand = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: Number(id) },
      });

      await ddbDocClient.send(deleteCommand);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Flight deleted successfully" }),
      };
    } else {
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
