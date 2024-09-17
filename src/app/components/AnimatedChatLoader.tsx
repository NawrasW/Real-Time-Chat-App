import React from 'react'

export default function Component() {
  return (
    <div className="flex items-center justify-center w-12 h-12" aria-label="Loading" role="status">
      <svg
        className="w-full h-full text-gray-300 animate-pulse"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
          fill="currentColor"
        />
        <circle className="animate-typing" cx="6" cy="12" r="1.5" fill="white">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1.5s"
            repeatCount="indefinite"
            begin="0s"
          />
        </circle>
        <circle className="animate-typing" cx="12" cy="12" r="1.5" fill="white">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1.5s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </circle>
        <circle className="animate-typing" cx="18" cy="12" r="1.5" fill="white">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1.5s"
            repeatCount="indefinite"
            begin="1s"
          />
        </circle>
      </svg>
    </div>
  )
}