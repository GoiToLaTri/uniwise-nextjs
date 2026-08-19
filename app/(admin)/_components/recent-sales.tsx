import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink } from "lucide-react";

const DATA = [
  { id: "1", user: "Phong Nguyen", course: "Next.js Pro", price: "1.290.000 VND", date: "2 phút trước" },
  { id: "2", user: "Minh Anh", course: "Tailwind v4 UI", price: "850.000 VND", date: "15 phút trước" },
  { id: "3", user: "Hoàng Vũ", course: "React Query", price: "450.000 VND", date: "1 giờ trước" },
  { id: "4", user: "Lan Chi", course: "Figma to Code", price: "990.000 VND", date: "3 giờ trước" },
];

export function RecentSales() {
  return (
    <Card className="border-none shadow-sm rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-50">
        <CardTitle className="text-lg font-black tracking-tight uppercase text-slate-800">Doanh thu gần đây</CardTitle>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-50">
          {DATA.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                  {item.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.user}</p>
                  <p className="text-xs text-slate-400 font-medium">{item.course}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">{item.price}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-50/50">
          <Button variant="link" className="w-full text-xs font-black text-indigo-600 uppercase tracking-widest hover:no-underline">
            Xem toàn bộ lịch sử <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
