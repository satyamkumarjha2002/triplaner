'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { JoinTripModal } from '@/components/trips/JoinTripModal';
import { InviteFriendModal } from '@/components/trips/InviteFriendModal';
import { EditTripModal } from '@/components/trips/EditTripModal';
import { AddActivityModal } from '@/components/activities/AddActivityModal';

type ModalType = 'joinTrip' | 'inviteFriend' | 'editTrip' | 'createTrip' | 'addActivity' | 'none';

interface ModalContextType {
  modalType: ModalType;
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  modalData: any;
}

const ModalContext = createContext<ModalContextType>({
  modalType: 'none',
  openModal: () => {},
  closeModal: () => {},
  modalData: null,
});

export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>('none');
  const [modalData, setModalData] = useState<any>(null);

  const openModal = (type: ModalType, data?: any) => {
    setModalType(type);
    setModalData(data);
  };

  const closeModal = () => {
    setModalType('none');
    setModalData(null);
  };

  return (
    <ModalContext.Provider value={{ modalType, openModal, closeModal, modalData }}>
      {children}
      
      {/* Join Trip Modal */}
      <JoinTripModal 
        isOpen={modalType === 'joinTrip'} 
        onClose={closeModal} 
      />
      
      {/* Invite Friend Modal */}
      {modalType === 'inviteFriend' && modalData?.tripId && (
        <InviteFriendModal
          isOpen={modalType === 'inviteFriend'}
          onClose={closeModal}
          tripId={modalData.tripId}
          tripName={modalData.tripName || 'Trip'}
        />
      )}
      
      {/* Edit Trip Modal */}
      {modalType === 'editTrip' && modalData?.trip && (
        <EditTripModal
          isOpen={modalType === 'editTrip'}
          onClose={closeModal}
          trip={modalData.trip}
          onSuccess={modalData.onSuccess}
        />
      )}
      
      {/* Add Activity Modal */}
      {modalType === 'addActivity' && modalData?.tripId && (
        <AddActivityModal
          isOpen={modalType === 'addActivity'}
          onClose={closeModal}
          tripId={modalData.tripId}
          onSuccess={modalData.onSuccess}
        />
      )}
      
      {/* Add other modals here as needed */}
    </ModalContext.Provider>
  );
} 