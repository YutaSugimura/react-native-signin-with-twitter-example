declare module 'react-native-config' {
  export interface NativeConfig {
    TWITTER_CONSUMER_KEY: string;
    TWITTER_CONSUMER_SECRET: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
