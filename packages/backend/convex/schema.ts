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
		// Status (available, sold, etc.)
		status: v.string(),
		// Timestamps
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_userId", ["userId"])
		.index("by_status", ["status"])
		.index("by_createdAt", ["createdAt"]),
});
