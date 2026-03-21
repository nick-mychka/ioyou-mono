import { usePersonStore } from "~/store/use-person-store";
import { PersonDetails } from "./person-details";
import { PersonUnselected } from "./person-unselected";

export function PersonView() {
  const selectedPersonId = usePersonStore((s) => s.selectedPersonId);

  return (
    <section className="flex flex-col overflow-y-auto pt-3 pr-6 pb-6 pl-2">
      {selectedPersonId ? (
        <PersonDetails key={selectedPersonId} personId={selectedPersonId} />
      ) : (
        <PersonUnselected />
      )}
    </section>
  );
}
