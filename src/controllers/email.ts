import { IContact, IEmail } from '../schema/email';

type IMCPersonalization = { to: IMCContact[] };
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
	static async send(email: IEmail) {
		// convert email to IMCEmail (MailChannels Email)
		const mcEmail: IMCEmail = Email.convertEmail(email);

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
			throw new Error(`Error sending email: ${resp.status} ${resp.statusText}`);
		}
	}

	/**
	 * Converts an IEmail to an IMCEmail
	 * @param email
	 * @protected
	 */
	protected static convertEmail(email: IEmail): IMCEmail {
		const personalizations: IMCPersonalization[] = [];

		// Convert 'to' field
		const toContacts: IMCContact[] = Email.convertContacts(email.to);
		personalizations.push({ to: toContacts });

		let replyTo: IMCContact | undefined = undefined;
		let bccContacts: IMCContact[] | undefined = undefined;
		let ccContacts: IMCContact[] | undefined = undefined;

		// Convert 'replyTo' field
		if (email.replyTo) {
			const replyToContacts: IMCContact[] = Email.convertContacts(email.replyTo);
			replyTo = replyToContacts.length > 0 ? replyToContacts[0] : { email: '', name: undefined };
		}

		// Convert 'cc' field
		if (email.cc) {
			ccContacts = Email.convertContacts(email.cc);
		}

		// Convert 'bcc' field
		if (email.bcc) {
			bccContacts = Email.convertContacts(email.bcc);
		}

		const from: IMCContact = Email.convertContact(email.from);

		// Convert 'subject' field
		const subject: string = email.subject;

		// Convert 'text' field
		const textContent: IMCContent[] = [];
		if (email.text) {
			textContent.push({ type: 'text/plain', value: email.text });
		}

		// Convert 'html' field
		const htmlContent: IMCContent[] = [];
		if (email.html) {
			htmlContent.push({ type: 'text/html', value: email.html });
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
}

export default Email;
