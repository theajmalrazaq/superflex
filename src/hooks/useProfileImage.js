import { useEffect, useState } from "react";
import { getProfileImage } from "../utils/userDataStorage";

export function useProfileImage(fallback = "/Login/GetImage") {
  const [image, setImage] = useState(fallback);

  useEffect(() => {
    let active = true;
    const load = async (event) => {
      const nextImage = event?.detail || (await getProfileImage());
      if (active) setImage(nextImage);
    };
    const reload = () => void load();
    void load();
    window.addEventListener("superflex-profile-image-changed", load);
    window.addEventListener("superflex-student-identity-changed", reload);
    return () => {
      active = false;
      window.removeEventListener("superflex-profile-image-changed", load);
      window.removeEventListener("superflex-student-identity-changed", reload);
    };
  }, []);

  return image;
}
