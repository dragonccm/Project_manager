// Đặt file này trong components/

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

/**
 * Component hỗ trợ nhập JSON trong textarea
 * - Hỗ trợ tốt hơn cho việc chỉnh sửa JSON trong textarea
 * - Cho phép tải file JSON
 * 
 * @param {object} props - Component properties
 * @param {string} props.id - ID của textarea
 * @param {string} props.label - Label cho textarea
 * @param {string} props.value - Giá trị hiện tại (JSON string)
 * @param {Function} props.onChange - Hàm callback khi giá trị thay đổi
 * @param {string} props.placeholder - Placeholder cho textarea
 * @param {boolean} props.required - Có bắt buộc hay không
 */
interface JSONEditorProps {
  id: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
}

export function JSONEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false
}: JSONEditorProps) {
  // State để lưu trữ giá trị JSON dạng text
  const [jsonText, setJsonText] = useState(value || '{}');
  const [isValid, setIsValid] = useState(true);

  // Hàm xử lý khi textarea thay đổi
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);
    
    try {
      // Nếu JSON hợp lệ, gọi onChange với object đã parse
      if (newText.trim()) {
        const jsonObject = JSON.parse(newText);
        onChange(jsonObject);
        setIsValid(true);
      } else {
        onChange({});
        setIsValid(true);
      }
    } catch (error) {
      // Nếu JSON không hợp lệ, vẫn lưu text để tiếp tục chỉnh sửa
      setIsValid(false);
      // KHÔNG gọi onChange để tránh lỗi
    }
  };

  // Xử lý tải file JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          throw new Error('Invalid file content');
        }
        // Cố gắng parse để kiểm tra JSON hợp lệ
        const parsed = JSON.parse(content);
        
        // Cập nhật state với nội dung file
        setJsonText(JSON.stringify(parsed, null, 2));
        onChange(parsed);
        setIsValid(true);
        
        // Reset input file
        e.target.value = '';
      } catch (error) {
        alert('❌ File JSON không hợp lệ. Vui lòng kiểm tra lại định dạng file.');
      }
    };
    
    reader.readAsText(file);
  };

  // Xử lý xóa JSON
  const handleClear = () => {
    setJsonText('{}');
    onChange({});
    setIsValid(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label} {required && '*'}</Label>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id={`${id}-upload`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById(`${id}-upload`)?.click()}
            className="h-6 px-2 text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            Tải file
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            Xóa
          </Button>
        </div>
      </div>
      <Textarea
        id={id}
        value={jsonText}
        onChange={handleTextChange}
        rows={6}
        placeholder={placeholder}
        required={required}
        className={`font-mono text-xs resize-none ${!isValid ? 'border-red-500' : ''}`}
      />
      {!isValid && (
        <p className="text-xs text-red-500">
          JSON không hợp lệ. Vui lòng kiểm tra lại định dạng.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Dán JSON hoặc tải file JSON ở trên
      </p>
    </div>
  );
}

export default JSONEditor;
