import { useState, useRef } from "react";
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Dimensions,
	Pressable,
	FlatList,
	Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { X, ChevronRight, Paperclip } from "lucide-react-native";
import { Container } from "@/components/container";

const { width } = Dimensions.get("window");

interface Photo {
	uri: string;
	width: number;
	height: number;
}

export default function EditPostScreen() {
	const params = useLocalSearchParams();
	const photoUri = params.photoUri as string;

	// For now, we're handling a single photo, but this structure supports multiple
	const [photos] = useState<Photo[]>([
		{
			uri: photoUri,
			width: width,
			height: width,
		},
	]);
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
	const [caption, setCaption] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [location, setLocation] = useState("");
	const [taggedListings, setTaggedListings] = useState<any[]>([]);

	const scrollViewRef = useRef<ScrollView>(null);

	const handleClose = () => {
		if (caption.trim() || tags.length > 0 || location.trim() || taggedListings.length > 0) {
			Alert.alert("Save Draft?", "Do you want to save this post as a draft?", [
				{
					text: "Discard",
					style: "destructive",
					onPress: () => router.back(),
				},
				{
					text: "Save Draft",
					onPress: () => {
						// TODO: Implement save draft functionality
						console.log("Saving draft...");
						router.back();
					},
				},
				{
					text: "Cancel",
					style: "cancel",
				},
			]);
		} else {
			router.back();
		}
	};

	const handlePost = () => {
		if (!caption.trim()) {
			Alert.alert("Caption Required", "Please add a caption to your post.");
			return;
		}

		// TODO: Implement post creation
		console.log({
			photos,
			caption,
			tags,
			location,
			taggedListings,
		});

		Alert.alert("Success", "Post created successfully!", [
			{
				text: "OK",
				onPress: () => router.back(),
			},
		]);
	};

	const handleScroll = (event: any) => {
		const offsetX = event.nativeEvent.contentOffset.x;
		const index = Math.round(offsetX / width);
		setCurrentPhotoIndex(index);
	};

	const handleAddTags = () => {
		router.push("/post/add-tags");
	};

	const handleAddLocation = () => {
		router.push("/post/add-location");
	};

	const handleAddTaggedListings = () => {
		router.push("/post/tag-listings");
	};

	return (
		<Container>
			<ScrollView>
				<View className="bg-brand-background">
					<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
						{/* Image Carousel with Header Overlay */}
						<View className="relative">
							<ScrollView
								ref={scrollViewRef}
								horizontal
								pagingEnabled
								showsHorizontalScrollIndicator={false}
								onScroll={handleScroll}
								scrollEventThrottle={16}
							>
								{photos.map((photo, index) => (
									<Image
										key={index}
										source={{ uri: photo.uri }}
										style={{
											width: width,
											height: width,
										}}
										resizeMode="cover"
									/>
								))}
							</ScrollView>

							{/* Header Overlay */}
							<View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 py-3">
								<Pressable onPress={handleClose} className="bg-black/30 rounded-full p-1">
									<X size={28} color="white" />
								</Pressable>
								<Text className="text-lg font-semibold text-white">EDIT POST</Text>
								<Pressable onPress={handlePost} className="bg-black/30 rounded-full p-1">
									<ChevronRight size={28} color="white" />
								</Pressable>
							</View>

							{/* Dots Indicator */}
							{photos.length > 1 && (
								<View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-2">
									{photos.map((_, index) => (
										<View
											key={index}
											className={`w-2 h-2 rounded-full ${
												index === currentPhotoIndex ? "bg-white" : "bg-white/50"
											}`}
										/>
									))}
								</View>
							)}

							{/* Paper Clip Icon (bottom right) */}
							<View className="absolute bottom-3 right-3">
								<View className="w-10 h-10 bg-black/30 rounded-full items-center justify-center">
									<Paperclip size={20} color="white" />
								</View>
							</View>
						</View>

						{/* Caption Input */}
						<View className="border-b border-border px-4 py-4">
							<TextInput
								value={caption}
								onChangeText={setCaption}
								placeholder="enter caption..."
								placeholderTextColor="#999"
								multiline
								className="text-base text-foreground min-h-[60px]"
								style={{ textAlignVertical: "top" }}
							/>
						</View>

						{/* Add Tags */}
						<TouchableOpacity
							onPress={handleAddTags}
							className="border-b border-border px-4 py-4 flex-row items-center justify-between"
						>
							<Text className="text-sm text-secondary-500">ADD TAGS</Text>
							<ChevronRight size={20} color="#999" />
						</TouchableOpacity>

						{/* Add Location */}
						<TouchableOpacity
							onPress={handleAddLocation}
							className="border-b border-border px-4 py-4 flex-row items-center justify-between"
						>
							<Text className="text-sm text-primary">ADD LOCATION</Text>
							<ChevronRight size={20} color="#999" />
						</TouchableOpacity>

						{/* Tagged Listings Section */}
						<View className="px-4 py-4">
							<Text className="text-xs font-semibold text-foreground mb-3 tracking-wide">
								TAGGED LISTINGS
							</Text>

							<TouchableOpacity
								onPress={handleAddTaggedListings}
								className="w-20 h-20 border border-border items-center justify-center rounded-lg"
							>
								<View className="items-center justify-center">
									<Text className="text-3xl text-muted-foreground mb-1">+</Text>
								</View>
							</TouchableOpacity>

							{/* Display Tagged Listings */}
							{taggedListings.length > 0 && (
								<View className="flex-row flex-wrap gap-2 mt-3">
									{taggedListings.map((listing, index) => (
										<View key={index} className="w-20 h-20 bg-muted rounded-lg">
											{/* Tagged listing preview */}
										</View>
									))}
								</View>
							)}
						</View>

						{/* Caption Drafting Note */}
						<View className="px-4 py-6">
							<Text className="text-sm text-muted-foreground italic">
								caption drafting^ <Text className="not-italic">paper clip</Text> logo to tag
								listings
							</Text>
						</View>
					</ScrollView>

					{/* Post Button */}
					<View className="border-t border-border p-4">
						<TouchableOpacity
							onPress={handlePost}
							className="bg-primary py-3 rounded-lg items-center"
						>
							<Text className="text-primary-foreground font-semibold text-base">POST</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</Container>
	);
}
