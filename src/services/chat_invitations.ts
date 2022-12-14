import { ChatInvitation, CHAT_INVITATION_KEY, storage } from './database';

export function verifyChatInvitation(contactID: string, requestHash: string): boolean {
  const invitation = storage.getString(CHAT_INVITATION_KEY(contactID));
  if (invitation) {
    const invitationObject = JSON.parse(invitation) as ChatInvitation;
    if (invitationObject.requestHash === requestHash) {
      return true;
    }
  }
  return false;
}
