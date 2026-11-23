import { writeFile } from "node:fs/promises";
import { buildHostingHeaders } from "../src/security-policy.ts";

await writeFile(new URL("../dist/_headers", import.meta.url), buildHostingHeaders());
