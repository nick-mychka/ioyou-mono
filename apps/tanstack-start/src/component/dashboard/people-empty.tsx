import { Users } from "lucide-react";

export function PeopleEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <Users className="text-muted-foreground size-10" />
      <div className="text-center">
        <p className="font-medium">No people yet</p>
        <p className="text-muted-foreground text-sm">
          Add someone to start tracking loans and debts
        </p>
      </div>
    </div>
  );
}
