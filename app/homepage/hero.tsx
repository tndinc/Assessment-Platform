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
    <div className="min-h-screen text-foreground bg-creamLight dark:bg-newDarkBlue">

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
            <div className="relative bg-muted rounded-lg mt-16">
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
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-creamLight dark:bg-newDarkBlue">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              About Us
            </h2>
            <div className="space-y-4 mb-12">
              <p className="text-lg text-muted-foreground">
                With over a decade of experience in educational technology, we're passionate about transforming the way assessments are conducted in the digital age.
              </p>
              <p className="text-lg text-muted-foreground">
                Our platform combines cutting-edge technology with user-friendly design to create an assessment experience that's both powerful and intuitive.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 max-w-md mx-auto">
                <div>
                  <h3 className="text-2xl font-bold text-primary">10+</h3>
                  <p className="text-muted-foreground">Years of Experience</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">50K+</h3>
                  <p className="text-muted-foreground">Assessments Delivered</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              className="mb-12"
            >
              Learn More About Us
            </Button>
            <div className="relative h-[500px] w-full max-w-2xl bg-background rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=500&width=600&text=Team+Image"
                alt="Our team at work"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

