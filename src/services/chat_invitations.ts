import { ChatInvitation, CHAT_INVITATION_KEY, storage } from './database';

// Check if the invitation acceptance is valid.
// This prevents attacks where a malicious user could send a fake invitation acceptance.
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
