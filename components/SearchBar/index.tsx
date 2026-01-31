'use client'

import type { NextPage } from 'next'
import { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

const SearchBar: NextPage = () => {
  const [searchValue, setSearchValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      window.location.href = `https://cn.bing.com/search?q=${searchValue}&form=QBRE`
    }
  }

  return (
    <div className="flex flex-row justify-center pt-26">
      <div className="flex w-140 rounded-2xl bg-[#ffffff80] focus-within:bg-white/90 hover:bg-white/90">
        <div className="flex size-13 items-center justify-center">
          <section className="flex size-8 items-center justify-center rounded-lg hover:cursor-pointer hover:bg-white/50">
            <Image src="/icon-bing.png" alt="bing" width={24} height={24} />
          </section>
        </div>
        <Input
          className="h-13 w-114 border-none px-0 shadow-none focus:ring-0 focus-visible:border-transparent focus-visible:ring-0"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="size-13"></div>
      </div>
    </div>
  )
}

export default SearchBar
