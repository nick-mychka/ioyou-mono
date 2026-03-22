import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@ioyou/ui";
import { Button } from "@ioyou/ui/button";
import { Calendar } from "@ioyou/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@ioyou/ui/popover";

export function DateField({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon />
          {value ? format(value, "MMMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
