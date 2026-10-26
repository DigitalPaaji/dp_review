import React, { Suspense } from 'react'
import AccountRequestsPage from './AccountRequestsPage'

const page = () => {
  return (
    <Suspense fallback={<div> Loading...... </div>}>
      <AccountRequestsPage />
    </Suspense>
  )
}

export default page