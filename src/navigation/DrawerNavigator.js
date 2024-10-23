import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Dashboard from "../screens/dashboard/Dashboard";
import BottomNavigator from "./BottomNavigator";
import RedeemRewardHistory from "../screens/historyPages/RedeemRewardHistory";
import AddBankAccountAndUpi from "../screens/payments/AddBankAccountAndUpi";
import Profile from "../screens/profile/Profile";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/FontAwesome";
import { useGetAppDashboardDataMutation } from "../apiServices/dashboard/AppUserDashboardApi";
import { useGetAppMenuDataMutation } from "../apiServices/dashboard/AppUserDashboardMenuAPi.js";
import * as Keychain from "react-native-keychain";
import { SvgUri } from "react-native-svg";
import { ScrollView } from "react-native-gesture-handler";
import { useGetActiveMembershipMutation } from "../apiServices/membership/AppMembershipApi";
import { useFetchProfileMutation } from "../apiServices/profile/profileApi";
import Share from "react-native-share";
import { shareAppLink } from "../utils/ShareAppLink";
import PoppinsTextMedium from "../components/electrons/customFonts/PoppinsTextMedium";
import PoppinsTextLeftMedium from "../components/electrons/customFonts/PoppinsTextLeftMedium";
import { useFetchLegalsMutation } from "../apiServices/fetchLegal/FetchLegalApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ErrorModal from "../components/modals/ErrorModal";
import VersionCheck from "react-native-version-check";
import { useTranslation } from "react-i18next";
import Pager from 'react-native-vector-icons/FontAwesome6'

