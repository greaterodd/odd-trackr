import { Input } from "./ui/Input";
import { TextareaWithButton } from "./ui/TextareaWithButton";

const Hero = () => {
	return (
		<div className="flex items-center py-12 flex-col">
			<h1 className="text-5xl font-bold">Tracker</h1>
			<div className="flex flex-col gap-3">
				<p className="text-3xl font-semibold mb-6">The to-do list that helps you form good habits</p>
				<Input placeholder="Add habit title" />
				<TextareaWithButton />
			</div>
		</div>
	);
};

export default Hero;
