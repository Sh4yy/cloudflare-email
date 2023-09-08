import { IContact, IEmail } from '../schema/email';

import Dkim from './dkim';

type IMCPersonalization = { to: IMCContact[]; dkim_domain: string; dkim_selector: string; dkim_private_key: string };
type IMCContact = { email: string; name: string | undefined };
type IMCContent = { type: string; value: string };

interface IMCEmail {
	personalizations: IMCPersonalization[];
	from: IMCContact;
	reply_to: IMCContact | undefined;
	cc: IMCContact[] | undefined;
	bcc: IMCContact[] | undefined;
	subject: string;
	content: IMCContent[];
}

class Email {
	/**
	 *
	 * @param email
	 */
	static async send(email: IEmail, env: Env) {
		// convert email to IMCEmail (MailChannels Email)
		const mcEmail: IMCEmail = Email.convertEmail(email, env);

		// send email through MailChannels
		const resp = await fetch(
			new Request('https://api.mailchannels.net/tx/v1/send', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify(mcEmail),
			})
		);

		// check if email was sent successfully
		if (resp.status > 299 || resp.status < 200) {
			throw new Error(`API Status : ${resp.status} ${resp.statusText}, API Response : ${await resp.text()}}`);
		}
	}

	/**
	 * Converts an IEmail to an IMCEmail
	 * @param email
	 * @protected
	 */
	protected static convertEmail(email: IEmail, env: Env): IMCEmail {
		const personalizations: IMCPersonalization[] = [];

		// Convert 'to' field
		const toContacts: IMCContact[] = Email.convertContacts(email.email.recipients.to);
		let dkim = Dkim.getInfo(email.email.from, env)
		personalizations.push({ to: toContacts, ...dkim });

		let replyTo: IMCContact | undefined = undefined;
		let bccContacts: IMCContact[] | undefined = undefined;
		let ccContacts: IMCContact[] | undefined = undefined;

		// Convert 'replyTo' field

		if (email.email.replyTo) {
			const replyToContacts: IMCContact[] = Email.convertToIMCContacts(email.email.replyTo);
			replyTo = replyToContacts.length > 0 ? replyToContacts[0] : { email: '', name: undefined };
		}

		// Convert 'cc' field
		if (email.email.recipients.cc) {
			ccContacts = Email.convertToIMCContacts(email.email.recipients.cc);
		}

		// Convert 'bcc' field
		if (email.email.recipients.bcc) {
			bccContacts = Email.convertToIMCContacts(email.email.recipients.bcc);
		}

		const from: IMCContact = Email.convertToIMCContactSingle(email.email.from, email.email.fromName);

		// Convert 'subject' field
		const subject: string = email.email.subject;

		// Convert 'text' field
		const textContent: IMCContent[] = [];
		if (email.email.text) {
			textContent.push({ type: 'text/plain', value: email.email.text });
		}

		// Convert 'html' field
		const htmlContent: IMCContent[] = [];
		if (email.email.html) {
			htmlContent.push({ type: 'text/html', value: email.email.html });
		}

		const content: IMCContent[] = [...textContent, ...htmlContent];

		return {
			personalizations,
			from,
			cc: ccContacts,
			bcc: bccContacts,
			reply_to: replyTo,
			subject,
			content,
		};
	}

	/**
	 * Converts an IContact or IContact[] to a Contact[]
	 * @param contacts
	 * @protected
	 */
	protected static convertContacts(contacts: IContact | IContact[]): IMCContact[] {
		if (!contacts) {
			return [];
		}

		const contactArray: IContact[] = Array.isArray(contacts) ? contacts : [contacts];
		const convertedContacts: IMCContact[] = contactArray.map(Email.convertContact);

		return convertedContacts;
	}

	/**
	 * Converts an IContact to a Contact
	 * @param contact
	 * @protected
	 */
	protected static convertContact(contact: IContact): IMCContact {
		if (typeof contact === 'string') {
			return { email: contact, name: undefined };
		}

		return { email: contact.email, name: contact.name };
	}

	/**
	 * Converts an IContact to a Contact
	 * @param contact
	 * @protected
	 */
	protected static convertToIMCContacts(emails: string[]): IMCContact[] {
		return emails.map((email) => ({ email, name: undefined }));
	  }

	  /**
	 * Converts an IContact to a Contact
	 * @param contact
	 * @protected
	 */
	protected static convertToIMCContactSingle(email: string, name: string): IMCContact {
		return { email, name: name };
	  }
}

export default Email;
