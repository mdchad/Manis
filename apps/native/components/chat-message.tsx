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
	status?: "sending" | "sent" | "read" | "error";
	isRead?: boolean;
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

		// Determine icon color based on message bubble background
		const iconColor = message.isCurrentUser ? "rgba(255, 255, 255, 0.7)" : "#9ca3af";

		switch (message.status) {
			case "sending":
				return <Clock size={14} color={iconColor} className="ml-1" />;
			case "error":
				return <AlertCircle size={14} color="#ef4444" className="ml-1" />;
			case "read":
				return <CheckCheck size={14} color={iconColor} className="ml-1" />;
			case "sent":
			default:
				// If message is read, show double check even if status is "sent"
				if (message.isRead) {
					return <CheckCheck size={14} color={iconColor} className="ml-1" />;
				}
				return <Check size={14} color={iconColor} className="ml-1" />;
		}
	};

	// Regular User Message
	return (
		<View
			className={`flex-1 mb-1 flex-row px-4 ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
		>
			<View className="max-w-[75%]">
				<View
					className={`px-3 py-2 rounded-2xl ${
						message.isCurrentUser
							? "bg-primary rounded-br-sm"
							: "bg-white rounded-bl-sm border border-gray-200"
					} ${message.status === "error" ? "opacity-70" : ""}`}
				>
					{/* Message text with padding on the right for timestamp */}
					<Text
						className={`text-sm ${message.isCurrentUser ? "text-white" : "text-foreground"} pr-14 pb-3`}
					>
						{message.text}
					</Text>

					{/* Timestamp and status inside bubble - Telegram style (absolute positioning) */}
					<View className="absolute bottom-1 right-2 flex-row items-center gap-1">
						<Text
							className={`text-xs ${message.isCurrentUser ? "text-white/80" : "text-gray-400"}`}
						>
							{message.timestamp}
						</Text>
						{renderStatusIcon()}
					</View>
				</View>
			</View>
		</View>
	);
}
