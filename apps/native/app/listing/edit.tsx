import { useState, useRef } from "react";
import {
	View,
	Text,
	Image,
	TextInput,
	ScrollView,
	Dimensions,
	Alert,
	ActivityIndicator,
	Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Container } from "@/components/container";
import { Button } from "heroui-native";
import { useUploadFile } from "@convex-dev/r2/react";
import { useMutation } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import type { Id } from "@manis/backend/convex/_generated/dataModel";
import { ChevronRight, X } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface Photo {
	uri: string;
	width: number;
	height: number;
}

export default function EditListingScreen() {
	const params = useLocalSearchParams<{ id?: string; photoUris?: string }>();
	const listingId = params.id as Id<"listings"> | undefined;
	const photoUris = params.photoUris as string | undefined;

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
	const scrollViewRef = useRef<ScrollView>(null);

	// Form state
	const [title, setTitle] = useState("");
	const [brand, setBrand] = useState("");
	const [price, setPrice] = useState("");
	const [size, setSize] = useState("");
	const [description, setDescription] = useState("");
	const [condition, setCondition] = useState("");
	const [location, setLocation] = useState("");
	const [tags, setTags] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	// Convex hooks
	const uploadFile = useUploadFile(api.r2);
	const createListing = useMutation(api.listings.createListing);
	const updateListing = useMutation(api.listings.updateListing);

	// Helper function to convert URI to File
	const convertUriToFile = async (uri: string, fileName: string): Promise<File> => {
		const response = await fetch(uri);
		const blob = await response.blob();
		return new File([blob], fileName, { type: blob.type });
	};

	const handleScroll = (event: any) => {
		const offsetX = event.nativeEvent.contentOffset.x;
		const index = Math.round(offsetX / width);
		setCurrentPhotoIndex(index);
	};

	const handleSave = async () => {
		if (!title.trim()) {
			Alert.alert("Title Required", "Please enter a listing title.");
			return;
		}

		if (photos.length === 0) {
			Alert.alert("Image Required", "Please select at least one photo.");
			return;
		}

		try {
			setIsSaving(true);

			// Upload first photo (or all photos if you want to support multiple)
			// For now, just uploading the first photo
			const file = await convertUriToFile(photos[0].uri, `listing-${Date.now()}.jpg`);
			const imageKey = await uploadFile(file);

			const priceNum = price.trim() ? parseFloat(price) : undefined;
			const tagsArray = tags
				.trim()
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);

			if (listingId) {
				// Update existing listing
				await updateListing({
					listingId,
					title: title.trim(),
					brand: brand.trim() || undefined,
					price: priceNum,
					size: size.trim() || undefined,
					description: description.trim() || undefined,
					imageKey,
					tags: tagsArray.length > 0 ? tagsArray : undefined,
				});

				Alert.alert("Success", "Listing updated successfully!", [
					{
						text: "OK",
						onPress: () => router.back(),
					},
				]);
			} else {
				// Create new listing
				await createListing({
					title: title.trim(),
					brand: brand.trim() || undefined,
					price: priceNum,
					size: size.trim() || undefined,
					description: description.trim() || undefined,
					imageKey,
					tags: tagsArray.length > 0 ? tagsArray : undefined,
				});

				Alert.alert("Success", "Listing created successfully!", [
					{
						text: "OK",
						onPress: () => router.back(),
					},
				]);
			}
		} catch (error) {
			console.error("Save listing error:", error);
			Alert.alert("Error", "Failed to save listing. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		if (title.trim() || price.trim()) {
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

	return (
		<Container edges={["top"]}>
			<ScrollView className="flex-1 bg-brand-background">
				{/* Image Carousel */}
				{photos.length > 0 && (
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
										height: width * 1.3,
									}}
									resizeMode="cover"
								/>
							))}
						</ScrollView>

						<View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 py-3">
							<Pressable onPress={handleClose} className="bg-black/30 rounded-full p-1">
								<X size={28} color="white" />
							</Pressable>
							<Text className="text-lg text-white">EDIT LISTING</Text>
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
					</View>
				)}

				{/* Form Fields */}
				<View className="px-4 py-4 space-y-4">
					{/* Listing Title */}
					<View className="border-b border-gray-200 pb-2">
						<Text className="text-xs text-gray-400 mb-1">LISTING TITLE</Text>
						<TextInput
							value={title}
							onChangeText={setTitle}
							placeholder=""
							placeholderTextColor="#999"
							className="text-base text-foreground"
						/>
					</View>

					{/* Size (Right Column in Design) */}
					<View className="border-b border-gray-200 pb-2">
						<Text className="text-xs text-gray-400 mb-1">SIZE</Text>
						<TextInput
							value={size}
							onChangeText={setSize}
							placeholder=""
							placeholderTextColor="#999"
							className="text-base text-foreground"
						/>
					</View>

					{/* Brand */}
					<View className="border-b border-gray-200 pb-2">
						<Text className="text-xs text-gray-400 mb-1">BRAND</Text>
						<TextInput
							value={brand}
							onChangeText={setBrand}
							placeholder=""
							placeholderTextColor="#999"
							className="text-base text-foreground"
						/>
					</View>

					{/* Price */}
					<View className="border-b border-gray-200 pb-2">
						<Text className="text-xs text-gray-400 mb-1">PRICE (SGD)</Text>
						<TextInput
							value={price}
							onChangeText={setPrice}
							placeholder=""
							placeholderTextColor="#999"
							keyboardType="decimal-pad"
							className="text-base text-foreground"
						/>
					</View>

					{/* Description */}
					<View className="border-b border-gray-200 pb-2">
						<Text className="text-xs text-gray-400 mb-1">ENTER DESCRIPTION HERE...</Text>
						<TextInput
							value={description}
							onChangeText={setDescription}
							placeholder=""
							placeholderTextColor="#999"
							multiline
							numberOfLines={4}
							className="text-base text-foreground min-h-[80px]"
							style={{ textAlignVertical: "top" }}
						/>
					</View>

					{/* Divider */}
					{/*<View className="h-px bg-gray-200 my-4" />*/}

					{/*/!* Add (Optional) Section *!/*/}
					{/*<Text className="text-xs text-gray-400 mb-2">ADD (OPTIONAL)</Text>*/}

					{/*/!* Condition *!/*/}
					{/*<View className="border-b border-gray-200 pb-2">*/}
					{/*	<Text className="text-xs text-gray-400 mb-1">CONDITION</Text>*/}
					{/*	<TextInput*/}
					{/*		value={condition}*/}
					{/*		onChangeText={setCondition}*/}
					{/*		placeholder=""*/}
					{/*		placeholderTextColor="#999"*/}
					{/*		className="text-base text-foreground"*/}
					{/*	/>*/}
					{/*</View>*/}

					{/*/!* Location / Meetup *!/*/}
					{/*<View className="border-b border-gray-200 pb-2">*/}
					{/*	<Text className="text-xs text-gray-400 mb-1">LOCATION / MEETUP</Text>*/}
					{/*	<TextInput*/}
					{/*		value={location}*/}
					{/*		onChangeText={setLocation}*/}
					{/*		placeholder=""*/}
					{/*		placeholderTextColor="#999"*/}
					{/*		className="text-base text-foreground"*/}
					{/*	/>*/}
					{/*</View>*/}

					{/*/!* Tags *!/*/}
					{/*<View className="border-b border-gray-200 pb-2">*/}
					{/*	<Text className="text-xs text-gray-400 mb-1">TAGS</Text>*/}
					{/*	<TextInput*/}
					{/*		value={tags}*/}
					{/*		onChangeText={setTags}*/}
					{/*		placeholder="Separate with commas"*/}
					{/*		placeholderTextColor="#999"*/}
					{/*		className="text-base text-foreground"*/}
					{/*	/>*/}
					{/*</View>*/}
				</View>

				{/* Save Button */}
				<View className="p-4 pb-8">
					<Button
						onPress={handleSave}
						variant="secondary"
						className="bg-white"
						isDisabled={isSaving}
					>
						{isSaving ? (
							<ActivityIndicator size="small" color="#000" />
						) : (
							<Button.Label className="text-primary">
								{listingId ? "UPDATE LISTING" : "CREATE LISTING"}
							</Button.Label>
						)}
					</Button>
				</View>
			</ScrollView>
		</Container>
	);
}
