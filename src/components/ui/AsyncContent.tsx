import React from "react";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeletonPack from "./LoadingSkeletonPack";

interface AsyncContentProps {
  loading?: boolean;
  error?: React.ReactNode;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingRows?: number;
  skeletonHeight?: number;
  emptyTitle?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children: React.ReactNode;
}

export default function AsyncContent({
  loading,
  error,
  isEmpty,
  onRetry,
  loadingRows = 3,
  skeletonHeight = 120,
  emptyTitle,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  children,
}: AsyncContentProps) {
  if (loading) {
    return <LoadingSkeletonPack rows={loadingRows} cardHeight={skeletonHeight} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <>{children}</>;
}
