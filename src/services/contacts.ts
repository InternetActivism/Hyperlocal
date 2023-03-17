import { timeSinceTimestamp } from '../utils/timeSinceTimestamp';
import { ContactInfo, CONTACT_INFO_KEY, storage } from './database';

// Sets the contact info for a given contact.
export function setContactInfo(contactID: string, contactInfo: ContactInfo) {
  console.log('(setContactInfo) Setting contact info for contact:', contactID);
  if (contactInfo.contactID !== contactID) {
    throw new Error('Fatal, contactID does not match contactInfo.contactID');
  }
  storage.set(CONTACT_INFO_KEY(contactID), JSON.stringify(contactInfo));
  return contactInfo;
}

// Checks if a contact exists in the database.
export function isContact(contactID: string): boolean {
  // console.log('(isContact) Checking if contact:', contactID);
  const contactString = storage.getString(CONTACT_INFO_KEY(contactID));
  return !!contactString;
}

// Gets the contact info for a given contact.
// Intentionally unsafe, throws an error if the contact is not found.
export function getContactInfo(contactID: string): ContactInfo {
  // console.log('(getContactInfo) Getting contact info for contact:', contactID);
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

// Updates the contact info for a given contact.
// Intentionally unsafe, throws an error if the contact is not found.
// Use this instead of setContactInfo if you know the contact already exists.
export function updateContactInfo(contactID: string, contactInfo: ContactInfo) {
  const contactString = storage.getString(CONTACT_INFO_KEY(contactID));
  if (!contactString) {
    console.log(contactID, contactInfo);
    throw new Error('Fatal, could not find contact');
  }
  storage.set(CONTACT_INFO_KEY(contactID), JSON.stringify(contactInfo));
}

// Gets the last seen time for a given contact and formats it as a string.
export function getLastSeenTime(contactID: string): string {
  const contact = getContactInfo(contactID);
  return timeSinceTimestamp(contact.lastSeen);
}

// Updates the last seen time for a given contact.
export function updateLastSeen(contactID: string) {
  console.log('(updateLastSeen) Logging last seen for contact:', contactID);
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
}

// Updates the unread message count for a given contact.
export function updateUnreadCountStorage(contactID: string, unreadCount: number) {
  const contactInfo = getContactInfo(contactID);
  updateContactInfo(contactID, {
    ...contactInfo,
    unreadCount,
  });
}
