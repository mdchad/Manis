import { Alert } from "react-native";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { Button } from "heroui-native";

interface FollowButtonProps {
	userId: string; // Better-Auth user ID
	variant?: "default" | "ghost" | "outline";
	size?: "sm" | "md" | "lg";
}

export function FollowButton({ userId, variant = "outline", size = "md" }: FollowButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const isFollowing = useQuery(api.follows.isFollowing, { userId });
	const follow = useMutation(api.follows.follow);
	const unfollow = useMutation(api.follows.unfollow);

	const handlePress = async () => {
		setIsLoading(true);
		try {
			if (isFollowing) {
				await unfollow({ userId });
			} else {
				await follow({ userId });
			}
		} catch (error) {
			Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	// Show loading state while checking follow status
	if (isFollowing === undefined) {
		return (
			<Button size={size} isDisabled>
				<Button.Label>Loading...</Button.Label>
			</Button>
		);
	}

	return (
		<Button size={size} onPress={handlePress} isDisabled={isLoading}>
			<Button.Label>{isFollowing ? "Following" : "Follow"}</Button.Label>
		</Button>
	);
}
