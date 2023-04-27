# Hyperlocal Mobile App

A bluetooth-based mesh networking app to allow free and secure communication between users without internet access. This will be used in humanitarian crises and other situations where internet access is not available.

## Starting the repository

1. Install [Node.js](https://nodejs.org/en/)
2. For ios, install XCode, XCode command line tools, and cocoapods
3. Install and run [Flipper](https://fbflipper.com/) for debugging
4. Clone the repository
5. To add the Bridgefy SDK api key click the bridgefytest icon at the top in XCode beside the build device destination and press "Edit Scheme...". Under environment variables add one named `API_KEY` with your API key as the value
6. Run `npm install` in the root directory
7. Run `bundle install` in the root directory
8. Run `pod install` in the `ios` directory
9. Run `npm start` in the root directory
10. Run `npx react-native run-ios` in the root directory

### Gotchas

- Currently to test the functioning application, you need to build this on a physical phone (not a simulator).
- Ensure that you have the latest version of XCode installed (currently 14.1).
- You will have to have bluetooth enabled on your phone to run the app.
- For the first launch, you will have to have internet connection to verify your keys with the Bridgefy SDK.
- If you see a signing error, you'll have to create an apple developer account, login to XCode with your account, then select "Sign as Personal Account.
- Make sure you have added the Bridgefy SDK API key to the project. See the "Starting the repository" section for more details.

## Infrastructure

### Database

Since this project will be using a mesh network, we will not be using a internet database, but rather a local database. We will be using [MMKV](https://github.com/mrousavy/react-native-mmkv), which is a key-value store that is fast and secure. This will be used to store the user's information, as well as the messages that they send and receive. 

We create a separate database for each conversation, and store the most recent conversations in an array in the user information database. This allows us to quickly access the most recent conversations, and also allows us to store a large number of conversations without slowing down the app.

### Bridgefy SDK

We will be using the [Bridgefy SDK](https://bridgefy.me/) to create the mesh network. This SDK allows us to create a mesh network between users, and allows us to send messages between users.

### User Infrastructure

Bridgefy SDK gives a certain UUID to each user, which we will hash to make more friendly to the user.
In the future we may associate unique usernames and names to the UUIDs.
