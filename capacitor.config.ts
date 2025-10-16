// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.ekarigar.telldemm',
//   appName: 'Telldemm',
//   webDir: 'www',
//   server: {
//   cleartext: true
// }
// };

// export default config;


import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
const config: CapacitorConfig = {
  appId: 'com.ekarigar.telldemm',
  appName: 'Telldemm',
  webDir: 'www',
  server: {
  cleartext: true
},
   plugins: {
    // Keyboard: {
    //   resize: KeyboardResize.Ionic,          // Correct use of enum
    //   style: KeyboardStyle.Light,             // Also using enum
    //   resizeOnFullScreen: true,  
    //             // Optional Android workaround
    // },
    EdgeToEdge: {
      backgroundColor: "#ffffff",  // color for status + navigation bar
    },   
  },
};
 
export default config;