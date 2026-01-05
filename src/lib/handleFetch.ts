export const handleFetch = async (
	url: string,
	options: RequestInit,
	validStatus: number[] = [],
	includeHeaders: boolean = false,
	getResponse: boolean = false,
) => {
	const response = await fetch(url, options).catch(error => {
		throw new Error('fetch error', { cause: error });
	});

	if (
		!response.ok &&
		!validStatus?.find(status => response.status === status)
	) {
		throw new Error('response error', { cause: response });
	}

	if (includeHeaders) {
		return {
			data: await response.json(),
			headers: response.headers,
		};
	}

	if (getResponse) {
		return response;
	}
	return response.json();
};
