import { MemoryRouter } from "react-router-dom";
import { SharedApp } from '@/components/SharedApp';

function Popup() {
  return (
    <MemoryRouter>
      <SharedApp />
    </MemoryRouter>
  )
}

export default Popup;
