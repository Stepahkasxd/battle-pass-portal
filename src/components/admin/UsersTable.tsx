import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPointsManager } from "./UserPointsManager";

interface UsersTableProps {
  users: any[];
  onUserClick: (userId: string) => void;
  refetchUsers: () => void;
}

export const UsersTable = ({ users, onUserClick, refetchUsers }: UsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Имя пользователя</TableHead>
          <TableHead>Очки</TableHead>
          <TableHead>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => (
          <TableRow 
            key={user.id} 
            className="cursor-pointer hover:bg-colizeum-gray/50"
            onClick={() => onUserClick(user.id)}
          >
            <TableCell className="font-mono">{user.numeric_id}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.points}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <UserPointsManager
                userId={user.id}
                currentPoints={user.points}
                onUpdate={refetchUsers}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};