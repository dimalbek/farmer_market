'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { BuyerProfile, FarmerProfile } from "@/lib/types/profile"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { TypographyP } from "@/components/ui/typography"
import { Trash2, Edit } from "lucide-react"

interface Detail {
    id: string;
    fullname: string;
    email: string;
    phone: string;
    role: "Admin" | "Buyer" | "Farmer";
    profile: FarmerProfile
}

interface BuyerDetail {
    id: string;
    fullname: string;
    email: string;
    phone: string;
    role: "Admin" | "Buyer" | "Farmer";
    profile: BuyerProfile
}

export const Dashboard = () => {

    const [farmers, setFarmers] = useState<Detail[]>([]);
    const [buyers, setBuyers] = useState<BuyerDetail[]>([]);

    const [editingUser, setEditingUser] = useState<Detail | BuyerDetail | null>(null);

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        farm_name: '',
        location: '',
        farm_size: 0,
        delivery_address: ''
    });

    useEffect(() => {
        const fetchFarmers = async () => {
            const token = localStorage.getItem('token')

            if (token) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/admin/farmers`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${JSON.parse(token).access_token}`,
                            'ngrok-skip-browser-warning': 'true'
                        },
                    });
                    const data = await response.json();
                    setFarmers(data);
                }
                catch (error) {
                    console.log(error)
                }

            }
        }
        fetchFarmers();
    }, [])

    useEffect(() => {
        const fetchBuyers = async () => {
            const token = localStorage.getItem('token')

            if (token) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/admin/buyers`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${JSON.parse(token).access_token}`,
                            'ngrok-skip-browser-warning': 'true'
                        },
                    });
                    const data = await response.json();
                    setBuyers(data);
                }
                catch (error) {
                    console.log(error)
                }

            }
        }
        fetchBuyers();
    }, [])

    useEffect(() => {
        if (editingUser) {
            setFormData({
                fullname: editingUser.fullname || '',
                email: editingUser.email || '',
                phone: editingUser.phone || '',
                farm_name: editingUser.role === 'Farmer' && 'farm_name' in editingUser.profile ? editingUser.profile.farm_name : '',
                location: editingUser.role === 'Farmer' && 'location' in editingUser.profile ? editingUser.profile.location : '',
                farm_size: editingUser.role === 'Farmer' && 'farm_size' in editingUser.profile ? editingUser.profile.farm_size : 0,
                delivery_address: editingUser.role === 'Buyer' && 'delivery_address' in editingUser.profile ? editingUser.profile.delivery_address : ''
            });
        }
    }, [editingUser]);

    const handleChange = (checked: boolean, userId: string) => {
        setFarmers((prev) => prev.map((farmer) => {
            if (farmer.id === userId) {
                return {
                    ...farmer,
                    profile: {
                        ...farmer.profile,
                        is_approved: checked
                    }
                }
            }
            return farmer
        }))
        const token = localStorage.getItem('token')
        if (!token) return;
        try {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND}/admin/${userId}/approve?is_approved=${checked}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token).access_token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
        catch (error) {
            console.log(error)
        }
        
    }

    const handleDeleteUser = (userId: string) => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                fetch(`${process.env.NEXT_PUBLIC_BACKEND}/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${JSON.parse(token).access_token}`,
                        'ngrok-skip-browser-warning': 'true'

                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        setFarmers((prev) => prev.filter((farmer) => farmer.id !== userId))
                        setBuyers((prev) => prev.filter((buyer) => buyer.id !== userId))
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            } catch (error) {
                console.log(error)
            }
        }


    }

    interface UpdateUserBody {
        fullname: string;
        email: string;
        phone: string;
        profile: {
            farm_name?: string;
            location?: string;
            farm_size?: number;
            delivery_address?: string;
        };
    }

    const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (token && editingUser) {
            try {
                const body: UpdateUserBody = {
                    fullname: formData.fullname,
                    email: formData.email,
                    phone: formData.phone,
                    profile: {}
                };

                if (editingUser.role === 'Farmer') {
                    body.profile = {
                        farm_name: formData.farm_name,
                        location: formData.location,
                        farm_size: Number(formData.farm_size)
                    };
                } else if (editingUser.role === 'Buyer') {
                    body.profile = {
                        delivery_address: formData.delivery_address
                    };
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/admin/users/${editingUser.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${JSON.parse(token).access_token}`,
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(body)
                });
                const data = await response.json();
                console.log('Success:', data);

                if (editingUser.role === 'Farmer') {
                    setFarmers((prev) => prev.map((farmer) => {
                        if (farmer.id === editingUser.id) {
                            return {
                                ...farmer,
                                fullname: formData.fullname,
                                email: formData.email,
                                phone: formData.phone,
                                profile: {
                                    ...farmer.profile,
                                    farm_name: formData.farm_name,
                                    location: formData.location,
                                    farm_size: formData.farm_size
                                }
                            };
                        }
                        return farmer;
                    }));
                } else if (editingUser.role === 'Buyer') {
                    setBuyers((prev) => prev.map((buyer) => {
                        if (buyer.id === editingUser.id) {
                            return {
                                ...buyer,
                                fullname: formData.fullname,
                                email: formData.email,
                                phone: formData.phone,
                                profile: {
                                    ...buyer.profile,
                                    delivery_address: formData.delivery_address
                                }
                            };
                        }
                        return buyer;
                    }));
                }
                setEditingUser(null);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    return (
        <main className="w-full flex flex-col items-center gap-2">
            <Tabs defaultValue="farmers" className="w-full max-w-[80vw] m-auto">
                <TabsList>
                    <TabsTrigger value="farmers">Farmers</TabsTrigger>
                    <TabsTrigger value="buyers">Buyers</TabsTrigger>
                </TabsList>
                <TabsContent value="farmers">
                    <Table className="w-full m-auto">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Farm name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="w-[100px]">Farm size</TableHead>
                                <TableHead className="w-[150px] text-center">Is approved</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {farmers.length > 0 ? farmers.map((invoice) => (
                                <TableRow key={invoice?.id}>
                                    <TableCell>{invoice?.id}</TableCell>
                                    <TableCell>
                                        <HoverCard>
                                            <HoverCardTrigger asChild>
                                                <TypographyP className="underline cursor-pointer">{invoice?.fullname}</TypographyP>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80">
                                                <div className="flex flex-col gap-2">
                                                    <TypographyP className="!m-0 !p-0">Full name: {invoice?.fullname}</TypographyP>
                                                    <TypographyP className="!m-0 !p-0">Email: {invoice?.email}</TypographyP>
                                                    <TypographyP className="!m-0 !p-0">Phone: {invoice?.phone}</TypographyP>
                                                    <TypographyP className="!m-0 !p-0">Role: {invoice?.role}</TypographyP>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    </TableCell>
                                    <TableCell>{invoice.profile?.farm_name}</TableCell>
                                    <TableCell>{invoice.profile?.location}</TableCell>
                                    <TableCell>{invoice.profile?.farm_size}</TableCell>
                                    <TableCell className="w-full flex flex-col items-center">
                                        <Switch id="is_approved" onCheckedChange={(checked) => handleChange(checked, invoice.id)} checked={invoice.profile?.is_approved} />
                                    </TableCell>
                                    <TableCell>
                                        <Edit className="cursor-pointer" size={24} onClick={() => setEditingUser(invoice)} />
                                    </TableCell>
                                    <TableCell>
                                        <Trash2 className="cursor-pointer" size={24} stroke="red" onClick={() => handleDeleteUser(
                                            invoice.id
                                        )} />
                                    </TableCell>
                                </TableRow>
                            )) :
                                <TableRow><TableCell></TableCell><TableCell><TypographyP>No farmers</TypographyP></TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="buyers">
                    <Table className="w-full m-auto">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Delivery address</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {buyers.length > 0 ? buyers.map((invoice) => (
                                <TableRow key={invoice?.id}>
                                    <TableCell>{invoice?.id}</TableCell>
                                    <TableCell>
                                        <HoverCard>
                                            <HoverCardTrigger asChild>
                                                <TypographyP className="underline cursor-pointer">{invoice?.fullname}</TypographyP>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80">
                                                <div className="flex flex-col gap-2">
                                                    <TypographyP className="!m-0 !p-0">Full name: {invoice?.fullname}</TypographyP>
                                                    <TypographyP className="!m-0 !p-0">Email: {invoice?.email}</TypographyP>
                                                    <TypographyP className="!m-0 !p-0">Phone: {invoice?.phone}</TypographyP>
                                                    <TypographyP className="!m-0 !p-0">Role: {invoice?.role}</TypographyP>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    </TableCell>
                                    <TableCell>{invoice.profile?.delivery_address}</TableCell>
                                    <TableCell>
                                        <Edit className="cursor-pointer" size={24} onClick={() => setEditingUser(invoice)} />
                                    </TableCell>
                                    <TableCell>
                                        <Trash2 className="cursor-pointer" size={24} stroke="red" onClick={() => handleDeleteUser(
                                            invoice.id
                                        )} />
                                    </TableCell>
                                </TableRow>
                            ))
                                :
                                <TableRow><TableCell></TableCell><TableCell><TypographyP>No buyers</TypographyP></TableCell></TableRow>
                            }
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>

            {/* Render the form when editingUser is not null */}
            {editingUser && (
                <div className="fixed top-0 left-0 w-full h-full bg-[black] bg-opacity-50 flex items-center justify-center">
<form onSubmit={handleUpdateUser} className="w-full max-w-md bg-white shadow-md  rounded-lg px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-xl font-bold mb-4">Edit User</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Update User
                        </button>
                        <button type="button" onClick={() => setEditingUser(null)} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                            Cancel
                        </button>
                    </div>
                </form>
                </div>
                
            )}
        </main>
    )
}
