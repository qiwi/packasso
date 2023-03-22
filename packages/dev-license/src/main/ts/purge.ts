import { ModuleCommand } from "@packasso/core";

export const purge: ModuleCommand = async () => ["+ rimraf LICENSE"];
