import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const constructorArgs = [process.env.NAZIR_ADDRESS];

export default constructorArgs;
