import { LanguageSwitcher } from "@/components/customer/language-switcher";

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 bg-white border-b">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Menu</h1>
                    <LanguageSwitcher />
                </div>
            </header>
            <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
    );
}
