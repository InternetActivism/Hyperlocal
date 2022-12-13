import { ContactInfo, CONTACT_INFO_KEY, storage } from './database';
import { timeSinceTimestamp } from '../../utils/timeSinceTimestamp';

export function setContactInfo(contactID: string, contactInfo: ContactInfo) {
  console.log('(setContactInfo) Setting contact info for contact:', contactInfo.contactID);
  if (contactInfo.contactID !== contactID) {
    throw new Error('Fatal, contactID does not match contactInfo.contactID');
  }
  storage.set(CONTACT_INFO_KEY(contactID), JSON.stringify(contactInfo));
  return contactInfo;
}

export function isContact(contactID: string): boolean {
  console.log('(isContact) Checking if contact:', contactID);
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
  const contactString = storage.getString(CONTACT_INFO_KEY(contactID));
  if (!contactString) {
    console.log(contactID, contactInfo);
    throw new Error('Fatal, could not find contact');
  }
  storage.set(CONTACT_INFO_KEY(contactID), JSON.stringify(contactInfo));
}

export function getLastSeenTime(contactID: string): string {
  const contact = getContactInfo(contactID);
  return timeSinceTimestamp(contact.lastSeen);
}

export function updateLastSeen(contactID: string) {
  console.log('(updateLastSeen) Logging disconnect for contact:', contactID);
  if (!contactID) {
    console.log(contactID);
    throw new Error('Disconnect called with no contactID');
  }

  // only update last seen for contacts
  const contactInfo = getContactInfo(contactID);
  updateContactInfo(contactID, {
    ...contactInfo,
    lastSeen: Date.now(),
  });
  console.log('(updateLastSeen) Updated last seen:', getContactInfo(contactID));
}
