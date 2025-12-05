import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { r2 } from "./r2";

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

		// Get seller info from auth
		const sellerUser = await authComponent.getAnyUserById(ctx, listing.userId);

		// Get image URLs
		const imageUrl = listing.imageKey ? await r2.getUrl(listing.imageKey, ctx) : null;
		const avatarUrl = sellerProfile?.avatarKey
			? await r2.getUrl(sellerProfile.avatarKey, ctx)
			: null;

		return {
			...listing,
			imageUrl,
			seller: {
				id: listing.userId,
				username: sellerUser?.username || "Unknown",
				name: sellerProfile?.displayName || sellerUser?.username || "Unknown",
				avatarUrl,
			},
		};
	},
});

/**
 * Get all listings for a specific user
 */
export const getUserListings = query({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, args) => {
		const listings = await ctx.db
			.query("listings")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.order("desc")
			.collect();

		const enrichedListings = await Promise.all(
			listings.map(async (listing) => {
				const imageUrl = listing.imageKey ? await r2.getUrl(listing.imageKey) : "";

				return {
					...listing,
					imageUrl,
				};
			})
		);

		return enrichedListings;
	},
});

/**
 * Create a new listing
 */
export const createListing = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		price: v.optional(v.number()),
		imageKey: v.optional(v.string()),
		brand: v.optional(v.string()),
		category: v.optional(v.string()),
		type: v.optional(v.string()),
		colors: v.optional(v.array(v.string())),
		size: v.optional(v.string()),
		condition: v.optional(v.string()),
		location: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const now = Date.now();
		const listingId = await ctx.db.insert("listings", {
			userId: user._id,
			title: args.title,
			description: args.description,
			price: args.price,
			imageKey: args.imageKey,
			brand: args.brand,
			category: args.category,
			type: args.type,
			colors: args.colors,
			size: args.size,
			status: "available",
			createdAt: now,
			updatedAt: now,
		});

		return listingId;
	},
});

/**
 * Update an existing listing
 */
export const updateListing = mutation({
	args: {
		listingId: v.id("listings"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		price: v.optional(v.number()),
		imageKey: v.optional(v.string()),
		brand: v.optional(v.string()),
		category: v.optional(v.string()),
		type: v.optional(v.string()),
		colors: v.optional(v.array(v.string())),
		size: v.optional(v.string()),
		condition: v.optional(v.string()),
		location: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		status: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const listing = await ctx.db.get(args.listingId);
		if (!listing) throw new Error("Listing not found");

		if (listing.userId !== user._id) {
			throw new Error("Unauthorized - not the listing owner");
		}

		const now = Date.now();
		await ctx.db.patch(args.listingId, {
			...(args.title !== undefined && { title: args.title }),
			...(args.description !== undefined && { description: args.description }),
			...(args.price !== undefined && { price: args.price }),
			...(args.imageKey !== undefined && { imageKey: args.imageKey }),
			...(args.brand !== undefined && { brand: args.brand }),
			...(args.category !== undefined && { category: args.category }),
			...(args.type !== undefined && { type: args.type }),
			...(args.colors !== undefined && { colors: args.colors }),
			...(args.size !== undefined && { size: args.size }),
			...(args.status !== undefined && { status: args.status }),
			updatedAt: now,
		});

		return args.listingId;
	},
});
