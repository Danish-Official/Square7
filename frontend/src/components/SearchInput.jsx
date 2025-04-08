import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
      {value && (
        <button
          onClick={() => onChange({ target: { value: "" } })}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
