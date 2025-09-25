import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export default async function createMessage(body, to) {
  const message = await client.messages.create({
    body: body,
    from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
    to: to, // Recipient's phone number
  });

  console.log(message);
  return message.body;
}

/**
 * Response from Twilio API
 * 201 - CREATED - The request was successful. We created a new resource and the response body contains the representation.
{
  "account_sid": "TWILIO_ACCOUNT_SID",
  "api_version": "2010-04-01",
  "body": "hello this is first message with otp 314810",
  "date_created": "Thu, 25 Sep 2025 10:14:02 +0000",
  "date_sent": null,
  "date_updated": "Thu, 25 Sep 2025 10:14:02 +0000",
  "direction": "outbound-api",
  "error_code": null,
  "error_message": null,
  "from": null,
  "messaging_service_sid": "messaging_service_sid",
  "num_media": "0",
  "num_segments": "0",
  "price": null,
  "price_unit": null,
  "sid": "sid",
  "status": "accepted",
  "subresource_uris": {
    "media": "/2010-04-01/Accounts/TWILIO_ACCOUNT_SID/Messages/sid/Media.json"
  },
  "to": "+923173762773",
  "uri": "/2010-04-01/Accounts/TWILIO_ACCOUNT_SID/Messages/sid.json"
}
 */
