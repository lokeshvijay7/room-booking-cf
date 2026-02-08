import { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from "@/hooks/use-toast";

export default function AdminRoomList({ rooms, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState('1');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this room?")) return;
        try {
            await api.deleteRoom(id);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert("Failed to delete room");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createRoom({
                name,
                description,
                capacity: parseInt(capacity),
                price_per_hour: parseFloat(price),
                image_url: image
            });
            setIsAddOpen(false);
            // Reset form
            setName('');
            setDescription('');
            setCapacity('1');
            setPrice('');
            setImage('');
            alert("Room created successfully!");
            onUpdate();
        } catch (e) {
            console.error(e);
            alert("Failed to create room: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Room Management</CardTitle>
                        <CardDescription>
                            Create, modify, and manage your rental spaces.
                        </CardDescription>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Room</DialogTitle>
                                <DialogDescription>
                                    Create a new room available for booking.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Room Name</Label>
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Conference Hall A" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="capacity">Capacity</Label>
                                        <Input id="capacity" type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price (₹/hr)</Label>
                                        <Input id="price" type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Image URL</Label>
                                    <Input id="image" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Room'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Capacity</th>
                                    <th className="p-4 font-medium">Price</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-muted-foreground">
                                            No rooms found. Add your first room to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    rooms.map(room => (
                                        <tr key={room.id} className="border-t hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="font-medium">{room.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{room.description}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="secondary" className="font-normal">
                                                    {room.capacity} People
                                                </Badge>
                                            </td>
                                            <td className="p-4 font-semibold">₹{room.price_per_hour}/hr</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => {
                                                                // Pre-fill form (simple inline approach or separate state)
                                                                setName(room.name);
                                                                setDescription(room.description);
                                                                setCapacity(room.capacity.toString());
                                                                setPrice(room.price_per_hour.toString());
                                                                setImage(room.image_url);
                                                            }}>
                                                                <Edit className="h-4 w-4 text-blue-500" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Room</DialogTitle>
                                                                <DialogDescription>
                                                                    Update room details.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <form onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                setLoading(true);
                                                                try {
                                                                    await api.updateRoom(room.id, {
                                                                        name,
                                                                        description,
                                                                        capacity: parseInt(capacity),
                                                                        price_per_hour: parseFloat(price),
                                                                        image_url: image
                                                                    });
                                                                    alert("Room updated!");
                                                                    onUpdate();
                                                                } catch (e) {
                                                                    alert("Update failed: " + e.message);
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }} className="grid gap-4 py-4">
                                                                <div className="grid gap-2">
                                                                    <Label>Room Name</Label>
                                                                    <Input value={name} onChange={e => setName(e.target.value)} required />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label>Description</Label>
                                                                    <Input value={description} onChange={e => setDescription(e.target.value)} />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="grid gap-2">
                                                                        <Label>Capacity</Label>
                                                                        <Input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} required />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label>Price (₹/hr)</Label>
                                                                        <Input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
                                                                    </div>
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label>Image URL</Label>
                                                                    <Input value={image} onChange={e => setImage(e.target.value)} />
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button type="submit" disabled={loading}>
                                                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(room.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
