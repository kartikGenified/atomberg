import React, { useEffect, useState } from "react";
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
  Vibration,
  ActivityIndicator,
} from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import PoppinsText from "../../components/electrons/customFonts/PoppinsText";
import PoppinsTextMedium from "../../components/electrons/customFonts/PoppinsTextMedium";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ScannedListItem from "../../components/atoms/ScannedListItem";
import * as Keychain from "react-native-keychain";
import { useVerifyQrByBatchMutation, useVerifyQrMutation } from "../../apiServices/qrScan/VerifyQrApi";
import ErrorModal from "../../components/modals/ErrorModal";
import ButtonProceed from "../../components/atoms/buttons/ButtonProceed";
import { useAddQrMutation } from "../../apiServices/qrScan/AddQrApi";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { useSelector, useDispatch } from "react-redux";
import { setQrData } from "../../../redux/slices/qrCodeDataSlice";
import { useCheckGenuinityMutation } from "../../apiServices/workflow/genuinity/GetGenuinityApi";
import { useCheckWarrantyMutation } from "../../apiServices/workflow/warranty/ActivateWarrantyApi";
import { useGetProductDataMutation } from "../../apiServices/product/productApi";
import { setProductData } from "../../../redux/slices/getProductSlice";
import ModalWithBorder from "../../components/modals/ModalWithBorder";
import Close from "react-native-vector-icons/Ionicons";
import RNQRGenerator from "rn-qr-generator";
import { useTranslation } from "react-i18next";
import scanDelay from "../../utils/ScannedDelayUtil";
import Sound from "react-native-sound";
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { TextInput } from "react-native";
import { splitX } from "../../utils/globalFunctions/splitX";

