import { SafeAreaView, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '600' }}>Ecommerce Mobile</Text>
        <Text>Initial production-oriented React Native bootstrap.</Text>
      </View>
    </SafeAreaView>
  );
}
