import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Tech Center
          </Link>
          
          <ul className="hidden md:flex space-x-8">
            <li>
              <Link href="/" className="hover:text-primary-600">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-primary-600">
                Khóa học
              </Link>
            </li>
            <li>
              <Link 
                href="#contact" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Đăng ký
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}