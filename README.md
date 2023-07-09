# Hyperlocal

Hyperlocal is a free, open source, Bluetooth messaging app, built to ensure the privacy and safety of communication between those without internet access.

## Starting out

1. Install [Node.js](https://nodejs.org/en/)
2. For ios, install XCode, XCode command line tools, and cocoapods
3. Set up [React Native](https://reactnative.dev/docs/environment-setup) to work on your local machine.
4. Clone the repository
5. Add your Bridgefy API key under `API_KEY` in `Hyperlocal.xcscheme` or `AndroidManifest.xml`. Please contact us if you need help acquiring an API key.
6. Run `npm install` in the root directory
7. Run `bundle install` in the root directory
8. Run `pod install` in the `ios` directory
9. Run `npm start` in the root directory
10. Run `npx react-native run-ios` or  in the root directory

### Gotchas

- Currently to test the functioning application, you need to build this on a physical phone (not a simulator).
- Ensure that you have the latest version of XCode installed (currently 14.1).
- You will have to have bluetooth enabled on your phone to run the app.
- For the first launch, you will have to have internet connection to verify your keys with the Bridgefy SDK.
- If you see a signing error, you'll have to create an apple developer account, login to XCode with your account, then select "Sign as Personal Account.
- Make sure you have added the Bridgefy SDK API key to the project. See the "Starting the repository" section for more details.
- You will have to use your own Bridgefy SDK API key that is assigned to whatever bundle ID you want to use.

### Database

Since this project will be using a mesh network, we will not be using a internet database, but rather a local database. We will be using [MMKV](https://github.com/mrousavy/react-native-mmkv), which is a key-value store that is fast and secure. This will be used to store the user's information, as well as the messages that they send and receive. 

### Bridgefy SDK

Hyperlocal utilizes the [Bridgefy SDK](https://bridgefy.me/sdk/) to power our peer-to-peer messaging protocol. This SDK allows us to create a mesh network between users, and allows us to send messages between users through bluetooth. 

Check it out for more information, and be sure to contact the Hyperlocal team if you have any questions. 

### User Infrastructure

Bridgefy SDK gives a certain UUID to each user, which we will hash to make more friendly to the user. Along with the User ID, we send nicknames that are associated with the UUID.
