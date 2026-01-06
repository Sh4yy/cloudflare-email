> [!WARNING]
> [As of August 31, 2024, MailChannels has sunset its free email sending service for Cloudflare Workers users.](https://support.mailchannels.com/hc/en-us/articles/4565898358413-Sending-Email-from-Cloudflare-Workers-using-MailChannels-Email-API).

<div align="center">
	<img src="https://github.com/Sh4yy/cloudflare-email/assets/23535123/36a28753-7ded-45ef-bfed-fcc308658b33" alt="Cloudflare Worker Email Server"/>
	<br>
  <h1>Cloudflare Worker Email Server</h1>
	<p>Send free transactional emails from your Cloudflare Workers using MailChannels.</p>
</div>


## Getting Started!

1. Clone this repository
2. Install the dependencies with `bun install`
3. Use the command `bunx wrangler secret put --env production TOKEN` to deploy a securely stored token to Cloudflare. With this command, you will be prompted to enter a random secret value, which will be used to authenticate your requests with the HTTP `Authorization` header as described below. You can also set this encrypted value directly in your Cloudflare dashboard.
4. (optional) - If you want DKIM then generate your private and public keys following [mailchannels tutorial](https://support.mailchannels.com/hc/en-us/articles/7122849237389-Adding-a-DKIM-Signature) and put your private key into `bunx wrangler secret put --env production DKIM_PRIVATE_KEY` to deploy your key to cloudflare.
5. (optional) - Modify your domain name in wrangler.toml by changing `DKIM_DOMAIN` to the base domain of your site.
6. (optional) - If you modified the DKIM selector (the part of the TXT record with the name `<xxxxx>._domainkey` and has `v=DKIM1;p=<long DKIM public key>` as the content) then change `DKIM_SELECTOR` in wrangler.toml to that selector.
7. Deploy the worker with `bun run deploy`

Or deploy directly to Cloudflare

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Sh4yy/cloudflare-email)

## Setup SPF

SPF is a DNS record that helps prevent email spoofing. You will need to add an SPF record to your domain to allow MailChannels to send emails on your behalf.

1. Add a `TXT` record to your domain with the following values:

		- Name: `@`
		- Value: `v=spf1 a mx include:relay.mailchannels.net ~all`

Note: If you're facing [Domain Lockdown error](https://support.mailchannels.com/hc/en-us/articles/16918954360845-Secure-your-domain-name-against-spoofing-with-Domain-Lockdown), follow the below steps:

1. Create a `TXT` record with the following values:

		- Name: `_mailchannels`
		- Value: `v=mc1 cfid=yourdomain.workers.dev` (the value of `cfid` will also be present in the error response)

## Setup DKIM

This step is optional, but highly recommended. DKIM is a DNS record that helps prevent email spoofing. You may follow the steps listed in the [MailChannels documentation](https://support.mailchannels.com/hc/en-us/articles/7122849237389-Adding-a-DKIM-Signature) to set up DKIM for your domain.

## Usage

Once you have deployed this worker function to Cloudflare Workers, you can send emails by making a `POST` request to the worker on the `/api/email` endpoint with the following parameters:

- Note you need to pass an `Authorization` header with the secure token you deployed. Like the following: `Authorization: TOKEN`

### Basic Email

The Most basic request would look like this:

```json
{
	"to": "john@example.com",
	"from": "me@example.com",
	"subject": "Hello World",
	"text": "Hello World"
}
```

### HTML Emails

You can also send HTML emails by adding an `html` parameter to the request. This can be used in conjunction with the `text` parameter to send a multi-part email.

```json
{
	"to": "john@example.com",
	"from": "me@example.com",
	"subject": "Hello World",
	"html": "<h1>Hello World</h1>"
}
```

### Sender and Recipient Name

You can also specify a sender and recipient name by adding a `name` parameter to the request. This can be used for both the `to` and `from` parameters.

```json
{
	"to": { "email": "john@example.com",  "name": "John Doe" },
	"from": { "email": "me@example.com", "name": "Jane Doe" },
	"subject": "Hello World",
	"text": "Hello World"
}
```

### Sending to Multiple Recipients

You may also send to multiple recipients by passing an array of emails, or an array of objects with `email` and `name` properties.

```json
{
	"to": [
		"john@example.com",
		"rose@example.com"
 	],
	"from": "me@example.com",
	"subject": "Hello World",
	"text": "Hello World"
}
```

or

```json
{
	"to": [
		{ "email": "john@example.com", "name": "John Doe" },
		{ "email": "rose@example.com", "name": "Rose Doe" }
 	],
	"from": "me@example.com",
	"subject": "Hello World",
	"text": "Hello World"
}
```

### Sending BCC and CC

You can also send BCC and CC emails by passing an array of emails, an object with `email` and `name` properties, or an array of either, similar to the `to` parameter.

```json
{
	"to": "john@example.com",
	"from": "me@example.com",
	"subject": "Hello World",
	"text": "Hello World",
	"cc": [
		"jim@example.com",
		"rose@example.com"
	],
	"bcc": [
		"gil@example.com"
	]
}
```

### Reply To

You can also specify a reply to email address by adding a `replyTo` parameter to the request. Again, you can use an email string, an object with `email` and `name` properties, or an array of either.

```json
{
	"to": "john@example.com",
	"from": "me@example.com",
	"replyTo": "support@example.com",
	"subject": "Hello World",
	"text": "Hello World"
}
```
