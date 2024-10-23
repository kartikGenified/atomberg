import React,{useRef,useEffect} from 'react';
import {View, StyleSheet,TouchableOpacity,Image,Animated,Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Bell from 'react-native-vector-icons/FontAwesome';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigation,DrawerActions } from '@react-navigation/core';
import { BaseUrl } from '../../utils/BaseUrl';
import RotateViewAnimation from '../animations/RotateViewAnimation';
import FadeInOutAnimations from '../animations/FadeInOutAnimations';
import PoppinsTextMedium from '../electrons/customFonts/PoppinsTextMedium';

const DrawerHeader = () => {
    const navigation = useNavigation()
    
    const ternaryThemeColor = useSelector(
        state => state.apptheme.ternaryThemeColor,
      )
        ? useSelector(state => state.apptheme.ternaryThemeColor)
        : 'grey';
    const icon = useSelector(state => state.apptheme.icon)
        ? useSelector(state => state.apptheme.icon)
        : require('../../../assets/images/demoIcon.png');
    
    const BellComponent =()=>{
        return(
            <TouchableOpacity style={{height:30,width:30}} onPress={()=>{navigation.navigate("Notification")}} >
            <Bell name="bell" size={30} color={ternaryThemeColor}></Bell>
        </TouchableOpacity>
        )
    }
    return (
        <View style={{height:60,width:'100%',flexDirection:"row",alignItems:"center",marginBottom:20,backgroundColor:"white"}}>
            <TouchableOpacity onPress={()=>{navigation.dispatch(DrawerActions.toggleDrawer());}} style={{marginLeft:10}}>
            <Icon name="bars" size={40} color={ternaryThemeColor}></Icon>
            </TouchableOpacity>
            <Image style={{height:80,width:100,resizeMode:"contain",marginLeft:10,}} source={{uri: icon}}></Image>
            <View style={{alignItems:'center',justifyContent:'center',flexDirection:'row',marginLeft:10}}>
          {/* <PoppinsTextMedium style={{color:'#075CA9',fontSize:24,fontWeight:'bold'}} content= " "></PoppinsTextMedium>
          <PoppinsTextMedium style={{color:'#80C343',fontSize:24,fontWeight:'bold'}} content= "Atomberg "></PoppinsTextMedium> */}
        </View>
                <RotateViewAnimation outputRange={["0deg","30deg", "-30deg","0deg"]} inputRange={[0,1,2,3]} comp={BellComponent} style={{height:30,width:30,position:'absolute',right:30}}>
                    
                </RotateViewAnimation>
                {/* <FadeInOutAnimations comp = {BellComponent}></FadeInOutAnimations> */}
                {/* <BellComponent></BellComponent> */}
           
            
            
            
        </View>
    );
}

const styles = StyleSheet.create({})

export default DrawerHeader;
