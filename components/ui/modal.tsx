import React, { useState } from "react";
import {
  Button,
  CloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import Lorem from "react-lorem-ipsum";

const modal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // Hook para manejar el estado del modal

  return (
    <>
      {/* Botón para abrir el modal */}
      <Button onClick={onOpen} variant="outline">
        Outside Scroll
      </Button>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <ModalCloseButton size="sm" />
            <h2>With Outside Scroll</h2>
          </ModalHeader>
          <ModalBody>
            <Lorem p={8} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default modal;