import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function HealthFactorSettings() {
  const currentHealthFactor = 1.8; // This should come from your contract
  const safetyMargin = 1.02; // This should come from your contract
  const isOwner = true; // This should come from your contract
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Factor Settings</CardTitle>
        <CardDescription>
          Configure your vault's health factor safety parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Current Health Factor</Label>
              <p className="text-2xl font-bold">{currentHealthFactor.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${currentHealthFactor > 1.5 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span>{currentHealthFactor > 1.5 ? 'Healthy' : 'Warning'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Safety Margin</Label>
              <span className="text-sm text-muted-foreground">{safetyMargin}x</span>
            </div>
            <div className="px-4">
              <Slider 
                defaultValue={[safetyMargin * 100]} 
                min={100} 
                max={110} 
                step={1}
                disabled={!isOwner}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {isOwner 
                ? 'Adjust the safety margin for automated position management'
                : 'Only the owner can adjust safety settings'}
            </p>
          </div>

          {isOwner && (
            <div className="pt-2">
              <Button>Update Settings</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
