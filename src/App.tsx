/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import {useSignInWithTwitter} from './useSignInWithTwitter';

function App(): JSX.Element {
  const {signInWithTwitter} = useSignInWithTwitter();

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Sign in with Twitter" onPress={signInWithTwitter} />
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
