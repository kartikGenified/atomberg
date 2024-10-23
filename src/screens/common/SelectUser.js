import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions, Image, ScrollView,BackHandler, ImageBackground} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {BaseUrl} from '../../utils/BaseUrl';
import LinearGradient from 'react-native-linear-gradient';
import {useGetAppUsersDataMutation} from '../../apiServices/appUsers/AppUsersApi';
import SelectUserBox from '../../components/molecules/SelectUserBox';
import { setAppUsers } from '../../../redux/slices/appUserSlice';
import { slug } from '../../utils/Slug';
import { setAppUserType, setAppUserName, setAppUserId, setUserData, setId} from '../../../redux/slices/appUserDataSlice';
import PoppinsTextMedium from '../../components/electrons/customFonts/PoppinsTextMedium';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorModal from '../../components/modals/ErrorModal';
import { t } from 'i18next';
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import hideUserFromLogin from '../../utils/hideUserFromLogin';
import { splash } from '../../utils/HandleClientSetup';
import FastImage from 'react-native-fast-image';



const SelectUser = ({navigation}) => {
  const [listUsers, setListUsers] = useState();
  const [showSplash, setShowSplash] = useState(true)
  const [connected, setConnected] = useState(true)
  const [isSingleUser, setIsSingleUser]  = useState(true)
  const [needsApproval, setNeedsApproval] = useState()
  const [error, setError] = useState(false);
  const [message, setMessage] = useState();
  const [users, setUsers] = useState()
  
  const primaryThemeColor = useSelector(
    state => state.apptheme.primaryThemeColor,
  )
  
  const secondaryThemeColor = useSelector(
    state => state.apptheme.secondaryThemeColor,
  )
 
  const ternaryThemeColor = useSelector(
    state => state.apptheme.ternaryThemeColor,
  )
  

  const icon = useSelector(state => state.apptheme.icon)
  const gifUri = Image.resolveAssetSource(splash).uri;



    const otpLogin = useSelector(state => state.apptheme.otpLogin)
    // console.log(useSelector(state => state.apptheme.otpLogin))
    const passwordLogin = useSelector(state => state.apptheme.passwordLogin)
    // console.log(useSelector(state => state.apptheme.passwordLogin))
    const manualApproval = useSelector(state => state.appusers.manualApproval)
    const autoApproval = useSelector(state => state.appusers.autoApproval)
    const registrationRequired = useSelector(state => state.appusers.registrationRequired)
    console.log("registration required",registrationRequired)

  const width = Dimensions.get('window').width;
 

  const [
    getUsers,
    {
      data: getUsersData,
      error: getUsersError,
      isLoading: getUsersDataIsLoading,
      isError: getUsersDataIsError,
    },
  ] = useGetAppUsersDataMutation();
  const dispatch = useDispatch()
  
  

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    getData()
    getUsers();
    return () => backHandler.remove()
  }, []);
  useEffect(() => {
    if (getUsersData) {
      console.log("type of users",getUsersData?.body);
      let tempUsers = []
      for(var i=0;i<getUsersData?.body.length;i++)
        {
          if(hideUserFromLogin.includes(getUsersData?.body[i]?.user_type.toLowerCase()))
          {
            continue
          }
          else{
            tempUsers.push(getUsersData?.body[i])
          }
        }

        const rearrangesSequencce = tempUsers.filter((item,index)=>{
          return (item.user_type).toLowerCase() == "retailer"
        })
        const rearrangesSequencceRemaining = tempUsers.filter((item,index)=>{
          return (item.user_type).toLowerCase() != "retailer"
        })
        const finalArrangements = [...rearrangesSequencce, ...rearrangesSequencceRemaining]

      console.log("new user data array after removing NON REQUIRED users", JSON.stringify(finalArrangements))

      setUsers(finalArrangements)
      if(finalArrangements.length == 1)
      {
        setIsSingleUser(true)
      }
      else{
        setIsSingleUser(false)
      }
      dispatch(setAppUsers(finalArrangements))
      setListUsers(finalArrangements);
    } else if(getUsersError) {
      setError(true)
      setMessage("Error in getting profile data, kindly retry after sometime")
      console.log("getUsersError",getUsersError);
    }
  }, [getUsersData, getUsersError]);

  useEffect(()=>{
    if(isSingleUser && users)
    {
      console.log("IS SINGLE USER", manualApproval,autoApproval,registrationRequired,users)
      
      if(registrationRequired.includes(users[0]?.name))
        {
            setNeedsApproval(true)
            console.log("registration required")
            setTimeout(() => {
          
              navigation.navigate('OtpLogin',{needsApproval:true, userType:users[0]?.name, userId:users[0]?.user_type_id,registrationRequired:registrationRequired})
        
                }, 1000);
        }
        else{
            setNeedsApproval(false)
            console.log("registration not required")
            setTimeout(() => {
          
              navigation.navigate('OtpLogin',{needsApproval:false, userType:users[0]?.name, userId:users[0]?.user_type_id,registrationRequired:registrationRequired})
        
                }, 1000);

        }
        
    }
  },[isSingleUser,users])
  
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('loginData');
      console.log("loginData",JSON.parse(jsonValue))
      if(jsonValue!=null)
      {
      saveUserDetails(JSON.parse(jsonValue))
      }
      
    } catch (e) {
      console.log("Error is reading loginData",e)
    }
  };
  const saveUserDetails = (data) => {

    try {
      console.log("Saving user details", data)
      dispatch(setAppUserId(data?.user_type_id))
      dispatch(setAppUserName(data?.name))
      dispatch(setAppUserType(data?.user_type))
      dispatch(setUserData(data))
      dispatch(setId(data?.id))
      handleNavigation()
    }
    catch (e) {
      console.log("error", e)
    }
    
  }   

  const handleNavigation=()=>{
    
    setTimeout(() => {
      setShowSplash(false)
    navigation.navigate('Dashboard')

    }, 5000);
  }
  
    
  console.log("issingleuserqwerty",isSingleUser)

  return (
    <View style={{height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
      {
        !isSingleUser ? <LinearGradient
        colors={["white", "white"]}
        style={styles.container}>
           <ScrollView showsVerticalScrollIndicator={false} style={{}}>
        <View
          style={{
            height: 140,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          
            <Image
              style={{
                height: 100,
                width: 160,
                resizeMode: 'contain',
                top: 60,
                marginBottom:40
              }}
              source={{uri: icon}}></Image>
  
              <View style={{width:'80%',alignItems:"center",justifyContent:'center',borderColor:ternaryThemeColor,borderTopWidth:1,borderBottomWidth:1,height:60,marginTop:40}}>
                {/* <PoppinsTextMedium style={{color:'#171717',fontSize:20,fontWeight:'700'}} ></PoppinsTextMedium> */}
                <PoppinsTextMedium style={{ color: '#171717', fontSize: 20, fontWeight: '700' }} content={t('choose profile')} />
  
              </View>
          {/* </View> */}
        </View>
       
        {error && (
        <ErrorModal
          modalClose={modalClose}
          message={message}
          openModal={error}
        ></ErrorModal>
      )}
       
        
          <View style={styles.userListContainer}>
            {listUsers &&
              listUsers.map((item, index) => {
                return (
                  <SelectUserBox
                  style={{}}
                  index ={index}
                    navigation = {navigation}
                    otpLogin={otpLogin}
                    passwordLogin={passwordLogin}
                    autoApproval={autoApproval}
                    manualApproval={manualApproval}
                    registrationRequired={registrationRequired}
                    key={index}
                    color={ternaryThemeColor}
                    image={item.user_type_logo}
                    content={item.user_type}
                    id={item.user_type_id}></SelectUserBox>
                );
              })}
          </View>
        </ScrollView>
        <View style={{alignItems:'center',justifyContent:'space-between',flexDirection:'row',width:'100%',padding:10}}>
        {/* <View style={{alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
            <View style={{backgroundColor:'#80C343',padding:4}}>
            <PoppinsTextMedium style={{color:'white',fontSize:24,fontWeight:'bold'}} content= "CG "></PoppinsTextMedium>
            </View>
            <View style={{backgroundColor:'#075CA9',padding:4}}>
          <PoppinsTextMedium style={{color:'white',fontSize:24,fontWeight:'bold'}} content= "Vishwas"></PoppinsTextMedium>
            
            </View>
        </View> */}
        {/* <View style={{alignItems:'center',justifyContent:'center'}}>
          <Image style={{height:80,width:110,resizeMode:'contain'}} source={require('../../../assets/images/murugappa_logo.jpg')}></Image>
        </View> */}
        </View>
        <PoppinsTextMedium style={{color:'black',fontSize:12,marginTop:4,marginBottom:10}} content="Designed and developed by Genefied"></PoppinsTextMedium>

      </LinearGradient>
      :
      <FastImage
      style={{ width: "100%", height: "100%", }}
      source={{
        uri: gifUri, // Update the path to your GIF
        priority: FastImage.priority.normal,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
      }
    
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height:'100%',
    width: '100%',
    alignItems: 'center'
  },
  semicircle: {
    backgroundColor: 'white',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    height: 184,
    width: '90%',
    borderRadius: 10,
  },
  userListContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:100,
    
  },
});

export default SelectUser;
