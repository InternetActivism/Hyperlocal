import { Text } from '@rneui/base';
import * as React from 'react';
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';
import { vars } from '../../utils/theme';

type ListItemProps = {
  imageSource: ImageSourcePropType;
  title: string;
  rightView?: JSX.Element;
  onPress?: () => void;
};

const ListItem = ({ imageSource, title, rightView, onPress }: ListItemProps): JSX.Element => {
  return (
    <TouchableOpacity style={styles.listItemContainer} onPress={onPress}>
      <View style={styles.listItemLeftContainer}>
        <Image source={imageSource} style={styles.listItemIconContainer} />
        <Text style={styles.listItemTitle}>{title}</Text>
      </View>
      {rightView}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  listItemIconContainer: {
    backgroundColor: '#454D45',
    height: 30,
    width: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7.75,
    marginRight: 20,
  },
  listItemContainer: {
    width: '100%',
    paddingHorizontal: 17,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listItemLeftContainer: { flexDirection: 'row', alignItems: 'center' },
  listItemTitle: {
    fontFamily: vars.fontFamilySecondary,
    fontWeight: vars.fontWeightMedium,
    fontSize: 18,
    color: '#C5C9C5',
  },
});

export default ListItem;
