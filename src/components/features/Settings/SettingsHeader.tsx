import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const StackHeader = () => {
    const navigation = useNavigation<StackNavigationProp<any>>();

    return (
        <View style={styles.container}>
            <View style={styles.horizontalLine} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        paddingHorizontal: 180,
    },
    horizontalLine: {
        width: '100%',
        height: 4,
        backgroundColor: '#414341',
    },
});

export default StackHeader;
