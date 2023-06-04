import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';
import tw from "tailwind-rn";

const MatchedScreen = () => {
    const navigation = useNavigation();
    const { params } = useRoute();

    const { loggedInProfile, userSwiped } = params;
  return (
    <View style={[tw("h-full bg-red-500 pt-20"), { opacity: 0.89 }]}>
      <View style={tw("justify-center px-10 pt-20")}>
        <Image
          style={tw("h-16 w-full")}
          source={{uri: "https://links.papareact.com/mg9"}} />
      </View>

      <Text style={tw("text-white text-center mt-7")}>
        You and {userSwiped.displayName} have liked each other.
      </Text>

      <View style={tw("flex-row justify-evenly mt-7")}>
        <Image 
          style={tw("h-24 w-24 rounded-full")}
          source={{
            uri: loggedInProfile.photoURL,
          }}
        />
          <Image 
          style={tw("h-24 w-24 rounded-full")}
          source={{
            uri: userSwiped.photoURL,
          }}
        />
      </View>

          <TouchableOpacity
            style={tw("bg-white m-7 px-10 py-8 rounded-full mt-20")}
            onPress={() => {
              navigation.goBack();
              navigation.navigate("Chat");
            }}
          >
            <Text style={tw("test-center")}>Send a Message</Text>
          </TouchableOpacity>

    </View>
  );  
};

export default MatchedScreen;
