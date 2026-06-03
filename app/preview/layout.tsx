import "../template.css";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full bg-neutral-50">{children}</div>;
}
