import { NavigationBar } from "../components/Navbar";

export default function UserLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <NavigationBar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {children}
            </main>
        </div>
    );      
}