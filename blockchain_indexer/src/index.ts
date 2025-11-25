import { ponder } from "ponder:registry";
import schema from "ponder:schema";

// ============================
// MocKIDR (mockStableCoin) events
// ============================

ponder.on("MocKIDR:Transfer", async ({ event, context }) => {
  const { from, to, value } = event.args;

  await context.db.insert(schema.mocKIDRTransfer).values({
    id: `${event.block.number}-${event.log.logIndex}`,
    from,
    to,
    value,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
  });
});

ponder.on("MocKIDR:Approval", async ({ event, context }) => {
  const { owner, spender, value } = event.args;

  await context.db.insert(schema.mocKIDRApproval).values({
    id: `${event.block.number}-${event.log.logIndex}`,
    owner,
    spender,
    value,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
  });
});

ponder.on("MocKIDR:OwnershipTransferred", async ({ event, context }) => {
  const { previousOwner, newOwner } = event.args;

  await context.db.insert(schema.mocKIDROwnershipTransferred).values({
    id: `${event.block.number}-${event.log.logIndex}`,
    previousOwner,
    newOwner,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
  });
});

// ============================
// Wakaf contract events
// ============================

ponder.on("Wakaf:MoneyOutEvent", async ({ event, context }) => {
  const { nazir, sendTo, amount, tokenAddress, reason } = event.args;

  await context.db.insert(schema.wakafMoneyOutEvent).values({
    id: `${event.block.number}-${event.log.logIndex}`,
    nazir,
    sendTo,
    amount,
    tokenAddress,
    reason,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
  });
});

ponder.on("Wakaf:NazirAdded", async ({ event, context }) => {
  const { nazir } = event.args;

  await context.db.insert(schema.wakafNazirAdded).values({
    id: `${event.block.number}-${event.log.logIndex}`,
    nazir,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
  });
});

ponder.on("Wakaf:NazirRemoved", async ({ event, context }) => {
  const { nazir } = event.args;

  await context.db.insert(schema.wakafNazirRemoved).values({
    id: `${event.block.number}-${event.log.logIndex}`,
    nazir,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
  });
});

ponder.on("Wakaf:OwnershipTransferred", async ({ event, context }) => {
  const { previousOwner, newOwner } = event.args;

  await context.db.insert(schema.wakafOwnershipTransferred).values({
    id: `${event.block.number}-${event.log.logIndex}`,
    previousOwner,
    newOwner,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
  });
});
