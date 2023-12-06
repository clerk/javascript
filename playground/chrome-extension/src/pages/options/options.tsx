import { MemoryRouter } from "react-router-dom";
import { SharedApp } from '@/components/SharedApp';

function Options() {
  return (
    <MemoryRouter>
      <SharedApp />
    </MemoryRouter>
  )
}

export default Options;
