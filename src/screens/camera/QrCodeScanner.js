import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ScrollView,
  FlatList,
  Alert,
  Linking,
  PermissionsAndroid,
  AppState,
  ActivityIndicator,
  ToastAndroid,
  Vibration,
  BackHandler,
  Button,
  TextInput,
  Keyboard,
  Modal,
} from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import PoppinsText from "../../components/electrons/customFonts/PoppinsText";
import PoppinsTextMedium from "../../components/electrons/customFonts/PoppinsTextMedium";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ScannedListItem from "../../components/atoms/ScannedListItem";
import * as Keychain from "react-native-keychain";
import {
  useVerifyQrByBatchMutation,
  useVerifyQrMutation,
} from "../../apiServices/qrScan/VerifyQrApi";
import ErrorModal from "../../components/modals/ErrorModal";
import ButtonProceed from "../../components/atoms/buttons/ButtonProceed";
import { useAddQrMutation } from "../../apiServices/qrScan/AddQrApi";
import { useSelector, useDispatch } from "react-redux";
import { setQrData, setQrIdList } from "../../../redux/slices/qrCodeDataSlice";
import { useCheckGenuinityMutation } from "../../apiServices/workflow/genuinity/GetGenuinityApi";
import { useCheckWarrantyMutation } from "../../apiServices/workflow/warranty/ActivateWarrantyApi";
import { useGetProductDataMutation } from "../../apiServices/product/productApi";
import {
  setProductData,
  setProductMrp,
  setScanningType,
} from "../../../redux/slices/getProductSlice";
import { useAddBulkQrMutation } from "../../apiServices/bulkScan/BulkScanApi";
import { slug } from "../../utils/Slug";
import MessageModal from "../../components/modals/MessageModal";
import ModalWithBorder from "../../components/modals/ModalWithBorder";
import Close from "react-native-vector-icons/Ionicons";
import RNQRGenerator from "rn-qr-generator";
import {
  useCashPerPointMutation,
  useFetchUserPointsHistoryMutation,
} from "../../apiServices/workflow/rewards/GetPointsApi";
import FastImage from "react-native-fast-image";
import {
  setFirstScan,
  setRegistrationBonusFirstScan,
} from "../../../redux/slices/scanningSlice";

import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useInternetSpeedContext } from "../../Contexts/useInternetSpeedContext";
import InternetModal from "../../components/modals/InternetModal";
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import scanDelay from "../../utils/ScannedDelayUtil";
import UpdateModal from "../../components/modals/UpdateModal";
import { useVerifyBarMutation } from "../../apiServices/barCodeApi/verifyBarCodeApi";
import ImageGallery from "../image/ImageGallery";
import { splitX } from "../../utils/globalFunctions/splitX";
import Sound from "react-native-sound";

