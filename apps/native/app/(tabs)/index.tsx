import { FlatList, View, Text, RefreshControl } from "react-native";
import { FeedPost } from "@/components/feed-post";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import React, { useState } from "react";
import { Skeleton } from "heroui-native";

export default function TabOne() {
	const [refreshing, setRefreshing] = useState(false);

	// Fetch posts from database
	const posts = useQuery(api.posts.getFeedPosts, { limit: 20 });

	const onRefresh = async () => {
		setRefreshing(true);
		// The query will automatically refetch
		setTimeout(() => setRefreshing(false), 1000);
	};

	if (!posts) {
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

	if (posts.length === 0) {
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
				data={posts}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<FeedPost
						userId={item.userId}
						userAvatar={item.avatarUrl || ""}
						username={item.username}
						images={item.imageUrls}
						caption={item.caption}
						likes={item.likeCount}
						listingImages={item.taggedListings || []}
					/>
				)}
				contentContainerClassName="bg-brand-background"
				showsVerticalScrollIndicator={false}
				// refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			/>
		</View>
	);
}
