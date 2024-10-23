//import liraries
import React, { Component, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

// create a component
const EnterCodeManually = () => {
    const[value,setValue] = useState('')


    
    return (
        <View style={styles.container}>
            <Text>EnterCodeManually</Text>
            <TextInput placeholder='Enter Batch No.' value={value} onChange={(text => {setValue()})}/>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
});

//make this component available to the app
export default EnterCodeManually;
