import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-themecolor text-white mx-4 my-4 rounded-lg p-6 flex flex-col justify-center items-center gap-2">
      <div className="flex flex-row gap-6 font-medium text-base">
        <Link href="/privacy" className="hover:text-gray-300 transition-colors">
          Datenschutz
        </Link>
        <Link href="/imprint" className="hover:text-gray-300 transition-colors">
          Impressum
        </Link>
      </div>
      <p className="text-sm font-medium text-gray-200 flex items-center gap-1">
        © 2025 Kantonsschule Hottingen
      </p>
    </footer>
  );
}