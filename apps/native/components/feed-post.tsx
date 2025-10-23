import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface FeedPostProps {
	userAvatar: string;
	username: string;
	images: string[];
	caption: string;
	likes?: number;
}

export const FeedPost: React.FC<FeedPostProps> = ({
	userAvatar,
	username,
	images,
	caption,
	likes = 0,
}) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [isSaved, setIsSaved] = useState(false);

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

			{/* Action Buttons */}
			{/*<View className="flex-row items-center justify-between px-4 py-3">*/}
			{/*	<View className="flex-row items-center gap-4">*/}
			{/*		<TouchableOpacity onPress={() => setIsLiked(!isLiked)}>*/}
			{/*			<HeartIcon*/}
			{/*				size={26}*/}
			{/*				color={isLiked ? "#e2296f" : "#000"}*/}
			{/*				fill={isLiked ? "#e2296f" : "none"}*/}
			{/*			/>*/}
			{/*		</TouchableOpacity>*/}
			{/*		<TouchableOpacity>*/}
			{/*			<MessageCircleIcon size={26} color="#000" />*/}
			{/*		</TouchableOpacity>*/}
			{/*		<TouchableOpacity>*/}
			{/*			<ShareIcon size={24} color="#000" />*/}
			{/*		</TouchableOpacity>*/}
			{/*	</View>*/}
			{/*	<TouchableOpacity onPress={() => setIsSaved(!isSaved)}>*/}
			{/*		<BookmarkIcon*/}
			{/*			size={24}*/}
			{/*			color="#000"*/}
			{/*			fill={isSaved ? "#000" : "none"}*/}
			{/*		/>*/}
			{/*	</TouchableOpacity>*/}
			{/*</View>*/}

			{/* Likes Count */}
			{/*{likes > 0 && (*/}
			{/*	<Text className="px-4 font-semibold text-sm">*/}
			{/*		{likes.toLocaleString()} likes*/}
			{/*	</Text>*/}
			{/*)}*/}

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
