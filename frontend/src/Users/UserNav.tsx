function UserNav() {

    return (
        <>
        
      <header className="fixed top-0 md:left-0 w-full bg-gradient-to-r from-[#0a3d91] via-[#0f4fb2] to-[#0a3d91] shadow-md z-50">
        <div className="max-w-7xl md:mx-auto px-6 py-4 md:flex justify-between items-center">
          <h1 className="text-white font-bold text-xl text-center tracking-wide">
            KARTHVY
          </h1>

          <nav className="hidden md:flex space-x-8">
            <a
              href="/complaints"
              className="relative text-white text-2xl font-medium group"
            >
              My Complaints
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-300 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/"
              className="relative text-white text-2xl font-bold group"
            >
              Departments
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-300 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#about-us" className="relative text-2xl text-white font-bold group">
              About Us
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-300 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
        </div>
      </header>


      {/* Mobile Bottom Navbar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50 md:hidden">
        <nav className="flex justify-around py-2">
          <a
            href="/complaints"
            className="flex flex-col items-center text-gray-600 hover:text-[#0a3d91] transition-colors duration-300"
          >
            📝
            <span className="text-sm">Complaints</span>
          </a>
          <a
            href="/"
            className="flex flex-col items-center text-gray-600 hover:text-[#0a3d91] transition-colors duration-300"
          >
            🏛️
            <span className="text-sm">Departments</span>
          </a>
          <a
            href="#about-us"
            className="flex flex-col items-center text-gray-600 hover:text-[#0a3d91] transition-colors duration-300"
          >
            ℹ️
            <span className="text-sm">About</span>
          </a>
        </nav>
      </footer>

        </>
    )
}


export default UserNav