'use client'

import dynamic from 'next/dynamic'

const GlobalMap = dynamic(() => import('@/components/GlobalMap'), { ssr: false })

export default function MapClient() {
  return <GlobalMap />
}
