"use client";
import * as React from 'react'
import { 
  type BaseError,
  useSendTransaction, 
  useWaitForTransactionReceipt 
} from 'wagmi' 
import { parseEther } from 'viem' 
 
export function SendTransaction() {
  const { 
    data: hash,
    error,
    isPending, 
    sendTransaction 
  } = useSendTransaction() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) 
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0x434D4f9E25c90A03A741D367d65319bFfCB877f2" required className='w-full p-2 rounded-md border border-gray-300'/>
      <input name="value" placeholder="0.001" required className="w-full p-2 rounded-md border border-gray-300" />
      <button 
        disabled={isPending} 
        type="submit"
        className='w-full p-2 rounded-md border border-gray-300'
      >
        {isPending ? 'Confirming...' : 'Send'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {error && (
        <div>Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </form>
  )
}