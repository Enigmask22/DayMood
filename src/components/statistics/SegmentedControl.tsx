import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { HOME_COLOR } from '@/utils/constant';

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

export const SegmentedControl = ({ 
  values, 
  selectedIndex, 
  onChange,
  style
}: SegmentedControlProps) => {
  return (
    <View style={[styles.container, style]}>
      {values.map((value, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.segment,
            selectedIndex === index && styles.segmentSelected,
            index === 0 && styles.segmentFirst,
            index === values.length - 1 && styles.segmentLast
          ]}
          onPress={() => onChange(index)}
        >
          <Text 
            style={[
              styles.segmentText,
              selectedIndex === index && styles.segmentTextSelected
            ]}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: HOME_COLOR.HOMETABBAR,
  },
  segmentFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentText: {
    fontSize: 13,
    color: '#7E7E7E',
    fontWeight: '500',
  },
  segmentTextSelected: {
    color: 'white',
    fontWeight: '600',
  }
});