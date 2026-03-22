import { BookUser } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ioyou/ui/empty";

export function PersonUnselected() {
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <BookUser />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No person selected</EmptyTitle>
        <EmptyDescription>
          Select someone from the list to view details
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
