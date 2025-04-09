import { Bell, Calendar, ChevronLeft, ChevronRight, FileText, Home, Search, Settings, User } from "lucide-react"
import Image from "next/image"

export default function Dashboard() {
    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            {/* Sidebar */}
            <div className="w-20 bg-white flex flex-col items-center py-8 shadow-sm">
                <div className="mb-10">
                    <Image
                        src="/placeholder.svg?height=40&width=40"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="text-blue-500"
                    />
                </div>
                <nav className="flex flex-col items-center space-y-8">
                    <button className="p-3 rounded-xl bg-blue-500 text-white">
                        <Home size={20} />
                    </button>
                    <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-100">
                        <FileText size={20} />
                    </button>
                    <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-100">
                        <User size={20} />
                    </button>
                    <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-100">
                        <Calendar size={20} />
                    </button>
                    <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-100">
                        <Settings size={20} />
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">Halo Angelina 👋</h1>
                            <p className="text-gray-500 text-sm">Let's do some productive activities today.</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search anything..."
                                    className="pl-10 pr-4 py-2 bg-gray-100 rounded-full w-64 text-sm focus:outline-none"
                                />
                            </div>
                            <button className="p-2 rounded-full bg-gray-100">
                                <Bell size={20} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Summary Report */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Summary Report</h2>
                            <div className="relative">
                                <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none">
                                    <option>6th Semester</option>
                                    <option>5th Semester</option>
                                    <option>4th Semester</option>
                                </select>
                                <ChevronRight
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400"
                                    size={16}
                                />
                            </div>
                        </div>

                        <div className="bg-blue-500 rounded-2xl p-6 text-white">
                            <div className="grid grid-cols-3 gap-6">
                                {/* Attendance */}
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/20 p-3 rounded-full">
                                        <div className="bg-white p-2 rounded-full">
                                            <Calendar className="text-blue-500" size={24} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-bold">89</span>
                                            <span className="text-sm opacity-80 ml-1">/ 89</span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <div className="bg-white/30 rounded-full px-2 py-0.5 text-xs mr-2">100%</div>
                                            <p className="text-xs">Great, you always attending class, keep it up!</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Task */}
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/20 p-3 rounded-full">
                                        <div className="bg-white p-2 rounded-full">
                                            <FileText className="text-blue-500" size={24} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-bold">134</span>
                                            <span className="text-sm opacity-80 ml-1">/ 140</span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <div className="bg-white/30 rounded-full px-2 py-0.5 text-xs mr-2">96%</div>
                                            <p className="text-xs">Don't forget to turn in your task</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/20 p-3 rounded-full">
                                        <div className="bg-white p-2 rounded-full">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <div className="w-5 h-5 bg-blue-500 flex items-center justify-center rounded-sm">
                                                    <div className="w-3 h-0.5 bg-white"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-bold">12</span>
                                            <span className="text-sm opacity-80 ml-1">/ 15</span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <div className="bg-white/30 rounded-full px-2 py-0.5 text-xs mr-2">80%</div>
                                            <p className="text-xs">You take 12 subjects at this semester</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Score Records and GPA */}
                    <div className="grid grid-cols-3 gap-8 mb-8">
                        <div className="col-span-2">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Score Records</h2>
                            <div className="bg-blue-50 rounded-2xl p-6 h-64 relative">
                                {/* Graph */}
                                <div className="absolute inset-0 p-6">
                                    <div className="relative h-full">
                                        {/* Graph line */}
                                        <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                            <path
                                                d="M0,150 L100,120 L200,80 L300,100 L400,60 L500,40"
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="3"
                                            />
                                            {/* Dots */}
                                            <circle cx="0" cy="150" r="4" fill="#3b82f6" />
                                            <circle cx="100" cy="120" r="4" fill="#3b82f6" />
                                            <circle cx="200" cy="80" r="4" fill="#3b82f6" />
                                            <circle cx="300" cy="100" r="4" fill="#3b82f6" />
                                            <circle cx="400" cy="60" r="4" fill="#3b82f6" />
                                            <circle cx="500" cy="40" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                                        </svg>

                                        {/* +0.01 indicator */}
                                        <div className="absolute top-8 right-0 bg-blue-900 text-white text-xs px-2 py-1 rounded-full">
                                            +0.01
                                        </div>
                                    </div>
                                </div>

                                {/* Semester scores */}
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="grid grid-cols-5 gap-4 text-center">
                                        <div>
                                            <div className="font-bold text-gray-800">3.80</div>
                                            <div className="text-xs text-gray-500">1st Semester</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">3.93</div>
                                            <div className="text-xs text-gray-500">2nd Semester</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">3.89</div>
                                            <div className="text-xs text-gray-500">3rd Semester</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">3.90</div>
                                            <div className="text-xs text-gray-500">4th Semester</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">4.00</div>
                                            <div className="text-xs text-gray-500">5th Semester</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="bg-blue-500 rounded-2xl h-full overflow-hidden relative">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-1">GPA</h3>
                                    <p className="text-sm opacity-80">Grade Point Average</p>

                                    <div className="mt-8 text-center">
                                        <div className="text-7xl font-bold">3.93</div>
                                        <p className="text-sm mt-2 opacity-80">Top 10 students in campus</p>
                                    </div>
                                </div>

                                {/* Decorative wave */}
                                <div className="absolute bottom-0 left-0 right-0">
                                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
                                        <path
                                            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                                            fill="#FFEB99"
                                            opacity="0.3"
                                        />
                                        <path
                                            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                                            fill="#FFEB99"
                                            opacity="0.5"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 bg-white p-8 shadow-sm">
                {/* Student Profile */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                        <Image
                            src="/placeholder.svg?height=120&width=120"
                            alt="Angelina Jolie"
                            width={120}
                            height={120}
                            className="rounded-2xl"
                        />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Angelina Jolie</h2>
                    <p className="text-gray-500 text-sm">Economics | 6th Semester</p>
                    <p className="text-gray-400 text-sm mt-1">322276180</p>
                </div>

                {/* Calendar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">November</h3>
                        <div className="flex space-x-2">
                            <button className="p-1 rounded-full hover:bg-gray-100">
                                <ChevronLeft size={16} className="text-gray-500" />
                            </button>
                            <button className="p-1 rounded-full hover:bg-gray-100">
                                <ChevronRight size={16} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        <div className="text-xs text-gray-500 py-1">Sun</div>
                        <div className="text-xs text-gray-500 py-1">Mon</div>
                        <div className="text-xs text-gray-500 py-1">Tue</div>
                        <div className="text-xs text-gray-500 py-1">Wed</div>
                        <div className="text-xs text-gray-500 py-1">Thu</div>
                        <div className="text-xs text-gray-500 py-1">Fri</div>
                        <div className="text-xs text-gray-500 py-1">Sat</div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                        <div className="text-sm py-2">16</div>
                        <div className="text-sm py-2">17</div>
                        <div className="text-sm py-2 bg-blue-500 text-white rounded-full">18</div>
                        <div className="text-sm py-2">19</div>
                        <div className="text-sm py-2">20</div>
                        <div className="text-sm py-2">21</div>
                        <div className="text-sm py-2">22</div>
                        <div className="text-sm py-2">23</div>
                        <div className="text-sm py-2">24</div>
                        <div className="text-sm py-2">25</div>
                        <div className="text-sm py-2">26</div>
                        <div className="text-sm py-2">27</div>
                        <div className="text-sm py-2">27</div>
                        <div className="text-sm py-2">29</div>
                    </div>
                </div>

                {/* Schedule */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
                        <a href="#" className="text-xs text-blue-500">
                            See All
                        </a>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-blue-50 rounded-xl p-4 flex">
                            <div className="bg-blue-500 text-white text-xl font-bold w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                                18
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Political Economy</h4>
                                <div className="flex items-center mt-1">
                                    <p className="text-xs text-gray-500">16:00 - 17:00</p>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full mx-2"></div>
                                    <p className="text-xs text-gray-500">08 of 20 Chapters</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 flex">
                            <div className="bg-gray-200 text-gray-700 text-xl font-bold w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                                19
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Modern Societies</h4>
                                <div className="flex items-center mt-1">
                                    <p className="text-xs text-gray-500">16:00 - 17:00</p>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full mx-2"></div>
                                    <p className="text-xs text-gray-500">18 of 20 Chapters</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

