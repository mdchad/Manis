import { FlatList, View, Text, RefreshControl, Image, Dimensions } from "react-native";
import { FeedPost } from "@/components/feed-post";
import { mockPosts } from "@/data/mock-posts";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import React, { useMemo, useState } from "react";
import { Skeleton } from "heroui-native";

export default function TabOne() {
	const [refreshing, setRefreshing] = useState(false);

	// Fetch real posts from database
	const realPosts = useQuery(api.posts.getFeedPosts, { limit: 20 });
	// Fetch real users for mock posts
	const users = useQuery(api.userProfiles.getAllUsers, { limit: 10 });

	// Combine real posts with mock posts
	const feedPosts = useMemo(() => {
		const posts = [];

		// Add real posts first
		if (realPosts && realPosts.length > 0) {
			posts.push(
				...realPosts.map((post) => ({
					id: post._id,
					userId: post.userId,
					userAvatar: post.avatarUrl || `https://i.pravatar.cc/150?u=${post.userId}`,
					username: post.username,
					images: post.imageUrls,
					caption: post.caption,
					likes: post.likeCount,
					listingImages: [],
					isRealPost: true,
				}))
			);
		}

		// Add mock posts if we have users
		if (users && users.length > 0) {
			const mockPostsToAdd = mockPosts.slice(0, users.length).map((mockPost, index) => ({
				...mockPost,
				userId: users[index].userId,
				username: users[index].username || `user${index}`,
				userAvatar: users[index].avatarUrl || `https://i.pravatar.cc/150?u=${users[index].userId}`,
				isRealPost: false,
			}));
			posts.push(...mockPostsToAdd);
		}

		return posts;
	}, [realPosts, users]);

	const onRefresh = async () => {
		setRefreshing(true);
		// The query will automatically refetch
		setTimeout(() => setRefreshing(false), 1000);
	};

	if (!realPosts && !users) {
		return (
			<View className="flex-1 bg-brand-background">
				<View className="flex-row items-center px-4 py-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<Skeleton className="ml-3 h-5 w-32 rounded-md" />
				</View>
				{/*<Text className="text-foreground">Loading...</Text>*/}
				<View className="mt-4">
					<Skeleton className="h-100 w-full rounded-md" />
				</View>

				<View className="px-4 py-2">
					<Skeleton className="h-6 w-full rounded-md" />
				</View>
			</View>
		);
	}

	if (feedPosts.length === 0) {
		return (
			<View className="flex-1 bg-brand-background items-center justify-center px-6">
				<Text className="text-foreground text-lg text-center mb-2">No posts yet</Text>
				<Text className="text-muted-foreground text-center">Be the first to share something!</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-brand-background">
			<FlatList
				data={feedPosts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<FeedPost
						userId={item.userId}
						userAvatar={item.userAvatar}
						username={item.username}
						images={item.images}
						caption={item.caption}
						likes={item.likes}
						listingImages={item.listingImages}
					/>
				)}
				contentContainerClassName="bg-brand-background"
				showsVerticalScrollIndicator={false}
				// refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			/>
		</View>
	);
}
