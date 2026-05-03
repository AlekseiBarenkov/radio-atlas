export type DropListOption = {
  value: string;
  label: string;
  secondaryLabel?: string;
};

export type DropListProps = {
  id?: string;
  options: DropListOption[];
  activeValue?: string | null;
  isLoading?: boolean;
  loadingText: string;
  emptyText: string;
  onSelect: (value: string) => void;
};
