import { useState } from 'react'
import { BlobContext } from './blobContext'
import { createBlobStore } from './blobStore'

/* Shared so the bloom can start from the blob and the intro can hand its
   ink drops over to it. Created once per mount. */
export default function BlobProvider({ children }) {
  const [store] = useState(createBlobStore)
  return <BlobContext.Provider value={store}>{children}</BlobContext.Provider>
}
