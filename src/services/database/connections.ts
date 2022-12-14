import { StoredConnectionInfo } from '../atoms';

export const getConnectionName = (contactID: string, cache: Map<string, StoredConnectionInfo>) => {
  const connection = cache.get(contactID);
  if (connection) {
    return connection.publicName;
  }
  return contactID;
};
