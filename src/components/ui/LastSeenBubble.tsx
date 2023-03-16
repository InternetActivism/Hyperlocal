import { useAtomValue } from 'jotai';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { getActiveConnectionsAtom } from 'services/atoms';
import { getLastSeenTime } from 'services/contacts';
import AlertBubble from './AlertBubble';

interface Props {
  user: string;
}

const LastSeenBubble = ({ user }: Props) => {
  const connections = useAtomValue(getActiveConnectionsAtom);
  const [connected, setConnected] = useState<boolean>(false);

  const lastOnline: string = getLastSeenTime(user);

  useEffect(() => {
    setConnected(connections.includes(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections]);

  return <AlertBubble primary={connected} text={connected ? 'Nearby' : 'Nearby ' + lastOnline} />;
};

export default LastSeenBubble;
