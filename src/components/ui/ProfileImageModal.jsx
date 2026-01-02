import { useState, useRef, useEffect } from "react";
import { User, Upload, Trash2, AlertCircle, Check, Shield } from "lucide-react";
import { processImage } from "../../utils/imageProcessor";
import Modal from "./Modal";
import Button from "./Button";

const CUSTOM_IMAGE_KEY = "superflex_user_custom_image";

const ProfileImageModal = ({ isOpen, onClose, currentImage }) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setPreview(null);
      setError(null);
    }
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
      localStorage.setItem(CUSTOM_IMAGE_KEY, resizedImage);
      window.dispatchEvent(new Event("storage"));
      setPreview(null);
      onClose();
    } catch (err) {
      setError("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm("Remove custom profile picture?")) {
      localStorage.removeItem(CUSTOM_IMAGE_KEY);
      window.dispatchEvent(new Event("storage"));
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Picture"
      subtitle="Update or remove your custom image"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center gap-8 pt-4">
        <div className="relative group">
          <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-40 h-40 rounded-[2.5rem] border-4 border-foreground/10 overflow-hidden bg-secondary flex items-center justify-center relative z-10">
            {preview ? (
              <img
                src={preview.url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : currentImage ? (
              <img
                src={currentImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={64} className="text-foreground/30" />
            )}
          </div>
          {!preview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-[2.5rem] text-foreground font-bold text-xs Cap tracking-[0px] z-20"
            >
              Change
            </button>
          )}
        </div>

        <div className="flex flex-col w-full gap-3">
          {!preview ? (
            <>
              <Button
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload size={18} />}
                className="w-full"
              >
                Upload New Image
              </Button>
              {localStorage.getItem(CUSTOM_IMAGE_KEY) && (
                <Button
                  onClick={handleRemove}
                  variant="danger"
                  icon={<Trash2 size={16} />}
                  className="w-full"
                >
                  Remove Custom Image
                </Button>
              )}
            </>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="success"
                isLoading={isProcessing}
                onClick={handleSave}
                icon={<Check size={18} />}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                variant="secondary"
                disabled={isProcessing}
                onClick={() => setPreview(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-error text-[10px] font-bold Cap tracking-wider bg-error/10 px-4 py-3 rounded-xl border border-error/20 w-fit">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="w-full p-5 rounded-3xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
          <h4 className="text-accent font-bold text-[10px] Cap tracking-[0px] flex items-center gap-2">
            <Shield size={14} />
            Privacy Note
          </h4>
          <p className="text-[11px] text-foreground/50 leading-relaxed font-bold">
            Your profile picture is processed locally and stored in your
            browser's local storage. SuperFlex does not upload it to any
            external servers.
          </p>
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
