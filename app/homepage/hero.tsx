"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Online Assessment Platform
      </h1>
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
  )
}

