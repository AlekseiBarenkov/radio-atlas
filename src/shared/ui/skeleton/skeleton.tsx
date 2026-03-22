type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
};

export const Skeleton = (props: SkeletonProps) => {
  const { width = '100%', height = 16, borderRadius = 12 } = props;

  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e5e7eb',
      }}
    />
  );
};
