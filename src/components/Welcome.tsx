"use client"
import React from 'react'
import { motion } from "motion/react"
import { ArrowRight, Bike, ShoppingBasket } from 'lucide-react'

type propType = {
    nextStep:(s:number)=>void
}

const Welcome = ({nextStep}:propType) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-center p-6'>
        <motion.div
        initial={{
            opacity:0,
            y:-15
        }}
        animate={{
            opacity:1,
            y:0
        }}
        transition={{
            duration:0.6
        }}
        className='flex items-center gap-3'
        >
            <ShoppingBasket className='w-10 h-10 text-green-600' />
            <h1 className='text-4xl md:text-5xl font-extrabold text-green-700' >
                Snapcart
            </h1>
        </motion.div>

        <motion.p
         initial={{
            opacity:0,
            y:15
        }}
        animate={{
            opacity:1,
            y:0
        }}
        transition={{
            duration:0.6,
            delay:0.3
        }}
        className="mt-4 text-lg text-gray-400 max-w-lg md:text-xl"
        >
            Welcome to Snapcart, your ultimate destination for lightning-fast shopping and seamless deliveries. Explore a curated selection of premium products tailored to your lifestyle, all from the comfort of your home.
        </motion.p>
        <motion.div
        initial={{
            opacity:0,
            scale:0.9 
        }}
        animate={{
            opacity:1,
            scale:1
        }}
        transition={{
            duration:0.6,
            delay:0.5
        }}
        className='flex items-center justify-center gap-10 mt-10'
        >
            <ShoppingBasket className='w-24 h-24 md:w-32 md:h-32 text-green-600 drop-shadow-md' />
            <Bike className='w-24 h-24 md:w-32 md:h-32 text-orange-500 drop-shadow-md' />
        </motion.div>

        <motion.button
        initial={{
            opacity:0,
            y:15 
        }}
        animate={{
            opacity:1,
            y:0
        }}
        transition={{
            duration:0.6,
            delay:0.8
        }}
        className='inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200 mt-16'
        onClick={()=>nextStep(2)}>
            Next <ArrowRight />
        </motion.button>
    </div>
  )
}

export default Welcome