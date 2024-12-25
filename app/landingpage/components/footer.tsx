import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#D7D3BF]/30 dark:bg-[#384B70]/30 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Insightassess</h3>
            <p className="text-sm text-muted-foreground">
              Empowering students with intelligent assessment tools.
            </p>
            <p className="text-sm">
              © 2023 TND Incorporations. All rights reserved.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Contact Us</h4>
            <p className="text-sm">Need help? We're here for you!</p>
            <Button variant="outline" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <div className="flex space-x-4 mt-4">
              <Link
                href="https://facebook.com"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://twitter.com"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://instagram.com"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
