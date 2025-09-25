
import LogoutButton from "@/components/ui/LogOutButton";
import UserDahboard from "@/components/UserDahboard";
import PagesList from "@/components/userDashboard/PageList";
import TokenUsagePage from "@/components/userDashboard/TokenUsage";
import UserName from "@/components/userDashboard/UserName";


export default function UserDashboardPage() {

    return (
        <div className="p-6 space-y-6 bg-radial-aurora text-white min-h-screen ">
            {/* <div className="lg:flex lg:gap-6  "> */}

            <div className="flex flex-col gap-8 ">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* LEFT: Welcome text */}
                    <UserName />

                    {/* RIGHT: Logout / controls */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* On small screens make button full width (stacked under text) */}
                        <LogoutButton />
                    </div>
                </div>
                <div className="flex flex-col gap-10 p-4">
                    <div className="lg:col-span-3 w-full">
                        <div className="flex items-center justify-between mb-3 ">
                            <h3 className="text-sm text-gray-300">Active Pages</h3>
                            <button
                                // onClick={fetchData}
                                className="text-xs text-indigo-400 hover:underline"
                            >
                                Refresh
                            </button>
                        </div>

                        <PagesList />
                    </div>

                    <TokenUsagePage />

                    <div className="w-full">
                        <UserDahboard />
                    </div>
                </div>
            </div>
        </div>
    );
}
