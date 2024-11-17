import { TypographyH4, TypographyP } from "@/components/ui/typography"
import { LayoutListIcon, MessageCircle, Plus } from "lucide-react"
import Link from "next/link"


export const FarmerMainPage = () => {
    return (
        <section className="w-full flex flex-col items-center gap-2">
            <div className="w-full flex items-center gap-2" >
                <Link href={'/products/new'} className="w-full flex flex-col justify-center items-center gap-1">
                    <Plus size={32} />
                    <TypographyP className="!m-0 !p-0">Add product</TypographyP>
                </Link>
                <Link href={'/products/my'} className="w-full flex flex-col justify-center items-center gap-1">
                    <LayoutListIcon size={32} />
                    <TypographyP className="!m-0 !p-0">My products</TypographyP>
                </Link>
                <Link href={'/product'} className="w-full flex flex-col justify-center items-center gap-1">
                    <MessageCircle size={32} />
                    <TypographyP className="!m-0 !p-0">Messenger</TypographyP>
                </Link>
            </div>
        </section>
    )
}