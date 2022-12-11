import { generateRandomName } from '../../utils/RandomName/generateRandomName';
import { SEND_NICKNAME_TO_NON_CONTACTS } from '../globals';
import { getContactInfo } from './contacts';
import {
  CONTACT_ARRAY_KEY,
  CurrentUserInfo,
  CURRENT_USER_INFO_KEY,
  sendMessageWrapper,
  storage,
} from './database';

export function getOrCreateUserInfo(userID: string): CurrentUserInfo {
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
    username: '', // used in future versions, globally unique
    nickname: generateRandomName(),
    userFlags: 0,
    privacy: 0,
    verified: false,
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
  };
  storage.set(CURRENT_USER_INFO_KEY(), JSON.stringify(newUserInfo));
  return newUserInfo;
}

export function setUserInfo(userInfo: CurrentUserInfo) {
  console.log('(setUserInfo) Setting current user');
  storage.set(CURRENT_USER_INFO_KEY(), JSON.stringify(userInfo));
}

// checks whether a contact has our updated name and sends it if not
export function checkUpToDateName(contactID: string, userInfo: CurrentUserInfo) {
  console.log('(checkUpToDateName) Checking:', contactID);
  // check if contact info exists
  const contactInfo = getContactInfo(contactID);

  // send username update to non contacts!
  if (!contactInfo || contactInfo.friend === false) {
    console.log('(checkUpToDateName) Sending username update:', contactID);
    // send a username update message
    if (!SEND_NICKNAME_TO_NON_CONTACTS) {
      sendMessageWrapper(userInfo.nickname, 1, contactID);
    }
    return;
  }

  if (contactInfo.lastSeen === -1) {
    console.log(contactInfo);
    throw new Error('Contact has not been seen yet');
  }

  // check if user's contact info is up to date, send update if not
  if (contactInfo.lastSeen < userInfo.dateUpdated) {
    console.log('(checkUpToDateName) Sending username update:', contactID);
    // send a username update message
    sendMessageWrapper(userInfo.nickname, 1, contactID);
  }
}

export function checkUpToDateNameAll(userInfo: CurrentUserInfo, connections: string[]) {
  console.log('(checkUpToDateNameAll) Checking all connections');
  for (const connection of connections) {
    checkUpToDateName(connection, userInfo);
  }
}
