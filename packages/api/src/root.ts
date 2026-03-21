import { authRouter } from "./router/auth";
import { currencyRouter } from "./router/currency";
import { personRouter } from "./router/person";
import { recordRouter } from "./router/record";
import { recordStatusRouter } from "./router/recordStatus";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  currency: currencyRouter,
  person: personRouter,
  record: recordRouter,
  recordStatus: recordStatusRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
