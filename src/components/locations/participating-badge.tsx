import { StatusBadge } from '@/components/ui/status-badge';

export type ParticipatingBadgeProps = {
  isParticipating: boolean;
};

export function ParticipatingBadge({ isParticipating }: ParticipatingBadgeProps) {
  return (
    <StatusBadge
      label={isParticipating ? 'Burger Club participant' : 'Not a Burger Club location'}
      tone={isParticipating ? 'success' : 'warning'}
      icon={isParticipating ? 'gift' : 'information-circle'}
    />
  );
}
