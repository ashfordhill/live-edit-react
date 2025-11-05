import { useState, useCallback, useEffect } from 'react';

export interface AnimationState {
  phase: 'idle' | 'resizing' | 'settling';
  duration: number;
}

export function useGridAnimation() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    phase: 'idle',
    duration: 300,
  });

  const startAnimation = useCallback((phase: 'resizing' | 'settling', duration: number = 300) => {
    setAnimationState({
      phase,
      duration,
    });
  }, []);

  const endAnimation = useCallback(() => {
    setAnimationState({
      phase: 'idle',
      duration: 300,
    });
  }, []);

  const getStaggerDelay = useCallback((rowIndex: number, colIndex: number): number => {
    return (rowIndex + colIndex) * 20;
  }, []);

  const getCellAnimationStyle = (
    rowIndex: number,
    colIndex: number,
    isNew: boolean
  ): React.CSSProperties => {
    if (animationState.phase === 'idle') {
      return {
        opacity: 1,
        transform: 'scale(1)',
      };
    }

    if (animationState.phase === 'resizing') {
      return {
        opacity: isNew ? 0.3 : 1,
        transform: isNew ? 'scale(0.8)' : 'scale(1)',
      };
    }

    if (animationState.phase === 'settling') {
      const delay = getStaggerDelay(rowIndex, colIndex);
      return {
        opacity: 1,
        transform: 'scale(1)',
        transition: `all ${animationState.duration}ms ease-out ${delay}ms`,
      };
    }

    return {};
  };

  return {
    animationState,
    startAnimation,
    endAnimation,
    getStaggerDelay,
    getCellAnimationStyle,
  };
}
