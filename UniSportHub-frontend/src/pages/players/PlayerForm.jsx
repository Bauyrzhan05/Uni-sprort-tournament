import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * PlayerForm — redirects to /players
 * The backend does NOT have a PUT /players/{id} endpoint.
 * Player management is done inline via the PlayerList modal.
 */
function PlayerForm() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/players", { replace: true }); }, [navigate]);
  return null;
}

export default PlayerForm;
