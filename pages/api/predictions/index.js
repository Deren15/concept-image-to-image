const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";

export default async function handler(req, res) {
	// remnove null and undefined values
	console.log(req.body);
	req.body = Object.entries(req.body).reduce(
		(a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
		{}
	);

	const body = JSON.stringify({
		// https://replicate.com/timothybrooks/instruct-pix2pix/versions
		version: "30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f",
		input: req.body,
	});

	const response = await fetch(`${API_HOST}/v1/predictions`, {
		method: "POST",
		headers: {
			Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
			"Content-Type": "application/json",
		},
		body,
	});

	if (response.status !== 201) {
		let error = await response.json();
		res.statusCode = 500;
		res.end(JSON.stringify({ detail: error.detail }));
		return;
	}

	const prediction = await response.json();
	res.statusCode = 201;
	res.end(JSON.stringify(prediction));
}

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "10mb",
		},
	},
};
