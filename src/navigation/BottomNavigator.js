import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/dashboard/Dashboard";
import Gift from "react-native-vector-icons/AntDesign";
import Qrcode from "react-native-vector-icons/AntDesign";
import Book from "react-native-vector-icons/AntDesign";
import { useSelector } from "react-redux";
import Wave from "../../assets/svg/bottomDrawer.svg";
import PoppinsTextMedium from "../components/electrons/customFonts/PoppinsTextMedium";
import BookOpen from "react-native-vector-icons/Entypo";
import { useTranslation } from "react-i18next";
import FlipAnimation from "../components/animations/FlipAnimation";

const Tab = createBottomTabNavigator();

function BottomNavigator({ navigation }) {
  const [requiresLocation, setRequiresLocation] = useState(false);
  const [modal, setModal] = useState(false);
  const { t } = useTranslation();

  const locationSetup = useSelector((state) => state.appusers.locationSetup);
  const ternaryThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  )
    ? useSelector((state) => state.apptheme.ternaryThemeColor)
    : "grey";
  const userData = useSelector((state) => state.appusersdata.userData);
  const workflow = useSelector((state) => state.appWorkflow.program);

  const platformFontWeight = Platform.OS === "ios" ? "400" : "800";

  const handleModalClose = () => {
    setModal(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={() => (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              backgroundColor: "#F7F7F7",
            }}
          >
            <Wave style={{ top: 10 }} width={100} />
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                height: 60,
                backgroundColor: "white",
                width: "100%",
              }}
            >
              {userData.user_type !== "consumer" ? (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("GiftCatalogue");
                  }}
                  style={{
                    alignItems: "center",
                    position: "absolute",
                    left: 30,
                  }}
                >
                  <Gift name="gift" size={24} color={ternaryThemeColor} />
                  <PoppinsTextMedium
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontWeight: platformFontWeight,
                      color: "black",
                    }}
                    content={t("gift Catalogue")}
                  />
                </TouchableOpacity>
              ) : (
                <View></View>
              )}

              {(userData?.user_type).toLowerCase() !== "sales" ? (
                <TouchableOpacity
                  onPress={() => 
                    Platform.OS == "android"
                    ? userData.user_type != "consumer"
                      ? navigation.navigate("EnableCameraScreen", {
                          scan_type: "QR",
                        })
                      : navigation.navigate("EnableCameraAndNavigateToWarranty", {
                          scan_type: "QR",
                        })
                    : userData.user_type != "consumer"
                    ? navigation.navigate("QrCodeScanner", {
                        scan_type: "QR",
                      })
                    : navigation.navigate("ScanAndRedirectToWarranty", {
                        scan_type: "QR",
                      })
                    }
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <FlipAnimation
                    direction="horizontal"
                    duration={1400}
                    comp={() => {
                      return (
                        <Qrcode
                          name="qrcode"
                          size={24}
                          color={ternaryThemeColor}
                        />
                      );
                    }}
                  />
                  {userData.user_type === "consumer" ? (
                    <PoppinsTextMedium
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: platformFontWeight,
                        color: "black",
                      }}
                      content={t("Activate Warranty")}
                    />
                  ) : (
                    <PoppinsTextMedium
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: platformFontWeight,
                        color: "black",
                      }}
                      content={t("Scan QR")}
                    />
                  )}
                </TouchableOpacity>
              ) : (
                workflow?.includes("Genuinity") && (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("ScanAndRedirectToGenuinity");
                    }}
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <FlipAnimation
                      direction="horizontal"
                      duration={1400}
                      comp={() => {
                        return (
                          <Qrcode
                            name="qrcode"
                            size={24}
                            color={ternaryThemeColor}
                          />
                        );
                      }}
                    />
                    <PoppinsTextMedium
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: platformFontWeight,
                        color: "black",
                      }}
                      content="Check Genuinity"
                    />
                  </TouchableOpacity>
                )
              )}
              {(userData?.user_type).toLowerCase() !== "sales" &&
                userData.user_type !== "consumer" && (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("Passbook");
                    }}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      position: "absolute",
                      right: 30,
                    }}
                  >
                    <Book name="book" size={24} color={ternaryThemeColor} />
                    <PoppinsTextMedium
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: platformFontWeight,
                        color: "black",
                      }}
                      content={t("passbook")}
                    />
                  </TouchableOpacity>
                )}

              {(userData?.user_type).toLowerCase() === "sales" && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("ProductCatalogue");
                  }}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    right: 20,
                  }}
                >
                  <BookOpen
                    name="open-book"
                    size={24}
                    color={ternaryThemeColor}
                  />
                  <PoppinsTextMedium
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontWeight: platformFontWeight,
                      color: "black",
                    }}
                    content="Product Catalogue"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      >
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarLabel: "Home",
            tabBarIcon: () => (
              <Home name="home" size={24} color={ternaryThemeColor} />
            ),
          }}
          name="DashboardBottom"
          component={Dashboard}
        />
      </Tab.Navigator>

      {/* Modal for QR Code Options */}
      <Modal
        transparent={true}
        visible={modal}
        animationType="slide"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: ternaryThemeColor,
                fontWeight: "bold",
                marginBottom: 25,
                borderBottomColor: "#808080",
              }}
            >
              Choose an Option
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setModal(false);
                Platform.OS == "android"
                  ? userData.user_type != "consumer"
                    ? navigation.navigate("EnableCameraScreen", {
                        scan_type: "QR",
                      })
                    : navigation.navigate("EnableCameraAndNavigateToWarranty", {
                        scan_type: "QR",
                      })
                  : userData.user_type != "consumer"
                  ? navigation.navigate("QrCodeScanner", {
                      scan_type: "QR",
                    })
                  : navigation.navigate("ScanAndRedirectToWarranty", {
                      scan_type: "QR",
                    });
              }}
            >
              <Text style={styles.optionText}>Scan QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setModal(false);
                Platform.OS == "android"
                  ? userData.user_type != "consumer"
                    ? navigation.navigate("EnableCameraScreen", {
                        scan_type: "Bar",
                      })
                    : navigation.navigate("EnableCameraAndNavigateToWarranty", {
                        scan_type: "Bar",
                      })
                  : (
                      userData.user_type != "consumer"
                        ?  navigation.navigate(
                          "QrCodeScanner",
                          { scan_type: "Bar" }
                        )
                        : navigation.navigate(
                            "ScanAndRedirectToWarranty",
                            { scan_type: "Bar" }
                          )
                    )
                
              }}
            >
              <Text style={styles.optionText}>Scan Barcode</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                userData.user_type != "consumer"
                  ? navigation.navigate("QrCodeScanner", {
                      scan_type: "Manual",
                    })
                  : navigation.navigate("ScanAndRedirectToWarranty", {
                      scan_type: "Manual",
                    });
                setModal(false);
              }}
            >
              <Text style={styles.optionText}>Enter Code Manually</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={[
                styles.modalOption,
                styles.cancelButton,
                { backgroundColor: ternaryThemeColor },
              ]}
              onPress={handleModalClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {},
  modalOption: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: "4%",
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF6347",
    marginTop: 20,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default BottomNavigator;
