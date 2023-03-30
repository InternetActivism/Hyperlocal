import { StoredConnectionInfo } from './atoms';

// This is a helper function to get the public name of a connection.
// If the connection is not in the cache, it will return the contactID.
// The connection cache is just a temporary cache to store connection info (name, last updated, etc). and should never be persisted for privacy reasons.
export const getConnectionName = (contactID: string, cache: Map<string, StoredConnectionInfo>) => {
  const connection = cache.get(contactID);
  if (connection) {
    return connection.publicName;
  }
  return 'Unknown User';
};
