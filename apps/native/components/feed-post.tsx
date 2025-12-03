import React, { useState } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	Dimensions,
	ScrollView,
	NativeScrollEvent,
	NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { Avatar } from "heroui-native";
import { FollowButton } from "./follow-button";

const { width } = Dimensions.get("window");

interface FeedPostProps {
	userId: string; // Better-Auth user ID of the post author
	userAvatar: string;
	username: string;
	images: string[];
	caption: string;
	likes?: number;
	listingImages?: string[];
}

export const FeedPost: React.FC<FeedPostProps> = ({
	userId,
	userAvatar,
	username,
	images,
	caption,
	likes = 0,
	listingImages = [],
}) => {
	const router = useRouter();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const { isAuthenticated } = useConvexAuth();
	const currentUser = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");

	// Check if this post is from the current user
	const isOwnPost = currentUser?._id === userId;

	const handleListingPress = (index: number) => {
		// Navigate to listing detail page
		router.push(`/listing/${index + 1}`);
	};

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const contentOffsetX = event.nativeEvent.contentOffset.x;
		const index = Math.round(contentOffsetX / width);
		setCurrentImageIndex(index);
	};

	return (
		<View className="mb-4 bg-brand-background">
			{/* Header */}
			<View className="flex-row items-center justify-between px-4 py-3 bg-brand-background">
				<View className="flex-row items-center flex-1">
					<Avatar size="sm" alt={"avatar"}>
						<Avatar.Image source={{ uri: userAvatar as string }} />
						<Avatar.Fallback>IR</Avatar.Fallback>
					</Avatar>
					<Text className="ml-3 font-semibold text-base">{username}</Text>
				</View>
				{!isOwnPost && currentUser && <FollowButton userId={userId} variant="outline" size="sm" />}
			</View>

			{/* Image Carousel */}
			<View className="relative">
				<ScrollView
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onScroll={handleScroll}
					scrollEventThrottle={16}
				>
					{images.map((image, index) => (
						<Image
							key={index}
							source={{ uri: image }}
							style={{ width, height: width * 1.2 }}
							resizeMode="cover"
						/>
					))}
				</ScrollView>

				{/* Pagination Dots */}
				{images.length > 1 && (
					<View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">
						{images.map((_, index) => (
							<View
								key={index}
								className={`w-2 h-2 rounded-full ${
									index === currentImageIndex ? "bg-white" : "bg-white/50"
								}`}
							/>
						))}
					</View>
				)}
			</View>

			{/* Listing Thumbnails */}
			{listingImages.length > 0 && (
				<View className="">
					<View className="flex-row">
						{listingImages.slice(0, 3).map((image, index) => (
							<TouchableOpacity key={index} onPress={() => handleListingPress(index)}>
								<Image
									source={{ uri: image }}
									style={{
										width: 70,
										height: 70,
										borderRadius: 2,
									}}
									resizeMode="cover"
								/>
							</TouchableOpacity>
						))}
					</View>
				</View>
			)}

			{/* Caption */}
			<View className="px-4 py-2">
				<Text className="text-sm">
					<Text className="font-semibold">{username}</Text>{" "}
					<Text className="text-gray-800">{caption}</Text>
				</Text>
			</View>
		</View>
	);
};
