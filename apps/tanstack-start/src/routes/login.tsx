import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { Button } from "@ioyou/ui/button";

import { authClient } from "~/auth/client";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(
      context.trpc.auth.getSession.queryOptions(),
    );
    if (session) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-5xl font-extrabold tracking-tight">
          I<span className="text-primary">O</span>You
        </h1>
        <p className="text-muted-foreground text-sm">
          Track loans and debts with ease
        </p>
        <Button
          size="lg"
          onClick={async () => {
            const res = await authClient.signIn.social({
              provider: "google",
              callbackURL: "/",
            });
            if (res.data?.url) {
              await navigate({ href: res.data.url, replace: true });
            }
          }}
        >
          Sign in with Google
        </Button>
      </div>
    </main>
  );
}