const QrCodeScanner = ({ navigation, route }) => {
  const [zoom, setZoom] = useState(0);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [zoomText, setZoomText] = useState("1");
  const [flash, setFlash] = useState(false);
  const [update, setUpdate] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [addedQrList, setAddedQrList] = useState([]);
  const [success, setSuccess] = useState(false);
  const [cameraAccessMessage, setCameraAccessMessage] = useState("");
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [message, setMessage] = useState();
  const [manualOption, setManualOption] = useState();
  const [error, setError] = useState(false);
  const [isDuplicateQr, setIsDuplicateQr] = useState(new Set());
  const [savedToken, setSavedToken] = useState();
  const [qr_id, setQr_id] = useState();
  const [isSlowInternet, setIsSlowInternet] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [fetchLocation, setFetchLocation] = useState(false);
  const [keyboardShow, setKeyboardShow] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [isReportable, setIsReportable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [chooseModalVisible, setChooseModalVisible] = useState(false);

  const [manualText, setManualText] = useState("");
  const [showProceed, setShowProceed] = useState(false);
  const [manualInputVisible, setManualInputVisible] = useState(false);
  const [batchCodeAvail, setIsBatchCodeAvail] = useState(false);
  const [manualQrCode, setManualQrCode] = useState("");
  const scan_type = route.params.scan_type;
  const qrList = route.params.oldaddedQrList;
  console.log("old added qr list", qrList);
  const userId = useSelector((state) => state.appusersdata.userId);
  const userData = useSelector((state) => state.appusersdata.userData);
  const userType = useSelector((state) => state.appusersdata.userType);
  const userName = useSelector((state) => state.appusersdata.name);
  const cameraPermissionStatus = useSelector(
    (state) => state.cameraStatus.cameraPermissionStatus
  );
  const cameraStatus = useSelector((state) => state.cameraStatus.cameraStatus);
  const locationEnabledd = useSelector(
    (state) => state.userLocation.locationEnabled
  );
  const locationPermissionStatus = useSelector(
    (state) => state.userLocation.locationPermissionStatus
  );
  const workflowProgram = useSelector((state) => state.appWorkflow.program);
  const location = useSelector((state) => state.userLocation.location);
  const currentVersion = useSelector((state) => state.appusers.app_version);
  const focused = useIsFocused();
  const device = useCameraDevice("back");
  
  console.log("scan_type", scan_type);

  

  const { responseTime, loading } = useInternetSpeedContext();
  console.log("workflowProgram", workflowProgram);
  console.log(
    cameraPermissionStatus,
    cameraStatus,
    locationEnabledd,
    locationPermissionStatus
  );
  const requiresLocation = route.params?.requiresLocation;
  const ternaryThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  )
    ? useSelector((state) => state.apptheme.ternaryThemeColor)
    : "grey";
  const gifUri = Image.resolveAssetSource(
    require("../../../assets/gif/cgLoader.gif")
  ).uri;
  const dispatch = useDispatch();
  Sound.setCategory('Playback');
  // console.log('Workflow Program is ',location);
  let addedqr = [];

  const isFocused = useIsFocused();
  // let isActive = isFocused  === "active"

  const { t } = useTranslation();
  // console.log("Selector state",useSelector((state)=>state.appusersdata.userId))

  // mutations ----------------------------------------
  const [
    verifyQrFunc,
    {
      data: verifyQrData,
      error: verifyQrError,
      isLoading: verifyQrIsLoading,
      isError: verifyQrIsError,
    },
  ] = useVerifyQrMutation();

  const [
    verifyQrbyBatchFunc,
    {
      data: verifyQrbyBatchData,
      error: verifyQrByBatchError,
      isLoading: verifyQrbyBatchIsLoading,
      isError: verifyQrbyBatchIsError,
    },
  ] = useVerifyQrByBatchMutation();

  const [
    checkGenuinityFunc,
    {
      data: checkGenuinityData,
      error: checkGenuinityError,
      isLoading: checkGenuinityIsLoading,
      isError: checkGenuinityIsError,
    },
  ] = useCheckGenuinityMutation();

  const [
    verifyBarScannerFunc,
    {
      data: verifyBarData,
      error: verifyBarError,
      isLoading: verifyBarIsLoading,
      isError: verifyBarIsError,
    },
  ] = useVerifyBarMutation();

  const [
    checkWarrantyFunc,
    {
      data: checkWarrantyData,
      error: checkWarrantyError,
      isLoading: checkWarrantyIsLoading,
      isError: checkWarrantyIsError,
    },
  ] = useCheckWarrantyMutation();

  const [
    productDataFunc,
    {
      data: productDataData,
      error: productDataError,
      isLoading: productDataIsLoading,
      isError: productDataIsError,
    },
  ] = useGetProductDataMutation();

  const [
    addBulkQrFunc,
    {
      data: addBulkQrData,
      error: addBulkQrError,
      isLoading: addBulkQrIsLoading,
      isError: addBulkQrIsError,
    },
  ] = useAddBulkQrMutation();

  Keyboard.addListener("keyboardDidShow", () => {
    setKeyboardShow(true);
  });
  Keyboard.addListener("keyboardDidHide", () => {
    setKeyboardShow(false);
  });

  // useEffect(() => {
  //   setAddedQrList([]);
  // }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (scan_type == "Manual") {
      setModalVisible(true);
    }
  }, []);

  useEffect(() => {
    console.log("added Qr list here", qrList);

    setAddedQrList(qrList ? qrList : []);
  }, []);

  useEffect(() => {
    if (addBulkQrData) {
      console.log("addBulkQrData", addBulkQrData);
      if (addBulkQrData.success) {
        setTimeout(() => {
          setShowProceed(true);
        }, 1200);
        // isFirstScan && checkFirstScan()
        if (checkGenuinityData) {
          if (checkGenuinityData?.body) {
            // console.log("check warranty data",checkWarrantyData)
            if (checkWarrantyError) {
              if (checkWarrantyError?.data?.body) {
                setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+", "Warranty");
                }, 1000);
              } else {
                setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+");
                }, 1000);
              }
            } else if (checkWarrantyData) {
              if (checkWarrantyData?.body) {
                setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+", "Warranty");
                }, 1000);
              } else {
                setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+");
                }, 1000);
              }
            }
          } else {
            if (checkWarrantyError) {
              if (checkWarrantyError?.data?.body) {
                setTimeout(() => {
                  handleWorkflowNavigation("Warranty");
                }, 1000);
              } else {
                handleWorkflowNavigation();
              }
            } else if (checkWarrantyData) {
              if (checkWarrantyData?.body) {
                setTimeout(() => {
                  handleWorkflowNavigation("Warranty");
                }, 1000);
              } else {
                setTimeout(() => {
                  handleWorkflowNavigation();
                }, 1000);
              }
            } else {
              setTimeout(() => {
                handleWorkflowNavigation();
              }, 1000);
            }
          }
        } else if (checkWarrantyError) {
          if (checkWarrantyError?.data?.body) {
            if (checkGenuinityData) {
              if (checkGenuinityData?.body) {
                setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+", "Warranty");
                }, 1000);
              } else {
                setTimeout(() => {
                  handleWorkflowNavigation("Warranty");
                }, 1000);
              }
            }
          }
        } else {
          // console.log("else")

          setTimeout(() => {
            handleWorkflowNavigation();
          }, 1000);
        }
      }
    } else if (addBulkQrError) {
      console.log("addBulkQrError", addBulkQrError);
      setTimeout(() => {
        setShowProceed(true);
      }, 1200);

      if (addBulkQrError.data) {
        if (addBulkQrError.status == 400) {
          setUpdate(true);
          setMessage(addBulkQrError.data?.message);
        } else {
          setError(true);
          setMessage(addBulkQrError.data?.message);
        }
      }
    }
  }, [addBulkQrData, addBulkQrError]);

  useEffect(() => {
    if (checkGenuinityData) {
      console.log("genuinity check", checkGenuinityData);
    } else if (checkGenuinityError) {
      if (checkGenuinityError.status == 401) {
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
        setMessage("Unable to check warranty status of this QR");
      }
      // console.log('Error', checkGenuinityError);
    }
  }, [checkGenuinityData, checkGenuinityError]);

  useEffect(() => {
    if (checkWarrantyData) {
      console.log("warranty check", checkWarrantyData);
    } else if (checkWarrantyError) {
      if (checkWarrantyError.status == 401) {
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
        setMessage("Unable to check warranty status of this QR");
      }
      // console.log('warranty Error', checkWarrantyError);
    }
  }, [checkWarrantyData, checkWarrantyError]);

  useEffect(() => {
    if (productDataData) {
      const form_type = "2";
      const token = savedToken;
      console.log("Product Data is ", productDataData?.body);

      if (productDataData?.body?.products.length !== 0) {
        if (productDataData?.body?.products[0].points_active === "2") {
          setError(true);
          setMessage("Reward is not activated for this product");
        } else {
          const body = {
            product_id: productDataData?.body?.products[0].product_id,
            qr_id: qr_id,
          };
          // console.log("productdata",body)
          dispatch(setProductData(productDataData?.body?.products[0]));

          workflowProgram.includes("Warranty") &&
            checkWarrantyFunc({ form_type, token, body });
          setTimeout(() => {
            setShowProceed(true);
          }, 1000);
        }
      } else {
        setError(true);
        setMessage("Product data not available.");
        if (addedQrList.length === 1) {
          setShowProceed(false);
        } else {
          setShowProceed(true);
        }
      }
    } else if (productDataError) {
      if (productDataError.status == 401) {
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
        // console.log('pr Error', productDataError);
        setError(true);
        setMessage(productDataError?.data?.Error?.message);
      }
    }
  }, [productDataData, productDataError]);
  // ----------------------------------------------------
  const height = Dimensions.get("window").height;
  const platform = Platform.OS === "ios" ? "1" : "2";
  const platformMargin = Platform.OS === "ios" ? -60 : -160;
  const toDate = undefined;
  var fromDate = undefined;

  useEffect(() => {
    if (Object.keys(location).length == 0) {
      setLocationGranted(false);
    } else {
      setLocationGranted(true);
    }
  }, [location]);

  useEffect(() => {
    console.log(
      "Location and camera status",
      cameraPermissionStatus,
      cameraStatus,
      locationEnabled,
      locationPermissionStatus
    );
  }, [cameraPermissionStatus, cameraStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log("AppState", appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    refreshScanner();
  }, []);

  // checking for response time
  useEffect(() => {
    console.log("responseTime", responseTime);
    if (responseTime > 4000) {
      setIsSlowInternet(true);
    }
    if (responseTime < 4000) {
      setIsSlowInternet(false);
    }
  }, [responseTime]);

  useEffect(() => {
    if (verifyQrData) {
      // console.log("Verify qr data", verifyQrData);
      setIsLoading(false);
      dispatch(setProductMrp(verifyQrData?.body?.qr));

      // let qrStatus,statusCode;

      // if(verifyQrData?.body?.qr!==undefined)
      // {
      //   qrStatus = verifyQrData.body?.qr?.qr_status == undefined
      //   statusCode = verifyQrData?.status;

      //  if (qrStatus === "1") {
      //    addQrDataToList(verifyQrData.body.qr);
      //  }
      // }
      // else{
      //   dispatch(setProductMrp(verifyQrData?.body))
      //   qrStatus = verifyQrData.body?.qr_status == undefined
      //   statusCode = verifyQrData?.status;

      //  if (qrStatus === "1") {
      //    addQrDataToList(verifyQrData.body);
      //  }
      // }

      // if (qrStatus === "2") {
      //   if (statusCode === 201) {
      //     setError(true);
      //     setMessage(verifyQrData.message);
      //   } else if (statusCode === 202) {
      //     setIsReportable(true);
      //     setError(true);
      //     setMessage(verifyQrData.message);
      //   } else if (statusCode === 200) {
      //     setError(true);
      //     setMessage(verifyQrData.message);
      //   }
      // }
    } else if (verifyQrError) {
      setIsLoading(false);
      if (verifyQrError === undefined) {
        setError(true);
        setMessage("This QR is not activated yet");
      } else {
        setError(true);
        setMessage(verifyQrError.data?.message);
      }
      // console.log('Verify qr error', verifyQrError?.data?.Error);
    }
  }, [verifyQrData, verifyQrError]);

  useEffect(() => {
    if (verifyQrbyBatchData) {
      // console.log("Verify qr data", verifyQrData);
      setIsLoading(false);

      dispatch(setProductMrp(verifyQrData?.body?.qr));
    } else if (verifyQrByBatchError) {
      setIsLoading(false);
      if (verifyQrError === undefined) {
        setError(true);
        setMessage("This QR is not activated yet");
      } else {
        setError(true);
        setMessage(verifyQrError.data?.message);
      }
      // console.log('Verify qr error', verifyQrError?.data?.Error);
    }
  }, [verifyQrbyBatchData, verifyQrByBatchError]);

  // --------------------------------------------------------
  useEffect(() => {
    if (verifyBarData) {
      addQrDataToList(verifyBarData.body);

      console.log("Verify bar data", verifyBarData);
      if (verifyBarData.body?.status === "1") {
        addQrDataToList(verifyBarData.body);
      }
      if (verifyBarData.body?.status === "2" && verifyBarData.status === 201) {
        setError(true);
        setMessage(verifyBarData.message);
      }
      if (verifyBarData.body?.status === "2" && verifyBarData.status === 202) {
        setIsReportable(true);
        setError(true);
        setMessage(verifyBarData.message);
      }
    } else if (verifyBarError) {
      // setScannedCodes(prevCodes => {
      //   const newCodes = new Set(prevCodes);
      //   newCodes.delete(lastScanned);
      //   return newCodes;
      // });

      if (verifyBarError === undefined) {
        setError(true);
        setMessage("This QR is not activated yet");
      } else {
        if (verifyBarError.status !== 409) {
          setError(true);
          setMessage(JSON.stringify(verifyBarError?.data?.Error?.error));
        } else {
          setError(true);
          setMessage(verifyBarError?.data?.message);
        }
      }
      console.log("Verify qr error", verifyBarError);
    }
  }, [verifyBarData, verifyBarError]);

  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "pink" }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "400",
        }}
      />
    ),

    error: ({ text1, props }) => (
      <View
        style={{
          height: 60,
          width: "70%",
          backgroundColor: ternaryThemeColor,
          borderWidth: 1,
          borderColor: ternaryThemeColor,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "800" }}>{text1}</Text>
        <Text>{props.uuid}</Text>
      </View>
    ),
  };

  const modalClose = () => {
    setError(false);
    setSuccess(false);
    setIsReportable(false);
    setManualOption(false);
  };

  const handleManualInput = () => {
    setQrData(manualQrCode);
    // Process the manually entered data
  };

  // const  splitX = (val) =>{
  //   let splitArr = []
  //   console.log("They Valllll", val)
  //   for(let i = val.length - 1; i >= 0; i--){
  //     //cases
  //       if(val[i] == ","){
  //         splitArr.length = 0
  //       }
  //       if(val[i] == " "){
  //         splitArr.length = 0
  //       }
  //       if(val[i] == "-"){
  //         splitArr.length = 0
  //       }

  //       //logic
  //       console.log("Val[i]", val[i])
  //       if(val[i] != "X" ){
  //         if(val[i]!="," && val[i] != "" && val[i] != "-"){
  //           splitArr.push(val[i])
  //         }
  //       }
  //       else{
  //         if(splitArr.length >= 9){
  //           return splitArr.reverse().join("")
  //         }
  //       }
  //   }

  //   return splitArr.reverse().join("")
  // }

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const codeScanner = useCodeScanner({

    

    codeTypes: scan_type == "Bar" ? ["code-128"] : ["qr"],
    onCodeScanned: debounce((codes) => {

      var dingSound = new Sound('capture.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        // loaded successfully
        console.log('duration in seconds: ' + dingSound.getDuration() + 'number of channels: ' + dingSound.getNumberOfChannels())
      
        dingSound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
    
      });

      console.log(`Scanned ${codes.length} codes!`, codes[0]?.value);
      scanDelay(codes[0]?.value, () => {
        Vibration.vibrate([1000, 1000, 1000]);

        if (codes[0]?.value.includes("X")) {
          setIsBatchCodeAvail(true);
        }

        let newValue = codes[0]?.value.includes("X")
          ? "X" + splitX(codes[0]?.value) // Get the part after "X"
          : codes[0]?.value;

          console.log("Newwwww Valueeee",  newValue)



        onSuccess(newValue);
      });
    }, 100), // Debounce time: adjust as needed
  });

  const onSuccess = async (e) => {
    setKeyboardShow(false);
    console.log("Qr data is ------", e);
    console.log("addedQrListIs", addedQrList);
    console.log("isDuplicateQr", isDuplicateQr);

    if (e === undefined) {
      setError(true);
      setMessage("Please scan a valid QR");
    } else {
      const verifyQR = async (data) => {
        console.log("qrDataVerifyQR", data);
        if (data?.unique_code != undefined) {
          try {
            // Retrieve the credentials
            const credentials = await Keychain.getGenericPassword();
            if (credentials) {
              setSavedToken(credentials?.username);
              const token = credentials?.username;
              let response;
              if (scan_type == "Manual") {
                response = await verifyQrbyBatchFunc({ token, data });
              } else {
                if (batchCodeAvail) {
                  response = await verifyQrbyBatchFunc({ token, data });
                } else {
                  response = await verifyQrFunc({ token, data });
                }
              }
              console.log("verifyQrFunc", response);
              if (response?.data) {
                console.log("Verify qr dataaaaaa", JSON.stringify(response));
                if (response?.data?.body == null) {
                  setTimeout(() => {
                    setError(true);
                    setMessage("Can't get product data");
                  }, 1000);
                  setManualOption(true);
                  
                }

                const qrStatus =
                  response?.data.body?.qr?.qr_status == undefined
                    ? response?.data.body?.qr_status
                    : response?.data.body?.qr?.qr_status;

                console.log("qrStatus heloo world", qrStatus);

                const statusCode = response?.data?.status;
                const verifiedQrData =
                  response?.data.body.qr == undefined
                    ? response?.data.body
                    : response?.data.body.qr;

                if (qrStatus === "1") {
                  console.log(
                    "qr status is 1 and verifiedqrda is ",
                    verifiedQrData
                  );
                  setShowProceed(true);
                  // setModalVisible(false);
                  await addQrDataToList(verifiedQrData);
                }

                if (qrStatus === "2") {
                  const updatedDuplicateQr = new Set(isDuplicateQr);
                  updatedDuplicateQr.delete(String(data?.unique_code));

                  setIsDuplicateQr(updatedDuplicateQr);

                  if (statusCode === 201) {
                    setError(true);
                    setMessage(response?.data.message);
                  } else if (statusCode === 202) {
                    setIsReportable(true);
                    setError(true);
                    setMessage(response?.data.message);
                  } else if (statusCode === 200) {
                    setError(true);
                    setMessage(response?.data.message);
                  }
                }
              } else {
                const updatedDuplicateQr = new Set(isDuplicateQr);
                updatedDuplicateQr.delete(String(data?.unique_code));

                setIsDuplicateQr(updatedDuplicateQr);
                console.log("response error", response.error.data.message);

                setError(true);
                setMessage(response.error.data.message);
              }
            }
          } catch (error) {}
        } else {
          setError(true);
          setMessage("Invalid QR");
        }
      };
      console.log("data from gallery", e);
      let qrData = "";
      if (e.includes("=")) {
        qrData = e?.split("=")[1];
      } else {
        qrData = e;
      }

      let requestData = {};
      //commented due to no need as per discussion 22 aug

      // if ( qrData?.split("-").length === 1) {
      //     requestData["unique_code"] = `cg-${qrData}`;
      //     qrData = `cg-${qrData}`
      // } else if (qrData?.split("-").length === 2) {
      //     requestData["unique_code"] = qrData;
      // }

      requestData["unique_code"] = qrData;

      console.log("onSuccess qrData", qrData, requestData);
      // Check for duplicate QR code

      if (isDuplicateQr.has(qrData)) {
        console.log("duplicate code exists");
        Toast.show({
          type: "error",
          text1: "This QR is already added to the list",
          position: "bottom",
          visibilityTime: 1000,
          autoHide: true,
        });

        if (scan_type == "Manual") {
          setError(true);
          setMessage("Already added to the list");
        }

        return;
      }

      // console.log("scan_type",scan_type)

      verifyQR(requestData);

      let duplicateQrSet = new Set(isDuplicateQr);
      duplicateQrSet.add(qrData);
      setIsDuplicateQr(duplicateQrSet);
    }
  };

  // add qr to the list of qr--------------------------------------

  const addQrDataToList = async (data) => {
    console.log("AddedQrListFUNCTION", data);
    setIsLoading(false);
    const qrId = data.id;
    setQr_id(qrId);

    const productCode = data?.product_code;

    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      console.log(
        "Credentials successfully loaded for user " + credentials?.username,
        workflowProgram
      );
      const token = credentials?.username;

      (workflowProgram.includes("Genuinity") ||
        workflowProgram.includes("Genuinity+")) &&
        checkGenuinityFunc({ qrId, token });
      productDataFunc({ productCode, userType, token });
    }
    addedqr = addedQrList;
    console.log("addQrDataToList", addedqr, data);

    if (addedqr.length === 0) {
      //  setAddedQrList([...addedqr, data]);
      addedqr.push(data);
    } else {
      const existingObject = addedqr.find(
        (obj) => obj?.unique_code === data?.unique_code
      );
      console.log("existingObject",existingObject,data)
      if (!existingObject) {
        // setAddedQrList([...addedqr, data]);
        addedqr.push(data);
      } else {
        setError(true);
        setMessage("Sorry This QR is already added to the list");
      }
    }
    console.log("AddedQR list is", addedqr);
    console.log(
      "Adding qr to list chekcing duplicate and list",
      addedQrList,
      isDuplicateQr
    );
    setAddedQrList(addedqr);
    return addedqr;
  };
  // --------------------------------------------------------

  // delete qr from list of qr-------------------------------------
  const deleteQrFromList = (code) => {
    try {
      const updatedList = addedQrList.filter(
        (item) => item?.unique_code !== code
      );
      setAddedQrList(updatedList);

      const updatedDuplicateQr = new Set(isDuplicateQr);
      updatedDuplicateQr.delete(String(code));
      setIsDuplicateQr(updatedDuplicateQr);
    } catch (e) {
      console.log("Exception in deleting QR", e);
    }
  };

  // --------------------------------------------------------

  // function to handle workflow navigation-----------------------
  const handleWorkflowNavigation = (item1, item2, item3) => {
    if (addedQrList.length > 1) {
      dispatch(setScanningType("Bulk"));
    } else {
      dispatch(setScanningType("Single"));
    }
    // console.log('success');
    // console.log("Items are",item1, item2, item3);

    const itemsToRemove = [item1, item2, item3];
    const updatedWorkflowProgram = workflowProgram.filter(
      (item) => !itemsToRemove.includes(item)
    );

    if (updatedWorkflowProgram[0] === "Static Coupon") {
      // console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate("CongratulateOnScan", {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0],
      });
    } else if (updatedWorkflowProgram[0] === "Warranty") {
      // console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate("ActivateWarranty", {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0],
      });
    } else if (
      updatedWorkflowProgram[0] === "Points On Product" ||
      updatedWorkflowProgram[0] === "Cashback" ||
      updatedWorkflowProgram[0] === "Wheel"
    ) {
      // console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate("CongratulateOnScan", {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0],
      });
    } else if (updatedWorkflowProgram[0] === "Genuinity+") {
      // console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate("GenuinityScratch", {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0],
      });
    } else if (updatedWorkflowProgram[0] === "Genuinity") {
      // console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate("Genuinity", {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0],
      });
    } else {
      // console.log("You have completed the workflow")
    }
  };

  // --------------------------------------------------------
  //check if warranty is claimed
  // useEffect(() => {
  //   if (checkWarrantyData) {
  //     console.log("Check Warranty Is Already Claimed",checkWarrantyData.body);

  //   } else {
  //     console.log(checkWarrantyError);
  //   }
  // }, [checkWarrantyData, checkWarrantyError]);
  // --------------------------------------------------------

  // getting verify qr data --------------------------

  // --------------------------------------------------------

  // handle camera functions --------------------------------------

  const handleFlash = () => {
    setFlash(!flash);
  };

  const handleZoom = () => {
    if (zoom === 2) {
      setZoom(1);
      setZoomText("1");
    } else {
      setZoom(2);
      setZoomText("2");
    }
  };

  const refreshScanner = () => {
    setScannerKey((prevKey) => prevKey + 1);
  };

  const handleOpenImageGallery = async () => {
    const result = await launchImageLibrary({ selectionLimit: 20 });
    console.log("handleOpenImageGalleryresult", result);
    setIsLoading(true);
    if (result?.assets) {
      const detectedQRCodes = [];

      for (let i = 0; i < result?.assets.length; i++) {
        // console.log("RNQRGenerator", result?.assets[i]?.uri);

        try {
          const response = await RNQRGenerator.detect({
            uri: result?.assets[i]?.uri,
          });

          const { values } = response;
          const requestData = values.length > 0 ? values[0] : null;

          if (requestData) {
            console.log("handleOpenImageGalleryresultrequestData", requestData);
            detectedQRCodes.push(requestData);
          } else {
            // console.log('No QR code detected in the image');
          }
        } catch (error) {
          // console.log('Error detecting QR code in image', error);
        }
      }

      // Process all detected QR codes after the loop completes
      detectedQRCodes.forEach((data) => {
        onSuccess(data);
      });
    }
  };

  // --------------------------------------------------------

  // function to call add qr api -------------------------------

  const handleAddQr = () => {
    const token = savedToken;

    const addedQrID = addedQrList.map((item, index) => {
      return item.id;
    });
    const params = {
      token: token,
      data: {
        qrs: addedQrID,
        platform_id: 1,
        name: userData?.name,
        app_version: currentVersion,
        scan_type: "Point on product",
      },
    };
    console.log("HandleADDQR", params);
    setShowProceed(false);
    addBulkQrFunc(params);
    dispatch(setQrIdList(addedQrID));
    dispatch(setQrData(addedQrList));
    // console.log(addedQrID,params)
  };
  // --------------------------------------------------------
  const helpModalComp = () => {
    return (
      <View
        style={{
          width: 340,
          height: 320,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          style={{ height: 370, width: 390 }}
          source={require("../../../assets/images/howToScan.png")}
        ></Image>
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
          onPress={() => setHelpModal(false)}
        >
          <Close name="close" size={17} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleModalClose = () => {
    setChooseModalVisible(false);
  };

  const locationStatus = (status) => {
    console.log(
      "location status recieved from enable location screen ",
      status
    );
    setLocationEnabled(status);
  };

  const SlowInternetComp = () => {
    return (
      <View
        style={{ alignItems: "center", justifyContent: "center", width: "90%" }}
      >
        <Text style={{ color: "black" }}>
          Slow Internet Connection Detected
        </Text>
        <Text style={{ color: "black" }}>
          Please check your internet connection.{" "}
        </Text>
      </View>
    );
  };

  // console.log("device",device)

  return (
    <>
      <View>
        {scan_type == "Manual" && (
          <View style={{ height: "100%" }}>
            <View style={{ height: "45%" }}>
              <View style={styles.modalOverlay}>
                <View
                  style={{
                    height: "16%",
                    width: "100%",
                    backgroundColor: ternaryThemeColor,
                    // alignItems: "flex-start",
                    // justifyContent: "center",
                    flexDirection: "row",
                    position: "absolute",
                    alignItems: "center",
                    top: 0,
                    //  marginTop: 10,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      height: 20,
                      width: 20,
                      position: "absolute",
                      left: 20,
                    }}
                    onPress={() => {
                      navigation.goBack();
                    }}
                  >
                    <Image
                      style={{ height: 20, width: 20, resizeMode: "contain" }}
                      source={require("../../../assets/images/blackBack.png")}
                    ></Image>
                  </TouchableOpacity>

                  <PoppinsTextMedium
                    style={{
                      fontSize: 20,
                      color: "#ffffff",
                      marginTop: 5,
                      position: "absolute",
                      left: 60,
                    }}
                    content={t("Manual Code Entry")}
                  ></PoppinsTextMedium>
                </View>
                <View style={[styles.modalContainer, { marginTop: 70 }]}>
                  <Text
                    style={{
                      color: ternaryThemeColor,
                      marginBottom: 30,
                      fontSize: 25,
                      fontWeight: "900",
                      textAlign: "center",
                    }}
                  >
                    Enter Code Manually
                  </Text>
                  <TextInput
                    autoCapitalize={"characters"}
                    style={{
                      borderWidth: 1,
                      borderColor: "black",
                      width: "90%",
                      borderRadius: 10,
                      color: ternaryThemeColor,
                      padding: 10,
                    }}
                    placeholderTextColor={ternaryThemeColor}
                    placeholder="Please Enter Batch Code"
                    onChangeText={(text) => setManualText(text?.toUpperCase())}
                    value={manualText}
                  />
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: ternaryThemeColor },
                    ]}
                    onPress={() => {
                      // Handle code submission logic here
                      onSuccess(manualText);
                      // setModalVisible(false);
                    }}
                  >
                    <Text style={{ color: "white" }}>Submit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setChooseModalVisible(true)}
                  >
                    <Text style={{ color: "white" }}>Switch To Scanner</Text>
                  </TouchableOpacity>

                  {/* Modal for QR Code Options */}
                  <Modal
                    transparent={true}
                    visible={chooseModalVisible}
                    animationType="slide"
                    onRequestClose={handleModalClose}
                  >
                    <View style={[styles.modalOverlay, { marginTop: -50 }]}>
                      <View
                        style={[
                          styles.modalContainer2,
                          { borderWidth: 1, borderColor: ternaryThemeColor },
                        ]}
                      >
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
                            {
                              console.log(
                                "check old added qrlist",
                                addedQrList
                              );
                            }
                            setModalVisible(false);
                            Platform.OS == "android"
                              ? navigation.navigate("EnableCameraScreen", {
                                  scan_type: "QR",
                                  oldaddedQrList: addedQrList,
                                })
                              : navigation.navigate("QrCodeScanner", {
                                  scan_type: "QR",
                                  oldaddedQrList: addedQrList,
                                });
                          }}
                        >
                          <Text style={styles.optionText}>Scan QR Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.modalOption}
                          onPress={() => {
                            setModalVisible(false);
                            Platform.OS == "android"
                              ? navigation.navigate("EnableCameraScreen", {
                                  scan_type: "QR",
                                })
                              : navigation.navigate("QrCodeScanner", {
                                  scan_type: "QR",
                                });
                          }}
                        >
                          <Text style={styles.optionText}>Scan Barcode</Text>
                        </TouchableOpacity>

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
              </View>
              <Toast config={toastConfig} />
            </View>

            <View
              style={{
                height: "55%",
                backgroundColor: "white",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                marginTop: 20,
              }}
            >
              {scan_type == "Manual" && (
                <View>
                  <FlatList
                    style={{ width: "100%", height: "100%" }}
                    data={addedQrList}
                    renderItem={({ item, index }) => (
                      <View
                        style={{
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {!error && (
                          <ScannedListItem
                            handleDelete={deleteQrFromList}
                            unique_code={item.unique_code}
                            index={index}
                            serialNo={item.batch_running_code}
                            productName={item.name}
                            productCode={item.product_code}
                            batchCode={item.batch_code}
                          ></ScannedListItem>
                        )}
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                  />

                  {error && (
                    <ErrorModal
                      modalClose={modalClose}
                      productData={verifyQrData?.body?.qr}
                      message={message}
                      isReportable={isReportable}
                      openModal={error}
                    ></ErrorModal>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {scan_type !== "Manual" && device != null && (
          <View style={{ height: "100%", width: "100%" }}>
            <Camera
              codeScanner={codeScanner}
              focusable={true}
              exposure={0}
              zoom={zoom}
              // frameProcessor={frameProcessor}
              // frameProcessorFps={5}
              style={{ height: "40%" }}
              device={device}
              isActive={cameraEnabled}
              torch={flash ? "on" : "off"}
              // format={}
            ></Camera>

            {/* Toggle manual input visibility */}
            {/* <Button
        color={ternaryThemeColor}
        title="Enter QR Code Manually"
        onPress={() => setManualInputVisible(!manualInputVisible)}
      /> */}

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                position: "absolute",
                top: 0,
                right: 0,
              }}
            >
              <View
                style={{
                  height: "36%",
                  width: "80%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PoppinsTextMedium
                  style={{
                    fontSize: 20,
                    color: "white",
                    marginLeft: 75,
                    marginBottom: 30,
                  }}
                  content="Scan Product QR Code"
                ></PoppinsTextMedium>
                <View
                  style={{
                    backgroundColor: "transparent",
                    borderWidth: 4,
                    borderColor: "#305CB8",
                    height: 200,
                    width: 240,
                    alignSelf: "center",
                    position: "absolute",
                    right: 0,
                    top: 60,

                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <View
                    style={{
                      height: 40,
                      width: 80,
                      backgroundColor: "#58585A",
                      borderRadius: 20,
                      marginBottom: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setHelpModal(true);
                      }}
                      style={{
                        backgroundColor: "black",
                        height: 34,
                        width: 34,
                        borderRadius: 17,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        style={{
                          height: 16,
                          width: 16,
                          resizeMode: "contain",
                          alignSelf: "center",
                        }}
                        source={require("../../../assets/images/qrQuestionMark.png")}
                      ></Image>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        handleZoom();
                      }}
                      style={{
                        backgroundColor: "black",
                        height: 34,
                        width: 34,
                        borderRadius: 17,
                        marginLeft: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: "#FB774F" }}>
                        {zoomText}X
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View
                style={{
                  width: "20%",
                  height: "36%",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Dashboard");
                  }}
                  style={{ height: 34, width: 34, margin: 10, left: 20 }}
                >
                  <Image
                    style={{ height: 34, width: 34, resizeMode: "contain" }}
                    source={require("../../../assets/images/qrCancel.png")}
                  ></Image>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleFlash();
                  }}
                  style={{ height: 44, width: 44, margin: 20, marginTop: 80 }}
                >
                  <Image
                    style={{ height: 44, width: 44, resizeMode: "contain" }}
                    source={require("../../../assets/images/qrTorch.png")}
                  ></Image>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleOpenImageGallery();
                  }}
                  style={{ height: 44, width: 44, margin: 20 }}
                >
                  <Image
                    style={{ height: 44, width: 44, resizeMode: "contain" }}
                    source={require("../../../assets/images/qrGallery.png")}
                  ></Image>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                height: "60%",
                backgroundColor: "white",
                width: "100%",
                // top: platformMargin,
                borderRadius: 30,
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              {update && (
                <UpdateModal
                  modalClose={modalClose}
                  message={message}
                  openModal={update}
                ></UpdateModal>
              )}
              {error && (
                <ErrorModal
                  modalClose={modalClose}
                  productData={verifyQrData?.body?.qr}
                  message={message}
                  isReportable={isReportable}
                  openModal={error}
                  isManual={scan_type == "Manual" ? true : false}
                  isWarranty={false}
                  isManualOption={manualOption}
                  scan_type={"Manual"}
                  addedQrList={addedQrList}
                ></ErrorModal>
              )}

              {success && (
                <MessageModal
                  modalClose={modalClose}
                  title="Success"
                  message={message}
                  openModal={success}
                ></MessageModal>
              )}

              {/* Modal for Manual QR Code Input */}
              {/* <Modal
        animationType="slide"
        transparent={true}
        visible={manualInputVisible}
        onRequestClose={() => setModalVisible(false)} // Close modal when back button is pressed
      >
        <View style={{top:'50%',left:'13%', width:'70%', padding:20,backgroundColor:ternaryThemeColor }}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Enter QR Code"
              value={manualQrCode}
              placeholderTextColor={'black'}
              onChangeText={setManualQrCode}
              style={{backgroundColor:'white', color:'black',borderWidth:1, marginBottom:10,padding:10}}
            />
            <View style={{marginBottom:10}}>
            <Button color={'black'} title="Submit QR Code" onPress={handleManualInput}  />

            </View>
            <Button
              title="Close"
              onPress={() => setManualInputVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>

           */}

              {addedQrList.length === 0 ? (
                <View
                  style={{
                    height: "100%",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  {console.log("addede QRLIST", addedQrList)}
                  <ScrollView
                    contentContainerStyle={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: "80%",
                      marginTop: 60,
                    }}
                  >
                    <Image
                      style={{ height: 300, width: 300, resizeMode: "contain" }}
                      source={require("../../../assets/images/qrHowTo.png")}
                    ></Image>
                    {isLoading && (
                      <ActivityIndicator
                        size="large"
                        color={ternaryThemeColor}
                      ></ActivityIndicator>
                    )}
                  </ScrollView>
                </View>
              ) : (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    // backgroundColor:'red'
                  }}
                >
                  {isLoading && (
                    <ActivityIndicator
                      size="large"
                      color={ternaryThemeColor}
                    ></ActivityIndicator>
                  )}
                  {console.log("addede QRLIST", addedQrList)}
                  <FlatList
                    style={{ width: "100%", height: "80%" }}
                    data={addedQrList}
                    renderItem={({ item, index }) => (
                      <View
                        style={{
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {!error && (
                          <ScannedListItem
                            handleDelete={deleteQrFromList}
                            unique_code={item.unique_code}
                            index={index}
                            serialNo={item.batch_running_code}
                            productName={item.name}
                            productCode={item.product_code}
                            batchCode={item.batch_code}
                          ></ScannedListItem>
                        )}
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                  />

                  {addedQrList && addedQrList?.length > 0 && (
                    <View style={{ marginBottom: 60 }}>
                      <ButtonProceed
                        handleOperation={handleAddQr}
                        style={{ color: "white" }}
                        content={"Proceed"}
                        navigateTo={"QrCodeScanner"}
                      ></ButtonProceed>
                    </View>
                  )}
                </View>
              )}
              <Toast config={toastConfig} />
            </View>

            {helpModal && (
              <ModalWithBorder
                modalClose={() => {
                  setHelpModal(!helpModal);
                }}
                // message={message}
                openModal={helpModal}
                // navigateTo="WarrantyClaimDetails"
                // parameters={{ warrantyItemData: data, afterClaimData: warrantyClaimData }}
                comp={helpModalComp}
              ></ModalWithBorder>
            )}
          </View>
        )}

        {showProceed && scan_type == "Manual" && (
          <View style={{ marginTop: "auto", marginBottom: 20 }}>
            <Text
              style={{
                color: ternaryThemeColor,
                fontSize: 20,
                textAlign: "center",
              }}
            >
              {manualQrCode}
            </Text>
            <ButtonProceed
              handleOperation={handleAddQr}
              style={{ color: "white" }}
              content={"Proceed"}
              navigateTo={"QrCodeScanner"}
            ></ButtonProceed>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#777",
  },
  textBold: {
    fontWeight: "500",
    color: "#000",
  },
  buttonText: {
    fontSize: 21,
    color: "black",
  },
  buttonTouchable: {
    padding: 16,
  },

  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalContainer2: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "red",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
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

export default QrCodeScanner;
