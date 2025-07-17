import type { Route } from "./+types/home";
import { useState } from "react";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { isRouteErrorResponse } from "react-router";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Make it your own | Transformative" },
		{ name: "description", content: "Welcome to your next project!" },
	];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	if (process.env.NODE_ENV === "development") {
		const res = await fetch("https://api.transformative.com/user");
		return await res.json();
	}
	return null;
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	
	// Calculate earliest habit date for Footer navigation limits
	// This will be passed from Hero component when habits are loaded
	const [earliestHabitDate, setEarliestHabitDate] = useState<Date | undefined>();
	
	const handleDateChange = (date: Date) => {
		setSelectedDate(date);
	};

	return (
		<div className="min-h-screen pb-20"> {/* Add padding bottom for fixed footer */}
			<Hero
				selectedDate={selectedDate}
				onDateChange={handleDateChange}
			/>
			<Footer
				selectedDate={selectedDate}
				onDateChange={handleDateChange}
				earliestHabitDate={earliestHabitDate}
			/>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
