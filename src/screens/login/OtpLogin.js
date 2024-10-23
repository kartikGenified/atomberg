import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { BaseUrl } from "../../utils/BaseUrl";
import LinearGradient from "react-native-linear-gradient";
import PoppinsTextMedium from "../../components/electrons/customFonts/PoppinsTextMedium";
import PoppinsText from "../../components/electrons/customFonts/PoppinsText";
import CustomTextInput from "../../components/organisms/CustomTextInput";
import CustomTextInputNumeric from "../../components/organisms/CustomTextInputNumeric";
import ButtonNavigateArrow from "../../components/atoms/buttons/ButtonNavigateArrow";
import { useGetLoginOtpMutation } from "../../apiServices/login/otpBased/SendOtpApi";
import ButtonNavigate from "../../components/atoms/buttons/ButtonNavigate";
import ErrorModal from "../../components/modals/ErrorModal";
import { useGetNameMutation } from "../../apiServices/login/GetNameByMobile";
import TextInputRectangularWithPlaceholder from "../../components/atoms/input/TextInputRectangularWithPlaceholder";
import { useIsFocused } from "@react-navigation/native";
import PoppinsTextLeftMedium from "../../components/electrons/customFonts/PoppinsTextLeftMedium";
import Checkbox from "../../components/atoms/checkbox/Checkbox";
import { useFetchLegalsMutation } from "../../apiServices/fetchLegal/FetchLegalApi";
import * as Keychain from "react-native-keychain";
import FastImage from "react-native-fast-image";
import { useTranslation } from "react-i18next";
import AlertModal from "../../components/modals/AlertModal";
import crashlytics from "@react-native-firebase/crashlytics";
import { appIcon } from "../../utils/HandleClientSetup";

