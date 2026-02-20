import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "tel" | "url";
  placeholder?: string;
  required?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
  autoComplete?: string;
}

export const FormField: React.FC<IFormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  onFocus,
  onBlur,
  className,
  autoComplete,
}) => (
  <div className={`space-y-2 ${className}`}>
    <Label htmlFor={id} className="text-sm font-medium">
      {label}
    </Label>
    <Input
      id={id}
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      onFocus={onFocus}
      onBlur={onBlur}
      autoComplete={autoComplete}
      className="focus-visible:ring-primary transition-shadow"
    />
  </div>
);
