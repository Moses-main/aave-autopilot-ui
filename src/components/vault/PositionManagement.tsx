import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type PositionData = {
  totalCollateral: string;
  totalDebt: string;
  availableBorrows: string;
  currentLtv: number;
  liquidationThreshold: number;
  healthFactor: number;
  variableBorrowRate: number;
  stableBorrowRate: number;
};

export function PositionManagement() {
  // Mock data - replace with actual contract data
  const position: PositionData = {
    totalCollateral: '10.5',
    totalDebt: '4.2',
    availableBorrows: '2.1',
    currentLtv: 0.6, // 60%
    liquidationThreshold: 0.8, // 80%
    healthFactor: 1.8,
    variableBorrowRate: 0.0345, // 3.45%
    stableBorrowRate: 0.045, // 4.5%
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collateral & Debt Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Total Collateral</h3>
            <p className="text-2xl font-bold">{position.totalCollateral} ETH</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Total Debt</h3>
            <p className="text-2xl font-bold">{position.totalDebt} ETH</p>
          </div>
        </div>

        {/* Health Factor */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium">Health Factor</h3>
            <span className="text-sm font-medium">{position.healthFactor.toFixed(2)}</span>
          </div>
          <div className="relative pt-1">
            <Progress value={Math.min(position.healthFactor * 50, 100)} className="h-2" />
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              {position.healthFactor < 1.5 ? 'Warning' : 'Healthy'}
            </div>
          </div>
        </div>

        {/* Loan to Value */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium">Loan to Value</h3>
            <span className="text-sm font-medium">{(position.currentLtv * 100).toFixed(0)}%</span>
          </div>
          <div className="relative pt-1">
            <Progress value={position.currentLtv * 100} className="h-2" />
            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-muted-foreground">
              <span>0%</span>
              <span>Liquidation: {(position.liquidationThreshold * 100).toFixed(0)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Interest Rates */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Interest Rates</h3>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Variable Rate</p>
              <p className="text-lg font-semibold">
                {(position.variableBorrowRate * 100).toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Stable Rate</p>
              <p className="text-lg font-semibold">
                {(position.stableBorrowRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
