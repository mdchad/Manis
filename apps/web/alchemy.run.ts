import alchemy from "alchemy";
import { Vite } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });

const app = await alchemy("manis");

export const web = await Vite("web", {
	assets: "dist",
	bindings: {
		VITE_CONVEX_URL: process.env.VITE_CONVEX_URL || "",
	},
	dev: {
		command: "bun run dev",
	},
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
