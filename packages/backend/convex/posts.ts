import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import type { Id } from "./_generated/dataModel";
import { r2 } from "./r2";

// Create a draft post (with or without initial images)
export const createDraftPost = mutation({
	args: {
		imageKeys: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const now = Date.now();
		const postId = await ctx.db.insert("posts", {
			userId: user._id,
			caption: undefined,
			imageKeys: args.imageKeys || [],
			tags: undefined,
			location: undefined,
			taggedListings: undefined,
			isArchived: false,
			isDraft: true,
			createdAt: now,
			updatedAt: now,
		});

		return postId;
	},
});

// Update a post (for editing drafts or published posts)
export const updatePost = mutation({
	args: {
		postId: v.id("posts"),
		caption: v.optional(v.string()),
		imageKeys: v.optional(v.array(v.string())),
		tags: v.optional(v.array(v.string())),
		location: v.optional(v.string()),
		taggedListings: v.optional(v.array(v.id("listings"))),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const post = await ctx.db.get(args.postId);
		if (!post) throw new Error("Post not found");

		// Only the post owner can update
		if (post.userId !== user._id) {
			throw new Error("Not authorized to modify this post");
		}

		await ctx.db.patch(args.postId, {
			...(args.caption !== undefined && { caption: args.caption }),
			...(args.imageKeys !== undefined && { imageKeys: args.imageKeys }),
			...(args.tags !== undefined && { tags: args.tags }),
			...(args.location !== undefined && { location: args.location }),
			...(args.taggedListings !== undefined && { taggedListings: args.taggedListings }),
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});

// Publish a draft post
export const publishPost = mutation({
	args: {
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const post = await ctx.db.get(args.postId);
		if (!post) throw new Error("Post not found");

		// Only the post owner can publish
		if (post.userId !== user._id) {
			throw new Error("Not authorized to modify this post");
		}

		// Must have caption to publish
		if (!post.caption || post.caption.trim() === "") {
			throw new Error("Caption is required to publish post");
		}

		await ctx.db.patch(args.postId, {
			isDraft: false,
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});

// Create a new post (legacy - for direct publishing)
export const createPost = mutation({
	args: {
		caption: v.string(),
		imageKeys: v.array(v.string()),
		tags: v.optional(v.array(v.string())),
		location: v.optional(v.string()),
		taggedListings: v.optional(v.array(v.id("listings"))),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const postId = await ctx.db.insert("posts", {
			userId: user._id,
			caption: args.caption,
			imageKeys: args.imageKeys,
			tags: args.tags,
			location: args.location,
			taggedListings: args.taggedListings,
			isArchived: false,
			isDraft: false,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		return { postId };
	},
});

// Get posts for feed (non-archived posts from all users, ordered by most recent)
export const getFeedPosts = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 20;

		// Get non-archived, published posts ordered by most recent
		const posts = await ctx.db
			.query("posts")
			.withIndex("by_archived_and_createdAt", (q) => q.eq("isArchived", false))
			.order("desc")
			.filter((q) => q.eq(q.field("isDraft"), false))
			.take(limit);

		// Enrich posts with user data, image URLs, and engagement counts
		const enrichedPosts = await Promise.all(
			posts.map(async (post) => {
				const user = await authComponent.getAnyUserById(ctx, post.userId);
				const profile = await ctx.db
					.query("userProfiles")
					.withIndex("by_userId", (q) => q.eq("userId", post.userId))
					.first();

				// Get image URLs from R2
				const imageUrls = await Promise.all(
					post.imageKeys.map(async (key) => await r2.getUrl(key, ctx))
				);

				// Get like count
				const likes = await ctx.db
					.query("postLikes")
					.withIndex("by_post", (q) => q.eq("postId", post._id))
					.collect();

				// Get comment count
				const comments = await ctx.db
					.query("postComments")
					.withIndex("by_post", (q) => q.eq("postId", post._id))
					.collect();

				// Get avatar URL
				const avatarUrl = profile?.avatarKey ? await r2.getUrl(profile.avatarKey) : null;

				// Get tagged listings with their details
				const taggedListingsData = post.taggedListings
					? await Promise.all(
							post.taggedListings.map(async (listingId) => {
								const listing = await ctx.db.get(listingId);
								if (!listing) return null;

								// Get listing image URL from R2
								const imageUrl = listing.imageKey ? await r2.getUrl(listing.imageKey) : null;

								return {
									...listing,
									imageUrl,
								};
							})
						)
					: [];

				// Filter out any null listings (in case they were deleted)
				const validTaggedListings = taggedListingsData.filter((listing) => listing !== null);

				return {
					...post,
					username: user?.username || "Unknown",
					displayName: profile?.displayName,
					avatarUrl,
					imageUrls,
					taggedListings: validTaggedListings,
					likeCount: likes.length,
					commentCount: comments.length,
				};
			})
		);

		return enrichedPosts;
	},
});

// Get a draft post by ID (for editing)
export const getDraftPost = query({
	args: {
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const post = await ctx.db.get(args.postId);
		if (!post) throw new Error("Post not found");

		// Only the post owner can access their draft
		if (post.userId !== user._id) {
			throw new Error("Not authorized to access this post");
		}

		return post;
	},
});

// Get a single post by ID
export const getPostById = query({
	args: {
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.postId);
		if (!post) throw new Error("Post not found");

		// Get user data
		const user = await authComponent.getAnyUserById(ctx, post.userId);
		const profile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userId", (q) => q.eq("userId", post.userId))
			.first();

		// Get image URLs from R2
		const imageUrls = await Promise.all(
			post.imageKeys.map(async (key) => await r2.getUrl(key, ctx))
		);

		// Get like count
		const likes = await ctx.db
			.query("postLikes")
			.withIndex("by_post", (q) => q.eq("postId", post._id))
			.collect();

		// Get comment count
		const comments = await ctx.db
			.query("postComments")
			.withIndex("by_post", (q) => q.eq("postId", post._id))
			.collect();

		// Get avatar URL
		const avatarUrl = profile?.avatarKey ? await r2.getUrl(profile.avatarKey, ctx) : null;

		return {
			...post,
			username: user?.username || "Unknown",
			displayName: profile?.displayName,
			avatarUrl,
			imageUrls,
			likeCount: likes.length,
			commentCount: comments.length,
		};
	},
});

// Get posts by user (for profile view)
export const getUserPosts = query({
	args: {
		userId: v.string(),
		includeArchived: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const includeArchived = args.includeArchived ?? false;

		let posts;
		if (includeArchived) {
			// Get all posts for this user
			posts = await ctx.db
				.query("posts")
				.withIndex("by_userId", (q) => q.eq("userId", args.userId))
				.order("desc")
				.collect();
		} else {
			// Get only non-archived posts
			posts = await ctx.db
				.query("posts")
				.withIndex("by_userId_and_archived", (q) =>
					q.eq("userId", args.userId).eq("isArchived", false)
				)
				.order("desc")
				.collect();
		}

		// Enrich posts with image URLs and engagement counts
		const enrichedPosts = await Promise.all(
			posts.map(async (post) => {
				// Get image URLs from R2
				const imageUrls = await Promise.all(
					post.imageKeys.map(async (key) => await r2.getUrl(key, ctx))
				);

				// Get like count
				const likes = await ctx.db
					.query("postLikes")
					.withIndex("by_post", (q) => q.eq("postId", post._id))
					.collect();

				// Get comment count
				const comments = await ctx.db
					.query("postComments")
					.withIndex("by_post", (q) => q.eq("postId", post._id))
					.collect();

				return {
					...post,
					imageUrls,
					likeCount: likes.length,
					commentCount: comments.length,
					taggedListings: validTaggedListings,
				};
			})
		);

		return enrichedPosts;
	},
});

// Archive/unarchive a post
export const toggleArchivePost = mutation({
	args: {
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const post = await ctx.db.get(args.postId);
		if (!post) throw new Error("Post not found");

		// Only the post owner can archive/unarchive
		if (post.userId !== user._id) {
			throw new Error("Not authorized to modify this post");
		}

		await ctx.db.patch(args.postId, {
			isArchived: !post.isArchived,
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});

// Delete a post
export const deletePost = mutation({
	args: {
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const post = await ctx.db.get(args.postId);
		if (!post) throw new Error("Post not found");

		// Only the post owner can delete
		if (post.userId !== user._id) {
			throw new Error("Not authorized to delete this post");
		}

		// Delete associated likes
		const likes = await ctx.db
			.query("postLikes")
			.withIndex("by_post", (q) => q.eq("postId", args.postId))
			.collect();
		for (const like of likes) {
			await ctx.db.delete(like._id);
		}

		// Delete associated comments
		const comments = await ctx.db
			.query("postComments")
			.withIndex("by_post", (q) => q.eq("postId", args.postId))
			.collect();
		for (const comment of comments) {
			await ctx.db.delete(comment._id);
		}

		// Delete the post
		await ctx.db.delete(args.postId);

		// TODO: Delete images from R2 if needed
		// for (const key of post.imageKeys) {
		//   await r2.delete(key);
		// }

		return { success: true };
	},
});

// Like a post
export const likePost = mutation({
	args: {
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		// Check if already liked
		const existingLike = await ctx.db
			.query("postLikes")
			.withIndex("by_post_and_user", (q) => q.eq("postId", args.postId).eq("userId", user._id))
			.first();

		if (existingLike) {
			// Unlike
			await ctx.db.delete(existingLike._id);
			return { liked: false };
		} else {
			// Like
			await ctx.db.insert("postLikes", {
				postId: args.postId,
				userId: user._id,
				createdAt: Date.now(),
			});
			return { liked: true };
		}
	},
});

// Add a comment to a post
export const addComment = mutation({
	args: {
		postId: v.id("posts"),
		text: v.string(),
		parentCommentId: v.optional(v.id("postComments")),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error("Unauthorized");

		const commentId = await ctx.db.insert("postComments", {
			postId: args.postId,
			userId: user._id,
			text: args.text,
			parentCommentId: args.parentCommentId,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		return { commentId };
	},
});

// Get comments for a post
export const getPostComments = query({
	args: {
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		const comments = await ctx.db
			.query("postComments")
			.withIndex("by_post", (q) => q.eq("postId", args.postId))
			.order("desc")
			.collect();

		// Enrich comments with user data
		const enrichedComments = await Promise.all(
			comments.map(async (comment) => {
				const user = await authComponent.getAnyUserById(ctx, comment.userId);
				const profile = await ctx.db
					.query("userProfiles")
					.withIndex("by_userId", (q) => q.eq("userId", comment.userId))
					.first();

				const avatarUrl = profile?.avatarKey ? await r2.getUrl(profile.avatarKey, ctx) : null;

				return {
					...comment,
					username: user?.username || "Unknown",
					displayName: profile?.displayName,
					avatarUrl,
				};
			})
		);

		return enrichedComments;
	},
});
