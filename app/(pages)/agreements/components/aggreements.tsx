"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

import ModernBackground from "@/components/ui/SchoolBackground";
import { motion } from "framer-motion";

const termsAndConditions = `Agreements and Terms of Use

Welcome to InsightAssess! By accessing or using our platform, you agree to comply with the following terms and conditions. Please read them carefully to understand your rights and responsibilities.

1. Acceptance of Terms
By using the InsightAssess platform, you acknowledge that you have read, understood, and agreed to these terms. If you do not agree, you must discontinue using the platform.

2. Use of the Platform
• The platform is designed to provide insight-driven assessments and educational tools.
• You agree to use the platform only for its intended purposes and in compliance with applicable laws and regulations.
• Unauthorized use of the platform, including attempts to access non-public features or disrupt services, is strictly prohibited.

3. Data Collection and Use
• InsightAssess collects and processes user data to provide personalized learning experiences, generate performance insights, and improve the platform.
• Data collected includes, but is not limited to:
  - Assessment responses
  - Progress metrics
  - User activity logs
  - Personal information provided during account creation (e.g., name, email, etc.)
• All data is stored securely and used in compliance with applicable privacy laws, including the Data Privacy Act of 2012.
• Aggregated and anonymized data may be used for research and analytics to enhance the platform's capabilities.

4. Privacy and Security
• User privacy is a priority. Collected data will not be shared with third parties without explicit consent, except as required by law.
• Security measures are implemented to protect your data from unauthorized access, loss, or misuse. However, no system is entirely secure, and InsightAssess cannot guarantee absolute security.

5. Intellectual Property
• All content, features, and technology on the platform, including but not limited to text, graphics, software, and branding, are the property of InsightAssess and are protected by intellectual property laws.
• Users may not reproduce, distribute, or create derivative works without prior written consent.

6. User Responsibilities
• Users are responsible for maintaining the confidentiality of their account credentials.
• Users agree to provide accurate and truthful information when creating accounts and interacting with the platform.
• Any misuse or violation of these terms may result in suspension or termination of access.

7. Limitations of Liability
• InsightAssess is not liable for any damages arising from the use or inability to use the platform.
• The platform is provided "as is," and while we strive for accuracy and reliability, we make no guarantees of uninterrupted service or error-free content.

8. Modifications to the Terms
• InsightAssess reserves the right to update or modify these terms at any time. Users will be notified of significant changes, and continued use of the platform after such changes constitutes acceptance.

9. Contact Us
For questions or concerns regarding these terms or your data, please contact us:
Email: tnd.incorporation@gmail.com

By using InsightAssess, you agree to these terms and conditions, ensuring a safe, transparent, and productive experience for all users.`;

export default function AgreementsAndTerms() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentIndex < termsAndConditions.length) {
      const timer = setTimeout(() => {
        setDisplayedText(
          (prevText) => prevText + termsAndConditions[currentIndex]
        );
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 0.7);

      return () => clearTimeout(timer);
    } else {
      setTypewriterComplete(true);
    }
  }, [currentIndex]);

  const handleAgree = () => {
    setAgreed(true);
  };

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/section");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-cyan-900 overflow-hidden">
      <ModernBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-4xl shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-blue-600 dark:text-blue-300">
              Agreements and Terms
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-300">
              Please read and accept our terms to continue
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] border rounded-md p-4 bg-white/50 dark:bg-gray-700/50">
              <pre className="font-sans text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {displayedText}
              </pre>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: typewriterComplete ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={handleAgree}
                disabled={!typewriterComplete}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <label
                htmlFor="agree"
                className={`text-sm ${
                  typewriterComplete
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                I agree to the terms and conditions
              </label>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: typewriterComplete ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button
                onClick={handleNext}
                disabled={!agreed || isLoading}
                className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-800 dark:hover:from-blue-800 dark:hover:to-cyan-900 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Next"}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
