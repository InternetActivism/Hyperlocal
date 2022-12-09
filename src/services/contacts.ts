import { ContactInfo, storage } from './database';
import { timeSinceTimestamp } from './helpers';

export function getOrCreateContactInfo(contactID: string): ContactInfo {
  console.log(
    '(getOrCreateContactInfo) Getting contact info for contact:',
    contactID,
  );
  const contactString = storage.getString(`u-${contactID}`);

  // return existing contact info
  if (contactString) {
    let contactInfo: ContactInfo;
    try {
      contactInfo = JSON.parse(contactString);
    } catch (error) {
      console.log('(getOrCreateContactInfo) Error parsing contact info');
      throw error;
    }
    return contactInfo;
  }

  // create new contact info
  const contactInfo: ContactInfo = {
    contactID: contactID,
    name: contactID,
    lastSeen: Date.now(),
    lastMessageIndex: -1, // new contact, no messages.
  };
  storage.set(`u-${contactID}`, JSON.stringify(contactInfo));

  // add new user to index of all users
  const allUsersString = storage.getString('all_users');
  const allUsers: string[] = allUsersString
    ? [...JSON.parse(allUsersString)]
    : [];
  storage.set('all_users', JSON.stringify(allUsers.concat(contactID)));

  return contactInfo;
}

// get contact info if it exists, otherwise return null
export function getContactInfo(contactID: string): ContactInfo | null {
  console.log(
    '(getOrCreateContactInfo) Getting contact info for contact:',
    contactID,
  );
  const contactString = storage.getString(`u-${contactID}`);

  // return existing contact info
  if (contactString) {
    let contactInfo: ContactInfo;
    try {
      contactInfo = JSON.parse(contactString);
    } catch (error) {
      console.log('(getOrCreateContactInfo) Error parsing contact info');
      throw error;
    }
    return contactInfo;
  }

  return null;
}

export function updateContactInfo(contactInfo: ContactInfo) {
  const contactString = storage.getString(`u-${contactInfo.contactID}`);

  // don't update if we don't have a record of this user
  if (contactString === undefined) {
    console.log(
      "(updateContactInfo) Fatal, couldn't find contact:",
      contactInfo.contactID,
    );
    throw new Error('Fatal, could not find contact');
  }

  storage.set(`u-${contactInfo.contactID}`, JSON.stringify(contactInfo));
}

export function updateLastSeen(contactID: string) {
  console.log('(updateLastSeen) Updating last seen for contact:', contactID);
  const contactString: string | undefined = storage.getString(`u-${contactID}`);
  if (contactString === undefined) {
    console.log('(updateLastSeen) Contact not found');
  } else {
    const contact: ContactInfo = JSON.parse(contactString);
    contact.lastSeen = Date.now();
    storage.set(`u-${contactID}`, JSON.stringify(contact));
  }
}

export function getLastSeenTime(contactID: string): string {
  const contactString: string | undefined = storage.getString(`u-${contactID}`);
  if (contactString === undefined) {
    console.log('(getLastSeenTime) Contact not found');
    throw new Error('Contact not found');
  }
  const contact: ContactInfo = JSON.parse(contactString);
  return timeSinceTimestamp(contact.lastSeen);
}

export function logDisconnect(contactID: string) {
  console.log('(logDisconnect) Logging disconnect for contact:', contactID);
  updateLastSeen(contactID);
}
