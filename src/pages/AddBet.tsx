import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBettingData } from '@/hooks/useBettingData';
import { useExtendedData } from '@/hooks/useExtendedData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { BetType, BetStatus } from '@/types/betting';

export default function AddBet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addBet, bookmakers } = useBettingData();
  const { updateTip } = useExtendedData();
  const { toast } = useToast();

  const locationState = location.state as { 
    prefill?: {
      description?: string;
      odds?: string;
      amount?: string;
      betType?: BetType;
      stakeLogic?: string;
    };
    sourceTipId?: string;
  } | null;

  const protectionTypes = ['DC (Double Chance)', 'DNB (Draw No Bet)', 'Asian Handicap', 'European Handicap', 'Cash Out Available'];
  
  const [formData, setFormData] = useState({
    bookmaker: '',
    date: new Date().toISOString().split('T')[0],
    betType: 'simple' as BetType,
    amount: '',
    odds: '',
    status: 'pending' as BetStatus,
    description: '',
    stakeLogic: '',
    protectionTypes: [] as string[],
    isLive: false,
    league: '',
    market: '',
    matchTime: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (locationState?.prefill) {
      setFormData(prev => ({
        ...prev,
        ...locationState.prefill,
      }));
    }
  }, [locationState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    const odds = parseFloat(formData.odds);

    if (!formData.bookmaker || !formData.date || !amount || !odds) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const return_ = formData.status === 'won' ? amount * odds : 0;
    const profit = return_ - amount;

    const betData = {
      bookmaker: formData.bookmaker,
      date: formData.date,
      betType: formData.betType,
      amount,
      odds,
      return: return_,
      profit,
      status: formData.status,
      description: formData.description,
      stakeLogic: formData.stakeLogic,
      isProtected: formData.protectionTypes.length > 0,
      isLive: formData.isLive,
      league: formData.league || undefined,
      market: formData.market || undefined,
      strategies: formData.protectionTypes.length > 0 ? formData.protectionTypes : undefined,
      matchTime: formData.matchTime || undefined,
      sourceType: locationState?.sourceTipId ? 'tip' as const : 'manual' as const,
      sourceTipId: locationState?.sourceTipId,
    };

    addBet(betData);

    // If this bet was created from a tip, mark the tip as converted
    if (locationState?.sourceTipId) {
      updateTip(locationState.sourceTipId, { 
        status: 'converted',
        convertedBetId: betData.description, // We'll use a proper ID after bet is created
      });
    }

    toast({
      title: 'Success',
      description: 'Bet added successfully',
    });

    navigate('/bets');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Bet</h1>
        <p className="text-muted-foreground">Record a new bet</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Bet Details</CardTitle>
            <CardDescription>Enter the details of your bet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bookmaker">Bookmaker *</Label>
                <Select value={formData.bookmaker} onValueChange={(value) => setFormData({ ...formData, bookmaker: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bookmaker" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookmakers.map((bm) => (
                      <SelectItem key={bm.id} value={bm.name}>{bm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="betType">Bet Type *</Label>
                <Select value={formData.betType} onValueChange={(value) => setFormData({ ...formData, betType: value as BetType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="multiple">Multiple</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as BetStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Stake Amount (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="odds">Odds *</Label>
                <Input
                  id="odds"
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.odds}
                  onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                  placeholder="1.50"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="league">League / Competition</Label>
                <Input
                  id="league"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                  placeholder="e.g., Premier League"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="market">Market</Label>
                <Input
                  id="market"
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                  placeholder="e.g., Match Winner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matchTime">Match Date & Time</Label>
              <Input
                id="matchTime"
                type="datetime-local"
                value={formData.matchTime}
                onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Home Team vs Away Team - Match Result"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stakeLogic">Stake Logic</Label>
              <Textarea
                id="stakeLogic"
                value={formData.stakeLogic}
                onChange={(e) => setFormData({ ...formData, stakeLogic: e.target.value })}
                placeholder="Reasoning behind this bet and stake size"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Protection Types</Label>
                <p className="text-sm text-muted-foreground">Select all that apply to this bet</p>
                <div className="space-y-2">
                  {protectionTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.protectionTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, protectionTypes: [...formData.protectionTypes, type] });
                          } else {
                            setFormData({ ...formData, protectionTypes: formData.protectionTypes.filter(t => t !== type) });
                          }
                        }}
                      />
                      <Label htmlFor={type} className="text-sm font-normal cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isLive">Live/In-Play Bet</Label>
                  <p className="text-sm text-muted-foreground">Placed during the match</p>
                </div>
                <Switch
                  id="isLive"
                  checked={formData.isLive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isLive: checked })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">Add Bet</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/bets')}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
