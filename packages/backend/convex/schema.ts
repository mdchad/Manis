import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),
	userProfiles: defineTable({
		// Reference to the Better-Auth user (_id from user table)
		userId: v.string(),
		// Avatar stored in R2
		avatarKey: v.optional(v.string()),
		// Bio/description
		bio: v.optional(v.string()),
		// User preferences
		language: v.optional(v.string()),
		theme: v.optional(v.string()),
		// Additional profile fields
		displayName: v.optional(v.string()),
		location: v.optional(v.string()),
		website: v.optional(v.string()),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_userId", ["userId"]),
	follows: defineTable({
		// User being followed (Better-Auth user ID from separate component)
		userId: v.string(),
		// User who is following (Better-Auth user ID from separate component)
		followerId: v.string(),
	})
		.index("by_user", ["userId"])
		.index("by_follower", ["followerId"])
		.index("by_user_and_follower", ["userId", "followerId"]),
	posts: defineTable({
		// Author of the post (Better-Auth user ID)
		userId: v.string(),
		// Caption/description
		caption: v.string(),
		// Array of image keys stored in R2 (supports multiple images per post)
		imageKeys: v.array(v.string()),
		// Tags (e.g., fashion, style, etc.)
		tags: v.optional(v.array(v.string())),
		// Location
		location: v.optional(v.string()),
		// Tagged listings (references to product listings)
		taggedListings: v.optional(v.array(v.id("listings"))),
		// Archive status (hidden from public feed but visible in profile archive)
		isArchived: v.boolean(),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_userId", ["userId"])
		.index("by_userId_and_archived", ["userId", "isArchived"])
		.index("by_createdAt", ["createdAt"])
		.index("by_archived_and_createdAt", ["isArchived", "createdAt"]),
	postLikes: defineTable({
		// Post being liked
		postId: v.id("posts"),
		// User who liked (Better-Auth user ID)
		userId: v.string(),
		// Timestamp
		createdAt: v.number(),
	})
		.index("by_post", ["postId"])
		.index("by_user", ["userId"])
		.index("by_post_and_user", ["postId", "userId"]),
	postComments: defineTable({
		// Post being commented on
		postId: v.id("posts"),
		// User who commented (Better-Auth user ID)
		userId: v.string(),
		// Comment text
		text: v.string(),
		// Parent comment (for replies)
		parentCommentId: v.optional(v.id("postComments")),
		// Timestamp
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_post", ["postId"])
		.index("by_user", ["userId"])
		.index("by_parent", ["parentCommentId"]),
	listings: defineTable({
		// User who created the listing (Better-Auth user ID)
		userId: v.string(),
		// Listing details
		title: v.string(),
		description: v.optional(v.string()),
		price: v.optional(v.number()),
		// Image key stored in R2
		imageKey: v.optional(v.string()),
		// Category, brand, etc.
		category: v.optional(v.string()),
		brand: v.optional(v.string()),
		// Core search metadata (keyword search)
		type: v.optional(v.string()), // e.g., shawl, pashmina, scarf
		colors: v.optional(v.array(v.string())), // e.g., ["black", "red"]
		// Filter metadata (dropdown filters)
		size: v.optional(v.string()), // e.g., S, M, L, Free Size
		// Status (available, sold, etc.)
		status: v.string(),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_userId", ["userId"])
		.index("by_status", ["status"])
		.index("by_createdAt", ["createdAt"])
		// Search indexes for core metadata
		.index("by_brand", ["brand"])
		.index("by_type", ["type"])
		.index("by_status_and_createdAt", ["status", "createdAt"]),
	chats: defineTable({
		// The listing being discussed
		listingId: v.id("listings"),
		// Buyer (user initiating the chat)
		buyerId: v.string(),
		// Seller (listing owner)
		sellerId: v.string(),
		// Last message timestamp (for sorting chat list)
		lastMessageAt: v.number(),
		// Last message preview (for chat list UI)
		lastMessageText: v.optional(v.string()),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_listing", ["listingId"])
		.index("by_buyer", ["buyerId"])
		.index("by_seller", ["sellerId"])
		// Prevent duplicate chats: one chat per listing per buyer
		.index("by_listing_and_buyer", ["listingId", "buyerId"])
		// For displaying user's chat list sorted by recent activity
		.index("by_buyer_and_lastMessage", ["buyerId", "lastMessageAt"])
		.index("by_seller_and_lastMessage", ["sellerId", "lastMessageAt"]),
	messages: defineTable({
		// Chat this message belongs to
		chatId: v.id("chats"),
		// Sender (Better-Auth user ID)
		senderId: v.string(),
		// Message content
		text: v.string(),
		// Message type: "user" for regular messages, "system" for automated messages
		type: v.optional(v.string()), // "user" | "system" | "offer_activity"
		// Reference to offer (for offer activity messages)
		offerId: v.optional(v.id("offers")),
		// Read status
		isRead: v.boolean(),
		// Timestamp
		createdAt: v.number(),
	})
		.index("by_chat", ["chatId"])
		.index("by_chat_and_createdAt", ["chatId", "createdAt"]),
	offers: defineTable({
		// Chat this offer belongs to
		chatId: v.id("chats"),
		// Listing being negotiated
		listingId: v.id("listings"),
		// Buyer making the offer
		buyerId: v.string(),
		// Seller receiving the offer
		sellerId: v.string(),
		// Offer amount
		amount: v.number(),
		// Optional message with the offer
		message: v.optional(v.string()),
		// Status: pending, accepted, declined, expired
		status: v.string(),
		// When accepted/declined
		resolvedAt: v.optional(v.number()),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_chat", ["chatId"])
		.index("by_listing", ["listingId"])
		.index("by_buyer", ["buyerId"])
		.index("by_seller", ["sellerId"])
		.index("by_status", ["status"])
		// Get the active offer for a chat (only one pending offer per chat)
		.index("by_chat_and_status", ["chatId", "status"]),
});
