# Data model of Hyperlocal.

How it works:

There's currently two major parts to the way we store data:

1. Through MMKV, a super fast permanent storage package.

2. Through Jotai, a simple state management library for temporary storage.

Important files:

Database.ts - MMKV permanent storage and schema types.
Atoms.ts - Jotai temporary storage and helper functions.
Brigefy-link.ts - Connection between React Native and Bridgefy SDK protocol. Low-level functions.
Transmission.ts - Data types for message transmission via mesh network.

Other files:

Stored_message.ts - Functions for message storage, retrieval, editing from the database.
Contact.ts - Functions for contact management and retrieval, conversation data, and other information.
User.ts - Functions for app user management and retrieval.
Chat_invitations.ts - Functions for chat invitation management and retrieval.
Connections.ts - Functions for connections data retrieval.

To be continued...
