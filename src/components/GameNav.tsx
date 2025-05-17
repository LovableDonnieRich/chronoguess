
import { UserMenu } from "@/components/UserMenu";

export function GameNav() {
  return (
    <div className="flex justify-between items-center w-full py-2">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-indigo-800 mr-2">ChronoGuess</h1>
      </div>
      <UserMenu />
    </div>
  );
}
