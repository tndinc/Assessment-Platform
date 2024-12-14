import { Book, GraduationCap, Lightbulb, Pencil } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-[243642]">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4 animate-pulse">
          Loading Knowledge
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Preparing your learning experience...
        </p>

        <div className="relative w-48 h-48 mx-auto mb-12">
          <div
            className="absolute inset-0 rounded-full border-t-4 border-b-4 border-indigo-500"
            style={{ animation: "spin 3s linear infinite" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full border-r-4 border-l-4 border-pink-500"
            style={{ animation: "spin 3s linear infinite reverse" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
              <Book
                className="w-10 h-10 text-blue-400"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />
              <GraduationCap
                className="w-10 h-10 text-green-400"
                style={{ animation: "float 3s ease-in-out infinite 0.2s" }}
              />
              <Lightbulb
                className="w-10 h-10 text-yellow-400"
                style={{ animation: "float 3s ease-in-out infinite 0.4s" }}
              />
              <Pencil
                className="w-10 h-10 text-red-400"
                style={{ animation: "float 3s ease-in-out infinite 0.6s" }}
              />
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-400 max-w-md mx-auto italic">
          "The capacity to learn is a gift; the ability to learn is a skill; the
          willingness to learn is a choice."
        </p>
        <p className="mt-2 text-sm text-gray-500">- Brian Herbert</p>
      </div>
    </div>
  );
}
