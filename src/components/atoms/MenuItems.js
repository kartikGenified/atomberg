import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import PoppinsTextMedium from "../electrons/customFonts/PoppinsTextMedium";
import { SvgUri } from "react-native-svg";
import ZoomViewAnimations from "../animations/ZoomViewAnimations";
import { useTranslation } from "react-i18next";
import { FAB } from "react-native-paper";

const MenuItems = (props) => {
  const colorShades = useSelector((state) => state.apptheme.colorShades);
  const [modal, setModal] = useState(false);

  const image = props.image;
  const content = props.content;
  const platformFontSize = Platform.OS === "ios" ? 10 : 13;
  const platformFontWeight = Platform.OS === "ios" ? "500" : "800";

  const ternaryThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  )
    ? useSelector((state) => state.apptheme.ternaryThemeColor)
    : "grey";

  const userData = useSelector((state) => state.appusersdata.userData);


  const { t } = useTranslation();
  // console.log("menu item images", image)
  const handlePress = () => {
    // console.log(content)
    props.handlePress(content);
  };

  const handleModalClose = () => {
    setModal(false);
  };

  // console.log(image)
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 100,
        margin: 6,
        // backgroundColor:'white'
      }}
    >
      <TouchableOpacity
        onPress={() => {
          handlePress();
        }}
        style={{
          height: 69,
          width: 69,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 34.5,
          opacity: 0.6,
        }}
      >
        <Image
          style={{ height: 69, width: 69 }}
          source={{ uri: image }}
        ></Image>
      </TouchableOpacity>
      <PoppinsTextMedium
        content={
          content == "Scan Qr" || content == "Scan QR"
            ? t("Scan QR")
            : content == "Activate Warranty"
            ? t("Activate Warranty")
            : content.toLowerCase() == "check genuinity"
            ? t("Check Genuinity")
            : content == "Passbook"
            ? t("Passbook")
            : content == "Product Catalogue"
            ? t("Product Catalogue")
            : content == "Report an Issue"
            ? t("Report an Issue")
            : content == "Customer Support"
            ? t("Customer Support")
            : content
        }
        style={{
          width: 80,
          marginTop: 6,
          color: "white",
          fontSize: platformFontSize,
          fontWeight: platformFontWeight,
        }}
      ></PoppinsTextMedium>

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
                fontSize: 18,
                color: ternaryThemeColor,
                fontWeight: "bold",
                marginBottom: 20,
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
                  : (
                      userData.user_type != "consumer"
                        ? requiresLocation
                        : navigation.navigate(
                            "EnableCameraAndNavigateToWarranty",
                            { scan_type: "QR" }
                          )
                    )
                  ? navigation.navigate("EnableCameraScreen", {
                      navigateTo: "QrCodeScanner",
                      scan_type: "QR",
                    })
                  : navigation.navigate("QrCodeScanner", { scan_type: "QR" });
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
                        ? requiresLocation
                        : navigation.navigate(
                            "EnableCameraAndNavigateToWarranty",
                            { scan_type: "Bar" }
                          )
                    )
                  ? navigation.navigate("EnableCameraScreen", {
                      navigateTo: "QrCodeScanner",
                      scan_type: "Bar",
                    })
                  : navigation.navigate("QrCodeScanner", { scan_type: "Bar" });
              }}
            >
              <Text style={styles.optionText}>Scan Barcode</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                navigation.navigate("QrCodeScanner", { scan_type: "Manual" });
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
};

const styles = StyleSheet.create({});

export default MenuItems;
