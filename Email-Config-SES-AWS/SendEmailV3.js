const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { accesskey, secretaccesskey, region, sender } = require("./EmailConfig");

const SES_CONFIG = {
  credentials: {
    accessKeyId: accesskey,
    secretAccessKey: secretaccesskey,
  },
  region: region,
};

// Create SES service object.
const sesClient = new SESClient(SES_CONFIG);

const sendEmail = async (recipientEmail, name) => {
  let params = {
    Source: sender,
    Destination: {
      ToAddresses: [
        recipientEmail
      ],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: '<h1>This is the body of my email!</h1> v3',
        },
        Text: {
          Charset: "UTF-8",
          Data: "This is the body of my email! v3"
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Hello, ${name}!`,
      }
    },
  };

  try {
    const sendEmailCommand = new SendEmailCommand(params);
    const res = await sesClient.send(sendEmailCommand);
    console.log('Email has been sent! v3', res);
  } catch (error) {
    console.error(error);
  }
}

sendEmail("karnsameer125@gmail.com", "Sameer Karn");