import { Card } from '@/components/ui/card'
import { COLORS } from '@/lib/config';

interface MetricCardProps {
  label: string;
  value: string;
  metricType?: 'primary' | 'secondary' | 'none';
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  value,
  metricType = 'none',
  onClick,
  className = ''
}: MetricCardProps) {
  const isPrimary = metricType === 'primary';
  const isSecondary = metricType === 'secondary';

  const cardStyles = {
    backgroundColor: isPrimary ? COLORS.primary : isSecondary ? COLORS.secondary : 'white',
    color: isPrimary || isSecondary ? 'white' : 'black',
  };

  const textColor = isPrimary || isSecondary ? 'text-white' : 'text-gray-900';
  const labelColor = isPrimary || isSecondary ? 'text-gray-200' : 'text-gray-500';

  return (
    <Card
      className={`
                p-4 transition-all
                ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-gray-300' : ''}
                ${className}
            `}
      style={cardStyles}
      onClick={onClick}
    >
      <div className={`text-sm font-medium ${labelColor}`}>{label}</div>
      <div className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</div>
    </Card>
  );
} 