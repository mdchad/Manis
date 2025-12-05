import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Container } from "@/components/container";
import { Avatar } from "heroui-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";

// Mock chat data
const mockChats = [
	{
		id: "1",
		userId: "user1",
		username: "fadhilahyacob",
		avatarUrl: "https://i.pravatar.cc/150?img=1",
		lastMessage: "Hey! I'm interested in the dress you posted",
		timestamp: "2m ago",
		unreadCount: 3,
	},
	{
		id: "2",
		userId: "user2",
		username: "john.doe",
		avatarUrl: "https://i.pravatar.cc/150?img=5",
		lastMessage: "Is this still available?",
		timestamp: "1h ago",
		unreadCount: 1,
	},
	{
		id: "3",
		userId: "user3",
		username: "jane doe",
		avatarUrl: "https://i.pravatar.cc/150?img=9",
		lastMessage: "Thank you! The item arrived perfectly",
		timestamp: "3h ago",
		unreadCount: 0,
	},
	{
		id: "4",
		userId: "user4",
		username: "irsyad",
		avatarUrl: "https://i.pravatar.cc/150?img=10",
		lastMessage: "Can you do $80 for this?",
		timestamp: "5h ago",
		unreadCount: 0,
	},
	{
		id: "5",
		userId: "user5",
		username: "nur",
		avatarUrl: "https://i.pravatar.cc/150?img=16",
		lastMessage: "Okay, I'll take it!",
		timestamp: "1d ago",
		unreadCount: 0,
	},
	{
		id: "6",
		userId: "user6",
		username: "aleena",
		avatarUrl: "https://i.pravatar.cc/150?img=20",
		lastMessage: "Do you have this in size M?",
		timestamp: "2d ago",
		unreadCount: 0,
	},
];

export default function Index() {
	const router = useRouter();
	const chats = useQuery(api.chats.getUserChats);

	const handleChatPress = (chatId: string) => {
		router.push(`/chat/${chatId}`);
	};

	if (!chats)
		return (
			<View>
				<Text>...Loading</Text>
			</View>
		);

	return (
		<Container edges={["top"]}>
			<View className="flex-1 bg-brand-background">
				{/* Header */}
				<View className="px-4 py-4 border-b border-gray-200">
					<Text className="text-2xl font-bold text-foreground">Messages</Text>
				</View>

				{/* Chat List */}
				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
					{chats.map((chat) => (
						<TouchableOpacity
							key={chat._id}
							onPress={() => handleChatPress(chat._id)}
							className="flex-row items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
						>
							{/* Avatar */}
							<Avatar size="md" alt={chat.otherUser.name}>
								<Avatar.Image source={{ uri: chat.otherUser.avatarUrl }} />
								<Avatar.Fallback />
							</Avatar>

							{/* Chat Info */}
							<View className="flex-1 ml-3">
								<Text className="text-base font-semibold text-foreground">
									{chat.otherUser.name}
								</Text>
								<Text
									className={`text-sm mt-0.5 ${
										chat?.unreadCount > 0 ? "font-medium text-foreground" : "text-gray-500"
									}`}
									numberOfLines={1}
								>
									{chat.lastMessageText}
								</Text>
							</View>

							{/* Right Side - Timestamp and Unread Badge */}
							<View className="items-end ml-2">
								<Text className="text-xs text-gray-400 mb-1">{chat.lastMessageAt}</Text>
								{chat?.unreadCount > 0 && (
									<View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
										<Text className="text-white text-xs font-bold">
											{chat?.unreadCount > 99 ? "99+" : chat.unreadCount}
										</Text>
									</View>
								)}
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</Container>
	);
}
