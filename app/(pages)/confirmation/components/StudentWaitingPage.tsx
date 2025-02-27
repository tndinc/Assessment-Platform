"use client";

import { Clock, CheckCircle, MessageCircle, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentWaitingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col justify-between p-4 md:p-8">
      <motion.header
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2">
          Account Verification
        </h1>
        <p className="text-lg text-purple-600">
          Hang tight! We're getting your student account ready.
        </p>
      </motion.header>

      <main className="flex-grow flex flex-col items-center justify-center space-y-8 my-8">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-500 rounded-full"></div>
          <Clock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500 w-12 h-12" />
        </motion.div>

        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">
            We're reviewing your student info
          </h2>
          <p className="text-gray-600 mb-6">
            Our team is making sure everything's set up correctly for you.
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-purple-800 mb-4">
            What's Next?
          </h3>
          <ul className="space-y-4">
            <motion.li
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-800">
                You'll be automatically logged in once your account is verified.
              </span>
            </motion.li>
            <motion.li
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <MessageCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-800">
                We might reach out if we need any additional info.
              </span>
            </motion.li>
            <motion.li
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Bell className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-800">
                Turn on notifications to get updates ASAP!
              </span>
            </motion.li>
          </ul>
        </motion.div>
      </main>

      <motion.footer
        className="text-center text-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <p>
          Need help? Reach out to the student support team at your university.
        </p>
      </motion.footer>
    </div>
  );
}
