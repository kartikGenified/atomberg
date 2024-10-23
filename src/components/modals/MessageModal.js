import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, BackHandler } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const MessageModal = (props) => {
  const [modalVisible, setModalVisible] = useState(true);
  const ternaryThemeColor = useSelector(state => state.apptheme.ternaryThemeColor) || 'grey';
  const navigation = useNavigation();
  const { navigateTo, params, openModal, message, modalClose } = props;

  useEffect(() => {
    console.log('Modal visibility change:', openModal);
    setTimeout(()=>{
      setModalVisible(false);
      if (navigateTo) {
        navigation.replace(navigateTo);
      }
    },2000)
  }, []);

  // const closeModal = () => {
  //   console.log('Closing modal');
  //   setTimeout(()=>{
  //     setModalVisible(false);

  //   },1500)
  //   if (modalClose) {
  //     console.log('Calling modalClose');
  //     setTimeout(()=>{
  //       modalClose();
  //     },1500)
  //   }
  //   if (navigateTo) {
  //     console.log(`Navigating to ${navigateTo}`);
  //     setTimeout(()=>{
  //       navigation.replace(navigateTo, params);
  //     },1500)
  //   }
  // };

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          modalClose && modalClose();
          setModalVisible(false);
          if (navigateTo) {
            navigation.replace(navigateTo);
          }
        }}
      >
        <View style={styles.centeredView}>
          <View style={{ ...styles.modalView, borderWidth: 3, borderColor: '#2FBA7E' }}>
            <Icon name="cloud-done" size={100} color="#2FBA7E" />
            <Text style={{ color: 'black', fontSize: 24, fontWeight: '600' }}>Success</Text>
            <Text style={{ ...styles.modalText, fontSize: 18, fontWeight: '500', color: 'black', marginTop: 20 }}>
              {message}
            </Text>
            <Pressable style={{ ...styles.button, backgroundColor: '#2FBA7E', width: 240 }} onPress={()=>{setModalVisible(false)}}>
              <Text style={styles.textStyle}>Okay</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.8)'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 60,
    paddingTop: 10,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",
  },
  button: {
    borderRadius: 30,
    padding: 14,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'black'
  },
});

export default MessageModal;
