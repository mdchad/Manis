import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent, getUserById } from "./auth";
import { r2 } from "./r2";

/**
 * Start or get existing chat for a listing
 * Returns existing chat if buyer already messaged about this listing
 */
export const startChat = mutation({
	args: {
		listingId: v.id("listings"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Get the listing to find the seller
		const listing = await ctx.db.get(args.listingId);
		if (!listing) throw new Error("Listing not found");

		// Prevent seller from chatting with themselves
		if (listing.userId === user._id) {
			throw new Error("Cannot start a chat with your own listing");
		}

		// Check if chat already exists for this listing + buyer
		const existingChat = await ctx.db
			.query("chats")
			.withIndex("by_listing_and_buyer", (q) =>
				q.eq("listingId", args.listingId).eq("buyerId", user._id)
			)
			.first();

		if (existingChat) {
			return existingChat._id;
		}

		// Create new chat
		const now = Date.now();
		const chatId = await ctx.db.insert("chats", {
			listingId: args.listingId,
			buyerId: user._id,
			sellerId: listing.userId,
			lastMessageAt: now,
			createdAt: now,
			updatedAt: now,
		});

		return chatId;
	},
});

/**
 * Get all chats for the current user (as buyer or seller)
 * Sorted by most recent message first
 */
export const getUserChats = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Get chats where user is buyer
		const buyerChats = await ctx.db
			.query("chats")
			.withIndex("by_buyer_and_lastMessage", (q) => q.eq("buyerId", user._id))
			.order("desc")
			.collect();

		// Get chats where user is seller
		const sellerChats = await ctx.db
			.query("chats")
			.withIndex("by_seller_and_lastMessage", (q) => q.eq("sellerId", user._id))
			.order("desc")
			.collect();

		// Combine and sort by lastMessageAt
		const allChats = [...buyerChats, ...sellerChats].sort(
			(a, b) => b.lastMessageAt - a.lastMessageAt
		);

		// Enrich with listing and user details
		const enrichedChats = await Promise.all(
			allChats.map(async (chat) => {
				const listing = await ctx.db.get(chat.listingId);
				const otherUserId = chat.buyerId === user._id ? chat.sellerId : chat.buyerId;

				// Get other user's profile
				const otherUserProfile = await ctx.db
					.query("userProfiles")
					.withIndex("by_userId", (q) => q.eq("userId", otherUserId))
					.first();

				// Get other user from auth component
				const otherUser = await authComponent.getAnyUserById(ctx, otherUserId);
				const avatarUrl = otherUserProfile?.avatarKey
					? await r2.getUrl(otherUserProfile.avatarKey)
					: "";

				return {
					...chat,
					listing,
					otherUser: {
						id: otherUserId,
						name: otherUserProfile?.displayName || otherUser?.name || "Unknown",
						avatarUrl: avatarUrl,
					},
					isSeller: chat.sellerId === user._id,
				};
			})
		);

		return enrichedChats;
	},
});

/**
 * Get a specific chat by ID with details
 */
export const getChatById = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error("Chat not found");

		// Verify user is part of this chat
		if (chat.buyerId !== user._id && chat.sellerId !== user._id) {
			throw new Error("Unauthorized");
		}

		// Get listing details
		const listing = await ctx.db.get(chat.listingId);

		// Get other user details
		const otherUserId = chat.buyerId === user._id ? chat.sellerId : chat.buyerId;
		const otherUserProfile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", otherUserId))
			.first();

		const otherUser = await authComponent.getAnyUserById(ctx, otherUserId);
		const avatarUrl = otherUserProfile?.avatarKey
			? await r2.getUrl(otherUserProfile.avatarKey)
			: "";

		return {
			...chat,
			listing,
			otherUser: {
				id: otherUserId,
				name: otherUserProfile?.displayName || otherUser?.name || "Unknown",
				avatarUrl: avatarUrl,
			},
			isSeller: chat.sellerId === user._id,
		};
	},
});
