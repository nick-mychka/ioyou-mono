import { Users } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ioyou/ui/empty";

import { AddPersonButton } from "../add-person/add-person-button";

export function PeopleEmpty() {
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <Users />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No people yet</EmptyTitle>
        <EmptyDescription>
          Start by adding someone you owe money to or who owes you. Track
          balances and settle up easily.
        </EmptyDescription>
      </EmptyHeader>
      <AddPersonButton />
    </Empty>
  );
}
