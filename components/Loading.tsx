import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-background">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          Loading...
        </h2>
      </div>
    </div>
  );
}
