const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: 'us-east-1' });
const TOPIC_ARN = 'arn:aws:sns:us-east-1:562896989310:NewFlight'; // Replace with your SNS Topic ARN

exports.handler = async (event) => {
  try {
    // Extract the message from the SNS event
    const message = JSON.parse(event.body);
    
    // Destructure the values from the message
    const { from, to, date } = message;

    const notificationMessage = `New Flight Added:
From: ${from}
To: ${to}
Date: ${date}`;

    const params = {
      Message: notificationMessage,
      Subject: `New Flight Notification`,
      TopicArn: TOPIC_ARN,
    };

    const command = new PublishCommand(params);
    await snsClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notification sent successfully.' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send notification.', error: error.message }),
    };
  }
};
