import React from "react";
import { View, Text } from "react-native";
import { Avatar } from "heroui-native";
import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react-native";

interface Message {
	id: string;
	text: string;
	type?: string;
	isCurrentUser: boolean;
	timestamp: string;
	status?: "sending" | "sent" | "error";
}

interface ChatMessageProps {
	message: Message;
	userAvatarUrl?: string;
	username?: string;
}

export function ChatMessage({ message, userAvatarUrl, username }: ChatMessageProps) {
	// System/Offer Activity Message
	if (message.type === "system" || message.type === "offer_activity") {
		return (
			<View className="items-center my-3 px-4">
				<View className="bg-gray-100 px-4 py-2 rounded-full">
					<Text className="text-xs text-gray-500 text-center">{message.text}</Text>
				</View>
				<Text className="text-xs text-gray-400 mt-1">{message.timestamp}</Text>
			</View>
		);
	}

	// Render status icon for current user messages
	const renderStatusIcon = () => {
		if (!message.isCurrentUser) return null;

		switch (message.status) {
			case "sending":
				return <Clock size={14} color="#9ca3af" className="ml-1" />;
			case "error":
				return <AlertCircle size={14} color="#ef4444" className="ml-1" />;
			case "sent":
			default:
				return <Check size={14} color="#9ca3af" className="ml-1" />;
		}
	};

	// Regular User Message
	return (
		<View
			className={`flex-1 mb-3 flex-row px-4 ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
		>
			{!message.isCurrentUser && userAvatarUrl && (
				<Avatar size="sm" alt={username || "User"} className="mr-2 mt-1">
					<Avatar.Image source={{ uri: userAvatarUrl }} />
					<Avatar.Fallback />
				</Avatar>
			)}

			<View className="max-w-[75%]">
				<View
					className={`px-4 py-3 rounded-2xl ${
						message.isCurrentUser
							? "bg-primary rounded-br-sm"
							: "bg-white rounded-bl-sm border border-gray-200"
					} ${message.status === "error" ? "opacity-70" : ""}`}
				>
					<Text className={`text-sm ${message.isCurrentUser ? "text-white" : "text-foreground"}`}>
						{message.text}
					</Text>
				</View>
				<View
					className={`flex-row items-center mt-1 ${
						message.isCurrentUser ? "justify-end" : "justify-start"
					}`}
				>
					<Text className="text-xs text-gray-400">{message.timestamp}</Text>
					{renderStatusIcon()}
				</View>
			</View>
		</View>
	);
}
