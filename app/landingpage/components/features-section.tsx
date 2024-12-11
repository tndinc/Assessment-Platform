"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Rocket, Shield, Zap } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: Rocket,
    title: "Lightning Fast",
    description: "Our platform is optimized for speed and performance.",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Your data is protected with state-of-the-art security measures.",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    icon: Zap,
    title: "Powerful Features",
    description: "Access a wide range of tools to boost your productivity.",
    image: "/placeholder.svg?height=300&width=400",
  },
]

export default function FeaturesSection() {
  return (
    <section className="px-20 py-20 inset-0 bg-muted border-4">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description, image, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      className="bg-card p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <div className="flex flex-col items-center">
        <Icon className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="rounded-lg shadow-lg"
        />
      </div>
    </motion.div>
  )
}
