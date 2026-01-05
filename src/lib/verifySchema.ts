import { ValidationError, type AnyObject } from 'yup';
import type { SignInSchema } from '../components/pages/Account/SignIn';
import type { SignUpSchema } from '../components/pages/Account/SignUp';
import type { RequestResetPasswordModelSchema } from './../components/pages/Account/RequestResetPasswordModel';
import type { ResetPasswordModelSchema } from '../components/pages/Account/ResetPasswordModel';

export const verifySchema = async ({
	schema,
	formFields,
}: {
	schema: AnyObject;
	formFields:
		| SignInSchema
		| SignUpSchema
		| RequestResetPasswordModelSchema
		| ResetPasswordModelSchema;
}) => {
	try {
		await schema.validate(formFields, {
			abortEarly: false,
			stripUnknown: true,
		});
	} catch (err) {
		if (err instanceof ValidationError) {
			const errors = err.inner.reduce(
				(obj, error) =>
					error.path ? { ...obj, [error.path]: error.message } : obj,
				{},
			);
			return errors;
		}
	}
};
