import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeamData {
  id: string;
  name: string;
  competition?: string;
  rating: string;
  totalBets: number;
  winRate: number;
  avgROI: number;
  totalProfit: number;
  lastBetDate?: string;
}

interface TeamsTableProps {
  teams: TeamData[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onViewHistory: (teamName: string) => void;
}

export default function TeamsTable({
  teams,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onViewHistory,
}: TeamsTableProps) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A++': return 'from-yellow-400 via-yellow-500 to-orange-500';
      case 'A+': return 'from-green-400 to-green-600';
      case 'A': return 'from-blue-400 to-blue-600';
      case 'B': return 'from-yellow-400 to-yellow-600';
      case 'C': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Gerar números de página com ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum time encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Competição</TableHead>
            <TableHead className="text-center">Rating</TableHead>
            <TableHead className="text-right">Apostas</TableHead>
            <TableHead className="text-right">Taxa de Acerto</TableHead>
            <TableHead className="text-right">ROI Médio</TableHead>
            <TableHead className="text-right">Lucro Total</TableHead>
            <TableHead className="text-right">Última Aposta</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell className="text-muted-foreground">{team.competition || '-'}</TableCell>
              <TableCell className="text-center">
                <Badge className={`bg-gradient-to-r ${getRatingColor(team.rating)} text-white border-0`}>
                  {team.rating}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{team.totalBets}</TableCell>
              <TableCell className="text-right font-medium text-blue-600">
                {team.winRate.toFixed(1)}%
              </TableCell>
              <TableCell className={`text-right font-medium ${team.avgROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {team.avgROI >= 0 ? '+' : ''}{team.avgROI.toFixed(1)}%
              </TableCell>
              <TableCell className={`text-right font-medium ${team.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {team.totalProfit.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">
                {team.lastBetDate ? format(new Date(team.lastBetDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewHistory(team.name)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Histórico
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {startIndex}-{endIndex} de {totalItems} times
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => onItemsPerPageChange(parseInt(v))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
