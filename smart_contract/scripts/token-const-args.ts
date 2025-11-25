import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const initialHolders = process.env.INITIAL_HOLDERS?.split(",") ?? [];
const constructorArgs = [process.env.IDR_OWNER_ADDRESS, initialHolders];

export default constructorArgs;
