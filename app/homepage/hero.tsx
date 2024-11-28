"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

const images = [
  '/placeholder.svg?height=400&width=600&text=Image+1',
  '/placeholder.svg?height=400&width=600&text=Image+2',
  '/placeholder.svg?height=400&width=600&text=Image+3',
  '/placeholder.svg?height=400&width=600&text=Image+4',
  '/placeholder.svg?height=400&width=600&text=Image+5',
]

export default function HeroLandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % images.length
    )
  }

  return (
    <div className="min-h-screen text-foreground bg-creamLight dark:bg-creamDark">

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Lorem ipsum dolor sit am.
              </h1>
              <p className="text-lg text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <Button size="lg" className="bg-black text-white hover:bg-black/90">
                Start free trial
              </Button>
            </div>
            <div className="relative h-[400px] bg-muted rounded-lg mt-16">
              {/* Placeholder for hero image */}
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Hero illustration"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-8 text-center">
            Online Assessment Platform
          </h2>
          <div className="relative w-full max-w-2xl">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={images[currentImageIndex]}
                    alt={`Unique Feature of System ${currentImageIndex + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              </CardContent>
            </Card>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-background/50 hover:bg-background/75"
              onClick={goToPreviousImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-background/50 hover:bg-background/75"
              onClick={goToNextImage}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

