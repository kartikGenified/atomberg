import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
  Button,
  BackHandler,
  Linking,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import MenuItems from "../../components/atoms/MenuItems";
import { BaseUrl } from "../../utils/BaseUrl";
import * as Keychain from "react-native-keychain";
import DashboardMenuBox from "../../components/organisms/DashboardMenuBox";
import Banner from "../../components/organisms/Banner";
import DrawerHeader from "../../components/headers/DrawerHeader";
import DashboardDataBox from "../../components/molecules/DashboardDataBox";
import KYCVerificationComponent from "../../components/organisms/KYCVerificationComponent";
import DashboardSupportBox from "../../components/molecules/DashboardSupportBox";
import { useGetWorkflowMutation } from "../../apiServices/workflow/GetWorkflowByTenant";
import { useGetFormMutation } from "../../apiServices/workflow/GetForms";
import { useSelector, useDispatch } from "react-redux";
import { useGetkycStatusMutation } from "../../apiServices/kyc/KycStatusApi";
import { setKycData } from "../../../redux/slices/userKycStatusSlice";
import { useIsFocused } from "@react-navigation/native";
import {
  setPercentagePoints,
  setShouldSharePoints,
} from "../../../redux/slices/pointSharingSlice";
import { useExtraPointEnteriesMutation } from "../../apiServices/pointSharing/pointSharingApi";
import PoppinsText from "../../components/electrons/customFonts/PoppinsText";
import {
  useFetchUserPointsHistoryMutation,
  useFetchUserPointsMutation,
} from "../../apiServices/workflow/rewards/GetPointsApi";
import PoppinsTextLeftMedium from "../../components/electrons/customFonts/PoppinsTextLeftMedium";
import { setQrIdList } from "../../../redux/slices/qrCodeDataSlice";
import CampaignVideoModal from "../../components/modals/CampaignVideoModal";
import { useGetActiveMembershipMutation } from "../../apiServices/membership/AppMembershipApi";
import PoppinsTextMedium from "../../components/electrons/customFonts/PoppinsTextMedium";
import PlatinumModal from "../../components/platinum/PlatinumModal";
import { useFetchAllQrScanedListMutation } from "../../apiServices/qrScan/AddQrApi";
import FastImage from "react-native-fast-image";
import ScannedDetailsBox from "../../components/organisms/ScannedDetailsBox";
import moment from "moment";
import AnimatedDots from "../../components/animations/AnimatedDots";
import analytics from "@react-native-firebase/analytics";
import messaging from "@react-native-firebase/messaging";
import Close from "react-native-vector-icons/Ionicons";
import ModalWithBorder from "../../components/modals/ModalWithBorder";
import ErrorModal from "../../components/modals/ErrorModal";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appIcon, needCaimpaign } from "../../utils/HandleClientSetup";
import { useGetAppCampaignMutation } from "../../apiServices/campaign/CampaignApi";
import Link from "react-native-vector-icons/AntDesign";
import RotateViewAnimation from "../../components/animations/RotateViewAnimation";
import FadeInOutAnimations from "../../components/animations/FadeInOutAnimations";
import Facebook from "react-native-vector-icons/AntDesign";
import Icon from "react-native-vector-icons/FontAwesome";
import Youtube from "react-native-vector-icons/AntDesign";
import Instagram from "react-native-vector-icons/AntDesign";

