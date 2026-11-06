import { useState, useRef, useEffect } from "react";
import { User, Upload, Trash2, AlertCircle, Check } from "lucide-react";
import { processImage } from "../../utils/imageProcessor";
import Modal from "./Modal";
import Button from "./Button";
import {
  deleteProfileImage,
  hasCustomProfileImage,
  setProfileImage,
} from "../../utils/userDataStorage";

const ProfileImageModal = ({ isOpen, onClose, currentImage }) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const fileInputRef = useRef(null);

  const resetPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreview(null);
  };

  const handleClose = () => {
    resetPreview();
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) hasCustomProfileImage().then(setHasCustomImage);
  }, [isOpen]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PNG or JPEG image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview({ url: previewUrl, file });
  };

  const handleSave = async () => {
    if (!preview) return;
    setIsProcessing(true);
    try {
      const resizedImage = await processImage(preview.file);
      await setProfileImage(resizedImage);
      setHasCustomImage(true);
      window.dispatchEvent(
        new CustomEvent("superflex-profile-image-changed", { detail: resizedImage }),
      );
      handleClose();
    } catch {
      setError("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm("Remove custom profile picture?")) {
      await deleteProfileImage();
      setHasCustomImage(false);
      window.dispatchEvent(
        new CustomEvent("superflex-profile-image-changed", { detail: "/Login/GetImage" }),
      );
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Profile Picture"
      subtitle="Update or remove your custom image"
      maxWidth="max-w-md"
      icon={<User size={24} />}
    >
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-center rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6">
          <div className="relative h-36 w-36 overflow-hidden rounded-3xl border-4 border-background bg-secondary shadow-sm">
            {preview ? (
              <img
                src={preview.url}
                alt="New profile preview"
                className="h-full w-full object-cover"
              />
            ) : currentImage ? (
              <img
                src={currentImage}
                alt="Current profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <User size={52} className="text-foreground/30" />
              </span>
            )}
            {!preview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-bold text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
              >
                Change image
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex w-full items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-200">
            <AlertCircle size={17} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="flex w-full gap-3">
          {!preview ? (
            <>
              <Button
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload size={17} />}
                className="min-w-0 flex-1"
              >
                Upload
              </Button>
              {hasCustomImage && (
                <Button
                  onClick={handleRemove}
                  variant="danger"
                  icon={<Trash2 size={16} />}
                  className="min-w-0 flex-1"
                >
                  Remove
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="success"
                isLoading={isProcessing}
                onClick={handleSave}
                icon={<Check size={17} />}
                className="min-w-0 flex-1"
              >
                Save Image
              </Button>
              <Button
                variant="secondary"
                disabled={isProcessing}
                onClick={resetPreview}
                className="min-w-0 flex-1"
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png,image/jpeg,image/jpg"
        />
      </div>
    </Modal>
  );
};

export default ProfileImageModal;
