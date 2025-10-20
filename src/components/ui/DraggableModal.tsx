import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { X } from 'lucide-react';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-2xl',
}) => {
  const nodeRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* Modal */}
      <Draggable nodeRef={nodeRef} handle=".modal-header" bounds="parent">
        <div
          ref={nodeRef}
          className={`relative bg-white rounded-lg shadow-xl ${width} w-full mx-4`}
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="modal-header flex items-center justify-between p-4 border-b border-gray-200 cursor-move bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            {children}
          </div>
        </div>
      </Draggable>
    </div>
  );
};
