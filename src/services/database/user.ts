import { generateRandomName } from '../../utils/RandomName/generateRandomName';
import { MessageType, SEND_NICKNAME_TO_NON_CONTACTS } from '../../utils/globals';
import { getContactInfo, isContact } from './contacts';
import { CurrentUserInfo, CURRENT_USER_INFO_KEY, sendMessageWrapper, storage } from './database';

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
    username: '', // used in future versions, globally unique
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

  // send username update to non contacts every time! privacy risk, remove later
  if (!isContact(contactID)) {
    console.log('(checkUpToDateName) Sending username update to non contact:', contactID);
    // send a username update message
    if (SEND_NICKNAME_TO_NON_CONTACTS) {
      sendMessageWrapper(contactID, {
        content: userInfo.nickname,
        flags: MessageType.USERNAME_UPDATE,
        createdAt: Date.now(),
      });
    }
    return;
  }

  const contactInfo = getContactInfo(contactID);

  if (contactInfo.lastSeen === -1) {
    console.log(contactInfo);
    throw new Error('Contact has not been seen yet');
  }

  console.log(
    '(checkUpToDateName) Contact info exists:',
    contactInfo.lastSeen,
    userInfo.dateUpdated
  );

  // check if user's contact info is up to date, send update if not
  if (contactInfo.lastSeen < userInfo.dateUpdated) {
    console.log('(checkUpToDateName) Sending username update:', contactID);
    // send a username update message
    sendMessageWrapper(contactID, {
      content: userInfo.nickname,
      flags: MessageType.USERNAME_UPDATE,
      createdAt: Date.now(),
    });
  }
}

export function checkUpToDateNameAll(userInfo: CurrentUserInfo, connections: string[]) {
  console.log('(checkUpToDateNameAll) Checking all connections');
  for (const connection of connections) {
    checkUpToDateName(connection, userInfo);
  }
}
