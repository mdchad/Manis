import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Share2 } from "lucide-react-native";
import { Container } from "@/components/container";

const { width } = Dimensions.get("window");

export default function ChatMessage() {
	const { id } = useLocalSearchParams();
	const router = useRouter();

	// Mock data - in real app, fetch based on id
	return (
		<Container edges={["top"]}>
			<ScrollView>
				<Text>Chat {id}</Text>
			</ScrollView>
		</Container>
	);
}
