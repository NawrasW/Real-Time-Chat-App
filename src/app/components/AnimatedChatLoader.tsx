import React from 'react'
import Image from 'next/image'

export default function Component ({ size = 60 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
    <Image
      src="/Logo.png"
      alt="Chattix"
      fill
      className="object-contain"
    />
  </div>
  )
}