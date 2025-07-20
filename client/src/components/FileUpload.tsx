import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: { [key: string]: string[] };
}

export default function FileUpload({ 
  files, 
  onFilesChange, 
  maxFiles = 5,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf']
  }
}: FileUploadProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalFiles = files.length + acceptedFiles.length;
    
    if (totalFiles > maxFiles) {
      toast({
        title: "عدد الملفات كبير جداً",
        description: `يمكنك رفع ${maxFiles} ملفات كحد أقصى`,
        variant: "destructive",
      });
      return;
    }

    // Check file sizes (10MB limit per file)
    const oversizedFiles = acceptedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "حجم الملف الواحد يجب أن يكون أقل من 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    onFilesChange([...files, ...acceptedFiles]);
  }, [files, onFilesChange, maxFiles, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return "fas fa-image text-blue-500";
    }
    if (file.type === 'application/pdf') {
      return "fas fa-file-pdf text-red-500";
    }
    return "fas fa-file text-neutral-500";
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-neutral-300 hover:border-primary hover:bg-primary/5'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <div className="bg-neutral-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <i className="fas fa-cloud-upload-alt text-2xl text-neutral-500"></i>
          </div>
          <div>
            <p className="font-medium text-neutral-700">
              {isDragActive ? "اسقط الملفات هنا" : "اسحب الملفات هنا أو انقر للتحديد"}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              يدعم الصور (JPG, PNG, GIF) والملفات النصية (PDF)
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              حد أقصى {maxFiles} ملفات، كل ملف أقل من 10 ميجابايت
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-neutral-700">الملفات المحددة:</h4>
          {files.map((file, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className={getFileIcon(file)}></i>
                    <div>
                      <p className="text-sm font-medium text-neutral-700">{file.name}</p>
                      <p className="text-xs text-neutral-500">
                        {(file.size / 1024 / 1024).toFixed(2)} ميجابايت
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
