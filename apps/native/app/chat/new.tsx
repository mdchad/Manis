import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send, DollarSign } from "lucide-react-native";
import { Container } from "@/components/container";
import { Avatar, Button, TextField } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import type { Id } from "@manis/backend/convex/_generated/dataModel";
import { OfferCard } from "@/components/offer-card";
import { ChatMessage } from "@/components/chat-message";

export default function NewChatScreen() {
	const params = useLocalSearchParams<{ listingId?: string; id?: string }>();
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [showMakeOffer, setShowMakeOffer] = useState(false);
	const [offerAmount, setOfferAmount] = useState("");
	const [offerMessage, setOfferMessage] = useState("");
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);

	// Check if we already have a chat (after first message)
	const chatId = params.id as Id<"chats"> | undefined;
	const listingId = params.listingId as Id<"listings"> | undefined;

	// Get chat data if chat exists
	const chat = useQuery(api.chats.getChatById, chatId ? { chatId } : "skip");
	const messages = useQuery(api.messages.getMessages, chatId ? { chatId } : "skip");
	const activeOffer = useQuery(api.offers.getActiveOffer, chatId ? { chatId } : "skip");
	console.log(chat);

	// Get listing data if no chat yet
	const listing = useQuery(api.listings.getById, !chatId && listingId ? { listingId } : "skip");
	const user = useQuery(api.auth.getCurrentUser, {});

	// Mutations
	const startChatMutation = useMutation(api.chats.startChat);
	const sendMessageMutation = useMutation(api.messages.sendMessage).withOptimisticUpdate(
		(localStore, args) => {
			const { chatId, text } = args;
			const existingMessages = localStore.getQuery(api.messages.getMessages, { chatId });

			// If we've loaded the messages query, push an optimistic message onto the list
			if (existingMessages !== undefined && user) {
				const now = Date.now();
				// Generate a temporary ID (will be replaced when server responds)
				const tempId = `temp_${now}_${Math.random().toString(36).substr(2, 9)}`;
				const newMessage = {
					_id: tempId as Id<"messages">,
					_creationTime: now,
					chatId,
					senderId: user._id,
					text,
					type: "user" as const,
					isRead: false,
					createdAt: now,
				};
				localStore.setQuery(api.messages.getMessages, { chatId }, [
					...existingMessages,
					newMessage,
				]);
			}
		}
	);
	const makeOfferMutation = useMutation(api.offers.makeOffer);
	const acceptOfferMutation = useMutation(api.offers.acceptOffer);
	const declineOfferMutation = useMutation(api.offers.declineOffer);
	const cancelOfferMutation = useMutation(api.offers.cancelOffer);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		if (messages && messages.length > 0) {
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages]);

	const handleSend = async () => {
		if (!message.trim()) return;

		try {
			if (!chatId && listingId) {
				// First message - create chat and send message
				const newChatId = await startChatMutation({ listingId });
				await sendMessageMutation({
					chatId: newChatId,
					text: message.trim(),
				});

				// 🎯 Update URL without navigation
				router.setParams({ id: newChatId });
				setMessage("");
			} else if (chatId) {
				// Existing chat - just send message
				await sendMessageMutation({
					chatId,
					text: message.trim(),
				});
				setMessage("");
			}
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const handleMakeOffer = async () => {
		const amount = parseFloat(offerAmount);
		if (!isNaN(amount) && amount > 0 && chatId) {
			try {
				await makeOfferMutation({
					chatId,
					amount,
					message: offerMessage.trim() || undefined,
				});
				setOfferAmount("");
				setOfferMessage("");
				setShowMakeOffer(false);
			} catch (error) {
				console.error("Failed to make offer:", error);
			}
		}
	};

	const handleEditOffer = async (amount: number, msg?: string) => {
		if (chatId) {
			try {
				await makeOfferMutation({
					chatId,
					amount,
					message: msg,
				});
			} catch (error) {
				console.error("Failed to edit offer:", error);
			}
		}
	};

	const handleAcceptOffer = async (offerId: Id<"offers">) => {
		try {
			await acceptOfferMutation({ offerId });
		} catch (error) {
			console.error("Failed to accept offer:", error);
		}
	};

	const handleDeclineOffer = async (offerId: Id<"offers">) => {
		try {
			await declineOfferMutation({ offerId });
		} catch (error) {
			console.error("Failed to decline offer:", error);
		}
	};

	const handleCancelOffer = async (offerId: Id<"offers">) => {
		try {
			await cancelOfferMutation({ offerId });
		} catch (error) {
			console.error("Failed to cancel offer:", error);
		}
	};

	// Determine display data (from chat or listing)
	const displayData = chat
		? {
				otherUser: chat.otherUser,
				listing: chat.listing,
				isSeller: chat.isSeller,
			}
		: listing
			? {
					otherUser: listing.seller,
					listing: listing,
					isSeller: false, // Always buyer in new chat
				}
			: null;

	if (!displayData) {
		return (
			<Container edges={["top"]}>
				<View className="flex-1 bg-brand-background items-center justify-center">
					<Text className="text-gray-500">Loading...</Text>
				</View>
			</Container>
		);
	}

	return (
		<Container edges={["top"]}>
			<View className="flex-1 bg-brand-background">
				{/* Header */}
				<View className="flex-row items-center px-4 py-3 border-b border-gray-200">
					<TouchableOpacity onPress={() => router.back()} className="mr-3">
						<ArrowLeft size={24} color="black" />
					</TouchableOpacity>

					<Avatar size="sm" alt={displayData.otherUser.name} className="mr-3">
						{displayData.otherUser.avatarUrl && (
							<Avatar.Image source={{ uri: displayData.otherUser.avatarUrl }} />
						)}
						<Avatar.Fallback />
					</Avatar>

					<View className="flex-1">
						<Text className="text-lg font-semibold text-foreground">
							{displayData.otherUser.name}
						</Text>
						{displayData.listing && (
							<Text className="text-xs text-gray-500" numberOfLines={1}>
								{displayData.listing.title}
							</Text>
						)}
					</View>
				</View>

				{/* Listing Preview */}
				{displayData.listing && (
					<View className="px-4 py-2 bg-white border-b border-gray-200">
						<Text className="text-sm font-medium text-foreground">{displayData.listing.title}</Text>
						{displayData.listing.price && (
							<Text className="text-sm text-primary font-semibold">
								SGD {displayData.listing.price.toFixed(2)}
							</Text>
						)}
					</View>
				)}

				{/* Offer Card (Pinned below header) - only show if chat exists */}
				{activeOffer && chatId && (
					<OfferCard
						offer={activeOffer}
						onAccept={handleAcceptOffer}
						onDecline={handleDeclineOffer}
						onEdit={handleEditOffer}
						onCancel={handleCancelOffer}
					/>
				)}

				{/* Messages */}
				<ScrollView
					ref={scrollViewRef}
					className="flex-1 py-4"
					contentContainerStyle={{ paddingBottom: 20 }}
					showsVerticalScrollIndicator={false}
				>
					{!chatId && (
						// Empty state for new chat
						<View className="items-center justify-center py-12 px-6">
							<Text className="text-gray-400 text-center text-sm">
								Start a conversation about this item
							</Text>
						</View>
					)}

					{messages &&
						messages.map((msg) => (
							<ChatMessage
								key={msg._id}
								message={{
									id: msg._id,
									text: msg.text,
									type: msg.type,
									isCurrentUser: displayData.otherUser.id !== msg.senderId,
									timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									}),
									isRead: msg.isRead,
								}}
								userAvatarUrl={
									displayData.otherUser.avatarUrl ? displayData.otherUser.avatarUrl : ""
								}
								username={displayData.otherUser.name}
							/>
						))}
				</ScrollView>

				{/* Make Offer Form (shown when showMakeOffer is true) */}
				{showMakeOffer && chatId && (
					<View className="bg-white border-t border-gray-200 p-4">
						<View className="flex-row items-center justify-between mb-3">
							<Text className="text-lg font-semibold text-foreground">Make an Offer</Text>
							<TouchableOpacity onPress={() => setShowMakeOffer(false)}>
								<Text className="text-gray-500">Cancel</Text>
							</TouchableOpacity>
						</View>

						<View className="mb-3">
							<Text className="text-sm font-medium text-gray-700 mb-1">Amount</Text>
							<TextField>
								<TextField.Input
									keyboardType="numeric"
									value={offerAmount}
									onChangeText={setOfferAmount}
									placeholder="Enter amount"
								/>
							</TextField>
						</View>

						<View className="mb-3">
							<Text className="text-sm font-medium text-gray-700 mb-1">Message (Optional)</Text>
							<TextField>
								<TextField.Input
									value={offerMessage}
									onChangeText={setOfferMessage}
									placeholder="Add a message..."
									multiline
								/>
							</TextField>
						</View>

						<Button onPress={handleMakeOffer} size="md">
							<Button.Label>Send Offer</Button.Label>
						</Button>
					</View>
				)}

				{/* Input Area */}
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
				>
					<View
						className="bg-white border-t flex flex-row items-center border-gray-200 px-4 py-3 w-full"
						style={{ paddingBottom: insets.bottom + 12 }}
					>
						{/* Make Offer Button (only show for buyer when chat exists and no active offer) */}
						{!displayData.isSeller && chatId && !activeOffer && (
							<TouchableOpacity onPress={() => setShowMakeOffer(!showMakeOffer)} className="mr-3">
								<DollarSign size={24} color="#3b82f6" />
							</TouchableOpacity>
						)}

						{/* Text Input */}
						<View className="flex-1">
							<TextField>
								<TextField.Input
									colors={{
										focusBackground: "#f3f4f6",
										blurBackground: "#f3f4f6",
									}}
									placeholder="Type your message..."
									value={message}
									onChangeText={setMessage}
									onSubmitEditing={handleSend}
								/>
							</TextField>
						</View>

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
					</View>
				</KeyboardAvoidingView>
			</View>
		</Container>
	);
}
