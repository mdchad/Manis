import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send, ImageIcon, Smile } from "lucide-react-native";
import { Container } from "@/components/container";
import { Avatar, Button, TextField } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock message data
const mockMessages = [
	{
		id: "1",
		text: "Hey! I'm interested in the dress you posted",
		senderId: "user1",
		timestamp: "10:30 AM",
		isCurrentUser: false,
	},
	{
		id: "2",
		text: "Hi! Yes, it's still available. Which one are you interested in?",
		senderId: "currentUser",
		timestamp: "10:32 AM",
		isCurrentUser: true,
	},
	{
		id: "3",
		text: "The floral midi dress! Is it in good condition?",
		senderId: "user1",
		timestamp: "10:33 AM",
		isCurrentUser: false,
	},
	{
		id: "4",
		text: "Yes, it's in excellent condition! Only worn twice. I can send you more photos if you'd like",
		senderId: "currentUser",
		timestamp: "10:35 AM",
		isCurrentUser: true,
	},
	{
		id: "5",
		text: "That would be great, thanks!",
		senderId: "user1",
		timestamp: "10:36 AM",
		isCurrentUser: false,
	},
	{
		id: "6",
		text: "What's your offer for it?",
		senderId: "user1",
		timestamp: "10:37 AM",
		isCurrentUser: false,
	},
];

// Mock user data
const mockUser = {
	id: "user1",
	username: "fadhilahyacob",
	avatarUrl: "https://i.pravatar.cc/150?img=1",
};

export default function ChatMessage() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const [message, setMessage] = useState("");
	const insets = useSafeAreaInsets();

	const handleSend = () => {
		if (message.trim()) {
			// In real app, send message to backend
			console.log("Sending message:", message);
			setMessage("");
		}
	};

	return (
		<Container edges={["top"]}>
			<View className="flex-1 bg-brand-background">
				{/* Header */}
				<View className="flex-row items-center px-4 py-3 border-b border-gray-200">
					<TouchableOpacity onPress={() => router.back()} className="mr-3">
						<ArrowLeft size={24} color="black" />
					</TouchableOpacity>

					<Avatar size="sm" alt={mockUser.username} className="mr-3">
						<Avatar.Image source={{ uri: mockUser.avatarUrl }} />
						<Avatar.Fallback />
					</Avatar>

					<Text className="flex-1 text-lg font-semibold text-foreground">{mockUser.username}</Text>
				</View>

				{/* Messages */}
				<ScrollView
					className="px-4 py-4"
					contentContainerStyle={{ paddingBottom: 20 }}
					showsVerticalScrollIndicator={false}
				>
					{mockMessages.map((msg) => (
						<View
							key={msg.id}
							className={`flex-1 mb-3 flex-row ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}
						>
							{!msg.isCurrentUser && (
								<Avatar size="sm" alt={mockUser.username} className="mr-2 mt-1">
									<Avatar.Image source={{ uri: mockUser.avatarUrl }} />
									<Avatar.Fallback />
								</Avatar>
							)}

							<View
								className={`max-w-[75%] px-4 py-3 rounded-2xl ${
									msg.isCurrentUser
										? "bg-primary rounded-br-sm"
										: "bg-white rounded-bl-sm border border-gray-200"
								}`}
							>
								<Text className={`text-sm ${msg.isCurrentUser ? "text-white" : "text-foreground"}`}>
									{msg.text}
								</Text>
								<Text
									className={`text-xs mt-1 ${
										msg.isCurrentUser ? "text-white/70" : "text-gray-400"
									}`}
								>
									{msg.timestamp}
								</Text>
							</View>
						</View>
					))}
				</ScrollView>

				{/* Input Area */}
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
				>
					<View
						className="bg-white border-t flex flex-row items-center border-gray-200 px-4 py-3 w-full"
						style={{ paddingBottom: insets.bottom + 12 }}
					>
						{/*<View className="flex-row items-center w-full">*/}
						{/* Image Button */}
						{/*<TouchableOpacity className="mr-3">*/}
						{/*	<ImageIcon size={24} color="#9ca3af" />*/}
						{/*</TouchableOpacity>*/}

						{/* Text Input */}
						<View className="w-5/6">
							<TextField>
								<TextField.Input
									colors={{
										focusBackground: "#f3f4f6",
										blurBackground: "#f3f4f6",
									}}
									placeholder="Type your message..."
									// multiline
									// maxLength={500}
									// numberOfLines={4}
								>
									{/*<TextField.InputEndContent>*/}
									{/*	<Button isIconOnly variant="ghost" size="sm">*/}
									{/*		<Smile size={20} color="#9ca3af" />*/}
									{/*	</Button>*/}
									{/*</TextField.InputEndContent>*/}
								</TextField.Input>
							</TextField>
						</View>
						{/*<View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">*/}
						{/*	<TextInput*/}
						{/*		className="flex-1 text-base text-foreground"*/}
						{/*		placeholder="Type a message..."*/}
						{/*		placeholderTextColor="#9ca3af"*/}
						{/*		value={message}*/}
						{/*		onChangeText={setMessage}*/}
						{/*		multiline*/}
						{/*		maxLength={500}*/}
						{/*	/>*/}
						{/*	<Button isIconOnly variant="ghost" size="sm">*/}
						{/*		<Smile size={20} color="#9ca3af" />*/}
						{/*	</Button>*/}
						{/*</View>*/}

						{/* Send Button */}
						<Button
							isIconOnly
							variant="ghost"
							onPress={handleSend}
							className="ml-3 bg-primary w-10"
						>
							<Button.Label>
								<Send size={20} color="white" />
							</Button.Label>
						</Button>
						{/*</View>*/}
					</View>
				</KeyboardAvoidingView>
			</View>
		</Container>
	);
}
