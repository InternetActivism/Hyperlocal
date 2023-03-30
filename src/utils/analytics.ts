import Analytics from '@react-native-firebase/analytics';

export async function logEvent(
  event: string,
  params?: {
    [key: string]: any;
  }
) {
  if (!__DEV__) {
    await Analytics().logEvent(event, params);
  }
}
