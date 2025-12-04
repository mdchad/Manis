import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get a listing by ID
 */
export const getById = query({
	args: {
		listingId: v.id("listings"),
	},
	handler: async (ctx, args) => {
		const listing = await ctx.db.get(args.listingId);
		if (!listing) {
			return null;
		}

		// Get seller's profile
		const sellerProfile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", listing.userId))
			.first();

		return {
			...listing,
			seller: {
				id: listing.userId,
				name: sellerProfile?.displayName || "Unknown",
				avatarKey: sellerProfile?.avatarKey,
			},
		};
	},
});