const ScanAndRedirectToWarranty = ({ navigation, route }) => {
  const [zoom, setZoom] = useState(0);
  const [zoomText, setZoomText] = useState("1");
  const [showProceed, setShowProceed] = useState(false);

  const [flash, setFlash] = useState(false);
  const [addedQrList, setAddedQrList] = useState([]);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState();
  const [error, setError] = useState(false);
  const [savedToken, setSavedToken] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [batchCodeAvail,setIsBatchCodeAvail] = useState(false)
  const [update, setUpdate] = useState(false);
  const [isReportable, setIsReportable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualText, setManualText] = useState("");
  const [manualQrCode, setManualQrCode] = useState("");

  const [productId, setProductId] = useState();
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const [qr_id, setQr_id] = useState();
  const [helpModal, setHelpModal] = useState(false);

  const userId = useSelector((state) => state.appusersdata.userId);
  const userType = useSelector((state) => state.appusersdata.userType);
  const userName = useSelector((state) => state.appusersdata.name);
  const workflowProgram = ["Warranty"];
  const location = useSelector((state) => state.userLocation.location);
  const dispatch = useDispatch();
  console.log("Workflow Program is ", workflowProgram);
  //check version
  const currentVersion = useSelector((state) => state.appusers.app_version);
  const userData = useSelector((state) => state.appusersdata.userData);

  const scan_type = route.params.scan_type;

  console.log("Scan type in warranty", scan_type)

  //---------------
  const { t } = useTranslation();
  const ternaryThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  )
    ? useSelector((state) => state.apptheme.ternaryThemeColor)
    : "grey";

  const device = useCameraDevice("back");

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
    addQrFunc,
    {
      data: addQrData,
      error: addQrError,
      isLoading: addQrIsLoading,
      isError: addQrIsError,
    },
  ] = useAddQrMutation();

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

  // ----------------------------------------------------
  const height = Dimensions.get("window").height;
  const platform = Platform.OS === "ios" ? "1" : "2";
  const platformMargin = Platform.OS === "ios" ? -60 : -160;

  useEffect(() => {
    if (scan_type == "Manual") {
      setModalVisible(true);
    }
  }, []);

  useEffect(() => {
    if (checkWarrantyData) {
      console.log("warranty check", checkWarrantyData);
      // if(checkWarrantyData?.body == false){
      //   setError(true)
      //   setMessage(checkWarrantyData?.message)
      // }
    } else if (checkWarrantyError) {
      console.log("warranty Error", checkWarrantyError);
      // setError(true)
      // setMessage(checkWarrantyError?.data.message)
    }
  }, [checkWarrantyData, checkWarrantyError]);

  useEffect(() => {
    if (productDataData) {
      const form_type = "2";
      const token = savedToken;
      const body = {
        product_id: productDataData.body?.products[0].product_id,
        qr_id: qr_id,
      };
      console.log(
        "Product Data is ",
        productDataData?.body?.products[0].product_id
      );
      console.log("productdata", token, body);
      dispatch(setProductData(productDataData?.body.products[0]));
      setProductId(productDataData?.body.product_id);

      checkWarrantyFunc({ form_type, token, body });
    } else if (productDataError) {
      console.log("Error", productDataError);
    }
  }, [productDataData, productDataError]);

  const modalClose = () => {
    setError(false);
  };

  const handleManualInput = () => {
    setQrData(manualQrCode);
    // Process the manually entered data
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

  // function called on successfull scan --------------------------------------
  // const onSuccess = e => {
  //   console.log('Qr data is ------', JSON.stringify(e));
  //   const qrData = e.data.split('=')[1];
  //   // console.log(typeof qrData);

  //   const requestData = { unique_code: qrData };
  //   const verifyQR = async data => {
  //     // console.log('qrData', data);
  //     try {
  //       // Retrieve the credentials

  //       const credentials = await Keychain.getGenericPassword();
  //       if (credentials) {
  //         console.log(
  //           'Credentials successfully loaded for user ' + credentials.username,
  //         );
  //         setSavedToken(credentials.username);
  //         const token = credentials.username;

  //         data && verifyQrFunc({ token, data });
  //       } else {
  //         console.log('No credentials stored');
  //       }
  //     } catch (error) {
  //       console.log("Keychain couldn't be accessed!", error);
  //     }
  //   };
  //   verifyQR(requestData);
  // };
  const onSuccess = (e) => {
    console.log("Qr data is ------", e);
    setIsLoading(false)

    if (e === undefined) {
      setError(true);
      setMessage("Please scan a valid QR");
    } else {
      const qrData = e?.split("=")[1] == undefined ? e : e?.split("=")[1];
      console.log("qrData", qrData);
      let requestData = { unique_code: qrData };
      console.log("qrDataArray", qrData?.split("-"));
      if (qrData?.split("-").length === 1) {
        // if(scan_type!=="Manual"){
        //   requestData = { unique_code: "cg-" + qrData };
        // }
      } else if (qrData?.split("-").length === 2) {
        requestData = { unique_code: scan_type == "Bar" ? e : qrData };
      } else {
        requestData = { unique_code: scan_type == "Bar" ? e : qrData };
      }

      const verifyQR = async (data) => {
        console.log('qrData11', data);
        try {
          // Retrieve the credentials

          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            console.log(
              "Credentials successfully loaded for user " +
                credentials.username,
              data
            );
            setSavedToken(credentials.username);
            const token = credentials.username;
            console.log("addedQrList", addedQrList)
              // data && (scan_type == "Manual") ? verifyQrbyBatchFunc({token,data}) : verifyQrFunc({ token, data });    
              if (scan_type == "Manual" && data) {
                response = await verifyQrbyBatchFunc({ token, data });
              } else {
                if(batchCodeAvail && data){
                response = await verifyQrbyBatchFunc({ token, data });
              }
              else{
                response = await verifyQrFunc({ token, data });
              }
              }  
          } else {
            console.log("No credentials stored");
          }
        } catch (error) {
          console.log("Keychain couldn't be accessed!", error);
        }
      };

      console.log("requestedData", requestData);

      verifyQR(requestData);
    }
  };
  // add qr to the list of qr--------------------------------------

  const addQrDataToList = (data) => {
    const qrId = data.id;
    setQr_id(qrId);
    const token = savedToken;
    const productCode = data.product_code;

    productDataFunc({ productCode, userType, token });
    console.log({ productCode, userType, token });

    if (addedQrList.length === 0) {
      setAddedQrList([...addedQrList, data]);
    } else {
      const existingObject = addedQrList.find(
        (obj) => obj.unique_code === data.unique_code
      );
      if (!existingObject) {
        setAddedQrList([...addedQrList, data]);
      } else {
        setError(true);
        setMessage("Sorry this QR is already added to the list");
      }
    }
  };
  // --------------------------------------------------------

  // delete qr from list of qr-------------------------------------
  const deleteQrFromList = (code) => {
    const removedList = addedQrList.filter((item, index) => {
      return item.unique_code !== code;
    });
    setAddedQrList(removedList);
  };

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
  // --------------------------------------------------------

  // function to handle workflow navigation-----------------------

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
        if(codes[0]?.value.includes("X")){
          setIsBatchCodeAvail(true)
        }

        // let newValue = codes[0]?.value.includes("X")
        //   ? "X" + codes[0]?.value.split("X")[1] // Get the part after "X"
        //   : codes[0]?.value;
          
        let newValue = codes[0]?.value.includes("X")
        ? "X"+splitX(codes[0]?.value) // Get the part after "X"
        : codes[0]?.value;


        onSuccess(newValue);
        // onSuccess(codes[0]?.value);
      });
    }, 100), // Debounce time: adjust as needed
  });

  const handleWorkflowNavigation = () => {
    userData.user_type == "retailer" || userData.user_type == "dealer"
      ? navigation.navigate("OtpVerification", {
          from: "scan",
          workflowProgram: [],
          rewardType: "",
          activatedData: addedQrList,
        })
      : navigation.navigate("ActivateWarranty", {
          from: "scan",
          workflowProgram: [],
          rewardType: "",
          activatedData: addedQrList,
        });
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
  useEffect(() => {
    if (verifyQrData) {
      console.log("Verify qr data", verifyQrData.body);
      if (
       (verifyQrData.body?.qr?.qr_status === "1" ||
        verifyQrData.body?.qr?.qr_status === "2" ||
        verifyQrData.body?.qr_status === "1" ||
        verifyQrData.body?.qr_status === "2") &&  verifyQrbyBatchData?.body!==null && addedQrList.length < 1
      ) {
        addQrDataToList(
          verifyQrData.body?.qr === undefined
            ? verifyQrData.body
            : verifyQrData.body?.qr
        );
        setError(false)
        setMessage("")
  
        
      }

      if(verifyQrData?.body==null){
        setError(true)
        setMessage(verifyQrData?.message)
      }


    
    } else {
      if(addedQrList.length == 1){
        setError(true)
        setMessage("You can activate warranty for one product at a time")
      }
      console.log("Verify qr error", verifyQrError, addedQrList.length, addedQrList);
    }
  }, [verifyQrData, verifyQrError]);

  useEffect(() => {
    if (verifyQrbyBatchData) {
      console.log("Verify qr by batch data", verifyQrbyBatchData);

      if (
       ( verifyQrbyBatchData?.body?.qr?.qr_status === "1" ||
        verifyQrbyBatchData?.body?.qr?.qr_status === "2" ||
        verifyQrbyBatchData?.body?.qr_status === "1" ||
        verifyQrbyBatchData?.body?.qr_status === "2" ) && verifyQrbyBatchData?.body!==null && addedQrList.length < 1
      ) {
  
          addQrDataToList(
            verifyQrbyBatchData?.body?.qr === undefined
              ? verifyQrbyBatchData?.body
              : verifyQrbyBatchData.body?.qr
          );
          setShowProceed(true)
    
  
      }

      if(verifyQrbyBatchData?.body==null){
        setError(true)
        setMessage(verifyQrbyBatchData?.message)
      }


    } else {
      if(addedQrList.length == 1){
        setError(true)
        setMessage("You can activate warranty for one product at a time")
      }
      
      console.log("verifyQrByBatchError", verifyQrByBatchError);
    }
  }, [verifyQrbyBatchData, verifyQrByBatchError]);
  // --------------------------------------------------------

  //getting add qr data ------------------------------------
  useEffect(() => {
    if (addQrData) {
      console.log("Add qr data", addQrData.body);
      if (addQrData.success) {
        dispatch(setQrData(addQrData.body));
        console.log("check Genuinity and warranty", checkWarrantyData);
        handleWorkflowNavigation();
      }
    } else if (addQrError) {
      console.log("addQrError", addQrError);
      setError(true)
      setMessage(addQrError.data.message)
    }
  }, [addQrData, addQrError]);
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
    addedQrList.length !== 0 &&
      addedQrList.map((item, index) => {
        const requestData = {
          qr_id: item.id,
          user_type_id: userId,
          user_type: userType,
          platform_id: platform,
          scanned_by_name: userName,
          address: location.address,
          state: location.state,
          district: location.district,
          city: location.city,
          app_version: currentVersion,
          scan_type: "Warranty",
        };
        token && addQrFunc({ token, requestData });
      });
  };
  // --------------------------------------------------------

  return (
    <View>
      {scan_type == "Manual" && (
        <View style={{ height: "100%" }}>
          <View style={{ height: "50%" }}>
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
                    marginTop: 10,
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
              <View style={[styles.modalContainer,{marginTop:50}]}>
                <Text
                  style={{
                    color: ternaryThemeColor,
                    marginBottom: 30,
                    fontSize: 25,
                    fontWeight: "900",
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
                {/* <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </TouchableOpacity> */}
              </View>
            </View>
            <Toast config={toastConfig} />
          </View>

          <View style={{ height: "50%",backgroundColor:'white',borderTopLeftRadius:20, borderTopRightRadius:20 }}>
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

      {scan_type !== "Manual" && (
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
                content="Scan Product Bar Code"
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
                isManual = {scan_type == "Manual"  ? true : false}
                isWarranty = {true}
                isManualOption = {true}
                scan_type={scan_type}
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

                <ButtonProceed
                  handleOperation={handleAddQr}
                  style={{ color: "white" }}
                  content="Proceed"
                  navigateTo={"QrCodeScanner"}
                ></ButtonProceed>
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
            content="Proceed"
            navigateTo={"QrCodeScanner"}
          ></ButtonProceed>
        </View>
      )}
    </View>
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
  modalOverlay: {
    height:'100%',
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
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
});

export default ScanAndRedirectToWarranty;
