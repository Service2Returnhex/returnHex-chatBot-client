import UpdatePageInfo from "@/components/userDashboard/updatePageInfo";

interface PageProps {
    params: { id: string } | Promise<{ id: string }>;
}

export default async function UpdatePage({ params }: any) {
    // const resolvedParams = await params;
    // const id = resolvedParams.id;
    // console.log("params id", id);
    return (
        <>
            <UpdatePageInfo id={params.id} />
        </>
    )
}