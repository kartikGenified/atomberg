import React, { useState } from 'react';
import {View, StyleSheet,ScrollView,Dimensions,Platform,Modal,Text,TouchableOpacity} from 'react-native';
import MenuItems from '../atoms/MenuItems';
import { BaseUrl } from '../../utils/BaseUrl';
import QrCodeScanner from '../../screens/camera/QrCodeScanner';
import { useSelector } from 'react-redux';

const DashboardMenuBox=(props)=>{
    const data = props?.data
    const navigation = props.navigation
    const width = Dimensions.get('window').width
    const requiresLocation = props.requiresLocation
    const [modal, setModal] = useState(false);
    const [modal2, setModal2] = useState(false);

    const [selectedTab, setSelectedTab] = useState("");


    const ternaryThemeColor = useSelector(
        (state) => state.apptheme.ternaryThemeColor
      )
        ? useSelector((state) => state.apptheme.ternaryThemeColor)
        : "grey";
    
      const userData = useSelector((state) => state.appusersdata.userData);

    const handleModalClose = () => {
        setModal(false);
      };

      const handleModalClose2 = () => {
        setModal2(false);
      };


    const handleMenuItemPress=(data)=>{
        if(data.substring(0,4).toLowerCase()==="scan" )
        {
          //  Platform.OS == 'android' ? navigation.navigate('EnableCameraScreen') : requiresLocation ? navigation.navigate('EnableLocationScreen',{navigateTo:"QrCodeScanner"}) : navigation.navigate("QrCodeScanner")
          setModal2(true)
          setSelectedTab("scan")
        }
        else if(data.toLowerCase()==="passbook")
        {
            navigation.navigate("Passbook")
        }
        else if(data.toLowerCase() === "rewards"){
            navigation.navigate('RedeemRewardHistory')
        }
        else if(data.toLowerCase() === "profile"){
            navigation.navigate('Profile')
        }
        else if (data.toLowerCase() === "query list") {
            navigation.navigate('QueryList')
          }
        else if(data.toLowerCase() === "warranty list"){
            navigation.navigate('WarrantyHistory')
        }
        else if(data.toLowerCase() === "scheme"){
            navigation.navigate("EnableLocationScreen",{navigateTo:"Scheme"})
        }
        else if(data.toLowerCase() === "bank details" || data.toLowerCase() === "bank account"){
            navigation.navigate('BankAccounts')
        }
        else if(data.toLowerCase().substring(0,5) === "check"){
            if(data?.toLowerCase().split(" ")[1]==="genuinity")
            navigation.navigate('ScanAndRedirectToGenuinity')

            else if(data?.toLowerCase().split(" ")[1]==="warranty")
            // navigation.navigate('ScanAndRedirectToWarranty')
            setModal(true)
            setSelectedTab("warranty")
        }
        else if(data?.toLowerCase().substring(0,8) === "activate"){
            if(data?.toLowerCase().split(" ")[1]==="genuinity")
            navigation.navigate('ScanAndRedirectToGenuinity')
            else if(data?.toLowerCase().split(" ")[1]==="warranty")
            Platform.OS == "android" ?  navigation.navigate("EnableCameraAndNavigateToWarranty", {
              scan_type: "QR",
            })
            :
            navigation.navigate("ScanAndRedirectToWarranty", {
              scan_type: "QR",
            })  
            // navigation.navigate('ScanAndRedirectToWarranty')
        }
        else if(data.toLowerCase() === "product catalogue"){
            navigation.navigate('ProductCatalogue')
        }
        else if(data.toLowerCase() === "add user"){
            navigation.navigate('ListUsers')
        }
        else if(data.toLowerCase() === "customer support" || data.toLowerCase() === "help and support"){
            navigation.navigate('HelpAndSupport')
        }
        else if(data.toLowerCase() === "report an issue"){
            navigation.navigate('QueryList')
        }
    }

    return(
        <View style={{borderColor:'#DDDDDD',borderRadius:10,borderWidth:1.2,width:width-20,alignItems:"center",justifyContent:"center",backgroundColor:'#80C343',padding:4,marginBottom:30}}>
        <View style={{width:'100%',flexWrap:"wrap",flexDirection:"row",alignItems:"center",justifyContent:'center'}}>
        {
            data.map((item,index)=>{
                return(
                   
                    <MenuItems handlePress={handleMenuItemPress} key={index} image={item?.icon} content={item?.name}></MenuItems>
                   
                )
            })
            
        }

           {/* Modal for Activate warranty Options */}
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
                Platform.OS == "android" ?  navigation.navigate("EnableCameraAndNavigateToWarranty", {
                    scan_type: "QR",
                  })
                  :
                  navigation.navigate("ScanAndRedirectToWarranty", {
                    scan_type: "QR",
                  })               
                 
              }}
            >
              <Text style={styles.optionText}>Scan QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setModal(false);
                Platform.OS == "android" ?  navigation.navigate("EnableCameraAndNavigateToWarranty", {
                    scan_type: "Bar",
                  })
                  :
                  navigation.navigate("ScanAndRedirectToWarranty", {
                    scan_type: "Bar",
                  })               
                 
              }}
            >
              <Text style={styles.optionText}>Scan Barcode</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setModal(false);
                Platform.OS == "android" ?  navigation.navigate("ScanAndRedirectToWarranty", {
                    scan_type: "Manual",
                  })
                  :
                  navigation.navigate("ScanAndRedirectToWarranty", {
                    scan_type: "Manual",
                  })               
                 
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



           {/* Modal for QR Code Options */}
           <Modal
        transparent={true}
        visible={modal2}
        animationType="slide"
        onRequestClose={handleModalClose2}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text
              style={{
                fontSize: 20,
                fontWeight:'bold',
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
                        ? navigation.navigate(
                          "QrCodeScanner",
                          { scan_type: "QR" }
                        )
                        : navigation.navigate(
                            "ScanAndRedirectToWarranty",
                            { scan_type: "QR" }
                          )
                    )
                
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
              onPress={handleModalClose2}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

        </View>
        </View>
    )
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
        marginBottom: '4%',
        borderRadius: 5,
        backgroundColor: "#F0F0F0",
      },
      optionText: {
        fontSize: 20,
        fontWeight:'bold',
        color: "#333",
      },
      cancelButton: {
        backgroundColor: "#FF6347",
        marginTop:10
      },
      cancelText: {
        color: "white",
        fontWeight:'bold',
        fontSize:18,
      },
})

export default DashboardMenuBox;

