import React from 'react';
import { View, Image, StyleSheet, Text, Dimensions, Pressable, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HOME_COLOR } from '@/utils/constant';

const { width } = Dimensions.get("window");

interface AvatarProps {
  size: number;
  source: ImageSourcePropType;
  online?: boolean;
  onPress?: () => void;
}

export default function Avatar({ size = 40, source, online, onPress }: AvatarProps) {
  const Component = onPress ? Pressable : View;
  
  // Dynamic styles based on size
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  
  const indicatorSize = Math.max(10, size * 0.25); // Scale indicator with avatar
  const indicatorStyle = {
    width: indicatorSize,
    height: indicatorSize,
    borderRadius: indicatorSize / 2,
    bottom: 0,
    right: 0,
    borderWidth: Math.max(1.5, size * 0.04),
  };

  return (
    <Component 
      style={[styles.container, containerStyle]} 
      onPress={onPress}
    >
      <Image
        source={{uri: "../../assets/images/splash-icon.png"}} // Placeholder image
        style={[styles.image, containerStyle]}
      />
      {online !== undefined && (
        <View 
          style={[
            styles.indicator, 
            indicatorStyle,
            { backgroundColor: online ? HOME_COLOR.HOMETABBAR : '#D1D1D6' }
          ]} 
        />
      )}
    </Component>
  );
}

interface AvatarInfoProps {
  name: string;
  email: string;
  source: ImageSourcePropType;
  online?: boolean;
}

export function AvatarInfo({ name, email, source, online }: AvatarInfoProps) {
  return (
    <View style={styles.infoContainer}>
      <Avatar size={40} source={source} online={online} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
    </View>
  );
}

interface AvatarProfileProps {
  name: string;
  source: ImageSourcePropType;
  onImagePress?: () => void;
}

export function AvatarProfile({ name, source, onImagePress }: AvatarProfileProps) {
  const profileSize = width * 0.25; // Responsive size based on screen width
  
  return (
    <View style={styles.profileContainer}>
      <Pressable style={styles.profileImageContainer} onPress={onImagePress}>
        <Avatar size={profileSize} source={source} />
        <View style={styles.cameraIconContainer}>
          <Ionicons name="camera" size={profileSize * 0.3} color="#555" />
        </View>
      </Pressable>
      
      <Text style={styles.profileName}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    borderColor: 'white',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: HOME_COLOR.HOMETEXT,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F1F1F1',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
  }
});