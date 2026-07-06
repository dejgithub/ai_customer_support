'use client';

export default function Input({
  label, name, type = 'text', value, onChange, error, placeholder, required, className = '',
}: {
  label?: string; name: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; placeholder?: string; required?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="label" htmlFor={name}>{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`} />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
