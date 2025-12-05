import React from "react";
import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	Dimensions,
	ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Share2 } from "lucide-react-native";
import { Container } from "@/components/container";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import type { Id } from "@manis/backend/convex/_generated/dataModel";

const { width } = Dimensions.get("window");

export default function ListingDetail() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	console.log(id);

	const listing = useQuery(api.listings.getById, {
		listingId: id as Id<"listings">,
	});

	if (listing === undefined) {
		return (
			<Container edges={["top"]}>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" />
				</View>
			</Container>
		);
	}

	if (listing === null) {
		return (
			<Container edges={["top"]}>
				<View className="flex-1 items-center justify-center px-4">
					<Text className="text-base text-gray-600">Listing not found</Text>
					<TouchableOpacity onPress={() => router.back()} className="mt-4">
						<Text className="text-primary font-semibold">Go Back</Text>
					</TouchableOpacity>
				</View>
			</Container>
		);
	}

	return (
		<Container edges={["top"]}>
			<ScrollView>
				{/* Header */}
				{/*<View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-12 pb-4">*/}
				{/*	<TouchableOpacity*/}
				{/*		onPress={() => router.back()}*/}
				{/*		className="w-10 h-10 items-center justify-center"*/}
				{/*	>*/}
				{/*		<ArrowLeft size={24} color="#000" />*/}
				{/*	</TouchableOpacity>*/}
				{/*</View>*/}

				<ScrollView showsVerticalScrollIndicator={false}>
					{/* Seller Info */}
					<View className="flex-row items-center px-4 pb-3">
						{listing.seller.avatarUrl ? (
							<Image
								source={{ uri: listing.seller.avatarUrl }}
								className="w-10 h-10 rounded-full"
							/>
						) : (
							<View className="w-10 h-10 rounded-full bg-gray-200" />
						)}
						<Text className="ml-3 font-semibold text-base">{listing.seller.name}</Text>
					</View>

					{/* Main Image */}
					{listing.imageUrl ? (
						<Image
							source={{ uri: listing.imageUrl }}
							style={{ width, height: width * 1.3 }}
							resizeMode="cover"
						/>
					) : (
						<View
							style={{ width, height: width * 1.3 }}
							className="bg-gray-200 items-center justify-center"
						>
							<Text className="text-gray-400">No image</Text>
						</View>
					)}

					{/* Product Details */}
					<View className="px-4 py-4">
						{/* Title and Price */}
						<View className="flex-row justify-between items-start mb-2">
							<View className="flex-1">
								<Text className="text-base mb-1">{listing.title}</Text>
								{listing.brand && <Text className="text-sm font-semibold">{listing.brand}</Text>}
							</View>
							{listing.price && <Text className="text-3xl font-bold ml-4">${listing.price}</Text>}
						</View>

						{/* Description */}
						{listing.description && (
							<Text className="text-sm text-gray-700 mt-3 leading-5">{listing.description}</Text>
						)}

						{/* Product Info */}
						<View className="mt-4 space-y-2">
							{listing.size && (
								<View className="flex-row">
									<Text className="text-sm font-semibold w-24">SIZE:</Text>
									<Text className="text-sm">{listing.size}</Text>
								</View>
							)}
							{listing.category && (
								<View className="flex-row mt-2">
									<Text className="text-sm font-semibold w-24">CATEGORY:</Text>
									<Text className="text-sm">{listing.category}</Text>
								</View>
							)}
							<View className="flex-row mt-2">
								<Text className="text-sm font-semibold w-24">STATUS:</Text>
								<Text className="text-sm uppercase">{listing.status}</Text>
							</View>
						</View>

						{/* Action Buttons */}
						<View className="flex-row items-center justify-between mt-8 mb-4">
							<TouchableOpacity
								className="flex-1 mr-2"
								onPress={() => router.push(`/chat/new?listingId=${listing._id.toString()}`)}
							>
								<View className="bg-primary py-3 items-center rounded-lg">
									<Text className="text-white font-semibold text-base">CHAT TO BUY</Text>
								</View>
							</TouchableOpacity>
							<TouchableOpacity className="w-12 h-12 items-center justify-center border border-gray-300 rounded-lg">
								<Share2 size={20} color="#000" />
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</ScrollView>
		</Container>
	);
}
