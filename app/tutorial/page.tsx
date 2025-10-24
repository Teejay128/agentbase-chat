"use client";

import { useEffect, useState } from "react";
import { Markdown } from "@/components/ui/markdown";

export default function TutorialPage() {
	const [markdown, setMarkdown] = useState("");

	useEffect(() => {
		fetch("/tutorial/final.md")
			.then((res) => res.text())
			.then((text) => setMarkdown(text))
			.catch((err) => console.error("Failed to load markdown:", err));
	}, []);

	return (
		<main className="container p-8">
			{markdown ? (
				<div className="prose prose-neutral mx-auto max-w-4xl sm:px-16 md:px-24">
					<Markdown>{markdown}</Markdown>
				</div>
			) : (
				<p>Loading tutorial...</p>
			)}
		</main>
	);
}
