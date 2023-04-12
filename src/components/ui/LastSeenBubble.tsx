import { useAtomValue } from 'jotai';
import React from 'react';
import { contactInfoAtom, getActiveConnectionsAtom } from '../../services/atoms';
import { ContactInfo } from '../../services/database';
import { timeSinceTimestamp } from '../../utils/time';
import AlertBubble from './AlertBubble';

interface Props {
  user: string;
  largeText?: boolean;
  shorten?: boolean;
}

const LastSeenBubble = ({ user, largeText, shorten }: Props) => {
  const connections = useAtomValue(getActiveConnectionsAtom);
  const connected = connections.includes(user);
  const allContactsInfo = useAtomValue(contactInfoAtom);

  const contactInfo: ContactInfo = allContactsInfo[user];
  if (!contactInfo) {
    throw new Error('(LastSeenBubble) Contact info not found in LastSeenBubble');
  }

  const lastOnline = timeSinceTimestamp(contactInfo.lastSeen);
  const lastSeenText = shorten ? '' : 'Last seen ';

  return (
    <AlertBubble
      primary={connected}
      text={connected ? 'Linked' : lastSeenText + lastOnline}
      largeText={largeText}
    />
  );
};

export default LastSeenBubble;
