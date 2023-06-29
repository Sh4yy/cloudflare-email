import { z } from 'zod';

const iContactSchema = z.object({
  name: z.string(),
  email: z.string(),
});

const iEmailRecipientSchema = z.object({
  name: z.string(),
  email: z.string(),
});

const iAttachmentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

const iEmailSchema = z.object({
  email: z.object({
    from: z.string().email(),
    fromName: z.string(),
    replyTo: z.array(z.string().email()).optional(),
    subject: z.string(),
    text: z.string().optional(),
    html: z.string().optional(),
    recipients: z.object({
      to: z.array(iEmailRecipientSchema),
      cc: z.array(z.string().email()).optional(),
      bcc: z.array(z.string().email()).optional(),
    }),
    attachments: z.array(iAttachmentSchema).optional(),
  }),
  metadata: z.object({
    campaignType: z.string(),
    custom: z.record(z.string()),
    timestamp: z.number(),
    messageId: z.string(),
  }),
  version: z.string(),
});

export type IContact = z.infer<typeof iContactSchema>;
export type IEmailRecipient = z.infer<typeof iEmailRecipientSchema>;
export type IAttachment = z.infer<typeof iAttachmentSchema>;
export type IEmail = z.infer<typeof iEmailSchema>;

export default iEmailSchema;
