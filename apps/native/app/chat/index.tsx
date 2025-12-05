import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Container } from "@/components/container";
import { Avatar } from "heroui-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";

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
								<Text className="text-xs text-gray-400 mb-1">
									{new Date(chat.lastMessageAt).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</Text>
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
