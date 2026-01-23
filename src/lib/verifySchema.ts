import { ValidationError, type AnyObject } from 'yup';
import type { SignInInputErrors } from '../components/pages/Account/SignIn';

export const verifySchema = async ({
	schema,
	formFields,
}: {
	schema: AnyObject;
	formFields: AnyObject;
}): Promise<false | SignInInputErrors> => {
	try {
		await schema.validate(formFields, {
			abortEarly: false,
			stripUnknown: true,
		});
	} catch (err) {
		if (err instanceof ValidationError) {
			const errors: SignInInputErrors = err.inner.reduce(
				(obj, error) =>
					error.path ? { ...obj, [error.path]: error.message } : obj,
				{},
			);
			return errors;
		}
	}
	return false;
};
