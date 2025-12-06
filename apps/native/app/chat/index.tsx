import { View, ScrollView, Text, TouchableOpacity, Image } from "react-native";
import { Container } from "@/components/container";
import { Skeleton } from "heroui-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";

export default function Index() {
	const router = useRouter();
	const chats = useQuery(api.chats.getUserChats);

	const handleChatPress = (chatId: string) => {
		router.push(`/chat/${chatId}`);
	};

	if (chats === undefined) {
		return (
			<Container edges={["top"]}>
				<View className="flex-1 bg-brand-background">
					{/* Header */}
					<View className="px-4 py-4 border-b border-gray-200">
						<Text className="text-2xl font-bold text-foreground">Messages</Text>
					</View>

					{/* Skeleton Loading */}
					<View className="px-4 py-3">
						{[1, 2, 3].map((i) => (
							<View key={i} className="flex-row items-start mb-4">
								<View className="flex-1 flex-row items-start">
									<View className="flex-1">
										<Skeleton className="h-5 w-32 rounded-md" />
										<Skeleton className="h-4 w-48 rounded-md mt-2" />
									</View>
									<View className="items-end ml-2">
										<Skeleton className="h-3 w-12 rounded-md" />
									</View>
								</View>
								<Skeleton className="w-16 h-16 rounded-lg ml-3" />
							</View>
						))}
					</View>
				</View>
			</Container>
		);
	}

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
