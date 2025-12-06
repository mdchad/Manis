import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Button, TextField } from "heroui-native";
import { DollarSign, X, Edit3 } from "lucide-react-native";
import type { Id } from "@manis/backend/convex/_generated/dataModel";

type OfferStatus = "pending" | "accepted" | "declined";

interface OfferCardProps {
	offer: {
		_id: Id<"offers">;
		amount: number;
		message?: string;
		status: OfferStatus;
		isBuyer: boolean;
		isSeller: boolean;
	};
	onAccept?: (offerId: Id<"offers">) => void;
	onDecline?: (offerId: Id<"offers">) => void;
	onEdit?: (amount: number, message?: string) => void;
	onCancel?: (offerId: Id<"offers">) => void;
}

export function OfferCard({ offer, onAccept, onDecline, onEdit, onCancel }: OfferCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editAmount, setEditAmount] = useState(offer.amount.toString());
	const [editMessage, setEditMessage] = useState(offer.message || "");

	const handleSaveEdit = () => {
		const amount = parseFloat(editAmount);
		if (!isNaN(amount) && amount > 0 && onEdit) {
			onEdit(amount, editMessage.trim() || undefined);
			setIsEditing(false);
		}
	};

	const handleCancelEdit = () => {
		setEditAmount(offer.amount.toString());
		setEditMessage(offer.message || "");
		setIsEditing(false);
	};

	// Pending offer
	if (offer.status === "pending") {
		return (
			<View className="mx-4 my-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
				{isEditing ? (
					// Edit mode (buyer only)
					<View>
						<View className="flex-row items-center mb-3">
							<DollarSign size={20} color="#f59e0b" />
							<Text className="ml-2 text-base font-bold text-amber-900">Edit Your Offer</Text>
						</View>

						<View className="mb-3">
							<Text className="text-sm font-medium text-gray-700 mb-1">Amount</Text>
							<TextField>
								<TextField.Input
									keyboardType="numeric"
									value={editAmount}
									onChangeText={setEditAmount}
									placeholder="Enter amount"
									colors={{
										focusBackground: "white",
										blurBackground: "white",
									}}
								/>
							</TextField>
						</View>

						<View className="mb-4">
							<Text className="text-sm font-medium text-gray-700 mb-1">Message (Optional)</Text>
							<TextField>
								<TextField.Input
									value={editMessage}
									onChangeText={setEditMessage}
									placeholder="Add a message..."
									multiline
									colors={{
										focusBackground: "white",
										blurBackground: "white",
									}}
								/>
							</TextField>
						</View>

						<View className="flex-row gap-2">
							<View className="flex-1">
								<Button onPress={handleCancelEdit} variant="outline" size="sm">
									<Button.Label>Cancel</Button.Label>
								</Button>
							</View>
							<View className="flex-1">
								<Button onPress={handleSaveEdit} size="sm">
									<Button.Label>Save</Button.Label>
								</Button>
							</View>
						</View>
					</View>
				) : (
					// View mode
					<View>
						<View className="flex-row items-center mb-2">
							<DollarSign size={20} color="#f59e0b" />
							<Text className="ml-2 text-base font-bold text-amber-900">
								{offer.isBuyer ? "Your Offer" : "Pending Offer"}
							</Text>
						</View>

						<View className="mb-3">
							<Text className="text-3xl font-bold text-amber-900">
								SGD {offer.amount.toFixed(2)}
							</Text>
							{offer.message && (
								<Text className="text-sm text-gray-600 mt-2">"{offer.message}"</Text>
							)}
						</View>

						{offer.isSeller && (
							// Seller actions
							<View className="flex-row gap-2">
								<View className="flex-1">
									<Button
										onPress={() => onDecline?.(offer._id)}
										variant="outline"
										size="sm"
										className="border-red-300"
									>
										<Button.Label className="text-red-600">Decline</Button.Label>
									</Button>
								</View>
								<View className="flex-1">
									<Button onPress={() => onAccept?.(offer._id)} size="sm" className="bg-green-600">
										<Button.Label>Accept</Button.Label>
									</Button>
								</View>
							</View>
						)}

						{offer.isBuyer && (
							// Buyer actions
							<View className="flex-row gap-2">
								<View className="flex-1">
									<Button onPress={() => onCancel?.(offer._id)} variant="outline" size="sm">
										<Button.Label>Cancel Offer</Button.Label>
									</Button>
								</View>
								<View className="flex-1">
									<Button onPress={() => setIsEditing(true)} size="sm">
										<Button.Label className="flex-row items-center">
											<Edit3 size={14} color="white" />
											<Text className="ml-1 text-white">Edit</Text>
										</Button.Label>
									</Button>
								</View>
							</View>
						)}
					</View>
				)}
			</View>
		);
	}

	// Accepted offer
	if (offer.status === "accepted") {
		return (
			<View className="mx-4 my-3 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
				<View className="flex-row items-center mb-2">
					<Text className="text-2xl mr-2">✅</Text>
					<Text className="text-base font-bold text-green-900">Offer Accepted</Text>
				</View>

				<View>
					<Text className="text-sm text-gray-600 mb-1">Final Price</Text>
					<Text className="text-3xl font-bold text-green-900">SGD {offer.amount.toFixed(2)}</Text>
					<Text className="text-sm text-gray-600 mt-2">
						{offer.isBuyer ? "Item reserved for you" : "Item reserved for buyer"}
					</Text>
				</View>
			</View>
		);
	}

	// Declined offer
	if (offer.status === "declined") {
		return (
			<View className="mx-4 my-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
				<View className="flex-row items-center mb-2">
					<Text className="text-2xl mr-2">❌</Text>
					<Text className="text-base font-bold text-gray-700">Offer Declined</Text>
				</View>

				<View>
					<Text className="text-sm text-gray-600 mb-1">Amount</Text>
					<Text className="text-2xl font-bold text-gray-700">SGD {offer.amount.toFixed(2)}</Text>
					{offer.message && <Text className="text-sm text-gray-500 mt-2">"{offer.message}"</Text>}
				</View>
			</View>
		);
	}

	return null;
}
