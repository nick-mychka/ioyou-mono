import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@ioyou/ui/button";
import { Skeleton } from "@ioyou/ui/skeleton";

import { useTRPC } from "~/lib/trpc";
import { AddPersonDialog } from "./add-person-dialog";
import { PeopleEmpty } from "./people-empty";
import { PeopleList } from "./people-list";

export function PeopleSidebar() {
  const trpc = useTRPC();
  const { data, isLoading, isSuccess } = useQuery(
    trpc.person.all.queryOptions(),
  );

  // const data = [];
  const [isAddOpen, setIsAddOpen] = useState(false);

  const hasPeople = isSuccess && data.length > 0;

  return (
    <section className="flex flex-col overflow-y-auto">
      {isLoading || hasPeople ? (
        <>
          <header className="flex items-center justify-between px-6 py-8">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-19" />
                <Skeleton className="h-9 w-31" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">People</h2>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="size-4" />
                  Add Person
                </Button>
              </>
            )}
          </header>
          <PeopleList people={data} isLoading={isLoading} />
        </>
      ) : (
        <div className="flex flex-1 flex-col">
          <PeopleEmpty />
          <div className="flex justify-center pb-8">
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="size-4" />
              Add Person
            </Button>
          </div>
        </div>
      )}

      <AddPersonDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </section>
  );
}
