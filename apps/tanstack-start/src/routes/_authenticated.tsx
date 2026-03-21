import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppHeader } from "~/component/app-header";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(
      context.trpc.auth.getSession.queryOptions(),
    );
    if (!session) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <Outlet />
    </div>
  );
}
