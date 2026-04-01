interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return <span className={`badge ${active ? 'active' : 'inactive'}`}>{active ? 'Active' : 'Inactive'}</span>;
}
