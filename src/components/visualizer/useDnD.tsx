'use client';

import {
  useState,
  useCallback,
  PointerEvent as ReactPointerEvent,
  createContext,
  useContext,
  PropsWithChildren,
} from 'react';
import { useReactFlow, XYPosition } from '@xyflow/react';

export type OnDropAction = (payload: { position: XYPosition }) => void;

interface DnDContextType {
  isDragging: boolean;
  position: XYPosition | null;
  onDragStart: (event: ReactPointerEvent<HTMLDivElement>, onDrop: OnDropAction) => void;
}

const DnDContext = createContext<DnDContextType | null>(null);

export function DnDProvider({ children }: PropsWithChildren) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<XYPosition | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, onDrop: OnDropAction) => {
      event.preventDefault();
      event.stopPropagation();

      const onPointerMove = (event: PointerEvent) => {
        setPosition({ x: event.clientX, y: event.clientY });
      };

      const onPointerUp = (event: PointerEvent) => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);

        setIsDragging(false);
        setPosition(null);

        // We need to make sure that the drop happened on a react flow pane
        const targetIsPane = (event.target as HTMLElement).classList.contains('react-flow__pane');

        if (targetIsPane) {
          const flowPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          onDrop({ position: flowPosition });
        }
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      setIsDragging(true);
    },
    [screenToFlowPosition]
  );

  return (
    <DnDContext.Provider value={{ isDragging, position, onDragStart }}>
      {children}
    </DnDContext.Provider>
  );
}

export const useDnD = () => {
  const context = useContext(DnDContext);
  if (!context) throw new Error('useDnD must be used within a DnDProvider');
  return { isDragging: context.isDragging, onDragStart: context.onDragStart };
};

export const useDnDPosition = () => {
  const context = useContext(DnDContext);
  if (!context) throw new Error('useDnDPosition must be used within a DnDProvider');
  return { position: context.position };
};