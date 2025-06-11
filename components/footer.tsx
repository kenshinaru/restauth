import Link from "next/link"
import { CONFIG } from "@/config/setting"
import { Instagram, Github } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="backdrop-blur-sm transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
            <div>© {currentYear} {CONFIG.APP.FOOTER}</div>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              href={CONFIG.SOCIAL.INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>

            <Link
              href={CONFIG.SOCIAL.WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <FaWhatsapp className="h-5 w-5" />
              <span className="sr-only">WhatsApp</span>
            </Link>

            <Link
              href={CONFIG.SOCIAL.GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">Github</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
