import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./root";

/**
 * Inference helpers for input types
 * @example
 * type LedgerByIdInput = RouterInputs['ledger']['byId']
 *      ^? { id: string }
 */
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type LedgerListOutput = RouterOutputs['ledger']['list']
 *      ^? Ledger[]
 */
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { type AppRouter, appRouter } from "./root";
export { createTRPCContext } from "./trpc";
export type { RouterInputs, RouterOutputs };
