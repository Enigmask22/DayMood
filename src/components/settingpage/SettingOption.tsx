import React from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity,
  TouchableHighlight 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HOME_COLOR } from '@/utils/constant';

interface SettingOptionProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

const SettingOption: React.FC<SettingOptionProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showChevron = false,
  rightElement
}) => {
  const Wrapper = onPress ? TouchableHighlight : View;
  const wrapperProps = onPress 
    ? { 
        onPress,
        underlayColor: '#f5f5f5',
        activeOpacity: 0.8,
      } 
    : {};

  return (
    <Wrapper 
      {...wrapperProps} 
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Left Section (Icon + Text) */}
        <View style={styles.leftSection}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={20} color={HOME_COLOR.HOMESTATUS2} />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {/* Right Section (Custom Element or Chevron) */}
        <View style={styles.rightSection}>
          {rightElement || (showChevron && (
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          ))}
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: HOME_COLOR.HOMEBACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily:'Quicksand-Semibold',
    color: '#000',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default SettingOption;