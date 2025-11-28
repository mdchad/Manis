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
});
