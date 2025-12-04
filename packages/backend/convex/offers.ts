import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

/**
 * Create or update an offer (buyer only)
 * If pending offer exists, update it instead of creating new one
 */
export const makeOffer = mutation({
	args: {
		chatId: v.id("chats"),
		amount: v.number(),
		message: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Get chat details
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error("Chat not found");

		// Only buyer can make offers
		if (chat.buyerId !== user.id) {
			throw new Error("Only the buyer can make offers");
		}

		// Check if there's already a pending offer
		const existingOffer = await ctx.db
			.query("offers")
			.withIndex("by_chat_and_status", (q) => q.eq("chatId", args.chatId).eq("status", "pending"))
			.first();

		const now = Date.now();
		const isEdit = !!existingOffer;

		if (existingOffer) {
			// Update existing offer
			await ctx.db.patch(existingOffer._id, {
				amount: args.amount,
				message: args.message,
				updatedAt: now,
			});

			// Send system message: "Buyer edited the offer"
			await ctx.db.insert("messages", {
				chatId: args.chatId,
				senderId: user.id,
				text: "Buyer edited the offer",
				type: "offer_activity",
				offerId: existingOffer._id,
				isRead: false,
				createdAt: now,
			});

			// Update chat
			await ctx.db.patch(args.chatId, {
				lastMessageAt: now,
				lastMessageText: "Buyer edited the offer",
				updatedAt: now,
			});

			return existingOffer._id;
		} else {
			// Create new offer
			const offerId = await ctx.db.insert("offers", {
				chatId: args.chatId,
				listingId: chat.listingId,
				buyerId: user.id,
				sellerId: chat.sellerId,
				amount: args.amount,
				message: args.message,
				status: "pending",
				createdAt: now,
				updatedAt: now,
			});

			// Send system message: "Buyer made an offer"
			await ctx.db.insert("messages", {
				chatId: args.chatId,
				senderId: user.id,
				text: "Buyer made an offer",
				type: "offer_activity",
				offerId,
				isRead: false,
				createdAt: now,
			});

			// Update chat
			await ctx.db.patch(args.chatId, {
				lastMessageAt: now,
				lastMessageText: "Buyer made an offer",
				updatedAt: now,
			});

			return offerId;
		}
	},
});

/**
 * Accept an offer (seller only)
 */
export const acceptOffer = mutation({
	args: {
		offerId: v.id("offers"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const offer = await ctx.db.get(args.offerId);
		if (!offer) throw new Error("Offer not found");

		// Only seller can accept
		if (offer.sellerId !== user.id) {
			throw new Error("Only the seller can accept offers");
		}

		// Can only accept pending offers
		if (offer.status !== "pending") {
			throw new Error("Offer is no longer pending");
		}

		const now = Date.now();

		// Update offer status
		await ctx.db.patch(args.offerId, {
			status: "accepted",
			resolvedAt: now,
			updatedAt: now,
		});

		// Update listing status to reserved/sold
		await ctx.db.patch(offer.listingId, {
			status: "reserved",
			updatedAt: now,
		});

		// Send system message: "Seller accepted the offer"
		await ctx.db.insert("messages", {
			chatId: offer.chatId,
			senderId: user.id,
			text: "Seller accepted the offer",
			type: "offer_activity",
			offerId: args.offerId,
			isRead: false,
			createdAt: now,
		});

		// Update chat
		await ctx.db.patch(offer.chatId, {
			lastMessageAt: now,
			lastMessageText: "Seller accepted the offer",
			updatedAt: now,
		});
	},
});

/**
 * Decline an offer (seller only)
 */
export const declineOffer = mutation({
	args: {
		offerId: v.id("offers"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const offer = await ctx.db.get(args.offerId);
		if (!offer) throw new Error("Offer not found");

		// Only seller can decline
		if (offer.sellerId !== user.id) {
			throw new Error("Only the seller can decline offers");
		}

		// Can only decline pending offers
		if (offer.status !== "pending") {
			throw new Error("Offer is no longer pending");
		}

		const now = Date.now();

		// Update offer status
		await ctx.db.patch(args.offerId, {
			status: "declined",
			resolvedAt: now,
			updatedAt: now,
		});

		// Send system message: "Seller declined the offer"
		await ctx.db.insert("messages", {
			chatId: offer.chatId,
			senderId: user.id,
			text: "Seller declined the offer",
			type: "offer_activity",
			offerId: args.offerId,
			isRead: false,
			createdAt: now,
		});

		// Update chat
		await ctx.db.patch(offer.chatId, {
			lastMessageAt: now,
			lastMessageText: "Seller declined the offer",
			updatedAt: now,
		});
	},
});

/**
 * Cancel an offer (buyer only)
 * Can only cancel pending offers
 */
export const cancelOffer = mutation({
	args: {
		offerId: v.id("offers"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const offer = await ctx.db.get(args.offerId);
		if (!offer) throw new Error("Offer not found");

		// Only buyer can cancel
		if (offer.buyerId !== user.id) {
			throw new Error("Only the buyer can cancel offers");
		}

		// Can only cancel pending offers
		if (offer.status !== "pending") {
			throw new Error("Offer is no longer pending");
		}

		const now = Date.now();

		// Update offer status
		await ctx.db.patch(args.offerId, {
			status: "declined",
			resolvedAt: now,
			updatedAt: now,
		});

		// Send system message: "Buyer cancelled the offer"
		await ctx.db.insert("messages", {
			chatId: offer.chatId,
			senderId: user.id,
			text: "Buyer cancelled the offer",
			type: "offer_activity",
			offerId: args.offerId,
			isRead: false,
			createdAt: now,
		});

		// Update chat
		await ctx.db.patch(offer.chatId, {
			lastMessageAt: now,
			lastMessageText: "Buyer cancelled the offer",
			updatedAt: now,
		});
	},
});

/**
 * Get the current active offer for a chat
 * Returns the most recent offer (any status) to show in pinned card
 */
export const getActiveOffer = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Verify user is part of this chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error("Chat not found");

		if (chat.buyerId !== user.id && chat.sellerId !== user.id) {
			throw new Error("Unauthorized");
		}

		// Get the most recent offer (any status)
		const offers = await ctx.db
			.query("offers")
			.withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
			.order("desc")
			.take(1);

		if (offers.length === 0) {
			return null;
		}

		const offer = offers[0];

		return {
			...offer,
			isBuyer: offer.buyerId === user.id,
			isSeller: offer.sellerId === user.id,
		};
	},
});

/**
 * Get all offers for a chat (for history/debugging)
 */
export const getChatOffers = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Verify user is part of this chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error("Chat not found");

		if (chat.buyerId !== user.id && chat.sellerId !== user.id) {
			throw new Error("Unauthorized");
		}

		const offers = await ctx.db
			.query("offers")
			.withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
			.order("desc")
			.collect();

		return offers.map((offer) => ({
			...offer,
			isBuyer: offer.buyerId === user.id,
			isSeller: offer.sellerId === user.id,
		}));
	},
});
