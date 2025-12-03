import { View, ScrollView, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { FeedPost } from "@/components/feed-post";
import { Skeleton } from "heroui-native";
import { Id } from "@manis/backend/convex/_generated/dataModel";
import { Container } from "@/components/container";

export default function PostScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();

	// Fetch the single post
	const post = useQuery(api.posts.getPostById, id ? { postId: id as Id<"posts"> } : "skip");

	if (!post) {
		return (
			<View className="flex-1 bg-brand-background">
				<View className="flex-row items-center px-4 py-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<Skeleton className="ml-3 h-5 w-32 rounded-md" />
				</View>
				<View className="mt-4">
					<Skeleton className="h-100 w-full rounded-md" />
				</View>
				<View className="px-4 py-2">
					<Skeleton className="h-6 w-full rounded-md" />
				</View>
			</View>
		);
	}

	return (
		<Container edges={["top"]}>
			<ScrollView>
				<FeedPost
					userId={post.userId}
					userAvatar={post.avatarUrl || `https://i.pravatar.cc/150?u=${post.userId}`}
					username={post.username}
					images={post.imageUrls}
					caption={post.caption}
					likes={post.likeCount}
					listingImages={[]}
				/>
			</ScrollView>
		</Container>
	);
}
