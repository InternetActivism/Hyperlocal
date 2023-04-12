import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { contactInfoAtom, getActiveConnectionsAtom } from '../../services/atoms';
import { ContactInfo } from '../../services/database';
import { timeSinceTimestamp } from '../../utils/time';
import AlertBubble from './AlertBubble';

interface Props {
  user: string;
  largeText?: boolean;
}

const LastSeenBubble = ({ user, largeText }: Props) => {
  const connections = useAtomValue(getActiveConnectionsAtom);
  const [connected, setConnected] = useState<boolean>(false);
  const allContactsInfo = useAtomValue(contactInfoAtom);

  const contactInfo: ContactInfo = allContactsInfo[user];
  if (!contactInfo) {
    throw new Error('(LastSeenBubble) Contact info not found in LastSeenBubble');
  }

  const lastOnline = timeSinceTimestamp(contactInfo.lastSeen);

  useEffect(() => {
    setConnected(connections.includes(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections]);

  return (
    <AlertBubble
      primary={connected}
      text={connected ? 'Connected' : 'Last seen ' + lastOnline}
      largeText={largeText}
    />
  );
};

export default LastSeenBubble;
