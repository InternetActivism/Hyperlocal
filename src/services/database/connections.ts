import { ConnectionInfo } from './database';

export const getConnectionName = (contactID: string, cache: Map<string, ConnectionInfo>) => {
  const connection = cache.get(contactID);
  if (connection) {
    return connection.displayName;
  }
  return contactID;
};
