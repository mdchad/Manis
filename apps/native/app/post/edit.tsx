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
	ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { X, ChevronRight, Paperclip } from "lucide-react-native";
import { Container } from "@/components/container";
import { Button } from "heroui-native";
import { useUploadFile } from "@convex-dev/r2/react";
import { useMutation } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";

const { width } = Dimensions.get("window");

interface Photo {
	uri: string;
	width: number;
	height: number;
}

export default function EditPostScreen() {
	const params = useLocalSearchParams();
	const photoUris = params.photoUris as string;

	// Parse multiple photo URIs from comma-separated string
	const [photos] = useState<Photo[]>(() => {
		const uris = photoUris ? photoUris.split(",") : [];
		return uris.map((uri) => ({
			uri: uri.trim(),
			width: width,
			height: width,
		}));
	});
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
	const [caption, setCaption] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [location, setLocation] = useState("");
	const [taggedListings, setTaggedListings] = useState<any[]>([]);
	const [isPosting, setIsPosting] = useState(false);

	const scrollViewRef = useRef<ScrollView>(null);

	// Convex hooks
	const uploadFile = useUploadFile(api.r2);
	const createPost = useMutation(api.posts.createPost);

	// Helper function to convert URI to File
	const convertUriToFile = async (uri: string, fileName: string): Promise<File> => {
		const response = await fetch(uri);
		const blob = await response.blob();
		return new File([blob], fileName, { type: blob.type });
	};

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

	const handlePost = async () => {
		if (!caption.trim()) {
			Alert.alert("Caption Required", "Please add a caption to your post.");
			return;
		}

		if (photos.length === 0) {
			Alert.alert("Photos Required", "Please select at least one photo.");
			return;
		}

		try {
			setIsPosting(true);

			// Upload all photos to R2 and get their keys
			const imageKeys: string[] = [];
			for (let i = 0; i < photos.length; i++) {
				const photo = photos[i];
				const file = await convertUriToFile(photo.uri, `post-${Date.now()}-${i}.jpg`);
				const key = await uploadFile(file);
				imageKeys.push(key);
				console.log(`Uploaded photo ${i + 1}/${photos.length} with key:`, key);
			}

			// Create the post with the uploaded image keys
			await createPost({
				caption: caption.trim(),
				imageKeys,
				tags: tags.length > 0 ? tags : undefined,
				location: location.trim() || undefined,
				taggedListings: taggedListings.length > 0 ? taggedListings.map((l) => l._id) : undefined,
			});

			Alert.alert("Success", "Post created successfully!", [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			console.error("Post creation error:", error);
			Alert.alert("Error", "Failed to create post. Please try again.");
		} finally {
			setIsPosting(false);
		}
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
		<Container edges={["top"]}>
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
								className="w-20 h-20 border border-border items-center justify-center rounded-lg bg-[#E1DFDB]"
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
						{/*<View className="px-4 py-6">*/}
						{/*	<Text className="text-sm text-muted-foreground italic">*/}
						{/*		caption drafting^ <Text className="not-italic">paper clip</Text> logo to tag*/}
						{/*		listings*/}
						{/*	</Text>*/}
						{/*</View>*/}
					</ScrollView>

					{/* Post Button */}
					<View className="border-t border-border p-4">
						<Button
							onPress={handlePost}
							variant="secondary"
							className="bg-white"
							isDisabled={isPosting}
						>
							{isPosting ? (
								<ActivityIndicator size="small" color="#000" />
							) : (
								<Button.Label className="text-primary">POST</Button.Label>
							)}
						</Button>
					</View>
				</View>
			</ScrollView>
		</Container>
	);
}
