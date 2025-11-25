import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MockIDRModule", (m) => {
  const mockIdr = m.contract("MockIDR");

  return { mockIdr };
});
