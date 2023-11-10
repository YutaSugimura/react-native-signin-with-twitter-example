import Axios from 'axios';
import OAuth from 'oauth-1.0a';
import {useEffect} from 'react';
import {Alert, Linking} from 'react-native';
import Config from 'react-native-config';
import crypto from 'react-native-quick-crypto';

const CONSUMER_KEY = Config.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = Config.TWITTER_CONSUMER_SECRET;
const TWITTER_API = 'https://api.twitter.com';
const OAUTH_CALLBACK_URL = 'oauth-app://oauth/twitter'; // your app scheme

export const useSignInWithTwitter = () => {
  // request token
  const signInWithTwitter = async () => {
    const oauth = new OAuth({
      consumer: {
        key: CONSUMER_KEY,
        secret: CONSUMER_SECRET,
      },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString, key) =>
        crypto.createHmac('sha1', key).update(baseString).digest('base64'),
    });

    const request_data = {
      url: TWITTER_API + '/oauth/request_token',
      method: 'POST',
      data: {
        oauth_callback: OAUTH_CALLBACK_URL,
      },
    };

    try {
      const res = await Axios.post(
        request_data.url,
        {},
        {headers: {...oauth.toHeader(oauth.authorize(request_data))}},
      );
      const responseData = res.data;
      const requestToken = responseData.match(/oauth_token=([^&]+)/)[1];
      // now redirect user to twitter login screen
      const twitterLoginURL =
        TWITTER_API + `/oauth/authenticate?oauth_token=${requestToken}`;
      Linking.openURL(twitterLoginURL);
    } catch (error) {
      console.log(error);
    }
  };

  // handle redirect from twitter
  useEffect(() => {
    const subscribe = Linking.addEventListener(
      'url',
      async (event: {url: string}) => {
        const url = event.url;

        const params = url.split('?')[1];
        const tokenParts = params.split('&');
        const requestToken = tokenParts[0].split('=')[1];
        const oauthVerifier = tokenParts[1].split('=')[1];

        const oauth = new OAuth({
          consumer: {
            key: CONSUMER_KEY,
            secret: CONSUMER_SECRET,
          },
          signature_method: 'HMAC-SHA1',
          hash_function: (baseString, key) =>
            crypto.createHmac('sha1', key).update(baseString).digest('base64'),
        });

        const request_data = {
          url: TWITTER_API + '/oauth/access_token',
          method: 'POST',
          data: {
            oauth_token: requestToken,
            oauth_verifier: oauthVerifier,
          },
        };

        try {
          const res = await Axios.post(
            request_data.url,
            {},
            {headers: {...oauth.toHeader(oauth.authorize(request_data))}},
          );
          const responseData = res.data;
          const authToken = responseData.match(/oauth_token=([^&]+)/)[1];
          const authTokenSecret = responseData.match(
            /oauth_token_secret=([^&]+)/,
          )[1];

          // https://rnfirebase.io/auth/social-auth#twitter
          // import auth from '@react-native-firebase/auth';
          // const twitterCredential = auth.TwitterAuthProvider.credential(authToken, authTokenSecret);

          // // Sign-in the user with the credential
          // const result = auth().signInWithCredential(twitterCredential);

          Alert.alert(
            'Success',
            `authToken: ${authToken.slice(0, 12) + '...'}\nauthTokenSecret: ${
              authTokenSecret.slice(1, 12) + '...'
            }`,
          );
        } catch (error) {
          console.log('Error: access token', error);
        }
      },
    );

    return () => subscribe.remove();
  }, []);

  return {
    signInWithTwitter,
  };
};
