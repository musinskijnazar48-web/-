import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
  className?: string;
}

const UserAvatar = ({ name, avatar, size = "md", isOnline, className }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("relative", className)}>
      <Avatar className={sizeClasses[size]}>
        {avatar && <AvatarImage src={avatar} alt={name} />}
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
      )}
    </div>
  );
};

export default UserAvatar;