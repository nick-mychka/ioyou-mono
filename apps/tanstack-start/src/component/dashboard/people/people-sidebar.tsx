import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@ioyou/ui/skeleton";

import { useTRPC } from "~/lib/trpc";
import { AddPersonButton } from "../add-person/add-person-button";
import { PeopleEmpty } from "./people-empty";
import { PeopleList } from "./people-list";

export function PeopleSidebar() {
  const trpc = useTRPC();
  const { data, isLoading, isSuccess } = useQuery(
    trpc.person.all.queryOptions(),
  );

  const hasPeople = isSuccess && data.length > 0;

  return (
    <section className="flex flex-col">
      {isLoading || hasPeople ? (
        <>
          <header className="flex items-center justify-between px-6 py-8">
            {isLoading ? (
              <Skeleton className="h-8 w-19" />
            ) : (
              <h2 className="text-2xl font-semibold">People</h2>
            )}
            {isLoading ? (
              <Skeleton className="h-9 w-31" />
            ) : (
              <AddPersonButton />
            )}
          </header>
          <PeopleList people={data} isLoading={isLoading} />
        </>
      ) : (
        <PeopleEmpty />
      )}
    </section>
  );
}
