import { MemoryRouter } from "react-router-dom";
import { SharedApp } from '@/components/SharedApp';

function NewTab() {
  return (
    <MemoryRouter>
      <SharedApp />
    </MemoryRouter>
  )
}

export default NewTab;
