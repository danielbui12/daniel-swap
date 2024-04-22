import Header from "@/app/component/Header";
import Swap from "@/app/component/Swap";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center p-12">
            <Header />
            <Swap />
            
        </main>
    );
}
