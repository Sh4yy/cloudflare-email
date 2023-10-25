<div align="center">
	<img src="https://github.com/Sh4yy/cloudflare-email/assets/23535123/36a28753-7ded-45ef-bfed-fcc308658b33" alt="Cloudflare Worker Email Server"/>
	<br>
  <h1>Cloudflare Worker Email Server</h1>
	<p>Send free transactional emails from your Cloudflare Workers using MailChannels.</p>
</div>


## Getting Started!

1. Clone this repository
2. Install the dependencies with `npm install`
3. Use the command `npx wrangler secret put --env production TOKEN` to deploy a securely stored token to Cloudflare. With this command, you will be prompted to enter a random secret value, which will be used to authenticate your requests with the HTTP `Authorization` header as described below. You can also set this encrypted value directly in your Cloudflare dashboard.
4. Deploy the worker with `npm run deploy`

Or deploy directly to cloudflare

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Sh4yy/cloudflare-email)

## Setup SPF

SPF is a DNS record that helps prevent email spoofing. You will need to add an SPF record to your domain to allow MailChannels to send emails on your behalf.

1. Add a `TXT` record to your domain with the following values:
		- Name: `@`
		- Value: `v=spf1 a mx include:relay.mailchannels.net ~all`

## Setup DKIM

This step is optional, but highly recommended. DKIM is a DNS record that helps prevent email spoofing. You may follow the steps listed in the [MailChannels documentation](https://support.mailchannels.com/hc/en-us/articles/7122849237389-Adding-a-DKIM-Signature) to set up DKIM for your domain.

## Usage

Once you have deployed this worker function to Cloudflare Workers, you can send emails by making a `POST` request to the worker on the `/api/email` endpoint with the following parameters:

- Note you need to pass an `Authorization` header with the secure token you deployed. Like the following: `Authorization: TOKEN`

### Request Body
Your `api/email` request payload should be structured as follows:

```json
{
  "email": {
    "from": "from@email.xyz",
    "fromName": "John Doe",
    "replyTo": [
      "replyone@email.xyz",
      "replytwo@email.xyz"
    ],
    "subject": "email subject",
    "text": "text body",
    "html": "html body",
    "recipients": {
      "to": [
        {
          "name": "Recipient1",
          "email": "abc12345"
        },
        {
          "name": "Recipient2",
          "email": "abc@pqr.xyz"
        }
      ],
      "cc": [
        "recipient_cc1@email.xyz",
        "recipient_cc2@email.xyz"
      ],
      "bcc": [
        "recipient_bcc1@email.xyz",
        "recipient_bcc2@email.xyz"
      ]
    }
  },
  "metadata": {
    "campaignType": "PROMOTIONAL",
    "custom": {
      "key1": "val1",
      "key2": "val2"
    },
    "timestamp": 1521012814,
    "messageId": "message-id"
  },
  "version": "1.0"
}
```
