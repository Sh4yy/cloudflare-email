import { z } from 'zod';

const iContactSchema = z.union([
	z.string(),
	z.object({
		email: z.string(),
		name: z.union([z.string(), z.undefined()]),
	}),
]);

const iEmailSchema = z.object({
	to: z.union([iContactSchema, z.array(iContactSchema)]),
	replyTo: z.union([iContactSchema, z.array(iContactSchema)]).optional(),
	cc: z.union([iContactSchema, z.array(iContactSchema)]).optional(),
	bcc: z.union([iContactSchema, z.array(iContactSchema)]).optional(),
	from: iContactSchema,
	subject: z.string(),
	text: z.union([z.string(), z.undefined()]),
	html: z.union([z.string(), z.undefined()]),
});

export type IContact = z.infer<typeof iContactSchema>;
export type IEmail = z.infer<typeof iEmailSchema>;
export default iEmailSchema;
