import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Button,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import imagePath from "../../../constants/imagePath";
import CustomeButton from "../../../components/buttons/CustomeButton";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const AddBasicDetails = () => {
  const [birthdate, setBirthdate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        setLoadingLocation(false);
        return;
      }

      // Get current location
      const userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;

      // Fetch city/state using Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "User-Agent": "YourAppName/1.0 (your-email@example.com)", // Add your app's name and email here
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.address) {
        const { city, state, city_district, country } = data.address;
        setLocation(
          `${city_district || ""}${city ? city : ""} ${state || ""} ${
            country || ""
          }`
        );
      } else {
        console.log("Unable to fetch location details");
        setLocation("Unknown City, Unknown State");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleDateSelect = (event, date) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString("en-GB"); // Formats as dd/mm/yyyy
      setBirthdate(formattedDate);
    }
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 py-5"
      >
        <FlatList
          data={[{ type: "header" }, { type: "body" }, { type: "footer" }]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            switch (item.type) {
              case "header":
                return (
                  <View className="header flex flex-col items-start justify-start gap-4">
                    <Text className="text-[#21262E] mt-4 font-bold text-3xl">
                      Add your basic Details
                    </Text>
                    <Text className="text-start text-lg text-[#61677D]">
                      Provide your basic details to complete your profile and
                      unlock personalised opportunities!
                    </Text>
                    <View className="flex-row items-center my-4">
                      <View className="flex-1 h-px bg-gray-300" />
                    </View>
                  </View>
                );
              case "body":
                return (
                  <View className="gap-6">
                    {/* Email Input */}
                    <View className="gap-4 w-full">
                      <Text className="font-semibold text-lg">Email</Text>
                      <TextInput
                        placeholder="you@example.com"
                        className="bg-[#2982dc14] w-full placeholder:text-[#7C8BA0] px-6 py-5 rounded-lg p-2"
                        keyboardType="email-address"
                      />
                    </View>

                    {/* Birthday Input */}
                    <View className="gap-4 w-full">
                      <Text className="font-semibold text-lg">Birthday</Text>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="bg-[#2982dc14] w-full flex flex-row items-center justify-between placeholder:text-sm placeholder:text-[#7C8BA0] px-6 rounded-lg py-4"
                      >
                        <Text
                          className={`text-md ${
                            birthdate ? "text-[#3B4054]" : "text-[#7C8BA0]"
                          }`}
                        >
                          {birthdate ? birthdate : "DD/MM/YYYY"}
                        </Text>
                        <Image source={imagePath.calender} />
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={handleDateSelect}
                        />
                      )}
                    </View>
                    <View className="flex flex-row items-center bg-[#E9FFE1] py-2 px-4 rounded-lg">
                      <Ionicons
                        name="warning-outline"
                        size={18}
                        color="#13B21D"
                      />
                      <Text className="text-sm font-medium text-[#13B21D] ml-2">
                        Your birthday will never be shared publicly
                      </Text>
                    </View>

                    {/* Location Input */}
                    <View className="gap-4 w-full">
                      <Text className="font-semibold text-lg">Location</Text>
                      <TouchableOpacity
                        className="bg-[#2982dc14] w-full flex flex-row items-center justify-between placeholder:text-[#7C8BA0] px-6 rounded-lg py-4"
                        onPress={getCurrentLocation}
                      >
                        <Text
                          className={`text-md ${
                            birthdate ? "text-[#3B4054]" : "text-[#7C8BA0]"
                          }`}
                        >
                          {location ? location : "Search Location"}
                        </Text>
                        {loadingLocation ? (
                          <ActivityIndicator size="small" color="#2983DC" />
                        ) : (
                          <Image source={imagePath.location} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              case "footer":
                return (
                  <View className="mt-4">
                    <CustomeButton
                      title="Continue"
                      style="my-2"
                      onButtonPress={() => {
                        router.push("/(profile_data)");
                      }}
                    />
                  </View>
                );
              default:
                return null;
            }
          }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between", // Ensures equal space between the header, body, and footer
            paddingBottom: 10, // To ensure the footer stays at the bottom
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddBasicDetails;
