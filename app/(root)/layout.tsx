import React from 'react'
// import Header from '@/components/Header'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col bg-[url('/bg.jpg')] bg-cover bg-no-repeat">
      {/* <Header /> */}
      <main>{children}</main>
    </div>
  )
}

export default RootLayout
