"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, 
  GraduationCap, Calendar, Award,
  Cpu, ShieldCheck, MessageSquare, User,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Hooks
import { useAccount } from "@/hooks/use-account";
import { useApproveInstructorApplication, useInstructorProfileByAccountId, useRejectInstructorApplication } from "@/hooks/use-instructor";
import { Degree, Expertise } from "@/interfaces/instructor.interface";

// Schema validation cho từ chối
const rejectSchema = z.object({
  reviewComment: z.string()
    .min(10, "Vui lòng nhập ít nhất 10 ký tự để giải thích lý do từ chối")
    .max(500, "Nhận xét không được vượt quá 500 ký tự")
});

type RejectFormData = z.infer<typeof rejectSchema>;

export default function InstructorDetailsPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const router = useRouter();

  const { data: account, isLoading: isLoadingAccount } = useAccount(accountId);
  const { data: instructor, isLoading: isLoadingInstructor } = useInstructorProfileByAccountId(accountId);
  
  const approveMutation = useApproveInstructorApplication();
  const rejectMutation = useRejectInstructorApplication();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reviewComment: ""
    }
  });

  const isPending = isLoadingAccount || isLoadingInstructor;

  // Mapping trạng thái UI
  const statusConfig = {
    PENDING: { color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock, label: "Chờ phê duyệt" },
    APPROVED: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: ShieldCheck, label: "Đã kích hoạt" },
    REJECTED: { color: "text-rose-600 bg-rose-50 border-rose-100", icon: XCircle, label: "Đã từ chối" },
    SUSPENDED: { color: "text-violet-600 bg-violet-50 border-violet-100", icon: AlertCircle, label: "Tạm ngưng" },
    INACTIVE: { color: "text-slate-400 bg-slate-50 border-slate-100", icon: XCircle, label: "Ngừng hoạt động" },
  };

  // Xử lý phê duyệt
  const handleApprove = async () => {
    if (!instructor?.publicId) return;
    
    toast.promise(
      approveMutation.mutateAsync(instructor.publicId),
      {
        loading: 'Đang xử lý phê duyệt...',
        success: () => {
          router.refresh();
          return 'Phê duyệt giảng viên thành công!';
        },
        error: (error) => {
          console.error('Approve error:', error);
          return error?.message || 'Có lỗi xảy ra khi phê duyệt';
        }
      }
    );
  };

  // Xử lý từ chối với validation
  const onReject = async (data: RejectFormData) => {
    if (!instructor?.publicId) return;
    
    toast.promise(
      rejectMutation.mutateAsync({ 
        applicationId: instructor.publicId, 
        reviewComment: data.reviewComment 
      }),
      {
        loading: 'Đang xử lý từ chối...',
        success: () => {
          router.refresh();
          reset();
          return 'Đã từ chối hồ sơ giảng viên!';
        },
        error: (error) => {
          console.error('Reject error:', error);
          return error?.message || 'Có lỗi xảy ra khi từ chối';
        }
      }
    );
  };

  if (isPending) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  if (!instructor) return <div>Không tìm thấy hồ sơ</div>;

  const status = statusConfig[instructor.status as keyof typeof statusConfig];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. TOP NAVIGATION & ACTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="h-11 w-11 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-black tracking-tight text-slate-900">Chi tiết đơn đăng ký</h1>
               <Badge className={cn("px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border shadow-none", status.color)}>
                  <status.icon className="w-3 h-3 mr-1.5" />
                  {status.label}
               </Badge>
            </div>
            <p className="text-slate-400 font-mono text-[11px] uppercase tracking-widest mt-1">
              Ref-ID: #{instructor.publicId}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - MAIN PROFILE INFO (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Card: Thông tin tóm tắt */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <GraduationCap className="w-32 h-32 text-indigo-600" />
             </div>
             
             <div className="flex flex-col gap-6 relative z-10">
                <div className="space-y-2">
                   <h2 className="text-4xl font-black text-slate-900 leading-none">{instructor?.name}</h2>
                   <p className="text-xl font-bold text-indigo-600 italic tracking-tight">{instructor.headline}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                   <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kinh nghiệm</p>
                      <p className="text-lg font-bold text-slate-800">{instructor.yearsOfExperience} Năm thực chiến</p>
                   </div>
                   <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bằng cấp</p>
                      <p className="text-lg font-bold text-slate-800">{instructor.degrees.length} Chứng chỉ nộp kèm</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiểu sử chuyên gia</h3>
                   <p className="text-slate-600 font-medium leading-relaxed text-lg italic">
                      “{instructor.biography}”
                   </p>
                </div>
             </div>
          </div>

          {/* Card: Bằng cấp & Học vấn (Dạng Table đồng bộ) */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Học vấn & Chứng chỉ</h3>
             </div>
             <div className="p-0">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/30">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bằng cấp</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổ chức</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ngày cấp</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {instructor.degrees.map((deg: Degree, index: number) => (
                        <tr key={deg.id ?? `${deg.name}-${index}`} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-5">
                              <p className="font-bold text-slate-800">{deg.name}</p>
                              <p className="text-[10px] font-black text-indigo-500 uppercase">{deg.type}</p>
                            </td>
                           <td className="px-8 py-5 text-slate-500 font-medium">{deg.institution}</td>
                           <td className="px-8 py-5 text-right font-mono text-xs text-slate-400 italic">
                              {format(new Date(deg.issuedDate), "dd/MM/yyyy")}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                 </table>
             </div>
          </div>

          {/* Card: Chuyên môn (Expertise Grid) */}
          <div className="space-y-4">
             <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Lĩnh vực chuyên môn</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instructor.expertises.map((exp: Expertise, index: number) => (
                  <div key={exp.id ?? `${exp.name}-${index}`} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-all group">
                     <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Cpu className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-black text-slate-900 uppercase tracking-tight">{exp.name}</h4>
                           <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 border-indigo-100 text-indigo-600">{exp.level}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Kiến thức chuyên sâu và am hiểu thực tế.</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN - ACCOUNT & APPROVAL PANEL (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Thông tin tài khoản */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Dữ liệu tài khoản</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email đăng ký</p>
                      <p className="text-sm font-bold text-slate-800">{account?.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Calendar className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày nộp đơn</p>
                      <p className="text-sm font-bold text-slate-800">{format(new Date(instructor.appliedAt), "HH:mm, dd/MM/yyyy")}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Card: Bảng điều khiển phê duyệt (CHỈ HIỆN KHI PENDING) */}
          {instructor.status === "PENDING" && (
            <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-8 space-y-6 text-white animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-2">
                 <MessageSquare className="w-5 h-5 text-indigo-400" />
                 <h3 className="text-[12px] font-black uppercase tracking-widest">Đánh giá hồ sơ</h3>
              </div>
              
              {/* Form từ chối với validation */}
              <form onSubmit={handleSubmit(onReject)} className="space-y-4">
                <div className="space-y-2">
                  <Textarea 
                     placeholder="Nhập nhận xét hoặc lý do từ chối (bắt buộc khi từ chối)..."
                     className={cn(
                       "bg-white/10 border-white/10 text-white rounded-xl min-h-[120px] focus:ring-indigo-500 placeholder:text-slate-500",
                       errors.reviewComment && "border-rose-500 focus:ring-rose-500"
                     )}
                     {...register("reviewComment")}
                  />
                  {errors.reviewComment && (
                    <p className="text-rose-400 text-xs font-medium animate-in fade-in">
                      {errors.reviewComment.message}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400 italic">
                    * Lý do từ chối sẽ được gửi kèm email thông báo
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 pt-2">
                   <Button 
                      type="button"
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                   >
                      {approveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Phê duyệt chuyên gia
                   </Button>
                   
                   <Button 
                      type="submit"
                      variant="ghost" 
                      className="w-full h-12 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 font-bold uppercase tracking-widest text-[10px]"
                      disabled={rejectMutation.isPending || isSubmitting}
                   >
                      {rejectMutation.isPending || isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Từ chối hồ sơ
                   </Button>
                </div>
              </form>
              
              <p className="text-[9px] text-slate-500 text-center font-medium italic">
                Hành động này sẽ gửi email thông báo cho giảng viên.
              </p>
            </div>
          )}

          {/* Card: Review Comment cũ (Nếu có) */}
          {(instructor.status === "REJECTED" || instructor.status === "APPROVED") && instructor.reviewComment && (
            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phản hồi từ Admin</p>
               <p className="text-sm font-medium text-slate-600 italic">“{instructor.reviewComment}”</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
