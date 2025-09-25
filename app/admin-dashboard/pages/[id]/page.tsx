
import TokenUsagePage from "@/components/adminDashboard/TokenUsage";
interface PageProps {
    params: { id: string };
}

export default async function TokenUsage({ params }: any) {
    // const resolvedParams = await params;
    // const id = resolvedParams.id;
    return (
        <>
            <TokenUsagePage
                id={params.id}
            />
        </>
    )
}

