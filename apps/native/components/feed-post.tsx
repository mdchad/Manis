import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon } from "lucide-react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface FeedPostProps {
	userAvatar: string;
	username: string;
	images: string[];
	caption: string;
	likes?: number;
	listingImages?: string[];
}

export const FeedPost: React.FC<FeedPostProps> = ({
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

	const handleListingPress = (index: number) => {
		// Navigate to listing detail page
		router.push(`/listing/${index + 1}`);
	};

	return (
		<View className="mb-4">
			{/* Header */}
			<View className="flex-row items-center px-4 py-3">
				<Image
					source={{ uri: userAvatar }}
					className="w-10 h-10 rounded-full"
				/>
				<Text className="ml-3 font-semibold text-base">{username}</Text>
			</View>

			{/* Image Carousel */}
			<View className="relative">
				<Image
					source={{ uri: images[currentImageIndex] }}
					style={{ width, height: width * 1.2 }}
					resizeMode="cover"
				/>

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
							<TouchableOpacity
								key={index}
								onPress={() => handleListingPress(index)}
							>
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
