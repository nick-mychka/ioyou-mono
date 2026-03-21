import { PeopleListItem, PeopleListItemSkeleton } from "./people-list-item";

interface Person {
  id: string;
  name: string;
  description: string | null;
}

export function PeopleList({
  people,
  isLoading,
}: {
  people: Person[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 px-2">
        {Array.from({ length: 3 }, (_, i) => (
          <PeopleListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-2">
      {people?.map((person) => (
        <PeopleListItem key={person.id} person={person} />
      ))}
    </div>
  );
}
