'use client'

import { motion, useInView, useScroll } from "framer-motion";
import { useRef } from "react"




const page = () => {

  const div2ref = useRef(); 
  const div2refInView = useInView(div2ref, { margin: "-100px" });

  return (
   <>
   
   <div className="flex h-full">
    {/* LEFT */}
    <div className="w-1/2 overflow-scroll">
      <div className="bg-black h-screen ">
        <motion.h1 className='text-[18px] md:text-[50px] lg:text-[100px] ' initial={{x: "300px", y:"300px"}} animate={{x:"0px", y:"0"}} transition={{delay:3}}>
        ...
        </motion.h1>
    </div>
      <div className="bg-white h-screen " >
      <motion.h1 
      className='text-[18px] md:text-[50px] lg:text-[100px] text-black'  
      ref={div2ref}
      initial={{x: "900px", y:"300px"}}
      animate={div2refInView? {x:"0"} : {}}
      transition={{duration:3}}
      >
    ...
    </motion.h1>
    </div>
  </div>
   {/* RIGHT */}
  <div className="bg-red-500 h-screen w-1/2 " >
      <motion.h1 
      className='text-[18px] md:text-[50px] lg:text-[100px] text-black'  
      ref={div2ref}
      initial={{x: "300px", y:"300px"}}
      animate={div2refInView? {x:"0"} : {}}
      transition={{duration:3}}
      >
    ...
    </motion.h1>
    </div>

  
  </div>
   </>
  )
}

export default page