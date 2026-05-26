import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Users } from "lucide-react";
import Image from "next/image";

interface CourseCardProps {
  title: string;
  instructor: string;
  price: string;
  rating: number;
  students: number;
  image: string;
  category: string;
}

export function CourseCard({ title, instructor, price, rating, students, image, category }: CourseCardProps) {
  return (
    <Card className="group border-slate-200 bg-white/90 backdrop-blur-md rounded-xl overflow-hidden hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500">
      <div className="relative aspect-video overflow-hidden">
        <Image 
          src={image} 
          alt={title} 
          sizes=""
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 text-indigo-600 hover:bg-white font-bold backdrop-blur-sm border-none">
            {category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3 text-slate-400">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-slate-600">{rating}</span>
          <span className="text-slate-200">•</span>
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{students} học viên</span>
        </div>
        
        <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-slate-500 text-sm font-medium italic">Giảng viên: {instructor}</p>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between">
        <div className="text-2xl font-black text-indigo-600">{price}</div>
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-90">
          <Clock className="w-5 h-5" />
        </button>
      </CardFooter>
    </Card>
  );
}