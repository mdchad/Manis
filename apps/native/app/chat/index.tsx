import { View, ScrollView, Text, TouchableOpacity, Image } from "react-native";
import { Container } from "@/components/container";
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
							className="flex-row items-center px-4 py-3 border-b border-gray-100 active:bg-gray-200"
						>
							{/* Chat Info */}
							<View className="flex-1 flex-row items-start">
								{/* Left side: Username and Message */}
								<View className="flex-1">
									<Text className="text-base font-semibold text-foreground">
										{chat.otherUser.name}
									</Text>
									<Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
										{chat.lastMessageText}
									</Text>
								</View>

								{/* Right side: Timestamp and Unread Badge */}
								<View className="items-end ml-2">
									<Text className="text-xs text-gray-400">
										{new Date(chat.lastMessageAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</Text>
									{chat?.unreadCount > 0 && (
										<View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 mt-1">
											<Text className="text-white text-xs font-bold">
												{chat?.unreadCount > 99 ? "99+" : chat.unreadCount}
											</Text>
										</View>
									)}
								</View>
							</View>

							{/* Listing Image */}
							{chat.listing?.imageUrl && (
								<Image
									source={{ uri: chat.listing.imageUrl }}
									className="w-16 h-16 rounded-lg ml-3"
									resizeMode="cover"
								/>
							)}
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</Container>
	);
}
