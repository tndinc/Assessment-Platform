import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b dark:from-[#243642] dark:to-[#384B70]/70 border-t">
      <div className="container mx-auto px-4 py-12 md:py-16 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left section - Brand Name */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Insightassess
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Empowering students with intelligent assessment tools.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © 2023 TND Incorporations. All rights reserved.
            </p>
          </div>

          {/* Middle section - Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Right section - Contact and Social */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              Contact Us
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Need help? We're here for you!
            </p>
            <Button
              variant="outline"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full px-8 py-6 text-lg font-medium transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <div className="flex justify-center md:justify-start space-x-4 mt-6">
              <Link
                href="https://facebook.com"
                className="text-gray-600 dark:text-gray-300 hover:text-primary"
              >
                <Facebook size={24} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://twitter.com"
                className="text-gray-600 dark:text-gray-300 hover:text-primary"
              >
                <Twitter size={24} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://instagram.com"
                className="text-gray-600 dark:text-gray-300 hover:text-primary"
              >
                <Instagram size={24} />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
