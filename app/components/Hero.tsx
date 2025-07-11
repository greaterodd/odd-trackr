import { Input } from "./ui/Input";
import { TextareaWithButton } from "./ui/TextareaWithButton";

const Hero = ({ mocks_enabled }: { mocks_enabled: boolean }) => {
	return (
		<div className="flex items-center py-12 flex-col">
			<h1 className="text-5xl font-bold">Tracker</h1>
			<div className="flex flex-col">
				<p className="text-3xl font-semibold mb-6">The to-do list that helps you form good habits</p>
				<Input />
				<TextareaWithButton />
			</div>
		</div>
	);
};

export default Hero;
