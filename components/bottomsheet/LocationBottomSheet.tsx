import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LocationBottomSheetProps {
  location: Location.LocationObject | undefined;
  errorMsg: string;
}

const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({ location, errorMsg }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const isLoading = !location && !errorMsg;

  // Variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const contentContainerStyle = useMemo(() => ({
    ...styles.contentContainer,
    paddingBottom: insets.bottom + 24,
  }), [insets.bottom]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.sheetBackground}
    >
      <BottomSheetView style={contentContainerStyle}>
        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          {/* Current Location Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="location" size={24} color="#A855F7" />
            <TextInput
              style={styles.input}
              value="Bailey Street"
              editable={false}
              placeholder="Current Location"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Destination Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={24} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="Your destination"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Payment Method Selector */}
          <TouchableOpacity style={styles.paymentSelector}>
            <View style={styles.paymentLeft}>
              <Ionicons name="card" size={24} color="#10B981" />
              <Text style={styles.paymentText}>Payment Method</Text>
            </View>
            <View style={styles.paymentRight}>
              <Text style={styles.usdcText}>USDC</Text>
              <Ionicons name="chevron-down" size={20} color="white" />
            </View>
          </TouchableOpacity>

          {/* Find a ride button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Find a ride</Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 24,
  },
  indicator: {
    backgroundColor: '#52525B',
    width: 32,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  paymentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    color: 'white',
    fontSize: 16,
  },
  usdcText: {
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#A855F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationBottomSheet;
