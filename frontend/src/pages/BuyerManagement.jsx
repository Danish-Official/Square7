import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const staticBuyers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890", purchasedPlot: "A-12" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+9876543210", purchasedPlot: "B-05" },
  { id: 3, name: "Alice Brown", email: "alice@example.com", phone: "+1122334455", purchasedPlot: "C-22" },
  { id: 4, name: "Bob Johnson", email: "bob@example.com", phone: "+5566778899", purchasedPlot: "D-18" }
];
export default function BuyerManagement() {
  // const [buyers, setBuyers] = useState([]);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   fetch("/api/buyers")
  //     .then((res) => res.json())
  //     .then((data) => setBuyers(data));
  // }, []);

  const filteredBuyers = staticBuyers.filter((buyer) =>
    buyer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Buyer Management</h1>
        <Card className="p-4">
          <CardContent>
            <div className="flex justify-between mb-4">
              <Input
                type="text"
                placeholder="Search buyers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-1/3"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Purchased Plot</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell>{buyer.name}</TableCell>
                    <TableCell>{buyer.email}</TableCell>
                    <TableCell>{buyer.phone}</TableCell>
                    <TableCell>{buyer.purchasedPlot}</TableCell>
                    <TableCell>
                      <Button variant="outline" className="mr-2">Edit</Button>
                      <Button variant="destructive">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
