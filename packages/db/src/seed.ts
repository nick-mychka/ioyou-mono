import { db } from "./client";
import { currencies, recordStatuses } from "./schema";

async function seed() {
  console.log("Seeding currencies...");
  await db
    .insert(currencies)
    .values([{ code: "USD" }, { code: "EUR" }, { code: "USDT" }])
    .onConflictDoNothing();

  console.log("Seeding record statuses...");
  await db
    .insert(recordStatuses)
    .values([{ code: "active" }, { code: "paid" }, { code: "overdue" }])
    .onConflictDoNothing();

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
