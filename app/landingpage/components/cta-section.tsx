"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="px-20 py-20 bg-muted relative overflow-hidden">
      <div className="container text-center relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied users today!</p>
          <Button size="lg">
            Sign Up Now
          </Button>
        </motion.div>
      </div>
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={isInView ? { opacity: 0.2, scale: 1 } : { opacity: 0, scale: 1.1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-20"
        />
      </motion.div>
    </section>
  )
}

