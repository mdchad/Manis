import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import type { Id } from "./_generated/dataModel";
import { r2 } from "./r2";

// Get user profile (read-only)
// Profile is automatically created via Better Auth trigger when user signs up
export const getProfile = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) return null;

		// Get existing profile
		const profile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", user._id))
			.first();

		if (profile) {
			return {
				...profile,
				// Include user data from Better-Auth
				username: user.username,
				email: user.email,
				name: user.name,
			};
		}

		// Return null if no profile exists (shouldn't happen due to trigger)
		return null;
	},
});

// Update user profile - unified mutation for all profile updates
export const updateProfile = mutation({
	args: {
		avatarKey: v.optional(v.string()),
		displayName: v.optional(v.string()),
		bio: v.optional(v.string()),
		location: v.optional(v.string()),
		website: v.optional(v.string()),
		language: v.optional(v.string()),
		theme: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const profile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", user._id))
			.first();

		if (!profile) {
			throw new Error("User profile not found");
		}

		// Build updates object with only provided fields
		const updates: Record<string, any> = {
			updatedAt: Date.now(),
		};

		if (args.avatarKey !== undefined) updates.avatarKey = args.avatarKey;
		if (args.displayName !== undefined) updates.displayName = args.displayName;
		if (args.bio !== undefined) updates.bio = args.bio;
		if (args.location !== undefined) updates.location = args.location;
		if (args.website !== undefined) updates.website = args.website;
		if (args.language !== undefined) updates.language = args.language;
		if (args.theme !== undefined) updates.theme = args.theme;

		await ctx.db.patch(profile._id as Id<"userProfiles">, updates);

		return { success: true };
	},
});

// Get all users with their profiles (for feed, suggestions, etc.)
export const getAllUsers = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;

		// Get all user profiles
		const profiles = await ctx.db.query("userProfiles").take(limit);

		// Fetch username and avatar URL for each profile
		const users = await Promise.all(
			profiles.map(async (profile) => {
				const user = await authComponent.getAnyUserById(ctx, profile.userId);

				// Get avatar URL if avatarKey exists
				const avatarUrl = profile.avatarKey ? await r2.getUrl(profile.avatarKey, ctx) : null;

				return {
					userId: profile.userId,
					username: user?.username || null,
					displayName: profile.displayName,
					bio: profile.bio,
					avatarKey: profile.avatarKey,
					avatarUrl: avatarUrl,
					location: profile.location,
					website: profile.website,
				};
			})
		);

		return users;
	},
});

// Backwards compatibility - deprecated, use updateProfile instead
export const updateAvatar = mutation({
	args: { avatarKey: v.string() },
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const profile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", user._id as string))
			.first();

		if (!profile) {
			throw new Error("User profile not found");
		}

		await ctx.db.patch(profile._id as Id<"userProfiles">, {
			avatarKey: args.avatarKey,
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});
