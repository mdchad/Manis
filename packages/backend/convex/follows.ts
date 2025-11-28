import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Follow a user
export const follow = mutation({
	args: {
		userId: v.string(), // Better-Auth user ID
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Prevent self-follows
		if (user._id === args.userId) {
			throw new Error("Cannot follow yourself");
		}

		// Check if already following (using compound index)
		const existingFollow = await ctx.db
			.query("follows")
			.withIndex("by_user_and_follower", (q) =>
				q.eq("userId", args.userId).eq("followerId", user._id)
			)
			.first();

		if (existingFollow) {
			throw new Error("Already following this user");
		}

		// Verify the user being followed exists
		const targetUser = await authComponent.getUserById(ctx, args.userId);
		if (!targetUser) {
			throw new Error("User not found");
		}

		// Create follow relationship
		await ctx.db.insert("follows", {
			userId: args.userId,
			followerId: user._id,
		});

		return { success: true };
	},
});

// Unfollow a user
export const unfollow = mutation({
	args: {
		userId: v.string(), // Better-Auth user ID
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Find the follow relationship
		const existingFollow = await ctx.db
			.query("follows")
			.withIndex("by_user_and_follower", (q) =>
				q.eq("userId", args.userId).eq("followerId", user._id)
			)
			.first();

		if (!existingFollow) {
			throw new Error("Not following this user");
		}

		// Delete the follow relationship
		await ctx.db.delete(existingFollow._id);

		return { success: true };
	},
});

// Get follow counts for a user
export const getFollowCounts = query({
	args: {
		userId: v.string(), // Better-Auth user ID
	},
	handler: async (ctx, args) => {
		const followers = await ctx.db
			.query("follows")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();

		const following = await ctx.db
			.query("follows")
			.withIndex("by_follower", (q) => q.eq("followerId", args.userId))
			.collect();

		return {
			followerCount: followers.length,
			followingCount: following.length,
		};
	},
});

// Get list of followers for a user
export const getFollowers = query({
	args: {
		userId: v.string(), // Better-Auth user ID
		limit: v.optional(v.number()),
		offset: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;
		const offset = args.offset ?? 0;

		// Get all followers
		const followRecords = await ctx.db
			.query("follows")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();

		// Sort by creation time (most recent first)
		const sortedFollows = followRecords.sort((a, b) => b._creationTime - a._creationTime);

		// Apply pagination
		const paginatedFollows = sortedFollows.slice(offset, offset + limit);

		// Fetch follower user data
		const followers = await Promise.all(
			paginatedFollows.map(async (follow) => {
				const followerUser = await authComponent.getUserById(ctx, follow.followerId);
				if (!followerUser) return null;

				// Get user profile
				const profile = await ctx.db
					.query("userProfiles")
					.withIndex("by_userId", (q) => q.eq("userId", followerUser._id))
					.first();

				return {
					userId: followerUser._id,
					username: followerUser.username,
					displayName: profile?.displayName,
					bio: profile?.bio,
					avatarKey: profile?.avatarKey,
					followedAt: follow._creationTime,
				};
			})
		);

		// Filter out null values
		return followers.filter((f) => f !== null);
	},
});

// Get list of users that a user is following
export const getFollowing = query({
	args: {
		userId: v.string(), // Better-Auth user ID
		limit: v.optional(v.number()),
		offset: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;
		const offset = args.offset ?? 0;

		// Get all following relationships
		const followRecords = await ctx.db
			.query("follows")
			.withIndex("by_follower", (q) => q.eq("followerId", args.userId))
			.collect();

		// Sort by creation time (most recent first)
		const sortedFollows = followRecords.sort((a, b) => b._creationTime - a._creationTime);

		// Apply pagination
		const paginatedFollows = sortedFollows.slice(offset, offset + limit);

		// Fetch followed user data
		const following = await Promise.all(
			paginatedFollows.map(async (follow) => {
				const followedUser = await authComponent.getUserById(ctx, follow.userId);
				if (!followedUser) return null;

				// Get user profile
				const profile = await ctx.db
					.query("userProfiles")
					.withIndex("by_userId", (q) => q.eq("userId", followedUser._id))
					.first();

				return {
					userId: followedUser._id,
					username: followedUser.username,
					displayName: profile?.displayName,
					bio: profile?.bio,
					avatarKey: profile?.avatarKey,
					followedAt: follow._creationTime,
				};
			})
		);

		// Filter out null values
		return following.filter((f) => f !== null);
	},
});

// Check if current user is following a specific user
export const isFollowing = query({
	args: {
		userId: v.string(), // Better-Auth user ID
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) return false;

		const existingFollow = await ctx.db
			.query("follows")
			.withIndex("by_user_and_follower", (q) =>
				q.eq("userId", args.userId).eq("followerId", user._id)
			)
			.first();

		return !!existingFollow;
	},
});

// Get suggested users to follow (friends of friends algorithm)
export const getSuggestedUsers = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) return [];

		const limit = args.limit ?? 10;

		// Get users that current user follows
		const following = await ctx.db
			.query("follows")
			.withIndex("by_follower", (q) => q.eq("followerId", user._id))
			.collect();

		const followingIds = following.map((f) => f.userId);

		// Get all users that people we follow are following (friends of friends)
		const friendsOfFriends = await Promise.all(
			followingIds.map(async (userId) => {
				return await ctx.db
					.query("follows")
					.withIndex("by_follower", (q) => q.eq("followerId", userId))
					.collect();
			})
		);

		// Flatten and count occurrences
		const suggestions = new Map<string, number>();
		for (const follows of friendsOfFriends) {
			for (const follow of follows) {
				const suggestedUserId = follow.userId;

				// Skip if it's the current user or already following
				if (suggestedUserId === user._id || followingIds.includes(suggestedUserId)) {
					continue;
				}

				const count = suggestions.get(suggestedUserId) ?? 0;
				suggestions.set(suggestedUserId, count + 1);
			}
		}

		// Sort by mutual connection count (descending)
		const sortedSuggestions = Array.from(suggestions.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit);

		// Fetch user data for suggestions
		const suggestedUsers = await Promise.all(
			sortedSuggestions.map(async ([userId, mutualCount]) => {
				const suggestedUser = await authComponent.getUserById(ctx, userId);
				if (!suggestedUser) return null;

				// Get user profile
				const profile = await ctx.db
					.query("userProfiles")
					.withIndex("by_userId", (q) => q.eq("userId", suggestedUser._id))
					.first();

				return {
					userId: suggestedUser._id,
					username: suggestedUser.username,
					displayName: profile?.displayName,
					bio: profile?.bio,
					avatarKey: profile?.avatarKey,
					mutualConnectionCount: mutualCount,
				};
			})
		);

		// Filter out null values
		return suggestedUsers.filter((u) => u !== null);
	},
});
