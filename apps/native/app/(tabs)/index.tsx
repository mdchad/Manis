import { Container } from "@/components/container";
import { FlatList } from "react-native";
import { FeedPost } from "@/components/feed-post";
import { mockPosts } from "@/data/mock-posts";

export default function TabOne() {
	return (
		<Container>
			<FlatList
				data={mockPosts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<FeedPost
						userAvatar={item.userAvatar}
						username={item.username}
						images={item.images}
						caption={item.caption}
						likes={item.likes}
					/>
				)}
				showsVerticalScrollIndicator={false}
			/>
		</Container>
	);
}
