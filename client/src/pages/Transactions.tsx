import { useState } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { generateMockTransactions } from '@/utils/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function Transactions() {
  const { transactions, addTransaction, bankroll } = useBettingData();
  const { toast } = useToast();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [viewTransaction, setViewTransaction] = useState<any>(null);

  const mockTransactions = generateMockTransactions();
  const allTransactions = [...transactions, ...mockTransactions].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  const [depositForm, setDepositForm] = useState({
    amount: '',
    dateTime: new Date().toISOString().slice(0, 16),
    description: '',
  });

  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    dateTime: new Date().toISOString().slice(0, 16),
    description: '',
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      type: 'deposit',
      amount: parseFloat(depositForm.amount),
      dateTime: new Date(depositForm.dateTime).toISOString(),
      description: depositForm.description,
    });
    toast({
      title: 'Deposit added',
      description: `€${depositForm.amount} deposited successfully`,
    });
    setIsDepositOpen(false);
    setDepositForm({ amount: '', dateTime: new Date().toISOString().slice(0, 16), description: '' });
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      type: 'withdrawal',
      amount: parseFloat(withdrawalForm.amount),
      dateTime: new Date(withdrawalForm.dateTime).toISOString(),
      description: withdrawalForm.description,
    });
    toast({
      title: 'Withdrawal processed',
      description: `€${withdrawalForm.amount} withdrawn successfully`,
    });
    setIsWithdrawalOpen(false);
    setWithdrawalForm({ amount: '', dateTime: new Date().toISOString().slice(0, 16), description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your deposits and withdrawals</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Add Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Deposit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount (€)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit-dateTime">Date & Time</Label>
                  <Input
                    id="deposit-dateTime"
                    type="datetime-local"
                    required
                    value={depositForm.dateTime}
                    onChange={(e) => setDepositForm({ ...depositForm, dateTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit-description">Description</Label>
                  <Textarea
                    id="deposit-description"
                    value={depositForm.description}
                    onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
                    placeholder="e.g., Monthly deposit"
                  />
                </div>
                <Button type="submit" className="w-full">Add Deposit</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Withdrawal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-amount">Amount (€)</Label>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={bankroll.currentBankroll}
                    required
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: €{bankroll.currentBankroll.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-dateTime">Date & Time</Label>
                  <Input
                    id="withdrawal-dateTime"
                    type="datetime-local"
                    required
                    value={withdrawalForm.dateTime}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, dateTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-description">Description</Label>
                  <Textarea
                    id="withdrawal-description"
                    value={withdrawalForm.description}
                    onChange={(e) => setWithdrawalForm({ ...withdrawalForm, description: e.target.value })}
                    placeholder="e.g., Profit withdrawal"
                  />
                </div>
                <Button type="submit" className="w-full">Add Withdrawal</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all your deposits and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              ) : (
                allTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.dateTime), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                        {transaction.type === 'deposit' ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'deposit' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>€{transaction.balanceAfter.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewTransaction(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewTransaction} onOpenChange={() => setViewTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {viewTransaction && (
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <p className="text-sm">{viewTransaction.type}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm">€{viewTransaction.amount.toFixed(2)}</p>
              </div>
              <div>
                <Label>Date & Time</Label>
                <p className="text-sm">{format(new Date(viewTransaction.dateTime), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{viewTransaction.description}</p>
              </div>
              <div>
                <Label>Balance After</Label>
                <p className="text-sm">€{viewTransaction.balanceAfter.toFixed(2)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
