import { onchainTable } from "ponder";

// ============================
// MocKIDR (mockStableCoin) tables
// ============================

export const mocKIDRTransfer = onchainTable("mocKIDR_transfer", (t) => ({
  id: t.text().primaryKey(), // event.log.id
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  value: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),
}));

export const mocKIDRApproval = onchainTable("mocKIDR_approval", (t) => ({
  id: t.text().primaryKey(), // event.log.id
  owner: t.hex().notNull(),
  spender: t.hex().notNull(),
  value: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),
}));

export const mocKIDROwnershipTransferred = onchainTable(
  "mocKIDR_ownership_transferred",
  (t) => ({
    id: t.text().primaryKey(), // event.log.id
    previousOwner: t.hex().notNull(),
    newOwner: t.hex().notNull(),
    blockNumber: t.bigint().notNull(),
    blockTimestamp: t.bigint().notNull(),
  })
);

// ============================
// Wakaf contract tables
// ============================

export const wakafMoneyOutEvent = onchainTable(
  "wakaf_money_out_event",
  (t) => ({
    id: t.text().primaryKey(), // event.log.id
    nazir: t.hex().notNull(),
    sendTo: t.hex().notNull(),
    amount: t.bigint().notNull(),
    tokenAddress: t.hex().notNull(),
    reason: t.text().notNull(),
    blockNumber: t.bigint().notNull(),
    blockTimestamp: t.bigint().notNull(),
  })
);

export const wakafNazirAdded = onchainTable("wakaf_nazir_added", (t) => ({
  id: t.text().primaryKey(), // event.log.id
  nazir: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),
}));

export const wakafNazirRemoved = onchainTable("wakaf_nazir_removed", (t) => ({
  id: t.text().primaryKey(), // event.log.id
  nazir: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
  blockTimestamp: t.bigint().notNull(),
}));

export const wakafOwnershipTransferred = onchainTable(
  "wakaf_ownership_transferred",
  (t) => ({
    id: t.text().primaryKey(), // event.log.id
    previousOwner: t.hex().notNull(),
    newOwner: t.hex().notNull(),
    blockNumber: t.bigint().notNull(),
    blockTimestamp: t.bigint().notNull(),
  })
);