const OtpLogin = ({ navigation, route }) => {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState();
  const [error, setError] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [hideButton, setHideButton] = useState(false);
  const [alert, setAlert] = useState(false);
  const { t } = useTranslation();
  // fetching theme for the screen-----------------------

  const primaryThemeColor = useSelector(
    (state) => state.apptheme.primaryThemeColor
  );

  const secondaryThemeColor = useSelector(
    (state) => state.apptheme.secondaryThemeColor
  );

  const ternaryThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  );

  const buttonThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  );

  const icon = useSelector((state) => state.apptheme.icon);

  // ------------------------------------------------
  const focused = useIsFocused();
  // send otp for login--------------------------------
  const [
    sendOtpFunc,
    {
      data: sendOtpData,
      error: sendOtpError,
      isLoading: sendOtpIsLoading,
      isError: sendOtpIsError,
    },
  ] = useGetLoginOtpMutation();

  const [
    getTermsAndCondition,
    {
      data: getTermsData,
      error: getTermsError,
      isLoading: termsLoading,
      isError: termsIsError,
    },
  ] = useFetchLegalsMutation();

  const [
    getNameFunc,
    {
      data: getNameData,
      error: getNameError,
      isLoading: getLoading,
      isError: getIsError,
    },
  ] = useGetNameMutation();

  const needsApproval = route?.params?.needsApproval;
  const user_type_id = route?.params?.userId;
  const user_type = route?.params?.userType;
  const registrationRequired = route?.params?.registrationRequired;
  // console.log("registrationRequiredotpLogin", registrationRequired);
  // const width = Dimensions.get("window").width;
  const navigationParams = {
    needsApproval: needsApproval,
    user_type_id: user_type_id,
    user_type: user_type,
    mobile: mobile,
    name: name,
  };
  console.log("navigationParams", navigationParams);
  const gifUri = Image.resolveAssetSource(
    require("../../../assets/gif/atomLoader.gif")
  ).uri;
  useEffect(() => {
    fetchTerms();
    setHideButton(false);
  }, [focused, registrationRequired]);

  useEffect(() => {
    if (getTermsData) {
      // console.log("getTermsData", getTermsData?.body?.data?.[0]?.files[0]);
    } else if (getTermsError) {
      console.log("gettermserror", getTermsError);
    }
  }, [getTermsData, getTermsError]);

  useEffect(() => {
    if (sendOtpData) {
      console.log("sendOtpData", sendOtpData);
      if (sendOtpData?.success === true && mobile.length === 10) {
        if (Object.keys(getNameData.body).length != 0) {
          navigation.navigate("VerifyOtp", { navigationParams });
        }
      } else {
        console.log("Trying to open error modal");
      }
      setHideButton(false);
    } else if (sendOtpError) {
      console.log("err", sendOtpError);
      if (sendOtpError.status == 400) setAlert(true);
      else setError(true);
      setHideButton(false);
      setMessage(sendOtpError?.data?.message);
    }
  }, [sendOtpData, sendOtpError]);

  useEffect(() => {
    if (getNameData) {
      console.log("getNameData", getNameData);
      if (getNameData?.success) {
        setName(getNameData?.body.name);
      }
    } else if (getNameError) {
      console.log("getNameError", getNameError);
    }
  }, [getNameData, getNameError]);

  useEffect(() => {
    console.log("Name in use effect--------->>>>>>>>>>>>>>>", name);
  }, [name]);

  const getMobile = (data) => {
    // console.log(data)
    const reg = "^([0|+[0-9]{1,5})?([6-9][0-9]{9})$";
    const mobReg = new RegExp(reg);

    setMobile(data);
    if (data !== undefined) {
      if (data.length === 10) {
        if (mobReg.test(data)) {
          getNameFunc({ mobile: data });
          Keyboard.dismiss();
        } else {
          setError(true);
          setMessage("Please enter a valid mobile number");
        }
      }
    }
  };

  const fetchTerms = async () => {
    const credentials = await Keychain.getGenericPassword();
    const token = credentials.username;
    const params = {
      type: "term-and-condition",
    };
    getTermsAndCondition(params);
  };

  const getName = (data) => {
    const nameRegex = /^[a-zA-Z\s-]+$/;
    console.log("Data getting function", data);
    if (data !== undefined) {
      setName(data);
    }
  };

  const getCheckBoxData = (data) => {
    setIsChecked(data);
    console.log("Checkbox data", data);
  };

  const navigateToOtp = () => {
    sendOtpFunc({ mobile, name, user_type, user_type_id });
    setHideButton(true);
    // navigation.navigate('VerifyOtp',{navigationParams})
  };
  const handleButtonPress = () => {
    crashlytics().setAttributes({
      name: "test",
      id: "13",
      email: "nishankphulera@gmail.com",
      userType: "carpenter",
    });
    // console.log("first",getNameData.message)
    // console.log("mobile",mobile,name.length,name,isChecked,getNameData)
    if (isChecked) {
      console.log("handleButtonPress", getNameData, isChecked, name, mobile);
      if (
        getNameData &&
        isChecked &&
        name !== undefined &&
        mobile !== undefined &&
        name != "" &&
        mobile.length !== 0 &&
        name.length !== 0
      ) {
        // console.log("mobile",mobile,name.length)
        if (getNameData.message === "Not Found") {
          console.log("registrationRequired", registrationRequired);
          if (mobile?.length == 10) {
            if (registrationRequired) {
              setMobile("");
              setName("");
              navigation.navigate("BasicInfo", {
                needsApproval: needsApproval,
                userType: user_type,
                userId: user_type_id,
                name: name,
                mobile: mobile,
                navigatingFrom: "OtpLogin",
                registrationRequired: registrationRequired,
              });
            } else {
              navigateToOtp();
            }
          } else {
            setError(true);
            setMessage("Please enter your 10 digit mobile number");
          }
          // setName('')
          // setMobile('')
        } else {
          sendOtpFunc({ mobile, name, user_type, user_type_id });
          // navigation.navigate('VerifyOtp',{navigationParams})
        }
      } else {
        if (mobile?.length != 10) {
          setError(true);
          setMessage("Please enter your 10 digit mobile number");
        } else if (name == undefined || name == "") {
          setError(true);
          setMessage("Please enter name");
        }
      }
    } else {
      setError(true);
      setMessage("Please Accept Terms and condition");
    }
  };

  const modalClose = () => {
    setError(false);
    setAlert(false);
  };
  return (
    <LinearGradient colors={["white", "white"]} style={styles.container}>
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "flex-start",
          backgroundColor: 'white',
          height:'30%'
        }}
      >
        <View
          style={{
            
            width: "100%",
            alignItems: "flex-start",
            justifyContent: 'space-between',
            paddingTop:10,
            flexDirection: "row",
          }}
        >
          
          <TouchableOpacity
            style={{
              height: 40,
              alignItems: "center",
              justifyContent: "center",
             marginLeft:20,
             marginTop:10
            }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              style={{ height: 26, width: 26, resizeMode: "contain" }}
              source={require("../../../assets/images/blackBack.png")}
            ></Image>
          </TouchableOpacity>

          { registrationRequired && user_type!== "consumer" && (
          <View style={{ flexDirection:'row',}}>
                    <Image
            style={{
              height: 90,
              width: 110,
              marginRight:20,
              resizeMode: "contain",
            
            }}
            source={appIcon}
          ></Image>
            
            <View style={{marginTop:10, height:65}}>
            <ButtonNavigate
              handleOperation={() => {
                navigation.navigate("BasicInfo", {
                  needsApproval: needsApproval,
                  userType: user_type,
                  userId: user_type_id,
                  name: name,
                  mobile: mobile,
                  navigatingFrom: "OtpLogin",
                });
              }}
              backgroundColor="black"
              style={{ color: "white", fontSize: 16 }}
              content="Register"
              navigateTo="BasicInfo"
              properties={{
                needsApproval: needsApproval,
                userType: user_type,
                userId: user_type_id,
                name: name,
                mobile: mobile,
                navigatingFrom: "OtpLogin",
              }}
            ></ButtonNavigate>
              </View>
           
            
          </View>

        )}
  
        </View>
        <View
          style={{
            alignItems: "flex-start",
            justifyContent: "center",
            marginTop: 0,
            marginLeft:12,

            width: "90%",
          }}
        >
          <PoppinsText
            style={{ color: "black", fontSize: 28,marginLeft:5  }}
            content={t("tell us number")}
          ></PoppinsText>
        </View>
      </View>

      {error && (
        <ErrorModal
          modalClose={modalClose}
          message={message}
          openModal={error}
        ></ErrorModal>
      )}
      {alert && (
        <AlertModal
          modalClose={modalClose}
          message={message}
          openModal={alert}
        ></AlertModal>
      )}
      <View style={{height:'70%',width:'100%',alignItems:'center',justifyContent:'center'}}>
      <ScrollView contentContainerStyle={{ }} style={{width:'90%' ,backgroundColor:'white'}}>
        <KeyboardAvoidingView style={{}}>
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 40,
            }}
          >
            <TextInputRectangularWithPlaceholder
              placeHolder={t("mobile no")}
              handleData={getMobile}
              maxLength={10}
              value={mobile}
              KeyboardType="numeric"
            ></TextInputRectangularWithPlaceholder>

            <TextInputRectangularWithPlaceholder
              placeHolder={t("name")}
              handleData={getName}
              value={name}
              specialCharValidation={true}
            ></TextInputRectangularWithPlaceholder>
          </View>
        </KeyboardAvoidingView>

        <View
          style={{
            width: "100%",
            height:'50%',
            backgroundColor:'white',
            // marginTop: 20,
            marginBottom: 30,
            marginLeft: 10,
          }}
        >
          <View style={{ flexDirection: "row", marginHorizontal: 24 }}>
            <Checkbox CheckBoxData={getCheckBoxData} />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("PdfComponent", {
                  pdf: getTermsData?.body?.data?.[0]?.files[0],
                });
              }}
            >
              <PoppinsTextLeftMedium
                content={t("terms and condition")}
                style={{
                  color: "#808080",
                  marginHorizontal: 30,
                  marginBottom: 20,
                  fontSize: 15,
                  marginLeft: 8,
                  marginTop: 16,
                }}
              ></PoppinsTextLeftMedium>
            </TouchableOpacity>
          </View>

          <ButtonNavigateArrow
            success={success}
            handleOperation={handleButtonPress}
            backgroundColor={"#80C343"}
            style={{ color: "white", fontSize: 16 }}
            isLoading={sendOtpIsLoading}
            content={t("login")}
            navigateTo="VerifyOtp"
            navigationParams={navigationParams}
            mobileLength={mobile}
            isChecked={
              isChecked && mobile?.length == 10 && name != "" && !hideButton
            }
          ></ButtonNavigateArrow>
         
          {sendOtpIsLoading && (
            <FastImage
              style={{
                width: 100,
                height: 100,
                alignSelf: "center",
                marginTop: 10,
              }}
              source={{
                uri: gifUri, // Update the path to your GIF
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </View>

      
      </ScrollView>
      <KeyboardAvoidingView style={{flexDirection:'row',justifyContent:'space-evenly',width:'100%'}}>
      {/* <View style={{alignItems:'center',justifyContent:'center'}}>
          <Image style={{height:80,width:110,resizeMode:'contain'}} source={require('../../../assets/images/iconG.jpg')}></Image>
        </View> */}
      {/* <View style={{alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
            <View style={{backgroundColor:'#80C343',padding:4}}>
            <PoppinsTextMedium style={{color:'white',fontSize:24,fontWeight:'bold'}} content= "CG "></PoppinsTextMedium>
            </View>
            <View style={{backgroundColor:'#075CA9',padding:4}}>
          <PoppinsTextMedium style={{color:'white',fontSize:24,fontWeight:'bold'}} content= "Vishwas"></PoppinsTextMedium>
            
            </View>
        </View> */}
        
        </KeyboardAvoidingView>
      </View>
        
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    height:'100%'
  },
  semicircle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  banner: {
    height: 184,
    width: "90%",
    borderRadius: 10,
  },
  userListContainer: {
    width: "100%",
    height: 600,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});

export default OtpLogin;
