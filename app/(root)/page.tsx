import type { NextPage } from 'next'
import { Suspense } from 'react'
import SearchBar from '@/components/SearchBar'
// import Dock from '@/components/Dock'
// import DockSkeleton from '@/app/ui/skeletons'

const Page: NextPage = async () => {
  return (
    <div>
      <SearchBar />
      {/* <Suspense fallback={<DockSkeleton />}>
        <Dock />
      </Suspense> */}
      page
    </div>
  )
}

export default Page
