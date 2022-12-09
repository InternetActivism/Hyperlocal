import { generateRandomName } from '../utils/RandomName/generateRandomName';
import { storage, UserInfo } from './database';

export function getOrCreateUserInfo(userID: string): UserInfo {
  console.log('(getOrCreateUserInfo) Creating new user');
  const UserInfo = storage.getString('user_info');
  if (UserInfo) {
    console.log(
      "(getOrCreateUserInfo) User already exists, returning user's info",
    );
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
