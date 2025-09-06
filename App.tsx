import { useEffect } from 'react';
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';

async function getFcmToken() {
  try {
    await messaging().registerDeviceForRemoteMessages();
    await messaging().setAutoInitEnabled(true);
    const token = await messaging().getToken();
    console.log('token**', token);
  } catch (e: any) {
    console.log('getToken ERROR name:', e?.name);
    console.log('getToken ERROR code:', e?.code);
    console.log('getToken ERROR message:', e?.message);
  }
}

async function requestPostNotificationsIfNeeded() {
  // Solo Android 13+ (API 33) necesita permiso para MOSTRAR notificaciones
  if (Platform.OS !== 'android' || Platform.Version < 33) return;

  const res = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );

  if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    Alert.alert(
      'Permiso desactivado',
      'Activar las notificaciones en Ajustes para poder mostrarlas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
      ]
    );
  } else if (res !== PermissionsAndroid.RESULTS.GRANTED) {
    Alert.alert('Permiso de notificaciones denegado');
  }
}

export default function App() {
  useEffect(() => {
    (async () => {
      // 1) SIEMPRE intenta obtener el token (no depende del permiso)
      await getFcmToken();

      // 2) Pide permiso solo para Android 13+ (para mostrar notifs)
      await requestPostNotificationsIfNeeded();
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);
  return (
    <View style={styles.container}>
      <Text>PUSH NOTIFICATIONS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
