export function PartnerHero() {
    return (
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] text-slate-900 animate-in fade-in slide-in-from-top-12 duration-1000">
            Kiến tạo tương lai <br />
            <span className="bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Giáo dục số.
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-top-16 duration-1000 delay-200">
             Uniwise kết nối các chuyên gia hàng đầu và các tổ chức giáo dục để tạo nên mạng lưới tri thức không giới hạn.
          </p>
        </div>
        {/* Nền decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
           <div className="absolute bottom-0 right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
        </div>
      </div>
    );
  }