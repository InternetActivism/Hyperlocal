import { generateRandomName } from '../utils/RandomName/generateRandomName';
import { getContactInfo } from './contacts';
import { sendMessageWrapper, storage, UserInfo } from './database';

export function getOrCreateUserInfo(userID: string): UserInfo {
  console.log('(getOrCreateUserInfo) Creating new user');
  const UserInfo = storage.getString('user_info');
  if (UserInfo) {
    console.log("(getOrCreateUserInfo) User already exists, returning user's info");
    let userInfo: UserInfo;
    try {
      userInfo = JSON.parse(UserInfo);
    } catch (error) {
      console.log('(getOrCreateUserInfo) Error parsing user info');
      throw error;
    }
    return userInfo;
  }
  const newUserInfo: UserInfo = {
    name: generateRandomName(),
    userID: userID,
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
  };
  storage.set('user_info', JSON.stringify(newUserInfo));
  return newUserInfo;
}

export function setUserInfo(userInfo: UserInfo) {
  console.log('(setUserInfo) Setting current user');
  storage.set('user_info', JSON.stringify(userInfo));
}

// checks whether a contact has our updated name and sends it if not
export function checkUpToDateName(contactID: string, userInfo: UserInfo) {
  if (!userInfo) return;

  console.log('(checkUpToDateName) Checking:', contactID);
  // check if contact info exists
  const contactInfo = getContactInfo(contactID);
  console.log(
    '(checkUpToDateName) Bool checks:',
    contactInfo,
    userInfo,
    contactInfo && userInfo && contactInfo.lastSeen < userInfo.dateUpdated
  );

  // send username update to non contacts! don't keep this? privacy?
  if (!contactInfo) {
    console.log('(checkUpToDateName) Sending username update:', contactID);
    // send a username update message
    sendMessageWrapper(userInfo.name, 1, contactID);
    return;
  }

  // check if user's contact info is up to date, send update if not
  if (contactInfo.lastSeen < userInfo.dateUpdated) {
    console.log('(checkUpToDateName) Sending username update:', contactID);
    // send a username update message
    sendMessageWrapper(userInfo.name, 1, contactID);
  }
}
