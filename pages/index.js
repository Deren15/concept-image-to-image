import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
	const [prediction, setPrediction] = useState(null);
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(e.target.prompt.value);
		console.log(e.target.image.files[0]);
		// convert the image to base64
		const reader = new FileReader();
		reader.readAsDataURL(e.target.image.files[0]);
		reader.onload = async () => {
			const response = await fetch("/api/predictions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt: e.target.prompt.value,
					image: reader.result,
				}),
			});
			let prediction = await response.json();
			if (response.status !== 201) {
				setError(prediction.detail);
				return;
			}
			setPrediction(prediction);

			while (
				prediction.status !== "succeeded" &&
				prediction.status !== "failed"
			) {
				await sleep(1000);
				const response = await fetch("/api/predictions/" + prediction.id);
				prediction = await response.json();
				if (response.status !== 200) {
					setError(prediction.detail);
					return;
				}
				console.log({ prediction });
				setPrediction(prediction);
			}
		};
		// const response = await fetch("/api/predictions", {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify({
		// 		prompt: e.target.prompt.value,
		// 	}),
		// });
		// let prediction = await response.json();
		// if (response.status !== 201) {
		// 	setError(prediction.detail);
		// 	return;
		// }
		// setPrediction(prediction);

		// while (
		// 	prediction.status !== "succeeded" &&
		// 	prediction.status !== "failed"
		// ) {
		// 	await sleep(1000);
		// 	const response = await fetch("/api/predictions/" + prediction.id);
		// 	prediction = await response.json();
		// 	if (response.status !== 200) {
		// 		setError(prediction.detail);
		// 		return;
		// 	}
		// 	console.log({ prediction });
		// 	setPrediction(prediction);
		// }
	};

	return (
		<div className={styles.container}>
			<Head>
				<title>Replicate + Next.js</title>
			</Head>

			<form className={styles.form} onSubmit={handleSubmit}>
				{/* Get image input from user and style the input label */}
				<input type="file" name="image" accept="image/*" />
				{/* Get text input from user */}
				<input
					type="text"
					name="prompt"
					placeholder="Enter a prompt for image(optional)"
				/>

				<button type="submit">Go!</button>
			</form>

			{error && <div>{error}</div>}

			{prediction && (
				<div>
					{prediction.output && (
						<div className={styles.imageWrapper}>
							<Image
								fill
								src={prediction.output[prediction.output.length - 1]}
								alt="output"
								sizes="100vw"
							/>
						</div>
					)}
					<p>status: {prediction.status}</p>
				</div>
			)}
		</div>
	);
}
