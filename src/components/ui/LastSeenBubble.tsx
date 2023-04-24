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
  height?: number;
  noBorder?: boolean;
}

const LastSeenBubble = ({ user, largeText, shorten, height, noBorder }: Props) => {
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
      text={connected ? 'Nearby' : lastSeenText + lastOnline}
      largeText={largeText}
      height={height}
      noBorder={noBorder}
    />
  );
};

export default LastSeenBubble;
