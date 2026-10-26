import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div> Loading...... </div>}>
      <AccountRequestsPage />
    </Suspense>
  )
}

export default page