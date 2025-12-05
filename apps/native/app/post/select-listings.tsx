import { useState } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	Image,
	ActivityIndicator,
	Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { X, Check } from "lucide-react-native";
import { Container } from "@/components/container";
import { Button } from "heroui-native";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { Id } from "@manis/backend/convex/_generated/dataModel";

interface Listing {
	_id: Id<"listings">;
	title: string;
	price?: number;
	imageUrl?: string;
	status: string;
}

export default function SelectListingsModal() {
	const params = useLocalSearchParams();
	const preSelectedIds = params.selectedIds as string;

	// Parse pre-selected listing IDs
	const [selectedListings, setSelectedListings] = useState<Id<"listings">[]>(() => {
		if (preSelectedIds) {
			try {
				return JSON.parse(preSelectedIds);
			} catch {
				return [];
			}
		}
		return [];
	});

	// Get current user's listings
	const currentUser = useQuery(api.auth.getCurrentUser);
	const userListings = useQuery(
		api.listings.getUserListings,
		currentUser?._id ? { userId: currentUser._id } : "skip"
	);

	const handleToggleListing = (listingId: Id<"listings">) => {
		setSelectedListings((prev) => {
			if (prev.includes(listingId)) {
				return prev.filter((id) => id !== listingId);
			} else {
				return [...prev, listingId];
			}
		});
	};

	const handleDone = () => {
		// Navigate back with selected listing IDs
		router.back();
		// Pass data back via navigation params
		// Note: You'll need to handle this in the edit.tsx screen
		router.setParams({
			selectedListingIds: JSON.stringify(selectedListings),
		});
	};

	const handleClose = () => {
		router.back();
	};

	const renderListingItem = ({ item }: { item: Listing }) => {
		const isSelected = selectedListings.includes(item._id);

		return (
			<TouchableOpacity
				onPress={() => handleToggleListing(item._id)}
				className="flex-row items-center p-4 border-b border-border"
			>
				{/* Listing Image */}
				<View className="relative">
					{item.imageUrl ? (
						<Image
							source={{ uri: item.imageUrl }}
							className="w-16 h-16 rounded-lg"
							resizeMode="cover"
						/>
					) : (
						<View className="w-16 h-16 rounded-lg bg-muted items-center justify-center">
							<Text className="text-muted-foreground text-xs">No Image</Text>
						</View>
					)}

					{/* Selection Indicator */}
					{isSelected && (
						<View className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full items-center justify-center border-2 border-white">
							<Check size={12} color="white" strokeWidth={3} />
						</View>
					)}
				</View>

				{/* Listing Details */}
				<View className="flex-1 ml-3">
					<Text className="text-sm font-medium text-foreground" numberOfLines={1}>
						{item.title}
					</Text>
					{item.price && (
						<Text className="text-xs text-muted-foreground mt-1">${item.price.toFixed(2)}</Text>
					)}
					<Text className="text-xs text-muted-foreground capitalize mt-0.5">{item.status}</Text>
				</View>
			</TouchableOpacity>
		);
	};

	if (!currentUser) {
		return (
			<Container edges={["top"]}>
				<View className="flex-1 items-center justify-center bg-background">
					<ActivityIndicator size="large" />
				</View>
			</Container>
		);
	}

	return (
		<Container edges={["top"]}>
			<View className="flex-1 bg-background">
				{/* Header */}
				<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
					<Pressable onPress={handleClose}>
						<X size={24} color="#000" />
					</Pressable>
					<Text className="text-lg font-semibold">Tag Listings</Text>
					<Button onPress={handleDone} variant="link" size="sm" className="min-w-0 px-0">
						<Button.Label className="text-primary font-semibold">Done</Button.Label>
					</Button>
				</View>

				{/* Selected Count */}
				{selectedListings.length > 0 && (
					<View className="px-4 py-2 bg-muted/30">
						<Text className="text-xs text-muted-foreground">
							{selectedListings.length} listing{selectedListings.length !== 1 ? "s" : ""} selected
						</Text>
					</View>
				)}

				{/* Listings List */}
				{!userListings ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" />
						<Text className="mt-4 text-muted-foreground">Loading your listings...</Text>
					</View>
				) : userListings.length === 0 ? (
					<View className="flex-1 items-center justify-center px-6">
						<Text className="text-center text-foreground text-base mb-2">No listings found</Text>
						<Text className="text-center text-muted-foreground text-sm">
							Create a listing first to tag it in your post
						</Text>
						<Button
							onPress={() => router.push("/listing/create")}
							variant="secondary"
							className="mt-4"
						>
							<Button.Label>Create Listing</Button.Label>
						</Button>
					</View>
				) : (
					<FlatList
						data={userListings}
						renderItem={renderListingItem}
						keyExtractor={(item) => item._id}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</Container>
	);
}
