import { useState } from 'react';
import { useBettingData } from '@/hooks/useBettingData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function BankrollSettings() {
  const { bankroll, updateBankrollSettings } = useBettingData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    initialBankroll: bankroll.initialBankroll.toString(),
    targetPercentage: bankroll.targetPercentage.toString(),
    stopLossWeekly: bankroll.stopLossWeekly.toString(),
    stopGainWeekly: bankroll.stopGainWeekly.toString(),
    stopLossMonthly: bankroll.stopLossMonthly.toString(),
    stopGainMonthly: bankroll.stopGainMonthly.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initialBankroll = parseFloat(formData.initialBankroll);
    const targetPercentage = parseFloat(formData.targetPercentage);
    const stopLossWeekly = parseFloat(formData.stopLossWeekly);
    const stopGainWeekly = parseFloat(formData.stopGainWeekly);
    const stopLossMonthly = parseFloat(formData.stopLossMonthly);
    const stopGainMonthly = parseFloat(formData.stopGainMonthly);

    const targetAmount = initialBankroll * (1 + targetPercentage / 100);

    updateBankrollSettings({
      initialBankroll,
      targetPercentage,
      targetAmount,
      stopLossWeekly,
      stopGainWeekly,
      stopLossMonthly,
      stopGainMonthly,
    });

    toast({
      title: 'Success',
      description: 'Bankroll settings updated successfully',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your bankroll and risk management</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Bankroll Configuration</CardTitle>
            <CardDescription>Set your initial bankroll and targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="initialBankroll">Initial Bankroll (€)</Label>
              <Input
                id="initialBankroll"
                type="number"
                step="0.01"
                min="0"
                value={formData.initialBankroll}
                onChange={(e) => setFormData({ ...formData, initialBankroll: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Current bankroll: €{bankroll.currentBankroll.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPercentage">Target Percentage (%)</Label>
              <Input
                id="targetPercentage"
                type="number"
                step="0.1"
                min="0"
                value={formData.targetPercentage}
                onChange={(e) => setFormData({ ...formData, targetPercentage: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Target amount: €{(parseFloat(formData.initialBankroll || '0') * (1 + parseFloat(formData.targetPercentage || '0') / 100)).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
            <CardDescription>Set stop loss and stop gain limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stopLossWeekly">Weekly Stop Loss (€)</Label>
                <Input
                  id="stopLossWeekly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stopLossWeekly}
                  onChange={(e) => setFormData({ ...formData, stopLossWeekly: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopGainWeekly">Weekly Stop Gain (€)</Label>
                <Input
                  id="stopGainWeekly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stopGainWeekly}
                  onChange={(e) => setFormData({ ...formData, stopGainWeekly: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLossMonthly">Monthly Stop Loss (€)</Label>
                <Input
                  id="stopLossMonthly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stopLossMonthly}
                  onChange={(e) => setFormData({ ...formData, stopLossMonthly: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopGainMonthly">Monthly Stop Gain (€)</Label>
                <Input
                  id="stopGainMonthly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stopGainMonthly}
                  onChange={(e) => setFormData({ ...formData, stopGainMonthly: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="mt-6 w-full">Save Settings</Button>
      </form>
    </div>
  );
}
