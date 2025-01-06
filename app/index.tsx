import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Dimensions, Text, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import LocationBottomSheet from '@/components/bottomsheet/LocationBottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Reduced delta values for closer zoom
const ASPECT_RATIO = Dimensions.get('window').width / Dimensions.get('window').height;
const LATITUDE_DELTA = 0.005; // Reduced from 0.0922 for closer zoom
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface TricycleLocation {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  driver?: string;
  rating?: number;
  eta?: string;
  price?: string;
  isAvailable?: boolean;
}

interface CustomMarkerProps {
  tricycle: TricycleLocation;
  scale: Animated.AnimatedInterpolation<number>;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedTricycle, setSelectedTricycle] = useState<TricycleLocation | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const markerAnimation = useRef(new Animated.Value(0)).current;

  // Enhanced tricycle locations with additional data
  const [tricycleLocations, setTricycleLocations] = useState<TricycleLocation[]>([
    {
      id: '1',
      coordinate: {
        latitude: 14.5995,
        longitude: 120.9842,
      },
      title: 'Tricycle 1',
      driver: 'John Doe',
      rating: 4.8,
      eta: '5 mins',
      price: '₱50',
      isAvailable: true,
    },
    {
      id: '2',
      coordinate: {
        latitude: 14.6008,
        longitude: 120.9892,
      },
      title: 'Tricycle 2',
      driver: 'Jane Smith',
      rating: 4.9,
      eta: '3 mins',
      price: '₱45',
      isAvailable: true,
    },
  ]);

  // Mapbox style for the map (you can replace with your preferred Mapbox style URL)
  const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#7c93a3"
        }
      ]
    },
    {
      "featureType": "administrative.neighborhood",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    }
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Animate to user location with closer zoom when location is first obtained
      if (mapRef.current && currentLocation.coords) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }, 1000);
      }

      // Watch location updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );
    })();
  }, []);

  // Simulate tricycle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setTricycleLocations((prev) =>
        prev.map((tricycle) => ({
          ...tricycle,
          coordinate: {
            latitude: tricycle.coordinate.latitude + (Math.random() - 0.5) * 0.001,
            longitude: tricycle.coordinate.longitude + (Math.random() - 0.5) * 0.001,
          },
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const animateMarker = () => {
    Animated.sequence([
      Animated.spring(markerAnimation, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(markerAnimation, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onMarkerPress = (tricycle: TricycleLocation) => {
    setSelectedTricycle(tricycle);
    animateMarker();

    mapRef.current?.animateToRegion({
      latitude: tricycle.coordinate.latitude,
      longitude: tricycle.coordinate.longitude,
      latitudeDelta: LATITUDE_DELTA / 2,
      longitudeDelta: LONGITUDE_DELTA / 2,
    }, 500);
  };

  const getApproximateDistance = (tricycleCoord: { latitude: number; longitude: number }) => {
    if (!location?.coords) return 'Calculating...';

    const latDiff = Math.abs(location.coords.latitude - tricycleCoord.latitude);
    const lonDiff = Math.abs(location.coords.longitude - tricycleCoord.longitude);
    const approxDist = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111;

    return approxDist < 1
      ? `${Math.round(approxDist * 1000)}m away`
      : `${approxDist.toFixed(1)}km away`;
  };

  const CustomMarker: React.FC<CustomMarkerProps> = ({ tricycle, scale }) => {
    return (
      <Animated.View style={[styles.markerContainer, { transform: [{ scale }] }]}>
        <Image
          source={require('@/assets/images/tri.jpg')}
          style={styles.tricycleMarker}
        />
        <View style={styles.markerDot} />
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          customMapStyle={mapStyle}
          initialRegion={{
            latitude: location?.coords?.latitude || 14.5995,
            longitude: location?.coords?.longitude || 120.9842,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={false}
          rotateEnabled={true}
        >
          {tricycleLocations.map((tricycle) => (
            <Marker
              key={tricycle.id}
              coordinate={tricycle.coordinate}
              onPress={() => onMarkerPress(tricycle)}
            >
              <CustomMarker
                tricycle={tricycle}
                scale={markerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                })}
              />
            </Marker>
          ))}
        </MapView>

        {selectedTricycle ? (
          <View style={styles.tricycleInfo}>
            <Image
              source={require('@/assets/images/tri.jpg')}
              style={styles.driverImage}
            />
            <View style={styles.infoContent}>
              <Text style={styles.driverName}>{selectedTricycle.driver}</Text>
              <Text style={styles.rating}>⭐ {selectedTricycle.rating}</Text>
              <Text style={styles.distance}>
                {getApproximateDistance(selectedTricycle.coordinate)}
              </Text>
              <Text style={styles.eta}>{selectedTricycle.eta}</Text>
              <Text style={styles.price}>{selectedTricycle.price}</Text>
            </View>
          </View>
        ) : (
          <LocationBottomSheet
            location={location}
            errorMsg={errorMsg}
          />
        )}
      </View>
    </BottomSheetModalProvider>
  </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  markerContainer: {
    alignItems: 'center',
  },
  tricycleMarker: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  markerDot: {
    width: 8,
    height: 8,
    backgroundColor: '#147efb',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  tricycleInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eta: {
    fontSize: 14,
    color: '#147efb',
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#147efb',
    position: 'absolute',
    right: 15,
    top: 15,
  },
});
