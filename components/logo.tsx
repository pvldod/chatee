export default function Logo() {
  return (
    <div className="w-10 h-10 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-white rounded-sm"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 bg-black rounded-sm"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-8 bg-white"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-2 bg-white"></div>
      </div>
    </div>
  )
}
