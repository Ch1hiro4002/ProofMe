import { Link } from "react-router-dom"
import { TwitterIcon } from "lucide-react"

type SocialBindButtonProps = {
  className?: string
  size?: "sm" | "md" | "lg"
}

/**
 * 社交绑定按钮组件
 * 可以放在导航栏或其他位置，用于快速访问社交绑定页面
 */
export function SocialBindButton({ className = "", size = "md" }: SocialBindButtonProps) {
  // 根据size确定按钮大小
  const sizeClasses = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-1.5 px-3",
    lg: "text-base py-2 px-4",
  }

  return (
    <Link
      to="/social-bind"
      className={`flex items-center gap-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${
        sizeClasses[size]
      } ${className}`}
    >
      <TwitterIcon className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} />
      <span>Bind social account</span>
    </Link>
  )
}
