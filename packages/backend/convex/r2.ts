import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";
import { query } from "./_generated/server";
import { authComponent } from "./auth";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi({
	checkUpload: async (ctx) => {
		// Check if user is authenticated
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");
	},
	onUpload: async (ctx, _bucket, key) => {
		console.log("File uploaded with key:", key);

		// Automatically update user profile with avatar key
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const profile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", user._id))
			.first();

		if (!profile) {
			throw new Error("User profile not found");
		}

		await ctx.db.patch(profile._id as Id<"userProfiles">, {
			avatarKey: key,
			updatedAt: Date.now(),
		});
		console.log("Updated user profile with avatar key:", key);
	},
});

// Query to get avatar URL from R2 key
export const getAvatarUrl = query({
	args: {
		key: v.string(),
	},
	handler: async (ctx, args) => {
		console.log("argument", args);
		if (!args.key) return null;
		return await r2.getUrl(args.key, ctx);
	},
});
