import { Button } from "./button";
import { Textarea } from "./Textarea";
export function TextareaWithButton() {
	return (
		<div className="grid w-full gap-2">
			<Textarea placeholder="Add description" />
			<Button>Add habit</Button>
		</div>
	);
}
