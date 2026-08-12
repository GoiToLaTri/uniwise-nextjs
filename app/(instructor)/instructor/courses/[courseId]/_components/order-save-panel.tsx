"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderSavePanelProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function OrderSavePanel({ isSaving, onCancel, onSave }: OrderSavePanelProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-2xl shadow-indigo-500/10 px-4 py-3 rounded-full animate-in slide-in-from-bottom-8">
      <div className="flex flex-col mx-2">
        <span className="text-sm font-bold text-slate-800">Lưu thay đổi vị trí?</span>
        <span className="text-[10px] text-slate-500 font-medium">Bạn có thay đổi chưa được lưu.</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving} className="rounded-full px-4 h-9 hover:bg-slate-100">
        Hủy
      </Button>
      <Button size="sm" onClick={onSave} disabled={isSaving} className="rounded-full px-5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Xác nhận lưu
      </Button>
    </div>
  );
}
