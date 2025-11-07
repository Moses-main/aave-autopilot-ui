import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { formatNumber, formatUSD } from '@/lib/utils';
import { VaultState } from '@/types/aave';

interface PositionOverviewProps {
  position: VaultState | undefined;
  isLoading: boolean;
}

export function PositionOverview({ position, isLoading }: PositionOverviewProps) {
  if (isLoading || !position) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Position</CardTitle>
          <CardDescription>Loading your AAVE position...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const healthFactorPercent = Math.min(Math.floor(position.healthFactor * 20), 100);
  const ltvPercent = Math.min(Math.floor(position.loanToValue * 100), 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Position</CardTitle>
        <CardDescription>Overview of your AAVE V3 positions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Supplied</span>
            <span className="font-medium">{formatUSD(parseFloat(position.totalSuppliedUSD))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Borrowed</span>
            <span className="font-medium">{formatUSD(parseFloat(position.totalBorrowedUSD))}</span>
          </div>
          <div className="pt-2">
            <Progress value={ltvPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>LTV: {formatNumber(position.loanToValue * 100, 2)}%</span>
              <span>Max: {formatNumber(position.currentLiquidationThreshold * 100, 0)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Health Factor</span>
            <span className="font-medium">{formatNumber(position.healthFactor, 2)}</span>
          </div>
          <Progress 
            value={healthFactorPercent} 
            className="h-2"
            indicatorClassName={healthFactorPercent < 20 ? 'bg-red-500' : healthFactorPercent < 50 ? 'bg-yellow-500' : 'bg-green-500'}
          />
          <div className="text-xs text-muted-foreground">
            {healthFactorPercent < 50 ? (
              <span className="text-yellow-500">Low health factor - Consider adding collateral or repaying debt</span>
            ) : healthFactorPercent < 80 ? (
              <span>Healthy position</span>
            ) : (
              <span className="text-green-500">Very healthy position</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available to Borrow</span>
            <span className="font-medium">{formatUSD(parseFloat(position.availableBorrowsUSD))}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
