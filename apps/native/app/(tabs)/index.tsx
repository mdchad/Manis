import { FlatList, View, Text } from "react-native";
import { FeedPost } from "@/components/feed-post";
import { mockPosts } from "@/data/mock-posts";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { useMemo } from "react";

export default function TabOne() {
	// Fetch real users from database
	const users = useQuery(api.userProfiles.getAllUsers, { limit: 10 });

	// Generate posts using real users and mock post data
	const feedPosts = useMemo(() => {
		if (!users || users.length === 0) return [];

		// Create posts by combining real users with mock post images/captions
		return mockPosts.slice(0, users.length).map((mockPost, index) => ({
			...mockPost,
			userId: users[index].userId,
			username: users[index].username || `user${index}`,
			userAvatar: users[index].avatarUrl || `https://i.pravatar.cc/150?u=${users[index].userId}`,
		}));
	}, [users]);

	if (!users) {
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
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
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
