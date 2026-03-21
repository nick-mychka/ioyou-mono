import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Button } from "@ioyou/ui/button";
import { ThemeToggle } from "@ioyou/ui/theme";

import { authClient } from "~/auth/client";

export function AppHeader() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  return (
    <header className="border-border flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-xl font-bold">
        I<span className="text-primary">O</span>You
      </h1>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        {session && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {session.user.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await authClient.signOut();
                await navigate({ to: "/login" });
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
