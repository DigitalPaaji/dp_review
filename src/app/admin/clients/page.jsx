import React, { Suspense } from 'react'
import ClientsPage from './ClientsPage'

const page = () => {
  return (
    <Suspense fallback={<div> Loading...... </div>}>
     <ClientsPage />
    </Suspense>
  )
}

export default page