import { ContactInfo, CONTACT_INFO_KEY, storage } from './database';
import { timeSinceTimestamp } from '../helpers';

// DEPRECATED
// export function getOrCreateContactInfo(contactID: string): ContactInfo {
//   console.log('(getOrCreateContactInfo) Getting contact info for contact:', contactID);
//   const contactString = storage.getString(CONTACT_INFO_KEY(contactID));

//   // return existing contact info
//   if (contactString) {
//     try {
//       return JSON.parse(contactString);
//     } catch (error) {
//       console.log('(getOrCreateContactInfo) Error parsing contact info');
//       throw error;
//     }
//   }

//   // create new default contact info
//   const contactInfo: ContactInfo = {
//     contactID: contactID,
//     username: '',
//     nickname: contactID,
//     contactFlags: 0,
//     verified: false, // used in future versions
//     lastSeen: -1,
//   };
//   storage.set(CONTACT_INFO_KEY(contactID), JSON.stringify(contactInfo));

//   // add new user to index of all users
//   const allUsersString = storage.getString('all_users');
//   const allUsers: string[] = allUsersString ? [...JSON.parse(allUsersString)] : [];
//   storage.set('all_users', JSON.stringify(allUsers.concat(contactID)));

//   return contactInfo;
// }

export function setContactInfo(contactID: string, contactInfo: ContactInfo) {
  console.log('(setContactInfo) Setting contact info for contact:', contactInfo.contactID);
  if (contactInfo.contactID !== contactID) {
    throw new Error('Fatal, contactID does not match contactInfo.contactID');
  }
  storage.set(CONTACT_INFO_KEY(contactID), JSON.stringify(contactInfo));
  return contactInfo;
}

export function isContact(contactID: string): boolean {
  const contactString = storage.getString(CONTACT_INFO_KEY(contactID));
  return !!contactString;
}

export function getContactInfo(contactID: string): ContactInfo {
  console.log('(getContactInfo) Getting contact info for contact:', contactID);
  const contactString = storage.getString(CONTACT_INFO_KEY(contactID));
  if (!contactString) {
    console.log('(getContactInfo) Contact not found');
    throw new Error('Contact not found');
  }
  try {
    return JSON.parse(contactString);
  } catch (error) {
    console.log('(getContactInfo) Error parsing contact info');
    throw error;
  }
}

export function updateContactInfo(contactID: string, contactInfo: ContactInfo) {
  const contactString = storage.getString(CONTACT_INFO_KEY(contactInfo.contactID));
  if (!contactString) {
    console.log(contactID, contactInfo);
    throw new Error('Fatal, could not find contact');
  }
  storage.set(CONTACT_INFO_KEY(contactInfo.contactID), JSON.stringify(contactInfo));
}

export function getLastSeenTime(contactID: string): string {
  const contact = getContactInfo(contactID);
  return timeSinceTimestamp(contact.lastSeen);
}

export function logDisconnect(contactID: string) {
  console.log('(logDisconnect) Logging disconnect for contact:', contactID);
  if (!contactID) {
    console.log(contactID);
    throw new Error('Disconnect called with no contactID');
  }

  // only update last seen for contacts
  if (isContact(contactID)) {
    const contactInfo = getContactInfo(contactID);
    updateContactInfo(contactID, {
      ...contactInfo,
      lastSeen: Date.now(),
    });
  }
}
