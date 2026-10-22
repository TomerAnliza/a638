import { BoardLoader } from "@/components/solitaire/BoardLoader";

export default function Home() {
  return (
    <main className="flex-1 bg-green-800 text-white">
      <BoardLoader />
    </main>
  );
}
