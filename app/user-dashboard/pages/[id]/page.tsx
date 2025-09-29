import TokenUsagePage from "@/components/userDashboard/TokenUsage";

interface PageProps {
    params: { id: string };
}

export default function TokenUsage({ params }: any) {
    return (
        <>
            <TokenUsagePage
                id={params.id}
            />
        </>
    )
}

