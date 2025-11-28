import { createClient, type GenericCtx, type AuthFunctions } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { expo } from "@better-auth/expo";
import { crossDomain } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import { v } from "convex/values";
import { username } from "better-auth/plugins";

const siteUrl = process.env.SITE_URL!;
const nativeAppUrl = process.env.NATIVE_APP_URL || "manis://";

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
	authFunctions,
	triggers: {
		user: {
			onCreate: async (ctx, doc) => {
				// Automatically create user profile when a new user signs up
				// Use _id as the unique identifier for the user
				const now = Date.now();
				await ctx.db.insert("userProfiles", {
					userId: doc._id,
					createdAt: now,
					updatedAt: now,
				});
			},
			onDelete: async (ctx, doc) => {
				// Clean up orphaned follow relationships when a user is deleted
				// Delete where this user is the follower (following others)
				const followingRecords = await ctx.db
					.query("follows")
					.withIndex("by_follower", (q) => q.eq("followerId", doc._id))
					.collect();

				for (const record of followingRecords) {
					await ctx.db.delete(record._id);
				}

				// Delete where this user is being followed (followers)
				const followerRecords = await ctx.db
					.query("follows")
					.withIndex("by_user", (q) => q.eq("userId", doc._id))
					.collect();

				for (const record of followerRecords) {
					await ctx.db.delete(record._id);
				}

				// Also delete the user profile
				const profile = await ctx.db
					.query("userProfiles")
					.withIndex("by_userId", (q) => q.eq("userId", doc._id))
					.first();

				if (profile) {
					await ctx.db.delete(profile._id);
				}
			},
		},
	},
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

function createAuth(
	ctx: GenericCtx<DataModel>,
	{ optionsOnly }: { optionsOnly?: boolean } = { optionsOnly: false }
) {
	return betterAuth({
		logger: {
			disabled: optionsOnly,
		},
		trustedOrigins: [nativeAppUrl],
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			},
			// apple: {
			// 	clientId: process.env.APPLE_CLIENT_ID!,
			// 	clientSecret: process.env.APPLE_CLIENT_SECRET!,
			// },
		},
		plugins: [expo(), crossDomain({ siteUrl }), convex(), username()],
	});
}

export { createAuth };

export const getCurrentUser = query({
	args: {},
	returns: v.any(),
	handler: async function (ctx, args) {
		return authComponent.getAuthUser(ctx);
	},
});

export const getUserById = query({
	args: {
		userId: v.id("user"),
	},
	returns: v.any(),
	handler: async function (ctx, args) {
		return authComponent.getAnyUserById(ctx, args.userId);
	},
});
