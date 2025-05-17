
import { UserMenu } from "@/components/UserMenu";

export function GameNav() {
  return (
    <div className="flex justify-between items-center w-full py-4 border-b-4 border-black mb-6">
      <div className="flex items-center">
        <h1 className="text-xl font-mono font-bold uppercase tracking-tight">ChronoGuess</h1>
      </div>
      <UserMenu />
    </div>
  );
}
