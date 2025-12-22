'use client'
import type { NextPage } from 'next'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty'

const NotFound: NextPage = () => {
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>404 - Not Found</EmptyTitle>
            <EmptyDescription>
              The page you&apos;re looking for doesn&apos;t exist. Try searching
              for what you need below.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <EmptyDescription>
              <Button
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                Back
              </Button>
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </div>
    </>
  )
}

export default NotFound
