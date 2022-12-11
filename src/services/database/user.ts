import { generateRandomName } from '../../utils/RandomName/generateRandomName';
import { getContactInfo } from './contacts';
import { CurrentUserInfo, CURRENT_USER_INFO_KEY, sendMessageWrapper, storage } from './database';

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
  if (!userInfo) return; // TODO: remove this?

  console.log('(checkUpToDateName) Checking:', contactID);
  // check if contact info exists
  const contactInfo = getContactInfo(contactID);

  // send username update to non contacts! don't keep this? privacy?
  if (!contactInfo) {
    console.log('(checkUpToDateName) Sending username update:', contactID);
    // send a username update message
    sendMessageWrapper(userInfo.nickname, 1, contactID);
    return;
  }

  // check if user's contact info is up to date, send update if not
  if (contactInfo.lastSeen < userInfo.dateUpdated) {
    console.log('(checkUpToDateName) Sending username update:', contactID);
    // send a username update message
    sendMessageWrapper(userInfo.nickname, 1, contactID);
  }
}
