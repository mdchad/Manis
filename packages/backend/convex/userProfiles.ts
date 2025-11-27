import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

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
			.withIndex("by_userId", (q) => q.eq("userId", user.id))
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

// Update user avatar
export const updateAvatar = mutation({
	args: {
		avatarKey: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Get or create profile
		const existingProfile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", user.id))
			.first();

		if (existingProfile) {
			// Update existing profile
			await ctx.db.patch(existingProfile._id, {
				avatarKey: args.avatarKey,
				updatedAt: Date.now(),
			});
		} else {
			// Create new profile with avatar
			const now = Date.now();
			await ctx.db.insert("userProfiles", {
				userId: user.id,
				avatarKey: args.avatarKey,
				createdAt: now,
				updatedAt: now,
			});
		}

		return { success: true };
	},
});

// Update user bio
export const updateBio = mutation({
	args: {
		bio: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const existingProfile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", user.id))
			.first();

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, {
				bio: args.bio,
				updatedAt: Date.now(),
			});
		} else {
			const now = Date.now();
			await ctx.db.insert("userProfiles", {
				userId: user.id,
				bio: args.bio,
				createdAt: now,
				updatedAt: now,
			});
		}

		return { success: true };
	},
});

// Update user preferences
export const updatePreferences = mutation({
	args: {
		language: v.optional(v.string()),
		theme: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const existingProfile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", user.id))
			.first();

		const updates: any = {
			updatedAt: Date.now(),
		};

		if (args.language !== undefined) updates.language = args.language;
		if (args.theme !== undefined) updates.theme = args.theme;

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, updates);
		} else {
			const now = Date.now();
			await ctx.db.insert("userProfiles", {
				userId: user.id,
				...updates,
				createdAt: now,
			});
		}

		return { success: true };
	},
});

// Update profile information
export const updateProfile = mutation({
	args: {
		displayName: v.optional(v.string()),
		bio: v.optional(v.string()),
		location: v.optional(v.string()),
		website: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const existingProfile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", user.id))
			.first();

		const updates: any = {
			updatedAt: Date.now(),
		};

		if (args.displayName !== undefined) updates.displayName = args.displayName;
		if (args.bio !== undefined) updates.bio = args.bio;
		if (args.location !== undefined) updates.location = args.location;
		if (args.website !== undefined) updates.website = args.website;

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, updates);
		} else {
			const now = Date.now();
			await ctx.db.insert("userProfiles", {
				userId: user.id,
				...updates,
				createdAt: now,
			});
		}

		return { success: true };
	},
});
