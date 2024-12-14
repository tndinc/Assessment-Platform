import { Book, GraduationCap, Lightbulb, Pencil } from "lucide-react";

export default function Loading() {
  return (
<<<<<<< HEAD
    <div className="flex items-center justify-center min-h-screen w-full bg-creamLight dark:bg-newDarkBlue">
=======
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
>>>>>>> ian2
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Loading Knowledge...
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Please wait while we prepare your learning experience.
        </p>

        <div className="flex justify-center space-x-4 mb-8">
          <Book className="w-8 h-8 text-blue-500 animate-bounce" />
          <GraduationCap className="w-8 h-8 text-green-500 animate-bounce [animation-delay:0.1s]" />
          <Lightbulb className="w-8 h-8 text-yellow-500 animate-bounce [animation-delay:0.2s]" />
          <Pencil className="w-8 h-8 text-red-500 animate-bounce [animation-delay:0.3s]" />
        </div>

        <div className="relative w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse"></div>
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          "The capacity to learn is a gift; the ability to learn is a skill; the
          willingness to learn is a choice." - Brian Herbert
        </p>
      </div>
    </div>
  );
}
