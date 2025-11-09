import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export function AdminControls() {
  const isOwner = true; // This should come from your contract
  const linkBalance = '10.5'; // This should come from your contract
  const isPaused = false; // This should come from your contract

  if (!isOwner) return null;

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Admin Controls</CardTitle>
        <CardDescription>
          Advanced controls for vault administration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Contract Status</Label>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span>{isPaused ? 'Paused' : 'Active'}</span>
            </div>
          </div>
          <Button variant={isPaused ? 'default' : 'destructive'} className="w-full">
            {isPaused ? 'Unpause Contract' : 'Pause Contract'}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>LINK Balance</Label>
            <span className="text-sm font-medium">{linkBalance} LINK</span>
          </div>
          <div className="flex gap-2">
            <Input placeholder="0x..." className="flex-1" />
            <Button variant="outline">Withdraw LINK</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Withdraw LINK tokens to the specified address
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Label>Emergency Withdraw</Label>
          <Button variant="destructive" className="w-full">
            Emergency Withdraw All
          </Button>
          <p className="text-xs text-muted-foreground">
            In case of emergency, withdraw all funds from the vault
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
