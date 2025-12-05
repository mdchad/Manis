import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

/**
 * Send a message in a chat
 */
export const sendMessage = mutation({
	args: {
		chatId: v.id("chats"),
		text: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Verify user is part of this chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error("Chat not found");

		if (chat.buyerId !== user._id && chat.sellerId !== user._id) {
			throw new Error("Unauthorized");
		}

		// Create the message
		const now = Date.now();
		const messageId = await ctx.db.insert("messages", {
			chatId: args.chatId,
			senderId: user._id,
			text: args.text,
			type: "user",
			isRead: false,
			createdAt: now,
		});

		// Update chat's lastMessageAt and lastMessageText
		await ctx.db.patch(args.chatId, {
			lastMessageAt: now,
			lastMessageText: args.text,
			updatedAt: now,
		});

		return messageId;
	},
});

/**
 * Get all messages for a chat
 */
export const getMessages = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Verify user is part of this chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error("Chat not found");

		if (chat.buyerId !== user._id && chat.sellerId !== user._id) {
			throw new Error("Unauthorized");
		}

		// Get messages sorted by creation time
		const messages = await ctx.db
			.query("messages")
			.withIndex("by_chat_and_createdAt", (q) => q.eq("chatId", args.chatId))
			.order("asc")
			.collect();

		return messages;
	},
});

/**
 * Mark messages as read in a chat
 */
export const markMessagesAsRead = mutation({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Verify user is part of this chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error("Chat not found");

		if (chat.buyerId !== user._id && chat.sellerId !== user._id) {
			throw new Error("Unauthorized");
		}

		// Get all unread messages sent by the other user
		const messages = await ctx.db
			.query("messages")
			.withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
			.collect();

		// Mark messages as read (only messages from other user)
		for (const message of messages) {
			if (message.senderId !== user._id && !message.isRead) {
				await ctx.db.patch(message._id, { isRead: true });
			}
		}
	},
});

/**
 * Send a system message (e.g., "Price updated to $40")
 */
export const sendSystemMessage = mutation({
	args: {
		chatId: v.id("chats"),
		text: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Verify user is part of this chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new Error("Chat not found");

		if (chat.buyerId !== user._id && chat.sellerId !== user._id) {
			throw new Error("Unauthorized");
		}

		// Create system message
		const now = Date.now();
		const messageId = await ctx.db.insert("messages", {
			chatId: args.chatId,
			senderId: user._id,
			text: args.text,
			type: "system",
			isRead: true, // System messages are always marked as read
			createdAt: now,
		});

		// Update chat's lastMessageAt
		await ctx.db.patch(args.chatId, {
			lastMessageAt: now,
			updatedAt: now,
		});

		return messageId;
	},
});

/**
 * Get unread message count for current user across all chats
 */
export const getUnreadCount = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Get all chats where user is participant
		const buyerChats = await ctx.db
			.query("chats")
			.withIndex("by_buyer", (q) => q.eq("buyerId", user._id))
			.collect();

		const sellerChats = await ctx.db
			.query("chats")
			.withIndex("by_seller", (q) => q.eq("sellerId", user._id))
			.collect();

		const allChats = [...buyerChats, ...sellerChats];

		// Count unread messages across all chats
		let unreadCount = 0;
		for (const chat of allChats) {
			const unreadMessages = await ctx.db
				.query("messages")
				.withIndex("by_chat", (q) => q.eq("chatId", chat._id))
				.filter((q) => q.and(q.eq(q.field("isRead"), false), q.neq(q.field("senderId"), user._id)))
				.collect();

			unreadCount += unreadMessages.length;
		}

		return unreadCount;
	},
});
