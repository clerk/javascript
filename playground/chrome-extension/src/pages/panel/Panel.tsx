import { MemoryRouter } from "react-router-dom";
import { SharedApp } from '@/components/SharedApp';

function Panel() {
  return (
    <MemoryRouter>
      <SharedApp />
    </MemoryRouter>
  )
}

export default Panel;
