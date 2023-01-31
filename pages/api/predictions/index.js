export default async function handler(req, res) {
	const response = await fetch("https://api.replicate.com/v1/predictions", {
		method: "POST",
		headers: {
			Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			// Pinned to a specific version of Stable Diffusion
			// See https://replicate.com/stability-ai/stable-diffussion/versions
			version:
				// "d0742988ca2894860b9f19cb18eeaaa446c6812f700296520fc823330503d861",
				"738154b934ddc51f3828f9ef34b500e40f4122018e669d95d25a2b26574fd206",

			// This is the text prompt that will be submitted by a form on the frontend
			input: {
				prompt: req.body.prompt,
				init_image: req.body.image,
				captioning_model: "blip",
				structural_image_strength: 0.15,
				conceptual_image_strength: 0.4,
			},
		}),
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
