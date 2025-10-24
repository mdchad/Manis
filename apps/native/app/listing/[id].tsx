import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Share2 } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ListingDetail() {
	const { id } = useLocalSearchParams();
	const router = useRouter();

	// Mock data - in real app, fetch based on id
	const listing = {
		id,
		image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
		title: "Shirt Dress Eva Black, M",
		brand: "KAIFIYYAH",
		price: 60,
		description: "description here: selling my entire Kaifiyyah set. click for more details! add more words to show that description can be lengthy and share more details",
		size: "M",
		meetup: "BUONA VISTA",
		condition: "BRAND NEW",
		seller: {
			name: "fadhilahyacob",
			avatar: "https://i.pravatar.cc/150?img=1",
		},
	};

	return (
		<View className="flex-1 bg-background">
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
					<Image
						source={{ uri: listing.seller.avatar }}
						className="w-10 h-10 rounded-full"
					/>
					<Text className="ml-3 font-semibold text-base">{listing.seller.name}</Text>
				</View>

				{/* Main Image */}
				<Image
					source={{ uri: listing.image }}
					style={{ width, height: width * 1.3 }}
					resizeMode="cover"
				/>

				{/* Product Details */}
				<View className="px-4 py-4">
					{/* Title and Price */}
					<View className="flex-row justify-between items-start mb-2">
						<View className="flex-1">
							<Text className="text-base mb-1">{listing.title}</Text>
							<Text className="text-sm font-semibold">{listing.brand}</Text>
						</View>
						<Text className="text-3xl font-bold ml-4">${listing.price}</Text>
					</View>

					{/* Description */}
					<Text className="text-sm text-gray-700 mt-3 leading-5">
						{listing.description}
					</Text>

					{/* Product Info */}
					<View className="mt-4 space-y-2">
						<View className="flex-row">
							<Text className="text-sm font-semibold w-24">SIZE:</Text>
							<Text className="text-sm">{listing.size}</Text>
						</View>
						<View className="flex-row mt-2">
							<Text className="text-sm font-semibold w-24">MEETUP:</Text>
							<Text className="text-sm">{listing.meetup}</Text>
						</View>
						<View className="flex-row mt-2">
							<Text className="text-sm font-semibold w-24">CONDITION:</Text>
							<Text className="text-sm">{listing.condition}</Text>
						</View>
					</View>

					{/* Action Buttons */}
					<View className="flex-row items-center justify-between mt-8 mb-4">
						<TouchableOpacity className="flex-1 mr-2">
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
		</View>
	);
}
