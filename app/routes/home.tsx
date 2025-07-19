import { useState } from "react";
import { isRouteErrorResponse } from "react-router";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import type { Route } from "./+types/home";
import { useUser } from "@clerk/react-router";

export function meta({ data }: Route.MetaArgs) {
	return [
		{ title: "Trackr | Be one percent better every day" },
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
	const { isSignedIn, user, isLoaded } = useUser();

	if (!isLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
					<p className="text-gray-600">Checking authentication...</p>
				</div>
			</div>
		);
	}

	if (!isSignedIn) {
		return (
			<div className="text-center">
				Pal, please authenticate above to change your life
			</div>
		);
	}

	const [selectedDate, setSelectedDate] = useState<Date>(new Date());

	// Calculate earliest habit date for Footer navigation limits
	// This will be passed from Hero component when habits are loaded
	const [earliestHabitDate, setEarliestHabitDate] = useState<
		Date | undefined
	>();

	const handleDateChange = (date: Date) => {
		setSelectedDate(date);
	};

	return (
		<div className="min-h-screen pb-20">
			{" "}
			{/* Add padding bottom for fixed footer */}
			<Hero selectedDate={selectedDate} onDateChange={handleDateChange} />
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
