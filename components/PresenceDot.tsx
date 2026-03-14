interface PresenceDotProps {
  online: boolean;
  size?: "sm" | "md" | "lg";
}

export default function PresenceDot({ online, size = "md" }: PresenceDotProps) {
  const px = size === "sm" ? 6 : size === "md" ? 8 : 10;

  return (
    <span style={{
      display: "inline-block",
      width: px,
      height: px,
      borderRadius: "50%",
      background: online ? "#3ecf8e" : "#1e2535",
      flexShrink: 0,
      boxShadow: online ? "0 0 0 2px rgba(62,207,142,0.15)" : "none",
      transition: "background 0.2s",
    }} />
  );
}