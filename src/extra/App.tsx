import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '@/navigation';
import { ThemeProvider } from '@/core/theme';
import { ParentComponent } from '@/core/ParentComponent';

function App() {
  return (
    <ThemeProvider theme="primary">
      <SafeAreaProvider>
        <NavigationContainer>
          <ParentComponent>
            <RootNavigator />
          </ParentComponent>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default App;