const Drawer = createDrawerNavigator();
const CustomDrawer = () => {
  const [profileImage, setProfileImage] = useState();
  const [myProgramVisible, setMyProgramVisibile] = useState(false);
  const [ozoneProductVisible, setOzoneProductVisible] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [requiresLocation, setRequiresLocation] = useState(false);
  const [KnowledgeHubVisible, setKnowledgeHubVisible] = useState(false);
  const [message, setMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const { t } = useTranslation();

  const currentVersion = VersionCheck.getCurrentVersion();
  const locationSetup = useSelector((state) => state.appusers.locationSetup);
  const drawerData = useSelector((state) => state.drawerData.drawerData);
  const getPolicyData = useSelector((state) => state.termsPolicy.policy);
  const getTermsData = useSelector((state) => state.termsPolicy.terms);
  const ternaryThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  )
    ? useSelector((state) => state.apptheme.ternaryThemeColor)
    : "grey";
  const primaryThemeColor = useSelector(
    (state) => state.apptheme.primaryThemeColor
  )
    ? useSelector((state) => state.apptheme.primaryThemeColor)
    : "#FF9B00";
  const userData = useSelector((state) => state.appusersdata.userData);
  const kycData = useSelector((state) => state.kycDataSlice.kycData);
    console.log("getTermsData",getTermsData)
  const [
    getFAQ,
    {
      data: getFAQData,
      error: getFAQError,
      isLoading: FAQLoading,
      isError: FAQIsError,
    },
  ] = useFetchLegalsMutation();

  // console.log("kycCompleted", kycData)

  const navigation = useNavigation();

  const [
    fetchProfileFunc,
    {
      data: fetchProfileData,
      error: fetchProfileError,
      isLoading: fetchProfileIsLoading,
      isError: fetchProfileIsError,
    },
  ] = useFetchProfileMutation();

  const [
    getActiveMembershipFunc,
    {
      data: getActiveMembershipData,
      error: getActiveMembershipError,
      isLoading: getActiveMembershipIsLoading,
      isError: getActiveMembershipIsError,
    },
  ] = useGetActiveMembershipMutation();

  useEffect(() => {
    const fetchData = async () => {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        console.log(
          "Credentials successfully loaded for user " + credentials.username
        );
        const token = credentials.username;
        fetchProfileFunc(token);
      }
    };
    fetchData();
    getMembership();
    fetchFaq();
  }, []);

  useEffect(() => {
    if (locationSetup) {
      if (Object.keys(locationSetup)?.length != 0) {
        setRequiresLocation(true);
      }
    }
  }, [locationSetup]);

  useEffect(() => {
    if (getFAQData) {
      console.log("getFAQData Here i am ", getFAQData);
    } else if (getFAQError) {
      console.log("getFAQError", getFAQError);
    }
  }, [getFAQData, getFAQError]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("loginData");
      await AsyncStorage.removeItem("storedBanner");

      navigation.reset({ index: "0", routes: [{ name: "SelectUser" }] });
    } catch (e) {
      console.log("error deleting loginData", e);
    }

    console.log("Done.");
  };

  const fetchFaq = async () => {
    // const credentials = await Keychain.getGenericPassword();
    // const token = credentials.username;
    const params = {
      type: "faq",
    };
    getFAQ(params);
  };

  const getMembership = async () => {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      console.log(
        "Credentials successfully loaded for user " + credentials.username
      );
      const token = credentials.username;
      getActiveMembershipFunc(token);
    }
  };

  useEffect(() => {
    if (fetchProfileData) {
      console.log("fetchProfileData", fetchProfileData);
      if (fetchProfileData.success) {
        setProfileImage(fetchProfileData.body.profile_pic);
      }
    } else if (fetchProfileError) {
      console.log("fetchProfileError", fetchProfileError);
    }
  }, [fetchProfileData, fetchProfileError]);

  useEffect(() => {
    if (getActiveMembershipData) {
      console.log(
        "getActiveMembershipData",
        JSON.stringify(getActiveMembershipData)
      );
    } else if (getActiveMembershipError) {
      console.log("getActiveMembershipError", getActiveMembershipError);
    }
  }, [getActiveMembershipData, getActiveMembershipError]);

  const modalClose = () => {
    setError(false);
  };

  const DrawerItems = (props) => {
    const image = props.image;
    const size = props.size;
    // console.log("image", image)
    return (
      <View
        style={{
          height: 54,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          marginTop: 1,
          borderBottomWidth: 1,
          borderColor: "#DDDDDD",
        }}
      >
        <View
          style={{
            width: "20%",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            marginBottom: 4,
          }}
        >
          {/* <SvgUri width={40} height={40} uri={image}></SvgUri> */}
          {/* <Icon size={size} name="bars" color={ternaryThemeColor}></Icon> */}
          <Image
            style={{ height: 20, width: 20, resizeMode: "contain" }}
            source={{ uri: image }}
          ></Image>
        </View>

        <TouchableOpacity
        style={{width:'80%'}}
            onPress={() => {
              if (
                props.title === "Scan QR Code" ||
                props.title === "Scan and Win"
              ) {
                Platform.OS == "android"
                  ? navigation.navigate("EnableCameraScreen")
                  : requiresLocation
                  ? navigation.navigate("EnableLocationScreen", {
                      navigateTo: "QrCodeScanner",
                    })
                  : navigation.navigate("QrCodeScanner");
              } else if (props.title.toLowerCase() === "passbook") {
                navigation.navigate("Passbook");
              } else if (props.title.toLowerCase() === "rewards") {
                navigation.navigate("RedeemRewardHistory");
              } else if (props.title.toLowerCase() === "gift catalogue") {
                navigation.navigate("GiftCatalogue");
              } else if (
                props.title.toLowerCase() === "bank details" ||
                props.title.toLowerCase() === "bank account"
              ) {
                navigation.navigate("BankAccounts");
              }
              else if (props.title.toLowerCase() === "terms and conditions") {
              navigation.navigate('PdfComponent', { pdf: getTermsData })
              } 
              else if (props.title.toLowerCase() === "profile") {
                navigation.navigate("Profile");
              } else if (props.title.toLowerCase() === "refer and earn") {
                navigation.navigate("ReferAndEarn");
              } else if (props.title.toLowerCase() === "warranty list") {
                navigation.navigate("WarrantyHistory");
              } else if (props.title.toLowerCase() === "help and support") {
                navigation.navigate("HelpAndSupport");
              } else if (props.title.toLowerCase() === "product catalogue") {
                navigation.navigate("ProductCatalogue");
              } else if (
                props.title.toLowerCase() === "video" ||
                props.title.toLowerCase() === "videos"
              ) {
                navigation.navigate("VideoGallery");
              } else if (props.title.toLowerCase() === "gallery") {
                navigation.navigate("ImageGallery");
              } else if (
                props.title.substring(0, 4).toLowerCase() === "scan" &&
                props.title.toLowerCase() !== "scan list"
              ) {
                Platform.OS == "android"
                  ? navigation.navigate("EnableCameraScreen")
                  : requiresLocation
                  ? navigation.navigate("EnableLocationScreen", {
                      navigateTo: "QrCodeScanner",
                    })
                  : navigation.navigate("QrCodeScanner");
              } else if (props.title.toLowerCase() === "scheme") {
                navigation.navigate("Scheme");
              } else if (props.title.toLowerCase() === "store locator") {
                navigation.navigate("ScanAndRedirectToWarranty");
              } else if (props.title.toLowerCase() === "scan list") {
                navigation.navigate("ScannedHistory");
              } else if (props.title.toLowerCase() === "add user") {
                navigation.navigate("ListUsers");
              } else if (props.title.toLowerCase() === "query list") {
                navigation.navigate("QueryList");
              } else if (props.title.toLowerCase() === "share app") {
                const options = {
                  title: "Share APP",
                  url: shareAppLink,
                };
                Share.open(options)
                  .then((res) => {
                    console.log(res);
                  })
                  .catch((err) => {
                    err && console.log(err);
                  });
              }
            }}
          >
        <View
          style={{
            width: "100%",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          
            {/* {console.log("props.title", props.title)} */}
            <Text style={{ color: primaryThemeColor, fontSize: 15 }}>
              {props.title == "Passbook"
                ? `${t("My Loyalty")}`
                : props.title == "My Profile"
                ? `${t("My Profile")}`
                : props.title == "Profile"
                ? `${t("profile")}`
                : props.title == "Scan History"
                ? `${t("scan history")}`
                : props.title == "Scheme"
                ? `${t("scheme")}`
                : props.title == "Help and Support"
                ? `${t("help and support")}`
                : props.title == "Product Catalogue"
                ? `${t("product catalogue")}`
                : props.title == "Videos"
                ? `${t("videos")}`
                : props.title == "Share App"
                ? `${t("share app")}`
                : props.title == "Feedback"
                ? `${t("feedback")}`
                : props.title == "Rewards"
                ? `${t("My Rewards")}`
                : props.title == "Gallery"
                ? `${t("gallery")}`
                : props.title == "Scan List"
                ? `${t("scan list")}`
                : props.title == "Gift Catalogue"
                ? `${t("gift catalogue")}`
                : props.title == "My Rewards"
                ? `${t("My Rewards")}`
                : props.title.toLowerCase().trim() == "refer and earn"
                ? `${t("Earn Extra Points")}`
                : props.title == "Earn Extra Points"
                ? `${t("Earn Extra Points")}`
                : props.title == "My Points"
                ? `${t("My Points")}`
                : props.title == "Install Product"
                ? `${t("Install Product")}`
                : props.title == "Get Technical Support"
                ? `${t("Get Technical Support")}`
                : props.title == "Redemption"
                ? `${t("Redemption")}`
                : props.title == "My Offers"
                ? `${t("My Offers")}`
                : props.title == "Notifications"
                ? `${t("Notifications")}`
                : props.title == "About Ultimatrue"
                ? `${t("About Ultimatrue")}`
                : props.title == "Products Catalogue"
                ? `${t("Products Catalogue")}`
                : props.title == "User Manuals"
                ? `${t("User Manuals")}`
                : props.title.toLowerCase() == "request project quotation "
                ? `${t("Request Project Quotation")}`
                : props.title.toLowerCase() == "customer list "
                ? `${t("Customer List")}`
                : props.title.toLowerCase() == "add to inventory"
                ? `${t("Add to inventory")}`
                : props.title.toLowerCase() == "my sales"
                ? `${t("My Sales")}`
                : props.title.toLowerCase() == "bank details"
                ? `${t("Bank Details")}`
                : props.title == "Contact Us"
                ? `${t("Contact Us")}`
                : props.title}
            </Text>
          
        </View>
        </TouchableOpacity>
      </View>
    );
  };

  const DrawerSections = (props) => {
    const image = props.image;
    const size = props.size;
    // console.log("image", image)
    return (
      <View
        style={{
          height: 54,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
          borderBottomWidth: 1,
          borderColor: "#DDDDDD",
        }}
      >
        <View
          style={{
            width: "20%",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            marginBottom: 4,
          }}
        >
          {/* <SvgUri width={40} height={40} uri={image}></SvgUri> */}
          {/* <Icon size={size} name="bars" color={ternaryThemeColor}></Icon> */}
          <Image
            style={{ height: 20, width: 20, resizeMode: "contain" }}
            source={{ uri: image }}
          ></Image>
        </View>

        <View
          style={{
            width: "80%",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (props.title == "My Program") {
              }
            }}
          >
            <Text style={{ color: primaryThemeColor, fontSize: 15 }}>
              {props.title}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: "#DDDDDD",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {error && (
        <ErrorModal
          modalClose={modalClose}
          message={message}
          openModal={error}
        ></ErrorModal>
      )}
      <View
        style={{
          width: "100%",
          height: 125,
          backgroundColor: ternaryThemeColor,
          borderBottomLeftRadius: 30,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {profileImage ? (
          <Image
            style={{
              height: 60,
              width: 60,
              borderRadius: 30,
              marginLeft: 10,
              position: "absolute",
              left: 4,
              resizeMode: "contain",
            }}
            source={{ uri: profileImage }}
          ></Image>
        ) : (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 30,
              marginLeft: 10,
              position: "absolute",
              backgroundColor: "white",
              left: 15,
              resizeMode: "contain",
            }}
          >
            <Image
              style={{
                height: 40,
                width: 40,
              }}
              source={require("../../assets/images/userGrey.png")}
            ></Image>
          </View>
        )}
        <View
          style={{ justifyContent: "center", marginLeft: 50, width: "50%" }}
        >
          {userData && (
            <Text
              style={{
                color: "white",
                margin: 0,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {userData.name}
            </Text>
          )}
          {userData && (
            <Text
              style={{ color: "white", margin: 0, textTransform: "capitalize" }}
            >
              {userData.user_type} Account
            </Text>
          )}

          {!Object.values(kycData).includes(false) ? (
            <View style={{ flexDirection: "row", marginTop: 4 }}>
              {/* <View
                style={{
                  height: 22,
                  width: 80,
                  borderRadius: 20,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  marginTop: 2,
                }}
              >
                <Image
                  style={{ height: 10, width: 10, resizeMode: "contain" }}
                  source={require("../../assets/images/tickBlue.png")}
                ></Image>
                <Text
                  style={{
                    marginLeft: 4,
                    color: "black",
                    fontSize: 10,
                    fontWeight: "500",
                  }}
                >
                  KYC Status
                </Text>
              </View> */}
            </View>
          ) : (
            <View></View>
          )}
        </View>
        <PoppinsTextMedium
          content={`Version : ${currentVersion}`}
          style={{
            position: "absolute",
            bottom: 4,
            right: 10,
            color: "white",
            fontSize: 12,
          }}
        ></PoppinsTextMedium>
      </View>
      <ScrollView
        contentContainerStyle={{backgroundColor:'white'}}
        style={{ width: "100%", height: "100%" , backgroundColor:'white'}}
      >
        {drawerData !== undefined &&
          drawerData.app_menu.map((item, index) => {
            return (
              <DrawerItems
                key={index}
                title={item.name}
                image={item.icon}
                size={20}
              ></DrawerItems>
            );
          })}
           {getTermsData && <TouchableOpacity style={{ marginTop: 5, marginBottom: 5,borderBottomWidth:1,height:40,borderColor:'#DDDDDD'}} onPress={() => {
                  navigation.navigate('PdfComponent', { pdf: getTermsData })
                }}>
                  <View style={{flexDirection:'row',marginLeft:18,height:'100%',alignItems:'center'}}>
                  <Pager name="pager" size={20} color={"grey"}></Pager>
                  <Text style={{ fontSize: 15, color: ternaryThemeColor,marginLeft:20 }}>{t("T&C(Terms and Condition)")}</Text>
                  </View>
                </TouchableOpacity>}
      </ScrollView>

      <TouchableOpacity
        style={{
          backgroundColor: ternaryThemeColor,
          height: 70,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
        onPress={() => {
          handleLogout();
        }}
      >
        <PoppinsTextLeftMedium
          style={{ color: "white" }}
          content={t("LOG OUT")}
        ></PoppinsTextLeftMedium>
        <PoppinsTextLeftMedium
          style={{
            color: "white",
            fontSize: 10,
            position: "absolute",
            bottom: 2,
          }}
          content="Designed and developed by Genefied"
        ></PoppinsTextLeftMedium>
      </TouchableOpacity>
    </View>
  );
};
function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={() => <CustomDrawer />}>
      <Drawer.Screen
        options={{ headerShown: false }}
        name="DashboardDrawer"
        component={BottomNavigator}
      />
      <Drawer.Screen
        options={{ headerShown: false }}
        name="Redeem Reward"
        component={RedeemRewardHistory}
      />
      <Drawer.Screen
        options={{ headerShown: false }}
        name="Add BankAccount And Upi"
        component={AddBankAccountAndUpi}
      />
      <Drawer.Screen
        options={{ headerShown: false }}
        name="Profile"
        component={Profile}
      />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
