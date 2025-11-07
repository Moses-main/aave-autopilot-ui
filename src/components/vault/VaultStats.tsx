import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface VaultStatsProps {
  totalAssets: string;
  sharePrice: string;
  userBalance: string;
  usdcBalance: string;
  isLoading: boolean;
}

export function VaultStats({
  totalAssets,
  sharePrice,
  userBalance,
  usdcBalance,
  isLoading,
}: VaultStatsProps) {
  const stats = [
    {
      title: 'Total Value Locked',
      value: `$${totalAssets || '0'}`,
      description: 'Total USDC in the vault',
    },
    {
      title: 'Share Price',
      value: `$${sharePrice || '1.00'}`,
      description: 'Current value of 1 vault share',
    },
    {
      title: 'Your Vault Balance',
      value: `${userBalance || '0'} shares`,
      description: 'Your share of the vault',
    },
    {
      title: 'Your USDC Balance',
      value: `${usdcBalance || '0'} USDC`,
      description: 'Available to deposit',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
            <p className="text-muted-foreground text-xs">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
