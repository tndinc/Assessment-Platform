import { Clock, CheckCircle, MessageCircle, Bell } from "lucide-react";

export default function StudentWaitingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-between p-4 md:p-8">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">
          Professor Confirmation
        </h1>
        <p className="text-lg text-indigo-600">
          Please wait while we process your account
        </p>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center space-y-8 my-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <Clock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-500 w-12 h-12" />
        </div>

        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            Your account is being reviewed
          </h2>
          <p className="text-gray-600 mb-6">
            The professor is currently reviewing your account.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold text-indigo-800 mb-4">
            What's Next?
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
              <span>
                You will be automatically redirected to your dashboard once your
                account is confirmed.
              </span>
            </li>
            <li className="flex items-start">
              <MessageCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <span>You may receive follow-up questions if needed</span>
            </li>
            <li className="flex items-start">
              <Bell className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
              <span>Enable notifications to get real-time updates</span>
            </li>
          </ul>
        </div>
      </main>

      <footer className="text-center text-gray-600">
        <p>
          If you have any questions, please contact support at national
          university
        </p>
      </footer>
    </div>
  );
}
