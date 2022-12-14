import { SEND_NICKNAME_TO_NON_CONTACTS } from '../utils/globals';
import { generateRandomName } from '../utils/RandomName/generateRandomName';
import { getContactInfo, isContact } from './contacts';
import { CurrentUserInfo, CURRENT_USER_INFO_KEY, storage } from './database';
import { sendNicknameUpdateWrapper } from './transmission';

export function getOrCreateUserInfo(
  userID: string,
  sdkValidated: boolean = false
): CurrentUserInfo {
  console.log('(getOrCreateUserInfo) Creating new user');
  const currentUserInfoString = storage.getString(CURRENT_USER_INFO_KEY());
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
  storage.set(CURRENT_USER_INFO_KEY(), JSON.stringify(newUserInfo));
  return newUserInfo;
}

export function getUserInfo(): CurrentUserInfo | null {
  const currentUserInfoString = storage.getString(CURRENT_USER_INFO_KEY());
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

export function setUserInfo(userInfo: CurrentUserInfo) {
  console.log('(setUserInfo) Setting current user');
  storage.set(CURRENT_USER_INFO_KEY(), JSON.stringify(userInfo));
}

// checks whether a contact has our updated name and sends it if not
export function checkUpToDateName(contactID: string, userInfo: CurrentUserInfo) {
  console.log('(checkUpToDateName) Checking:', contactID);
  // check if contact info exists

  // send nickname update to non contacts every time! privacy risk, remove later
  if (!isContact(contactID)) {
    console.log('(checkUpToDateName) Sending nickname update to non contact:', contactID);
    // send a nickname update message
    if (SEND_NICKNAME_TO_NON_CONTACTS) {
      sendNicknameUpdateWrapper(contactID, userInfo.nickname);
    }
    return;
  }

  const contactInfo = getContactInfo(contactID);

  if (contactInfo.lastSeen === -1) {
    console.log(contactInfo);
    throw new Error('Contact has not been seen yet');
  }

  // check if user's contact info is up to date, send update if not
  if (contactInfo.lastSeen < userInfo.dateUpdated) {
    console.log('(checkUpToDateName) Sending nickname update:', contactID);
    // send a nickname update message
    sendNicknameUpdateWrapper(contactID, userInfo.nickname);
  }
}

export function checkUpToDateNameAll(userInfo: CurrentUserInfo, connections: string[]) {
  console.log('(checkUpToDateNameAll) Checking all connections');
  for (const connection of connections) {
    checkUpToDateName(connection, userInfo);
  }
}