const Dashboard = ({ navigation }) => {
  const [dashboardItems, setDashboardItems] = useState();
  const [requiresLocation, setRequiresLocation] = useState(false);
  const [showKyc, setShowKyc] = useState(true);
  const [CampainVideoVisible, setCmpainVideoVisible] = useState(true);
  const [logoutStatus, setLogoutStatus] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [membership, setMembership] = useState();
  const [scanningDetails, seScanningDetails] = useState();
  const [notifModal, setNotifModal] = useState(false);
  const [notifData, setNotifData] = useState(null);
  const [message, setMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const [hide, setHide] = useState(true);
  const [campaignData, setCaimpaignData] = useState(null);
  const focused = useIsFocused();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.appusersdata.userId);
  const userData = useSelector((state) => state.appusersdata.userData);
  const pointSharingData = useSelector(
    (state) => state.pointSharing.pointSharing
  );
  const dashboardData = useSelector(
    (state) => state.dashboardData.dashboardData
  );
  const bannerArray = useSelector((state) => state.dashboardData.banner);
  const locationSetup = useSelector((state) => state.appusers.locationSetup);

  console.log("Dashboard data is", dashboardData, locationSetup);

  const ternaryThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  )
    ? useSelector((state) => state.apptheme.ternaryThemeColor)
    : "#FFB533";

  const gifUri = Image.resolveAssetSource(
    require("../../../assets/gif/cgLoader.gif")
  ).uri;
  // console.log("pointSharingData", JSON.stringify(pointSharingData), userData)
  // console.log("user id is from dashboard", userId)
  //   console.log(focused)
  let startDate, endDate;
  const [
    getActiveMembershipFunc,
    {
      data: getActiveMembershipData,
      error: getActiveMembershipError,
      isLoading: getActiveMembershipIsLoading,
      isError: getActiveMembershipIsError,
    },
  ] = useGetActiveMembershipMutation();

  const [
    getAppCampaign,
    {
      data: getAppCampaignData,
      isLoading: getAppCampaignIsLoading,
      isError: getAppCampaignIsError,
      error: getAppCampaignError,
    },
  ] = useGetAppCampaignMutation();

  const [
    getKycStatusFunc,
    {
      data: getKycStatusData,
      error: getKycStatusError,
      isLoading: getKycStatusIsLoading,
      isError: getKycStatusIsError,
    },
  ] = useGetkycStatusMutation();

  const [
    userPointFunc,
    {
      data: userPointData,
      error: userPointError,
      isLoading: userPointIsLoading,
      isError: userPointIsError,
    },
  ] = useFetchUserPointsMutation();

  const [
    fetchUserPointsHistoryFunc,
    {
      data: fetchUserPointsHistoryData,
      error: fetchUserPointsHistoryError,
      isLoading: fetchUserPointsHistoryLoading,
      isError: fetchUserPointsHistoryIsError,
    },
  ] = useFetchUserPointsHistoryMutation();

  const id = useSelector((state) => state.appusersdata.id);
  const { t } = useTranslation();

  const fetchPoints = async () => {
    const credentials = await Keychain.getGenericPassword();
    const token = credentials.username;
    const params = {
      userId: id,
      token: token,
    };
    userPointFunc(params);
    fetchUserPointsHistoryFunc(params);
  };

  useEffect(() => {
    if (locationSetup) {
      if (Object.keys(locationSetup)?.length != 0) {
        setRequiresLocation(true);
      }
    }
  }, [locationSetup]);

  useEffect(() => {
    const handleBackPress = () => {
      navigation.goBack(); // Navigate back when back button is pressed
      return true; // Prevent default back press behavior
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    fetchPoints();
    dispatch(setQrIdList([]));
    dispatch({ type: "NETWORK_REQUEST" });
    return () => {
      // Ensure backHandler exists and remove the listener
      // console.log("unmounting compionent sajkdahjsdhsaghd")

      if (backHandler) {
        BackHandler.addEventListener("hardwareBackPress", () => false);
      }
    };
  }, [focused, dispatch]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      setNotifModal(true);
      setNotifData(remoteMessage?.notification);
      // console.log("remote message",remoteMessage)
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const getToken = async () => {
      const credentials = await Keychain.getGenericPassword();
      const token = credentials.username;

      getAppCampaign(token);
    };

    getToken();
  }, []);

  useEffect(() => {
    if (getAppCampaignData) {
      console.log("getAppCampaignData", getAppCampaignData);
      setHide(getAppCampaignData?.body?.data?.length == 0);
      setCaimpaignData(getAppCampaignData);
    } else if (getAppCampaignError) {
      console.log("getAppCampaignIsError", getAppCampaignIsError);
    }
  }, [getAppCampaignData, getAppCampaignIsError]);

  useEffect(() => {
    if (userPointData) {
      // console.log("userPointData",userPointData)
    } else if (userPointError) {
      // setError(true);
      // setMessage("Can't get user user point data, kindly retry.");
      // console.log("userPointError",userPointError)
    }
  }, [userPointData]);

  useEffect(() => {
    if (fetchUserPointsHistoryData) {
      // console.log("fetchUserPointsHistoryData", JSON.stringify(fetchUserPointsHistoryData))

      if (fetchUserPointsHistoryData?.success) {
        seScanningDetails(fetchUserPointsHistoryData?.body);
      }
    } else if (fetchUserPointsHistoryError) {
      if (fetchUserPointsHistoryError.status == 401) {
        const handleLogout = async () => {
          try {
            await AsyncStorage.removeItem("loginData");
            navigation.navigate("Splash");
            navigation.reset({ index: 0, routes: [{ name: "Splash" }] }); // Navigate to Splash screen
          } catch (e) {
            console.log("error deleting loginData", e);
          }
        };
        handleLogout();
      } else {
        setError(true);
        setMessage("Unable to fetch user point history.");
      }
      // console.log("fetchUserPointsHistoryError", fetchUserPointsHistoryError)
    }
  }, [fetchUserPointsHistoryData, fetchUserPointsHistoryError]);

  useEffect(() => {
    if (getActiveMembershipData) {
      // console.log("getActiveMembershipData", JSON.stringify(getActiveMembershipData))
      if (getActiveMembershipData?.success) {
        setMembership(getActiveMembershipData?.body?.tier.name);
      }
    } else if (getActiveMembershipError) {
      if (getActiveMembershipError.status == 401) {
        const handleLogout = async () => {
          try {
            await AsyncStorage.removeItem("loginData");
            navigation.navigate("Splash");
            navigation.reset({ index: 0, routes: [{ name: "Splash" }] }); // Navigate to Splash screen
          } catch (e) {
            console.log("error deleting loginData", e);
          }
        };
        handleLogout();
      } else {
        //   setError(true)
        // setMessage("problem in fetching membership, kindly retry.")
        console.log("getActiveMembershipError", getActiveMembershipError);
      }
    }
  }, [getActiveMembershipData, getActiveMembershipError]);

  useEffect(() => {
    if (getKycStatusData) {
      // console.log("getKycStatusData", getKycStatusData)
      if (getKycStatusData?.success) {
        const tempStatus = Object.values(getKycStatusData?.body);

        setShowKyc(tempStatus.includes(false));

        dispatch(setKycData(getKycStatusData?.body));
      }
    } else if (getKycStatusError) {
      if (getKycStatusError.status == 401) {
        const handleLogout = async () => {
          try {
            await AsyncStorage.removeItem("loginData");
            navigation.navigate("Splash");
            navigation.reset({ index: 0, routes: [{ name: "Splash" }] }); // Navigate to Splash screen
          } catch (e) {
            console.log("error deleting loginData", e);
          }
        };
        handleLogout();
      } else {
        // setError(true);
        // setMessage("Can't get KYC status kindly retry after sometime.");
      }
      // console.log("getKycStatusError", getKycStatusError)
    }
  }, [getKycStatusData, getKycStatusError]);

  useEffect(() => {
    const keys = Object.keys(pointSharingData?.point_sharing_bw_user.user);
    const values = Object.values(pointSharingData?.point_sharing_bw_user.user);
    const percentageKeys = Object.keys(
      pointSharingData?.point_sharing_bw_user.percentage
    );
    const percentageValues = Object.values(
      pointSharingData?.point_sharing_bw_user.percentage
    );

    let eligibleUser = "";
    let percentage;
    let index;
    for (var i = 0; i < values.length; i++) {
      if (values[i].includes(userData?.user_type)) {
        eligibleUser = keys[i];
        index = percentageKeys.includes(eligibleUser)
          ? percentageKeys.indexOf(eligibleUser)
          : undefined;
        const pointSharingPercent = percentageValues[index];
        // console.log(pointSharingPercent)
        if (percentageKeys.includes(eligibleUser)) {
          dispatch(setPercentagePoints(pointSharingPercent));
          // console.log("On", userData.user_type, "scan", pointSharingPercent, "% Points would be shared with", eligibleUser)
        }
        dispatch(setShouldSharePoints());
      }
    }
  }, []);
  useEffect(() => {
    const getDashboardData = async () => {
      try {
        // Retrieve the credentials
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          // console.log(
          //   'Credentials successfully loaded for user ' + credentials?.username
          // );
          const token = credentials?.username;

          // console.log("token from dashboard ", token)
        } else {
          // console.log('No credentials stored');
        }
      } catch (error) {
        // console.log("Keychain couldn't be accessed!", error);
      }
    };
    getDashboardData();
  }, []);
  useEffect(() => {
    const fetchOnPageActive = async () => {
      try {
        // Retrieve the credentials
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          // console.log(
          //   'Credentials successfully loaded for user ' + credentials?.username
          // );
          const token = credentials?.username;
          // console.log("token from dashboard ", token)

          token && getKycStatusFunc(token);

          getMembership();
        } else {
          // console.log('No credentials stored');
        }
      } catch (error) {
        // console.log("Keychain couldn't be accessed!", error);
      }
    };
    if (focused) {
      fetchOnPageActive();
    }
  }, [focused]);

  // ozone change

  const platformMarginScroll = Platform.OS === "ios" ? 0 : 0;

  const getMembership = async () => {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      // console.log(
      //   'Credentials successfully loaded for user ' + credentials?.username
      // );
      const token = credentials?.username;
      getActiveMembershipFunc(token);
    }
  };

  const hideSuccessModal = () => {
    setIsSuccessModalVisible(false);
  };

  const showSuccessModal = () => {
    setIsSuccessModalVisible(true);
    // console.log("hello")
  };
  const modalClose = () => {
    setError(false);
  };

  const notifModalFunc = () => {
    return (
      <View style={{ width: "100%" }}>
        <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
          <View>
            {/* <Bell name="bell" size={18} style={{marginTop:5}} color={ternaryThemeColor}></Bell> */}
          </View>
          <PoppinsTextLeftMedium
            content={notifData?.title ? notifData?.title : ""}
            style={{
              color: ternaryThemeColor,
              fontWeight: "800",
              fontSize: 20,
              marginTop: 8,
            }}
          ></PoppinsTextLeftMedium>

          <PoppinsTextLeftMedium
            content={notifData?.body ? notifData?.body : ""}
            style={{
              color: "#000000",
              marginTop: 10,
              padding: 10,
              fontSize: 15,
              fontWeight: "600",
            }}
          ></PoppinsTextLeftMedium>
        </View>

        <TouchableOpacity
          style={[
            {
              backgroundColor: ternaryThemeColor,
              padding: 6,
              borderRadius: 5,
              position: "absolute",
              top: -10,
              right: -10,
            },
          ]}
          onPress={() => setNotifModal(false)}
        >
          <Close name="close" size={17} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F7F9FA",
        flex: 1,
        height: "100%",
      }}
    >
      {notifModal && (
        <ModalWithBorder
          modalClose={() => {
            setNotifModal(false);
          }}
          message={"message"}
          openModal={notifModal}
          comp={notifModalFunc}
        ></ModalWithBorder>
      )}

      {error && (
        <ErrorModal
          modalClose={modalClose}
          message={message}
          openModal={error}
        ></ErrorModal>
      )}

      <ScrollView
        style={{
          width: "100%",
          marginBottom: platformMarginScroll,
          height: "100%",
        }}
      >
        <DrawerHeader></DrawerHeader>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            marginBottom: 10,
          }}
        >
          <PoppinsTextLeftMedium
            style={{
              color: ternaryThemeColor,
              fontWeight: "bold",
              fontSize: 19,
              marginLeft: 20,
            }}
            content={`${t("welcome")} ${userData?.name}`}
          ></PoppinsTextLeftMedium>
          {getActiveMembershipData?.body !== null && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  backgroundColor: ternaryThemeColor,
                  padding: 4,
                  borderRadius: 4,
                }}
                onPress={showSuccessModal}
              >
                <Image
                  style={{ height: 16, width: 16, resizeMode: "contain" }}
                  source={require("../../../assets/images/reward.png")}
                ></Image>

                <PoppinsTextMedium
                  style={{ color: "white", fontSize: 14 }}
                  content={membership}
                ></PoppinsTextMedium>
              </TouchableOpacity>
            </View>
          )}
          <PlatinumModal
            isVisible={isSuccessModalVisible}
            onClose={hideSuccessModal}
            getActiveMembershipData={getActiveMembershipData}
          />
        </View>

        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            height: "90%",
          }}
        >
          <View style={{ height: 200, width: "100%", marginBottom: 20 }}>
            {bannerArray && 
            <TouchableWithoutFeedback onPress={()=>{
              Linking.openURL("https://www.cgglobal.com/")
            }}>
              <View>
            <Banner images={bannerArray}></Banner>
            </View>
            </TouchableWithoutFeedback>
            }

            {needCaimpaign && !hide && (
              <CampaignVideoModal
                appCampaignData={campaignData}
                isVisible={CampainVideoVisible}
                onClose={() => {
                  setCmpainVideoVisible(false);
                }}
              />
            )}
          </View>
          {/* Ozone specific change do not show for sales */}
          {userData?.user_type_id !== 13 &&
            userData.user_type !== "consumer" && (
              <View
                style={{
                  width: "90%",
                  backgroundColor: "white",
                  marginBottom: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: "#808080",
                  borderWidth: 0.3,
                  borderRadius: 10,
                  paddingBottom: 10,
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    width: "42%",
                    marginHorizontal: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {userPointData?.body?.point_balance ? (
                    <PoppinsText
                      content={`${t("balance points")} ${
                        userPointData?.body?.point_balance
                          ? userPointData?.body?.point_balance
                          : "loading"
                      }`}
                      style={{ color: "black", fontWeight: "bold" }}
                    ></PoppinsText>
                  ) : (
                    <AnimatedDots color={"black"} />
                  )}
                </View>

                <View
                  style={{
                    height: "100%",
                    borderWidth: 0.4,
                    color: "#808080",
                    opacity: 0.3,
                  }}
                ></View>

                {userData && !userPointIsLoading && (
                  <View
                    style={{
                      backgroundColor: "white",
                      width: "46%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("RedeemedHistory");
                      }}
                      style={{
                        backgroundColor: ternaryThemeColor,
                        borderRadius: 10,
                        width: "90%",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 6,
                      }}
                    >
                      <PoppinsTextLeftMedium
                        style={{
                          color: "white",
                          fontWeight: "800",
                          fontSize: 16,
                        }}
                        content={t("redeem")}
                      ></PoppinsTextLeftMedium>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          {(userData?.user_type).toLowerCase() !== "dealer" ? (
            (userData?.user_type).toLowerCase() !== "sales" ? (
              scanningDetails &&
              scanningDetails?.data.length !== 0 && (
                <ScannedDetailsBox
                  lastScannedDate={moment(
                    scanningDetails?.data[0]?.created_at
                  ).format("DD MMM YYYY")}
                  scanCount={scanningDetails.total}
                ></ScannedDetailsBox>
              )
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
          {/* <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{ paddingLeft: 10, paddingRight: 10, paddingBottom: 4 }}>
            <DashboardDataBox header="Total Points"  data="5000" image={require('../../../assets/images/coin.png')} ></DashboardDataBox>
          <DashboardDataBox header="Total Points"  data="5000" image={require('../../../assets/images/coin.png')} ></DashboardDataBox>

          </ScrollView> */}
          {dashboardData && !userPointIsLoading  && (
            <DashboardMenuBox
              requiresLocation={requiresLocation}
              navigation={navigation}
              data={dashboardData}
            ></DashboardMenuBox>
          )}
          {/* <View
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              flexDirection: "row",
              width: "90%",
              marginBottom: 40,
            }}
          >
            
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  width: "90%",
                  height: 60,
                  flexDirection: "row",
                  marginBottom: 10,
                }}
              >
                <RotateViewAnimation
                  outputRange={["0deg", "60deg", "-60deg", "0deg"]}
                  inputRange={[0, 1, 2, 3]}
                  comp={() => {
                    return (
                      <FadeInOutAnimations
                        comp={() => {
                          return (
                            <TouchableOpacity
                              onPress={() => {
                                Linking.openURL(
                                  "https://www.facebook.com/people/CG-Industrial-Division/100066535583616/"
                                );
                              }}
                            >
                              <Facebook
                                name="facebook-square"
                                size={40}
                                color="blue"
                              ></Facebook>
                            </TouchableOpacity>
                          );
                        }}
                      ></FadeInOutAnimations>
                     );
                  }}
                /> 

                <RotateViewAnimation
              outputRange={["0deg", "60deg", "-60deg", "0deg"]}
              inputRange={[0, 1, 2, 3]}
              comp={() => {
                return (
                  <FadeInOutAnimations
                    comp={() => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            Linking.openURL(
                              `whatsapp://send?text=Hi Welcome To BTPL World&phone=${"+201023666065"}`
                            );
                          }}
                        >
                          <Icon name="whatsapp" size={40} color="green"></Icon>
                        </TouchableOpacity>
                      );
                    }}
                  ></FadeInOutAnimations>
                );
              }}
            />

                <RotateViewAnimation
                  outputRange={["0deg", "60deg", "-60deg", "0deg"]}
                  inputRange={[0, 1, 2, 3]}
                  comp={() => {
                    return (
                      <FadeInOutAnimations
                        comp={() => {
                          return (
                            <TouchableOpacity
                              onPress={() => {
                                Linking.openURL(
                                  "https://www.linkedin.com/company/10324/admin/"
                                );
                              }}
                            >
                              <View
                                style={{
                                  height: 50,
                                  width: 50,
                                  backgroundColor: "#DDE8EE",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 25,
                                }}
                              >
                                <Icon
                                  name="linkedin"
                                  size={35}
                                  color="blue"
                                ></Icon>
                              </View>
                            </TouchableOpacity>
                          );
                        }}
                      ></FadeInOutAnimations>
                    );
                  }}
                /> 

                <RotateViewAnimation
                  outputRange={["0deg", "60deg", "-60deg", "0deg"]}
                  inputRange={[0, 1, 2, 3]}
                  comp={() => {
                    return (
                      <FadeInOutAnimations
                        comp={() => {
                          return (
                            <TouchableOpacity
                              onPress={() => {
                                Linking.openURL(
                                  "https://www.youtube.com/channel/UCEWSZGFJBWEFOPxQ0yPIQWg?app=desktop"
                                );
                              }}
                            >
                              <View
                                style={{
                                  height: 50,
                                  width: 50,
                                  backgroundColor: "#DDE8EE",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 25,
                                }}
                              >
                                <Icon
                                  name="youtube"
                                  size={35}
                                  color="red"
                                ></Icon>
                              </View>
                            </TouchableOpacity>
                          );
                        }}
                      ></FadeInOutAnimations>
                     );
                  }}
                /> 

                <RotateViewAnimation
                  outputRange={["0deg", "60deg", "-60deg", "0deg"]}
                  inputRange={[0, 1, 2, 3]}
                  comp={() => {
                    return (
                      <FadeInOutAnimations
                        comp={() => {
                          return (
                            <TouchableOpacity
                              onPress={() => {
                                Linking.openURL(
                                  "https://www.instagram.com/cg_industrialdivision/"
                                );
                              }}
                            >
                              <Instagram
                                name="instagram"
                                size={40}
                                color="red"
                              ></Instagram>
                            </TouchableOpacity>
                          );
                        }}
                      ></FadeInOutAnimations>
                     );
                  }}
                />

                <RotateViewAnimation
                   outputRange={["0deg", "60deg", "-60deg", "0deg"]}
                   inputRange={[0, 1, 2, 3]}
                   comp={() => {
                     return (
                      <FadeInOutAnimations
                        comp={() => {
                          return (
                            <TouchableOpacity
                              onPress={() => {
                                Linking.openURL("https:www.cgglobal.com/");
                              }}
                            >
                              <View
                                style={{
                                  height: 50,
                                  width: 50,
                                  backgroundColor: "#DDE8EE",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 25,
                                }}
                              >
                                <Image
                                  style={{ height: 50, width: 100 }}
                                  resizeMode="contain"
                                  source={appIcon}
                                ></Image>
                              </View>
                            </TouchableOpacity>
                          );
                        }}
                      ></FadeInOutAnimations>
                     );
                  }}
                /> 
              </View>
          
            <TouchableWithoutFeedback
              onPress={() => {
                setShowLink(!showLink);
              }}
              style={{ width: "15%", marginBottom: 10 }}
            >
              <View
                style={{
                  backgroundColor: ternaryThemeColor,
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Link name="sharealt" color={"white"} size={30}></Link>
              </View>
            </TouchableWithoutFeedback>
          </View> */}
          {userPointIsLoading && (
            <View>
              <Text style={{ color: "black", fontSize: 10 }}>
                Dashboard Menu Loading
              </Text>

              <FastImage
                style={{
                  width: 100,
                  height: 100,
                  alignSelf: "center",
                  // marginTop: 20,
                }}
                source={{
                  uri: gifUri, // Update the path to your GIF
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          )}
          <View style={{ width: '100%', alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            {showKyc && <KYCVerificationComponent buttonTitle={t("Complete Your KYC")} title={t("Your KYC is not completed")}></KYCVerificationComponent>}
          </View>
          {/* <View style={{ flexDirection: "row", width: '100%', alignItems: "center", justifyContent: 'space-evenly' }}>
            {(userData.user_type).toLowerCase()!=="sales" &&<DashboardSupportBox title={t("rewards")} text="Rewards" backgroundColor="#D9C7B6" borderColor="#FEE8D4" image={require('../../../assets/images/reward_dashboard.png')} ></DashboardSupportBox>}
            <DashboardSupportBox title={t("customer support")} text="Customer Support" backgroundColor="#BCB5DC" borderColor="#E4E0FC" image={require('../../../assets/images/support.png')} ></DashboardSupportBox>
            <DashboardSupportBox title={t("feedback")} text="Feedback" backgroundColor="#D8C8C8" borderColor="#FDDADA" image={require('../../../assets/images/feedback.png')} ></DashboardSupportBox>

          </View> */}
          {/* <Button
        title="Add To Basket"
        onPress={async () =>
          await analytics().logEvent('basket', {
            id: 3745092,
            item: 'mens grey t-shirt',
            description: ['round neck', 'long sleeved'],
            size: 'L',
          })
        }
      /> */}

          {/* --------------------- */}
        </View>
      </ScrollView>
      <View style={{ marginTop: 30 }}></View>
      {/* social links */}
    </View>
  );
};

const styles = StyleSheet.create({});

export default Dashboard;
