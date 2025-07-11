import { Button } from "./Button"
import { Textarea } from "./Textarea"
export function TextareaWithButton() {
  return (
    <div className="grid w-full gap-2">
      <Textarea placeholder="Add description" />
      <Button variant={'ghost'}>Add habit</Button>
    </div>
  )
}