import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "./ui";
import { useToast } from "./Toast";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  showWarning?: boolean;
}

export const FileUploader = ({
  onFileSelect,
  acceptedTypes = ["image/png", "image/jpeg", "image/jpg"],
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = "Screenshot Proof",
  description = "PNG, JPG up to 5MB",
  showWarning = true,
}: FileUploaderProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      showToast(
        `Only ${acceptedTypes
          .map((t) => t.split("/")[1].toUpperCase())
          .join(", ")} files are allowed`,
        "error"
      );
      return;
    }

    if (file.size > maxSize) {
      showToast(
        `File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
        "error"
      );
      return;
    }

    setUploadedFile(file);
    onFileSelect(file);
    showToast(`File "${file.name}" selected`, "success");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>

        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? "border-primary-600 bg-primary-50"
              : uploadedFile
              ? "border-green-300 bg-green-50"
              : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {uploadedFile ? (
            <div className="space-y-3">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto border border-green-200">
                <ImageIcon size={32} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleRemoveFile}
                >
                  <X size={14} /> Remove
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleClick}
                >
                  <Upload size={14} /> Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="cursor-pointer" onClick={handleClick}>
              <Upload size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
          )}
        </div>
      </div>

      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex gap-2 items-start">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p>Fake proofs will lead to immediate account suspension.</p>
        </div>
      )}
    </div>
  );
};
