import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { authClient } from "~/utils/auth";

function MobileAuth() {
  const { data: session } = authClient.useSession();

  return (
    <Text className="text-foreground pb-2 text-center text-xl font-semibold">
      {session?.user.name ? `Hello, ${session.user.name}` : "Not logged in"}
    </Text>
  );
}

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="bg-background h-full w-full p-4">
        <Text className="text-foreground pb-2 text-center text-5xl font-bold">
          ioyou
        </Text>
        <MobileAuth />
      </View>
    </SafeAreaView>
  );
}
