import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export function KeeperManagement() {
  const isOwner = true; // This should come from your contract
  const keepers: string[] = []; // This should come from your contract
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keeper Management</CardTitle>
        <CardDescription>
          Manage keepers that can perform automated maintenance on your vault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input placeholder="0x..." className="flex-1" />
              <Button>Add Keeper</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Add a new keeper address that can perform maintenance tasks
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Active Keepers</Label>
          <div className="rounded-md border divide-y">
            {keepers.length > 0 ? (
              keepers.map((keeper) => (
                <div key={keeper} className="flex items-center justify-between p-3">
                  <span className="font-mono text-sm">{keeper}</span>
                  {isOwner && (
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No keepers configured
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
