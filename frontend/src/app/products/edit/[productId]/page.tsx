import EditProduct from "@/views/EditProduct";

const Page = ({
    params
}: 
{
    params: {
        productId: string;
    }
}
) => {
    return (
        <EditProduct productId={params.productId} />
    );
}

export default Page;