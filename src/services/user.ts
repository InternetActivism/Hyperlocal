import { SEND_NICKNAME_TO_NON_CONTACTS } from '../utils/globals';
import { generateRandomName } from '../utils/RandomName/generateRandomName';
import { getContactInfo, isContact } from './contacts';
import { CurrentUserInfo, CURRENT_USER_INFO_KEY, storage } from './database';
import { sendNicknameUpdateWrapper } from './transmission';

// Gets the current user info from the database or creates a new one if it doesn't exist.
export function getOrCreateUserInfoDatabase(
  userID: string,
  sdkValidated: boolean = false
): CurrentUserInfo {
  console.log('(getOrCreateUserInfo) Creating new user');
  const currentUserInfoString = storage.getString(CURRENT_USER_INFO_KEY);
  if (currentUserInfoString) {
    console.log('(getOrCreateUserInfo) User already exists, returning existing.');
    let currentUserInfoObj: CurrentUserInfo;
    try {
      currentUserInfoObj = JSON.parse(currentUserInfoString);
    } catch (error) {
      console.log(currentUserInfoString);
      throw error;
    }
    return currentUserInfoObj;
  }

  const newUserInfo: CurrentUserInfo = {
    userID: userID,
    nickname: generateRandomName(),
    userFlags: 0,
    privacy: 0, // used in future versions
    verified: false, // used in future versions
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    sdkValidated: sdkValidated,
  };
  console.log('(getOrCreateUserInfo) Setting current user', newUserInfo);
  storage.set(CURRENT_USER_INFO_KEY, JSON.stringify(newUserInfo));
  return newUserInfo;
}

// Gets the current user info from the database.
export function getUserInfoDatabase(): CurrentUserInfo | null {
  const currentUserInfoString = storage.getString(CURRENT_USER_INFO_KEY);
  if (currentUserInfoString) {
    let currentUserInfoObj: CurrentUserInfo;
    try {
      currentUserInfoObj = JSON.parse(currentUserInfoString);
    } catch (error) {
      console.log(currentUserInfoString);
      throw error;
    }
    return currentUserInfoObj;
  }
  return null;
}

// Sets the current user info in the database.
export function setUserInfoDatabase(userInfo: CurrentUserInfo) {
  console.log('(setUserInfo) Setting current user');
  storage.set(CURRENT_USER_INFO_KEY, JSON.stringify(userInfo));
}

// Checks whether a connection/contact has our updated name and sends it if not.
export function checkUpToDateName(connectionID: string, userInfo: CurrentUserInfo) {
  console.log('(checkUpToDateName) Checking:', connectionID);

  // Send nickname update to non contacts every time! Privacy risk, remove later.
  if (!isContact(connectionID)) {
    console.log('(checkUpToDateName) Sending nickname update to non contact:', connectionID);
    // send a nickname update message
    if (SEND_NICKNAME_TO_NON_CONTACTS) {
      sendNicknameUpdateWrapper(connectionID, userInfo.nickname);
    }
    return;
  }

  // Check if user's contact info is up to date, send update if not.
  // Last seen is the last time we connected to the contact.
  const contactInfo = getContactInfo(connectionID);
  if (contactInfo.lastSeen < userInfo.dateUpdated) {
    console.log('(checkUpToDateName) Sending nickname update:', connectionID);
    // send a nickname update message
    sendNicknameUpdateWrapper(connectionID, userInfo.nickname);
  }
}

// Checks all connections for up to date name.
export function checkUpToDateNameAll(userInfo: CurrentUserInfo, connections: string[]) {
  console.log('(checkUpToDateNameAll) Checking all connections');
  for (const connection of connections) {
    checkUpToDateName(connection, userInfo);
  }
}
