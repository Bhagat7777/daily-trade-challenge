import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { Plus } from 'lucide-react';

const Fab = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/submit')}
      className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full bg-gradient-primary shadow-lg shadow-primary/40 flex items-center justify-center"
      aria-label="Submit New Trade"
    >
      <Plus className="h-8 w-8" />
    </Button>
  );
};

export default Fab;