"use client";
import React, { useState } from 'react';
import { ProjectForm } from '../ProjectForm';
import { Modal } from '../Modal';
import { useRouter } from 'next/navigation';

export default function AddProjectButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn bg-var(--primary) text-[var(--background)] hover:bg-[var(--primary-hover)] transition-all cursor-pointer btn-primary"
      >
        + New Project
      </button>
      
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create New Project">
        <ProjectForm 
          onCancel={() => setOpen(false)} 
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }} 
        />
      </Modal>
    </>
  );
}
