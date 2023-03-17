import { SEND_NICKNAME_TO_NON_CONTACTS } from '../utils/globals';
import { getContactInfo, isContact } from './contacts';
import { CurrentUserInfo } from './database';
import { sendConnectionInfoWrapper, sendNicknameUpdateWrapper } from './transmission';

// Checks whether a connection/contact has our updated name and sends it if not.
export function checkUpToDateName(connectionID: string, userInfo: CurrentUserInfo) {
  console.log('(checkUpToDateName) Checking:', connectionID);

  // Send nickname update to non contacts every time! Privacy risk, remove later.
  if (!isContact(connectionID)) {
    console.log(
      '(checkUpToDateName) Sending nickname update to non contact:',
      connectionID,
      ', nickname:',
      userInfo.nickname
    );
    // send a nickname update message
    if (SEND_NICKNAME_TO_NON_CONTACTS) {
      sendConnectionInfoWrapper(connectionID, userInfo.nickname);
    }
    return;
  }

  // Check if user's contact info is up to date, send update if not.
  // Last seen is the last time we connected to the contact.
  const contactInfo = getContactInfo(connectionID);
  // TODO: dateUpdated could be from something else than a nickname update.
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
