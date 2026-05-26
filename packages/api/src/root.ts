import { authRouter } from "./router/auth";
import { currencyRouter } from "./router/currency";
import { ledgerRouter } from "./router/ledger";
import { recordRouter } from "./router/record";
import { recordStatusRouter } from "./router/recordStatus";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  currency: currencyRouter,
  ledger: ledgerRouter,
  record: recordRouter,
  recordStatus: recordStatusRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
